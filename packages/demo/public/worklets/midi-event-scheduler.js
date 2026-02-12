class MidiEventScheduler extends AudioWorkletProcessor {
  constructor() {
    super();
    this._events = [];
    this._eventIndex = 0;
    this._playing = false;
    this._startTime = 0;
    this._scale = 1;
    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data || !data.type) return;
      if (data.type === 'events') {
        this._events = Array.isArray(data.events) ? data.events : [];
        this._eventIndex = 0;
      } else if (data.type === 'scale') {
        this._scale = data.value || 1;
      } else if (data.type === 'play') {
        this._playing = true;
        this._startTime = data.startTime || 0;
        const position = data.position || 0;
        if (typeof data.scale === 'number') {
          this._scale = data.scale;
        }
        this._eventIndex = this._findEventIndex(position);
      } else if (data.type === 'stop') {
        this._playing = false;
      } else if (data.type === 'seek') {
        const position = data.position || 0;
        this._eventIndex = this._findEventIndex(position);
      } else if (data.type === 'reset') {
        this._playing = false;
        this._eventIndex = 0;
        this._startTime = 0;
      }
    };
  }

  _findEventIndex(position) {
    for (let i = 0; i < this._events.length; i++) {
      if (this._events[i].time >= position) return i;
    }
    return this._events.length;
  }

  process(_inputs, outputs) {
    const output = outputs[0];
    if (output && output.length > 0) {
      const channel = output[0];
      if (channel) {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = 0;
        }
      }
    }
    if (!this._playing || this._events.length === 0) return true;
    const quantumEnd = currentTime + 128 / sampleRate;
    while (this._eventIndex < this._events.length) {
      const evt = this._events[this._eventIndex];
      const eventTime = this._startTime + evt.time * this._scale;
      if (eventTime > quantumEnd) break;
      this.port.postMessage({ type: 'event', event: evt, time: eventTime });
      this._eventIndex += 1;
    }
    if (this._eventIndex >= this._events.length) {
      this._playing = false;
      this.port.postMessage({ type: 'end' });
    }
    return true;
  }
}

registerProcessor('midi-event-scheduler', MidiEventScheduler);
