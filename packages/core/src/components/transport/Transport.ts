export type TransportState = 'stopped' | 'running';

export type TransportEvent = 'start' | 'stop' | 'tempo' | 'seek';

type TransportListener = (transport: Transport) => void;

interface TempoEvent {
  time: number;
  bpm: number;
}

export interface TransportOptions {
  bpm?: number;
  startBeat?: number;
}

export interface TransportLike {
  readonly currentTime: number;
  readonly isPlaying: boolean;
  getBeatAtTime(time: number): number;
  getTimeAtBeat(beat: number): number;
  getPhaseAtTime(time: number, cycleBeats: number): number;
}

export class Transport {
  private readonly context: AudioContext;
  private state: TransportState = 'stopped';
  private startTime = 0;
  private startBeat = 0;
  private pausedBeat = 0;
  private bpmValue: number;
  private tempoEvents: TempoEvent[] = [];
  private listeners = new Map<TransportEvent, Set<TransportListener>>();

  constructor(context: AudioContext, options: TransportOptions = {}) {
    this.context = context;
    this.bpmValue = options.bpm ?? 120;
    this.startBeat = options.startBeat ?? 0;
    this.pausedBeat = this.startBeat;
  }

  get isPlaying(): boolean {
    return this.state === 'running';
  }

  get bpm(): number {
    return this.bpmValue;
  }

  get currentTime(): number {
    return this.context.currentTime;
  }

  get currentBeat(): number {
    return this.getBeatAtTime(this.context.currentTime);
  }

  on(event: TransportEvent, listener: TransportListener): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener);
    this.listeners.set(event, set);
    return () => this.off(event, listener);
  }

  off(event: TransportEvent, listener: TransportListener): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    set.delete(listener);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  start(atTime = this.context.currentTime): void {
    if (this.state === 'running') {
      return;
    }
    // Anchor beat zero to an AudioContext time so all phase math stays in audio time.
    this.startTime = atTime;
    this.startBeat = this.pausedBeat;
    this.tempoEvents = [{ time: this.startTime, bpm: this.bpmValue }];
    this.state = 'running';
    this.emit('start');
  }

  stop(atTime = this.context.currentTime): void {
    if (this.state === 'stopped') {
      return;
    }
    // Capture the beat position at the audio clock to resume without drift.
    this.pausedBeat = this.getBeatAtTime(atTime);
    this.state = 'stopped';
    this.emit('stop');
  }

  seek(beat: number, atTime = this.context.currentTime): void {
    if (beat < 0) {
      throw new Error('Transport.seek: beat must be >= 0.');
    }
    this.pausedBeat = beat;
    if (this.state === 'running') {
      this.startTime = atTime;
      this.startBeat = beat;
      this.tempoEvents = [{ time: this.startTime, bpm: this.bpmValue }];
      this.emit('seek');
      return;
    }
    this.startBeat = beat;
    this.emit('seek');
  }

  setTempo(bpm: number, atTime = this.context.currentTime): void {
    if (bpm <= 0) {
      throw new Error('Transport.setTempo: bpm must be > 0.');
    }
    this.bpmValue = bpm;
    if (this.state === 'stopped') {
      return;
    }
    // Insert a tempo boundary at a specific audio time to keep phase continuity.
    const time = Math.max(atTime, this.startTime);
    this.insertTempoEvent({ time, bpm }, true);
    this.emit('tempo');
  }

  scheduleTempoChange(bpm: number, atTime: number): void {
    if (bpm <= 0) {
      throw new Error('Transport.scheduleTempoChange: bpm must be > 0.');
    }
    if (this.state === 'stopped') {
      throw new Error('Transport.scheduleTempoChange: transport is stopped.');
    }
    const time = Math.max(atTime, this.startTime);
    this.insertTempoEvent({ time, bpm }, false);
    this.emit('tempo');
  }

  getBeatAtTime(time: number): number {
    if (this.state === 'stopped') {
      return this.pausedBeat;
    }
    if (time <= this.startTime) {
      return this.startBeat;
    }
    // Integrate tempo between AudioContext times for drift-free beat conversion.
    let beat = this.startBeat;
    let lastTime = this.startTime;
    let bpm = this.tempoEvents[0]?.bpm ?? this.bpmValue;
    for (let i = 1; i < this.tempoEvents.length; i += 1) {
      const event = this.tempoEvents[i];
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

  getTimeAtBeat(beat: number): number {
    if (this.state === 'stopped') {
      return this.context.currentTime;
    }
    if (beat <= this.startBeat) {
      return this.startTime;
    }
    // Invert the tempo map so scheduled events land exactly on the audio clock.
    let currentBeat = this.startBeat;
    let currentTime = this.startTime;
    let bpm = this.tempoEvents[0]?.bpm ?? this.bpmValue;
    for (let i = 1; i < this.tempoEvents.length; i += 1) {
      const next = this.tempoEvents[i];
      const segmentBeats = ((next.time - currentTime) * bpm) / 60;
      if (beat <= currentBeat + segmentBeats) {
        return currentTime + ((beat - currentBeat) * 60) / bpm;
      }
      currentBeat += segmentBeats;
      currentTime = next.time;
      bpm = next.bpm;
    }
    return currentTime + ((beat - currentBeat) * 60) / bpm;
  }

  getPhaseAtTime(time: number, cycleBeats: number): number {
    const beat = this.getBeatAtTime(time);
    const cycle = cycleBeats > 0 ? cycleBeats : 1;
    const phaseBeat = ((beat % cycle) + cycle) % cycle;
    return phaseBeat / cycle;
  }

  private insertTempoEvent(event: TempoEvent, replaceFuture: boolean): void {
    const filtered = this.tempoEvents.filter((existing) => {
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
      filtered.push({ time: this.startTime, bpm: this.bpmValue });
    }
    this.tempoEvents = filtered;
  }

  private emit(event: TransportEvent): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    set.forEach((listener) => listener(this));
  }
}
