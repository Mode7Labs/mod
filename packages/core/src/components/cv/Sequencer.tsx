import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface Step {
  active: boolean;
  value: number;
  lengthPct: number;
  slide: boolean;
  accent: boolean;
}

export interface SequencerHandle {
  reset: () => void;
  getState: () => {
    steps: Step[];
    currentStep: number;
    division: number;
    length: number;
    swing: number;
  };
}

export interface SequencerRenderProps {
  steps: Step[];
  setSteps: (steps: Step[]) => void;
  currentStep: number;
  division: number;
  setDivision: (value: number) => void;
  length: number;
  setLength: (value: number) => void;
  swing: number;
  setSwing: (value: number) => void;
  reset: () => void;
}

export interface SequencerProps {
  output: ModStreamRef;
  gateOutput?: ModStreamRef;
  accentOutput?: ModStreamRef;
  clock?: ModStreamRef;
  reset?: ModStreamRef;
  label?: string;
  numSteps?: number;
  steps?: Step[];
  onStepsChange?: (steps: Step[]) => void;
  division?: number;
  onDivisionChange?: (division: number) => void;
  length?: number;
  onLengthChange?: (length: number) => void;
  swing?: number;
  onSwingChange?: (swing: number) => void;
  onCurrentStepChange?: (currentStep: number) => void;
  children?: (props: SequencerRenderProps) => ReactNode;
}

const CLOCK_DETECTOR_WORKLET = `
class ClockDetector extends AudioWorkletProcessor {
  constructor() {
    super();
    this._last = 0;
    this._cooldown = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) {
      const value = channel[i];
      if (this._cooldown > 0) {
        this._cooldown--;
        this._last = value;
        continue;
      }
      if (this._last <= 0.5 && value > 0.5) {
        this.port.postMessage({ type: 'pulse' });
        this._cooldown = 32;
      }
      this._last = value;
    }
    return true;
  }
}
registerProcessor('clock-detector', ClockDetector);
`;

const clockDetectorLoaders = new WeakMap<AudioContext, Promise<void>>();
const clockDetectorUrls = new WeakMap<AudioContext, string>();

const loadClockDetectorWorklet = (audioContext: AudioContext) => {
  let loader = clockDetectorLoaders.get(audioContext);
  if (!loader) {
    const blob = new Blob([CLOCK_DETECTOR_WORKLET], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    clockDetectorUrls.set(audioContext, url);
    loader = audioContext.audioWorklet.addModule(url).then(() => {
      const loadedUrl = clockDetectorUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        clockDetectorUrls.delete(audioContext);
      }
    }).catch((err) => {
      const loadedUrl = clockDetectorUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        clockDetectorUrls.delete(audioContext);
      }
      clockDetectorLoaders.delete(audioContext);
      throw err;
    });
    clockDetectorLoaders.set(audioContext, loader);
  }
  return loader;
};

