export const diodeFilterWorklet = `
class DiodeFilterProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'cutoff', defaultValue: 1000, minValue: 20, maxValue: 20000, automationRate: 'a-rate' },
      { name: 'resonance', defaultValue: 0.1, minValue: 0, maxValue: 4, automationRate: 'a-rate' },
      { name: 'drive', defaultValue: 0.0, minValue: 0, maxValue: 10, automationRate: 'a-rate' },
    ];
  }
  constructor() {
    super();
    this._stages = [];
    this._prevOut = [];
    this.sampleRate = sampleRate;
  }
  process(inputs, outputs, parameters) {
    const inputChannels = inputs[0] || [];
    const outputChannels = outputs[0] || [];
    const numChannels = Math.max(inputChannels.length, outputChannels.length, 1);
    for (let ch = 0; ch < numChannels; ch++) {
      const output = outputChannels[ch];
      if (!output) continue;
      const input = inputChannels[ch] || inputChannels[0] || new Float32Array(128);
      if (!this._stages[ch] || this._stages[ch].length !== 4) {
        this._stages[ch] = [0,0,0,0];
        this._prevOut[ch] = 0;
      }
      const s = this._stages[ch];
      const cutoffParam = parameters.cutoff;
      const resParam = parameters.resonance;
      const driveParam = parameters.drive;
      for (let i = 0; i < output.length; i++) {
        const inSample = input[i] || 0;
        const cutoff = cutoffParam.length > 1 ? cutoffParam[i] : cutoffParam[0];
        const resonance = resParam.length > 1 ? resParam[i] : resParam[0];
        const drive = driveParam.length > 1 ? driveParam[i] : driveParam[0];
        const fc = Math.max(20, Math.min(this.sampleRate*0.5-1, cutoff));
        const g = Math.exp(-2*Math.PI*fc/this.sampleRate);
        const b = 1 - g;
        const feedback = resonance * this._prevOut[ch];
        const u = Math.tanh((inSample - feedback) * (1 + drive));
        s[0] = b * u + g * s[0];
        s[1] = b * s[0] + g * s[1];
        s[2] = b * s[1] + g * s[2];
        s[3] = b * s[2] + g * s[3];
        const out = s[3];
        this._prevOut[ch] = out;
        output[i] = out;
      }
    }
    return true;
  }
}
registerProcessor('diode-filter-processor', DiodeFilterProcessor);
`;
