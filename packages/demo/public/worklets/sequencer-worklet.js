const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const clampLengthPct = (value) => {
  if (!Number.isFinite(value)) return 80;
  return clamp(value, 10, 100);
};
const normalizeStep = (step) => ({
  active: step?.active ?? false,
  value: Number.isFinite(step?.value) ? step.value : 0,
  lengthPct: clampLengthPct(step?.lengthPct),
  slide: step?.slide ?? false,
  accent: step?.accent ?? false,
});

class SequencerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.steps = [normalizeStep({ active: false, value: 0, lengthPct: 80, slide: false, accent: false })];
    this.length = 1;
    this.division = 4;
    this.swing = 0;
    this.slideTime = 0.065;
    this.baseGateSeconds = 0.05;

    this.currentStep = 0;
    this.pulseAccumulator = 0;
    this.lastPulseSample = null;
    this.lastPulseInterval = null;
    this.lastStepSample = null;
    this.stepTriggerCount = 0;
    this.resetPending = false;

    this.gateOffSample = -Infinity;
    this.accentOffSample = -Infinity;
    this.gateValue = 0;
    this.accentValue = 0;
    this.cvValue = 0;
    this.cvRampRemaining = 0;
    this.cvRampStep = 0;

    this.eventQueue = [];
    this._lastClock = 0;
    this._clockCooldown = 0;
    this._lastReset = 0;
    this._resetCooldown = 0;
    this._sampleTime = 0;

    this.port.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === 'state') {
        if (Array.isArray(data.steps)) {
          const nextSteps = data.steps.map(normalizeStep);
          this.steps = nextSteps.length ? nextSteps : this.steps;
          this.length = Math.max(1, Math.min(32, data.length ?? this.steps.length));
          this.steps = this.steps.slice(0, this.length);
          while (this.steps.length < this.length) {
            this.steps.push(normalizeStep({ active: false, value: 0, lengthPct: 80, slide: false, accent: false }));
          }
          if (this.currentStep >= this.steps.length) {
            this.currentStep = this.steps.length > 0 ? (this.currentStep % this.steps.length) : 0;
          }
        }
        if (Number.isFinite(data.division)) {
          this.division = data.division;
          this.pulseAccumulator = 0;
        }
        if (Number.isFinite(data.swing)) {
          this.swing = clamp(data.swing, -50, 50);
        }
        if (Number.isFinite(data.slideTime)) {
          this.slideTime = Math.max(0.01, data.slideTime);
        }
        if (Number.isFinite(data.baseGateSeconds)) {
          this.baseGateSeconds = Math.max(0.005, data.baseGateSeconds);
        }
      } else if (data.type === 'steps') {
        if (Array.isArray(data.steps)) {
          const nextSteps = data.steps.map(normalizeStep);
          this.steps = nextSteps.length ? nextSteps : this.steps;
          this.length = Math.max(1, Math.min(32, data.length ?? this.steps.length));
          this.steps = this.steps.slice(0, this.length);
          while (this.steps.length < this.length) {
            this.steps.push(normalizeStep({ active: false, value: 0, lengthPct: 80, slide: false, accent: false }));
          }
          if (this.currentStep >= this.steps.length) {
            this.currentStep = this.steps.length > 0 ? (this.currentStep % this.steps.length) : 0;
          }
        }
      } else if (data.type === 'division') {
        if (Number.isFinite(data.value)) {
          this.division = data.value;
          this.pulseAccumulator = 0;
        }
      } else if (data.type === 'swing') {
        if (Number.isFinite(data.value)) {
          this.swing = clamp(data.value, -50, 50);
        }
      } else if (data.type === 'reset') {
        this._resetSequence();
      }
    };
  }

  _getPulsesPerStep(division) {
    const pulsesPerStepMap = {
      1: 16,
      2: 8,
      3: 6,
      4: 4,
      6: 3,
      8: 2,
      12: 1.5,
      16: 1,
    };
    if (pulsesPerStepMap[division] != null) {
      return pulsesPerStepMap[division];
    }
    return Math.max(1, 16 / division);
  }

  _resetSequence() {
    this.currentStep = 0;
    this.pulseAccumulator = this._getPulsesPerStep(this.division) - 1;
    this.resetPending = true;
    this.lastPulseSample = null;
    this.lastPulseInterval = null;
    this.lastStepSample = null;
    this.stepTriggerCount = 0;
    this.gateOffSample = -Infinity;
    this.accentOffSample = -Infinity;
    this.gateValue = 0;
    this.accentValue = 0;
    const firstStep = this.steps[0] || normalizeStep();
    this.cvValue = firstStep.value;
    this.cvRampRemaining = 0;
    this.cvRampStep = 0;
    this.eventQueue.length = 0;
  }

  _scheduleStepEvent(pulseSample) {
    const pulsesPerStep = this._getPulsesPerStep(this.division);
    const swingAmount = clamp(this.swing, -50, 50);
    let swingOffsetSamples = 0;
    if (this.lastPulseInterval != null && swingAmount !== 0) {
      const stepInterval = this.lastPulseInterval * pulsesPerStep;
      const delaySamples = Math.abs(swingAmount) / 100 * stepInterval;
      const isOddStep = this.stepTriggerCount % 2 === 1;
      const delayOdd = swingAmount > 0;
      const shouldDelay = delayOdd ? isOddStep : !isOddStep;
      swingOffsetSamples = shouldDelay ? delaySamples : 0;
    }
    const triggerSample = pulseSample + swingOffsetSamples;
    const previousStepSample = this.lastStepSample;
    const stepIntervalSamples = previousStepSample != null ? triggerSample - previousStepSample : null;

    const stepIndex = this.resetPending ? 0 : (this.currentStep + 1) % this.steps.length;
    const prevStepIndex = (stepIndex - 1 + this.steps.length) % this.steps.length;
    const nextStepIndex = (stepIndex + 1) % this.steps.length;
    const stepData = normalizeStep(this.steps[stepIndex]);
    const prevStep = normalizeStep(this.steps[prevStepIndex]);
    const nextStep = normalizeStep(this.steps[nextStepIndex]);

    const slideFromPrev = Boolean(stepIntervalSamples && prevStep.active && stepData.active && stepData.slide);
    const slideIntoNext = Boolean(stepIntervalSamples && stepData.active && nextStep.active && nextStep.slide);

    this.lastStepSample = triggerSample;
    this.stepTriggerCount += 1;

    this.eventQueue.push({
      time: triggerSample,
      stepIndex,
      stepData,
      prevStep,
      nextStep,
      stepIntervalSamples,
      slideFromPrev,
      slideIntoNext,
    });
  }

  _applyStepEvent(event) {
    const {
      time,
      stepIndex,
      stepData,
      prevStep,
      nextStep,
      stepIntervalSamples,
      slideFromPrev,
      slideIntoNext,
    } = event;

    if (slideFromPrev && stepIntervalSamples) {
      const slideSamples = Math.max(1, Math.round(this.slideTime * sampleRate));
      this.cvValue = prevStep.value;
      this.cvRampRemaining = slideSamples;
      this.cvRampStep = (stepData.value - prevStep.value) / slideSamples;
    } else {
      this.cvValue = stepData.value;
      this.cvRampRemaining = 0;
      this.cvRampStep = 0;
    }

    const gateIsHigh = this.gateOffSample > time + 1e-6;
    const legato = slideFromPrev && gateIsHigh;

    if (stepData.active) {
      if (!legato) {
        this.gateValue = 1;
      }
      const gateLengthPct = slideIntoNext ? 100 : clampLengthPct(stepData.lengthPct);
      const baseGateSamples = Math.max(1, Math.round(this.baseGateSeconds * sampleRate));
      const gateDuration = stepIntervalSamples != null
        ? (stepIntervalSamples * gateLengthPct) / 100
        : (baseGateSamples * gateLengthPct) / 100;
      let gateOffSample = time + gateDuration;
      if (slideIntoNext && stepIntervalSamples != null) {
        const nextGateLengthPct = clampLengthPct(nextStep.lengthPct);
        const nextGateDuration = (stepIntervalSamples * nextGateLengthPct) / 100;
        gateOffSample = time + stepIntervalSamples + nextGateDuration;
      }
      this.gateOffSample = gateOffSample;
    } else if (!legato) {
      this.gateValue = 0;
      this.gateOffSample = time;
    }

    if (stepData.active && stepData.accent) {
      const accentLengthPct = clampLengthPct(stepData.lengthPct);
      const baseGateSamples = Math.max(1, Math.round(this.baseGateSeconds * sampleRate));
      const accentDuration = stepIntervalSamples != null
        ? (stepIntervalSamples * accentLengthPct) / 100
        : (baseGateSamples * accentLengthPct) / 100;
      this.accentValue = 1;
      this.accentOffSample = time + accentDuration;
    } else {
      this.accentValue = 0;
      this.accentOffSample = time;
    }

    this.currentStep = stepIndex;
    this.resetPending = false;
    this.port.postMessage({ type: 'step', currentStep: stepIndex });
  }

  process(inputs, outputs) {
    const clockInput = inputs[0] && inputs[0][0];
    const resetInput = inputs[1] && inputs[1][0];
    const outputA = outputs[0] && outputs[0][0];
    const outputB = outputs[1] && outputs[1][0];
    const outputC = outputs[2] && outputs[2][0];
    const frames = (outputA || outputB || outputC || clockInput || resetInput)?.length || 128;

    const blockStart = this._sampleTime;
    const blockEnd = blockStart + frames;

    if (resetInput) {
      for (let i = 0; i < resetInput.length; i++) {
        const value = resetInput[i];
        if (this._resetCooldown > 0) {
          this._resetCooldown--;
          this._lastReset = value;
          continue;
        }
        if (this._lastReset <= 0.5 && value > 0.5) {
          this._resetSequence();
          this._resetCooldown = 32;
        }
        this._lastReset = value;
      }
    }

    if (clockInput) {
      for (let i = 0; i < clockInput.length; i++) {
        const value = clockInput[i];
        if (this._clockCooldown > 0) {
          this._clockCooldown--;
          this._lastClock = value;
          continue;
        }
        if (this._lastClock <= 0.5 && value > 0.5) {
          const pulseSample = blockStart + i;
          if (this.lastPulseSample != null) {
            this.lastPulseInterval = pulseSample - this.lastPulseSample;
          }
          this.lastPulseSample = pulseSample;
          this.pulseAccumulator += 1;
          const pulsesPerStep = this._getPulsesPerStep(this.division);
          if (this.pulseAccumulator + 1e-6 >= pulsesPerStep) {
            this.pulseAccumulator -= pulsesPerStep;
            this._scheduleStepEvent(pulseSample);
          }
          this._clockCooldown = 32;
        }
        this._lastClock = value;
      }
    }

    let eventIndex = 0;
    while (eventIndex < this.eventQueue.length && this.eventQueue[eventIndex].time < blockStart) {
      this._applyStepEvent(this.eventQueue[eventIndex]);
      eventIndex++;
    }
    if (eventIndex > 0) {
      this.eventQueue.splice(0, eventIndex);
    }

    let nextEvent = this.eventQueue[0] || null;

    for (let i = 0; i < frames; i++) {
      const sampleTime = blockStart + i;
      while (nextEvent && nextEvent.time <= sampleTime) {
        this._applyStepEvent(nextEvent);
        this.eventQueue.shift();
        nextEvent = this.eventQueue[0] || null;
      }

      if (sampleTime >= this.gateOffSample) {
        this.gateValue = 0;
      }
      if (sampleTime >= this.accentOffSample) {
        this.accentValue = 0;
      }

      if (this.cvRampRemaining > 0) {
        this.cvValue += this.cvRampStep;
        this.cvRampRemaining--;
      }

      if (outputA) outputA[i] = this.cvValue;
      if (outputB) outputB[i] = this.gateValue;
      if (outputC) outputC[i] = this.accentValue;
    }

    this._sampleTime = blockEnd;
    return true;
  }
}

registerProcessor('sequencer-worklet', SequencerProcessor);
