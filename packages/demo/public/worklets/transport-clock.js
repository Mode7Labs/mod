class TransportClockProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._running = false;
    this._startTime = 0;
    this._startBeat = 0;
    this._pausedBeat = 0;
    this._bpm = 120;
    this._tempoEvents = [{ time: 0, bpm: 120 }];
    this._tickInterval = 0.025;
    this._nextTickTime = 0;
    this._phaseSamples = 0;
    this._startPulseRemaining = 0;
    this._stopPulseRemaining = 0;
    this.port.onmessage = (event) => this._onMessage(event.data);
  }

  _onMessage(message) {
    switch (message.type) {
      case 'init':
        this._bpm = message.bpm;
        this._tempoEvents = [{ time: 0, bpm: message.bpm }];
        this._startBeat = message.startBeat;
        this._pausedBeat = message.startBeat;
        this._tickInterval = message.tickIntervalSec;
        this._nextTickTime = currentTime;
        this._phaseSamples = 0;
        break;
      case 'start':
        this._running = true;
        this._startTime = message.time;
        this._startBeat = message.beat;
        this._tempoEvents = [{ time: this._startTime, bpm: this._bpm }];
        this._nextTickTime = message.time;
        this._phaseSamples = 0;
        this._startPulseRemaining = Math.max(1, Math.round(sampleRate * 0.01));
        break;
      case 'stop':
        this._pausedBeat = this._getBeatAtTime(message.time);
        this._running = false;
        this._nextTickTime = message.time;
        this._stopPulseRemaining = Math.max(1, Math.round(sampleRate * 0.01));
        break;
      case 'seek':
        this._pausedBeat = message.beat;
        if (this._running) {
          this._startTime = message.time;
          this._startBeat = message.beat;
          this._tempoEvents = [{ time: this._startTime, bpm: this._bpm }];
        } else {
          this._startBeat = message.beat;
        }
        this._nextTickTime = message.time;
        this._phaseSamples = 0;
        break;
      case 'tempo':
        this._bpm = message.bpm;
        if (this._running) {
          this._insertTempoEvent({ time: message.time, bpm: message.bpm }, true);
        }
        break;
      case 'schedule-tempo':
        this._insertTempoEvent({ time: message.time, bpm: message.bpm }, false);
        break;
      default:
        break;
    }
  }

  _insertTempoEvent(event, replaceFuture) {
    const filtered = this._tempoEvents.filter((existing) => {
      if (existing.time < event.time) {
        return true;
      }
      if (existing.time === event.time) {
        return false;
      }
      return !replaceFuture;
    });
    filtered.push(event);
    filtered.sort((a, b) => a.time - b.time);
    if (filtered.length === 0) {
      filtered.push({ time: this._startTime, bpm: this._bpm });
    }
    this._tempoEvents = filtered;
  }

  _getBeatAtTime(time) {
    if (!this._running) {
      return this._pausedBeat;
    }
    if (time <= this._startTime) {
      return this._startBeat;
    }
    let beat = this._startBeat;
    let lastTime = this._startTime;
    let bpm = this._tempoEvents[0] ? this._tempoEvents[0].bpm : this._bpm;
    for (let i = 1; i < this._tempoEvents.length; i += 1) {
      const event = this._tempoEvents[i];
      if (event.time >= time) {
        break;
      }
      beat += ((event.time - lastTime) * bpm) / 60;
      lastTime = event.time;
      bpm = event.bpm;
    }
    beat += ((time - lastTime) * bpm) / 60;
    return beat;
  }

  process(_inputs, outputs) {
    const clockOut = outputs[0] && outputs[0][0];
    const startOut = outputs[1] && outputs[1][0];
    const stopOut = outputs[2] && outputs[2][0];
    const frames = (clockOut || startOut || stopOut)?.length || 128;
    const pulseWidthSamples = Math.max(1, Math.round(sampleRate * 0.01));
    const samplesPerPulse = Math.max(1, Math.round(sampleRate * 60 / (Math.max(1e-6, this._bpm) * 16)));
    for (let i = 0; i < frames; i++) {
      if (startOut) {
        startOut[i] = this._startPulseRemaining > 0 ? 1 : 0;
      }
      if (this._startPulseRemaining > 0) {
        this._startPulseRemaining -= 1;
      }
      if (stopOut) {
        stopOut[i] = this._stopPulseRemaining > 0 ? 1 : 0;
      }
      if (this._stopPulseRemaining > 0) {
        this._stopPulseRemaining -= 1;
      }
      if (!this._running) {
        if (clockOut) clockOut[i] = 0;
        this._phaseSamples = 0;
        continue;
      }
      const phase = this._phaseSamples % samplesPerPulse;
      if (clockOut) {
        clockOut[i] = phase < pulseWidthSamples ? 1 : 0;
      }
      this._phaseSamples += 1;
    }
    const now = currentTime;
    if (now + 1e-6 >= this._nextTickTime) {
      const beat = this._getBeatAtTime(now);
      this.port.postMessage({
        type: 'tick',
        time: now,
        beat,
        bpm: this._bpm,
        running: this._running,
      });
      this._nextTickTime = now + this._tickInterval;
    }
    return true;
  }
}

registerProcessor('transport-clock', TransportClockProcessor);
