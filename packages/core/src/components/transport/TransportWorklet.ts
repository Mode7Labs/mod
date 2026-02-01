import { Transport, TransportEvent, TransportLike, TransportOptions } from './Transport';

type WorkletCommand =
  | { type: 'init'; bpm: number; startBeat: number; tickIntervalSec: number }
  | { type: 'start'; time: number; beat: number }
  | { type: 'stop'; time: number }
  | { type: 'seek'; time: number; beat: number }
  | { type: 'tempo'; time: number; bpm: number }
  | { type: 'schedule-tempo'; time: number; bpm: number };

export interface TransportTick {
  type: 'tick';
  time: number;
  beat: number;
  bpm: number;
  running: boolean;
}

type TickListener = (tick: TransportTick) => void;
type WorkletTransportListener = (transport: WorkletTransport) => void;

export interface WorkletTransportOptions extends TransportOptions {
  tickIntervalSec?: number;
}

const TRANSPORT_WORKLET = `
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
        break;
      case 'start':
        this._running = true;
        this._startTime = message.time;
        this._startBeat = message.beat;
        this._tempoEvents = [{ time: this._startTime, bpm: this._bpm }];
        this._nextTickTime = message.time;
        break;
      case 'stop':
        this._pausedBeat = this._getBeatAtTime(message.time);
        this._running = false;
        this._nextTickTime = message.time;
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
    // Integrate bpm over audio time so beat math stays locked to the audio clock.
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
    const output = outputs[0];
    if (output && output[0]) {
      // Keep the node alive without producing audio.
      output[0].fill(0);
    }
    const now = currentTime;
    if (now + 1e-6 >= this._nextTickTime) {
      // Emit ticks on the audio thread and include the exact audio time.
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
`;

const workletLoaders = new WeakMap<AudioContext, Promise<void>>();
const workletUrls = new WeakMap<AudioContext, string>();

const loadTransportWorklet = (audioContext: AudioContext) => {
  let loader = workletLoaders.get(audioContext);
  if (!loader) {
    const blob = new Blob([TRANSPORT_WORKLET], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    workletUrls.set(audioContext, url);
    loader = audioContext.audioWorklet.addModule(url).then(() => {
      const loadedUrl = workletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        workletUrls.delete(audioContext);
      }
    }).catch((err) => {
      const loadedUrl = workletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        workletUrls.delete(audioContext);
      }
      workletLoaders.delete(audioContext);
      throw err;
    });
    workletLoaders.set(audioContext, loader);
  }
  return loader;
};

export class WorkletTransport implements TransportLike {
  private readonly context: AudioContext;
  private readonly transport: Transport;
  private node: AudioWorkletNode | null = null;
  private listeners = new Set<TickListener>();
  private eventListeners = new Map<TransportEvent, Set<WorkletTransportListener>>();
  private tickIntervalSec: number;

  private constructor(context: AudioContext, options: WorkletTransportOptions) {
    this.context = context;
    this.transport = new Transport(context, options);
    this.tickIntervalSec = options.tickIntervalSec ?? 0.025;
  }

  static async create(context: AudioContext, options: WorkletTransportOptions = {}): Promise<WorkletTransport> {
    if (!context.audioWorklet || typeof AudioWorkletNode === 'undefined') {
      throw new Error('WorkletTransport: AudioWorklet is not supported in this environment.');
    }
    const instance = new WorkletTransport(context, options);
    await loadTransportWorklet(context);
    const node = new AudioWorkletNode(context, 'transport-clock', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [1],
    });
    // Keep the worklet pulling audio by connecting it to the destination.
    node.connect(context.destination);
    node.port.onmessage = (event) => {
      const message = event.data as TransportTick;
      if (message.type !== 'tick') {
        return;
      }
      instance.listeners.forEach((listener) => listener(message));
    };
    node.port.postMessage({
      type: 'init',
      bpm: instance.transport.bpm,
      startBeat: options.startBeat ?? 0,
      tickIntervalSec: instance.tickIntervalSec,
    } satisfies WorkletCommand);
    instance.node = node;
    return instance;
  }

  get currentTime(): number {
    return this.context.currentTime;
  }

  get isPlaying(): boolean {
    return this.transport.isPlaying;
  }

  get bpm(): number {
    return this.transport.bpm;
  }

  onTick(listener: TickListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  on(event: TransportEvent, listener: WorkletTransportListener): () => void {
    const set = this.eventListeners.get(event) ?? new Set();
    set.add(listener);
    this.eventListeners.set(event, set);
    return () => this.off(event, listener);
  }

  off(event: TransportEvent, listener: WorkletTransportListener): void {
    const set = this.eventListeners.get(event);
    if (!set) {
      return;
    }
    set.delete(listener);
    if (set.size === 0) {
      this.eventListeners.delete(event);
    }
  }

  start(atTime = this.context.currentTime): void {
    this.transport.start(atTime);
    this.post({ type: 'start', time: atTime, beat: this.transport.getBeatAtTime(atTime) });
    this.emit('start');
  }

  stop(atTime = this.context.currentTime): void {
    this.transport.stop(atTime);
    this.post({ type: 'stop', time: atTime });
    this.emit('stop');
  }

  seek(beat: number, atTime = this.context.currentTime): void {
    this.transport.seek(beat, atTime);
    this.post({ type: 'seek', time: atTime, beat });
    this.emit('seek');
  }

  setTempo(bpm: number, atTime = this.context.currentTime): void {
    this.transport.setTempo(bpm, atTime);
    this.post({ type: 'tempo', time: atTime, bpm });
    this.emit('tempo');
  }

  scheduleTempoChange(bpm: number, atTime: number): void {
    this.transport.scheduleTempoChange(bpm, atTime);
    this.post({ type: 'schedule-tempo', time: atTime, bpm });
    this.emit('tempo');
  }

  getBeatAtTime(time: number): number {
    return this.transport.getBeatAtTime(time);
  }

  getTimeAtBeat(beat: number): number {
    return this.transport.getTimeAtBeat(beat);
  }

  getPhaseAtTime(time: number, cycleBeats: number): number {
    return this.transport.getPhaseAtTime(time, cycleBeats);
  }

  dispose(): void {
    if (!this.node) {
      return;
    }
    this.node.port.onmessage = null;
    this.node.disconnect();
    this.node = null;
    this.listeners.clear();
    this.eventListeners.clear();
  }

  private post(message: WorkletCommand): void {
    if (!this.node) {
      return;
    }
    this.node.port.postMessage(message);
  }

  private emit(event: TransportEvent): void {
    const set = this.eventListeners.get(event);
    if (!set) {
      return;
    }
    set.forEach((listener) => listener(this));
  }
}