export const Sequencer = React.forwardRef<SequencerHandle, SequencerProps>(({
  output,
  gateOutput,
  accentOutput,
  clock,
  reset: resetInput,
  label = 'sequencer',
  numSteps = 8,
  steps: controlledSteps,
  onStepsChange,
  division: controlledDivision,
  onDivisionChange,
  length: controlledLength,
  onLengthChange,
  swing: controlledSwing,
  onSwingChange,
  onCurrentStepChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const initialSteps: Step[] = [];
  for (let i = 0; i < numSteps; i++) {
    initialSteps.push({ active: false, value: 0, lengthPct: 80, slide: false, accent: false });
  }
  const [steps, setSteps] = useControlledState(controlledSteps, initialSteps, onStepsChange);
  const [currentStep, setCurrentStep] = useState(0);
  const [division, setDivision] = useControlledState(controlledDivision, 4, onDivisionChange);
  const [length, setLength] = useControlledState(controlledLength, numSteps, onLengthChange);
  const [swing, setSwing] = useControlledState(controlledSwing, 0, onSwingChange);
  const [isListenerReady, setIsListenerReady] = useState(false);
  const [isResetListenerReady, setIsResetListenerReady] = useState(false);

  const constantSourceRef = useRef<ConstantSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const gateSourceRef = useRef<ConstantSourceNode | null>(null);
  const gateGainRef = useRef<GainNode | null>(null);
  const accentSourceRef = useRef<ConstantSourceNode | null>(null);
  const accentGainRef = useRef<GainNode | null>(null);
  const clockListenerRef = useRef<AudioWorkletNode | null>(null);
  const resetListenerRef = useRef<AudioWorkletNode | null>(null);
  const gateDurationRef = useRef(0.05);
  const pulseAccumulatorRef = useRef(0);
  const resetPendingRef = useRef(false);
  const lastPulseTimeRef = useRef<number | null>(null);
  const lastPulseIntervalRef = useRef<number | null>(null);
  const stepTriggerCountRef = useRef(0);
  const slideTimeRef = useRef(0.065);
  const gateOffTimeRef = useRef(-Infinity);
  const lastStepTimeRef = useRef<number | null>(null);
  const stepsRef = useRef(steps);
  const currentStepRef = useRef(currentStep);
  const divisionRef = useRef(division);
  const swingRef = useRef(swing);

  const clampLengthPct = (value: number | undefined) => {
    if (!Number.isFinite(value)) {
      return 80;
    }
    return Math.max(10, Math.min(100, value as number));
  };

  const normalizeStep = (input: Step | undefined): Step => ({
    active: input?.active ?? false,
    value: input?.value ?? 0,
    lengthPct: clampLengthPct(input?.lengthPct),
    slide: input?.slide ?? false,
    accent: input?.accent ?? false,
  });

  const normalizeSteps = (nextLength: number, current: Step[]) => {
    const clampedLength = Math.max(1, Math.min(32, nextLength));
    const nextSteps = current.slice(0, clampedLength).map((step) => normalizeStep(step));
    while (nextSteps.length < clampedLength) {
      nextSteps.push({ active: false, value: 0, lengthPct: 80, slide: false, accent: false });
    }
    return nextSteps;
  };

  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => {
    divisionRef.current = division;
    pulseAccumulatorRef.current = 0;
  }, [division]);
  useEffect(() => { swingRef.current = swing; }, [swing]);

  useEffect(() => {
    const normalized = normalizeSteps(length, steps);
    const needsUpdate = normalized.length !== steps.length
      || normalized.some((step, index) => {
        const current = steps[index];
        if (!current) {
          return true;
        }
        return (
          step.active !== current.active
          || step.value !== current.value
          || step.lengthPct !== current.lengthPct
          || step.slide !== current.slide
          || step.accent !== current.accent
        );
      });
    if (needsUpdate) {
      setSteps(normalized);
    }
    if (currentStepRef.current >= normalized.length) {
      const nextStep = Math.max(0, normalized.length - 1);
      currentStepRef.current = nextStep;
      setCurrentStep(nextStep);
    }
  }, [length, steps, setSteps]);

  useEffect(() => {
    if (!audioContext) return;

    const constantSource = audioContext.createConstantSource();
    constantSource.offset.value = steps[0]?.value || 0;
    constantSourceRef.current = constantSource;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    gainNodeRef.current = gainNode;

    constantSource.connect(gainNode);
    constantSource.start(0);

    output.current = {
      audioNode: constantSource,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    if (gateOutput) {
      const gateSource = audioContext.createConstantSource();
      gateSource.offset.value = 0;
      gateSourceRef.current = gateSource;

      const gateGain = audioContext.createGain();
      gateGain.gain.value = 1.0;
      gateGainRef.current = gateGain;

      gateSource.connect(gateGain);
      gateSource.start(0);

      gateOutput.current = {
        audioNode: gateSource,
        gain: gateGain,
        context: audioContext,
        metadata: {
          label: `${label}-gate`,
          sourceType: 'cv',
        },
      };
    }

    if (accentOutput) {
      const accentSource = audioContext.createConstantSource();
      accentSource.offset.value = 0;
      accentSourceRef.current = accentSource;

      const accentGain = audioContext.createGain();
      accentGain.gain.value = 1.0;
      accentGainRef.current = accentGain;

      accentSource.connect(accentGain);
      accentSource.start(0);

      accentOutput.current = {
        audioNode: accentSource,
        gain: accentGain,
        context: audioContext,
        metadata: {
          label: `${label}-accent`,
          sourceType: 'cv',
        },
      };
    }

    return () => {
      constantSource.stop();
      constantSource.disconnect();
      gainNode.disconnect();
      output.current = null;
      constantSourceRef.current = null;
      gainNodeRef.current = null;

      if (gateSourceRef.current) {
        gateSourceRef.current.stop();
        gateSourceRef.current.disconnect();
        gateSourceRef.current = null;
      }
      if (gateGainRef.current) {
        gateGainRef.current.disconnect();
        gateGainRef.current = null;
      }
      if (gateOutput) {
        gateOutput.current = null;
      }
      if (accentSourceRef.current) {
        accentSourceRef.current.stop();
        accentSourceRef.current.disconnect();
        accentSourceRef.current = null;
      }
      if (accentGainRef.current) {
        accentGainRef.current.disconnect();
        accentGainRef.current = null;
      }
      if (accentOutput) {
        accentOutput.current = null;
      }
    };
  }, [audioContext, label, gateOutput, accentOutput]);

  const getPulsesPerStep = (divisionValue: number) => {
    const pulsesPerStepMap: Record<number, number> = {
      1: 16,
      2: 8,
      3: 6,
      4: 4,
      6: 3,
      8: 2,
      12: 1.5,
      16: 1,
    };
    return pulsesPerStepMap[divisionValue] ?? Math.max(1, 16 / divisionValue);
  };

  useEffect(() => {
    if (!audioContext) return;
    let cancelled = false;

    loadClockDetectorWorklet(audioContext).then(() => {
      if (cancelled) return;
      const node = new AudioWorkletNode(audioContext, 'clock-detector', {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });
      clockListenerRef.current = node;
      node.port.onmessage = (event) => {
        if (event.data?.type !== 'pulse') return;
        if (!audioContext || !constantSourceRef.current) return;
        if (!stepsRef.current.length) return;
        const pulsesPerStep = getPulsesPerStep(divisionRef.current);
        const now = audioContext.currentTime;
        const lastPulseTime = lastPulseTimeRef.current;
        if (lastPulseTime !== null) {
          lastPulseIntervalRef.current = now - lastPulseTime;
        }
        lastPulseTimeRef.current = now;
        pulseAccumulatorRef.current += 1;
        if (pulseAccumulatorRef.current < pulsesPerStep) return;

        pulseAccumulatorRef.current -= pulsesPerStep;
        const nextStep = resetPendingRef.current
          ? 0
          : (currentStepRef.current + 1) % stepsRef.current.length;
        const currentStepData = normalizeStep(stepsRef.current[nextStep]);
        const prevStepIndex = (nextStep - 1 + stepsRef.current.length) % stepsRef.current.length;
        const prevStepData = normalizeStep(stepsRef.current[prevStepIndex]);
        const nextStepIndex = (nextStep + 1) % stepsRef.current.length;
        const nextStepData = normalizeStep(stepsRef.current[nextStepIndex]);
        let swingOffset = 0;
        const swingAmount = Math.max(-50, Math.min(50, swingRef.current));
        const pulseInterval = lastPulseIntervalRef.current;
        if (pulseInterval && swingAmount !== 0) {
          const stepInterval = pulseInterval * pulsesPerStep;
          const delaySeconds = (Math.abs(swingAmount) / 100) * stepInterval;
          const isOddStep = stepTriggerCountRef.current % 2 === 1;
          const delayOdd = swingAmount > 0;
          const shouldDelay = delayOdd ? isOddStep : !isOddStep;
          swingOffset = shouldDelay ? delaySeconds : 0;
        }
        const triggerTime = now + swingOffset;
        const previousStepTime = lastStepTimeRef.current;
        const stepInterval = previousStepTime !== null ? triggerTime - previousStepTime : null;
        lastStepTimeRef.current = triggerTime;
        const slideFromPrev = Boolean(
          stepInterval
          && prevStepData.active
          && currentStepData.active
          && currentStepData.slide
        );
        const slideIntoNext = Boolean(
          stepInterval
          && currentStepData.active
          && nextStepData.active
          && nextStepData.slide
        );
        if (slideFromPrev && stepInterval) {
          const slideTime = Math.max(0.01, slideTimeRef.current);
          constantSourceRef.current.offset.setValueAtTime(prevStepData.value, triggerTime);
          constantSourceRef.current.offset.linearRampToValueAtTime(
            currentStepData.value,
            triggerTime + slideTime
          );
        } else {
          constantSourceRef.current.offset.setValueAtTime(currentStepData.value, triggerTime);
        }
        if (gateSourceRef.current) {
          const gateParam = gateSourceRef.current.offset;
          gateParam.cancelScheduledValues(triggerTime);
          const gateIsHigh = gateOffTimeRef.current > triggerTime + 1e-6;
          const legato = slideFromPrev && gateIsHigh;
          if (currentStepData.active) {
            if (!legato) {
              gateParam.setValueAtTime(1, triggerTime);
            }
            const baseGate = gateDurationRef.current;
            const gateLengthPct = slideIntoNext ? 100 : clampLengthPct(currentStepData.lengthPct);
            const currentGateDuration = stepInterval
              ? (stepInterval * gateLengthPct) / 100
              : (baseGate * gateLengthPct) / 100;
            let gateOffTime = triggerTime + currentGateDuration;
            if (slideIntoNext && stepInterval) {
              const nextGateLengthPct = clampLengthPct(nextStepData.lengthPct);
              const nextGateDuration = (stepInterval * nextGateLengthPct) / 100;
              gateOffTime = triggerTime + stepInterval + nextGateDuration;
            }
            gateParam.setValueAtTime(0, gateOffTime);
            gateOffTimeRef.current = gateOffTime;
          } else if (!legato) {
            gateParam.setValueAtTime(0, triggerTime);
            gateOffTimeRef.current = triggerTime;
          }
        }
        if (accentSourceRef.current) {
          const accentParam = accentSourceRef.current.offset;
          accentParam.cancelScheduledValues(triggerTime);
          if (currentStepData.active && currentStepData.accent) {
            const baseAccent = gateDurationRef.current;
            const accentLengthPct = clampLengthPct(currentStepData.lengthPct);
            const accentDuration = stepInterval
              ? (stepInterval * accentLengthPct) / 100
              : (baseAccent * accentLengthPct) / 100;
            accentParam.setValueAtTime(1, triggerTime);
            accentParam.setValueAtTime(0, triggerTime + accentDuration);
          } else {
            accentParam.setValueAtTime(0, triggerTime);
          }
        }
        stepTriggerCountRef.current += 1;
        currentStepRef.current = nextStep;
        setCurrentStep(nextStep);
        resetPendingRef.current = false;
      };
      setIsListenerReady(true);
    }).catch((err) => {
      if (cancelled) return;
      console.error('Failed to load clock detector worklet', err);
    });

    return () => {
      cancelled = true;
      if (clockListenerRef.current) {
        if (clockListenerRef.current.port) {
          clockListenerRef.current.port.onmessage = null;
        }
        try { clockListenerRef.current.disconnect(); } catch (e) { /* ignore */ }
        clockListenerRef.current = null;
      }
      setIsListenerReady(false);
    };
  }, [audioContext]);

  useEffect(() => {
    if (!audioContext) return;
    let cancelled = false;

    loadClockDetectorWorklet(audioContext).then(() => {
      if (cancelled) return;
      const node = new AudioWorkletNode(audioContext, 'clock-detector', {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
      });
      resetListenerRef.current = node;
      node.port.onmessage = (event) => {
        if (event.data?.type !== 'pulse') return;
        resetSequence();
      };
      setIsResetListenerReady(true);
    }).catch((err) => {
      if (cancelled) return;
      console.error('Failed to load reset detector worklet', err);
    });

    return () => {
      cancelled = true;
      if (resetListenerRef.current) {
        if (resetListenerRef.current.port) {
          resetListenerRef.current.port.onmessage = null;
        }
        try { resetListenerRef.current.disconnect(); } catch (e) { /* ignore */ }
        resetListenerRef.current = null;
      }
      setIsResetListenerReady(false);
    };
  }, [audioContext]);

  const clockKey = clock?.current?.audioNode ? String(clock.current.audioNode) : 'null';
  useEffect(() => {
    if (!clock?.current || !clockListenerRef.current || !isListenerReady) return;
    const inGain = clock.current.gain;
    const listener = clockListenerRef.current;
    inGain.connect(listener);
    return () => {
      try { inGain.disconnect(listener); } catch (e) { /* ignore */ }
    };
  }, [clockKey, isListenerReady]);

  const resetKey = resetInput?.current?.audioNode ? String(resetInput.current.audioNode) : 'null';
  useEffect(() => {
    if (!resetInput?.current || !resetListenerRef.current || !isResetListenerReady) return;
    const inGain = resetInput.current.gain;
    const listener = resetListenerRef.current;
    inGain.connect(listener);
    return () => {
      try { inGain.disconnect(listener); } catch (e) { /* ignore */ }
    };
  }, [resetKey, isResetListenerReady]);

  const resetSequence = () => {
    setCurrentStep(0);
    currentStepRef.current = 0;
    pulseAccumulatorRef.current = getPulsesPerStep(divisionRef.current) - 1;
    resetPendingRef.current = true;
    lastPulseTimeRef.current = null;
    lastPulseIntervalRef.current = null;
    stepTriggerCountRef.current = 0;
    gateOffTimeRef.current = -Infinity;
    lastStepTimeRef.current = null;
    if (constantSourceRef.current && audioContext) {
      const now = audioContext.currentTime;
      constantSourceRef.current.offset.setValueAtTime(stepsRef.current[0]?.value ?? 0, now);
    }
  };

  useImperativeHandle(ref, () => ({
    reset: resetSequence,
    getState: () => ({ steps, currentStep, division, length, swing }),
  }), [steps, currentStep, division, length, swing]);

  useEffect(() => {
    onCurrentStepChange?.(currentStep);
  }, [currentStep, onCurrentStepChange]);

  if (children) {
    return <>{children({
      steps,
      setSteps,
      currentStep,
      division,
      setDivision,
      length,
      setLength,
      swing,
      setSwing,
      reset: resetSequence,
    })}</>;
  }

  return null;
});

Sequencer.displayName = 'Sequencer';
