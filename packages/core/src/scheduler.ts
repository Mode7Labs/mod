import { TransportLike } from './transport';

export interface Schedulable {
  schedule(transport: TransportLike, windowStartTime: number, windowEndTime: number): void;
}

export interface SchedulerOptions {
  lookaheadMs?: number;
  intervalMs?: number;
}

export class Scheduler {
  private readonly transport: TransportLike;
  private readonly lookaheadSec: number;
  private readonly intervalMs: number;
  private readonly schedulables = new Set<Schedulable>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private cursorTime = 0;

  constructor(transport: TransportLike, options: SchedulerOptions = {}) {
    this.transport = transport;
    // Lookahead trades CPU for timing stability by scheduling into the audio clock.
    this.lookaheadSec = (options.lookaheadMs ?? 100) / 1000;
    // The interval only drives the scheduler loop, never actual event timing.
    this.intervalMs = options.intervalMs ?? 25;
  }

  add(schedulable: Schedulable): void {
    this.schedulables.add(schedulable);
  }

  remove(schedulable: Schedulable): void {
    this.schedulables.delete(schedulable);
  }

  start(useTimer = true): void {
    if (!useTimer) {
      this.cursorTime = this.transport.currentTime;
      return;
    }
    if (this.timer) {
      return;
    }
    this.cursorTime = this.transport.currentTime;
    this.timer = setInterval(() => this.advance(), this.intervalMs);
  }

  stop(): void {
    if (!this.timer) {
      return;
    }
    clearInterval(this.timer);
    this.timer = null;
  }

  reset(): void {
    this.cursorTime = this.transport.currentTime;
  }

  advance(nowOverride?: number): void {
    const now = nowOverride ?? this.transport.currentTime;
    if (!this.transport.isPlaying) {
      // Keep the cursor aligned with the context clock so scheduling resumes cleanly.
      this.cursorTime = now;
      return;
    }
    const windowEnd = now + this.lookaheadSec;
    const windowStart = Math.max(this.cursorTime, now);
    if (windowEnd <= windowStart) {
      return;
    }
    this.schedulables.forEach((schedulable) => {
      schedulable.schedule(this.transport, windowStart, windowEnd);
    });
    this.cursorTime = windowEnd;
  }
}
