import { Transport, TransportEvent, TransportLike, TransportOptions } from './transport';
import { getWorkletUrl } from './workletUrl';

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

const workletLoaders = new WeakMap<AudioContext, Promise<void>>();

const loadTransportWorklet = (audioContext: AudioContext) => {
  let loader = workletLoaders.get(audioContext);
  if (!loader) {
    const url = getWorkletUrl('transport-clock.js');
    loader = audioContext.audioWorklet.addModule(url).catch((err) => {
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
  private keepAliveGain: GainNode | null = null;
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
      numberOfOutputs: 3,
      outputChannelCount: [1, 1, 1],
    });
    // Keep the worklet pulling audio without audibly monitoring the CV pulses.
    const keepAlive = context.createGain();
    keepAlive.gain.value = 0;
    node.connect(keepAlive);
    keepAlive.connect(context.destination);
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
    instance.keepAliveGain = keepAlive;
    return instance;
  }

  getNode(): AudioWorkletNode | null {
    return this.node;
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
    if (this.keepAliveGain) {
      this.keepAliveGain.disconnect();
      this.keepAliveGain = null;
    }
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
