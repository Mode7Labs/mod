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
        const pulseTime = currentTime + i / sampleRate;
        this.port.postMessage({ type: 'pulse', time: pulseTime });
        this._cooldown = 32;
      }
      this._last = value;
    }
    return true;
  }
}

registerProcessor('midi-clock-detector', ClockDetector);
