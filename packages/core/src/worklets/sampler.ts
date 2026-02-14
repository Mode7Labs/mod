export const samplerWorklets = `
class GateDetector extends AudioWorkletProcessor {
  constructor() {
    super();
    this._isHigh = false;
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel) return true;
    let isHigh = this._isHigh;
    for (let i = 0; i < channel.length; i++) {
      const value = channel[i];
      if (!isHigh && value > 0.5) {
        this.port.postMessage({ type: 'gate-on' });
        isHigh = true;
      } else if (isHigh && value < 0.2) {
        this.port.postMessage({ type: 'gate-off' });
        isHigh = false;
      }
    }
    this._isHigh = isHigh;
    return true;
  }
}

class CvFollower extends AudioWorkletProcessor {
  constructor() {
    super();
    this._counter = 0;
    this._sum = 0;
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const channel = input[0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) {
      this._sum += channel[i];
      this._counter += 1;
      if (this._counter >= 256) {
        const avg = this._sum / this._counter;
        this.port.postMessage({ type: 'cv', value: avg });
        this._sum = 0;
        this._counter = 0;
      }
    }
    return true;
  }
}

registerProcessor('sampler-gate-detector', GateDetector);
registerProcessor('sampler-cv-follower', CvFollower);
`;
