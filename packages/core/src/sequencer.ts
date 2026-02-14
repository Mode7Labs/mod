import { TransportLike } from './transport';
import { Schedulable } from './scheduler';

export interface SequencerStepEvent {
  time: number;
  beat: number;
  stepIndex: number;
  stepInCycle: number;
  cycleIndex: number;
  phase: number;
}

export interface PhaseSequencerOptions {
  stepsPerCycle?: number;
  stepLengthBeats?: number;
  onStep: (event: SequencerStepEvent) => void;
}

export class PhaseSequencer implements Schedulable {
  private stepsPerCycle: number;
  private stepLengthBeats: number;
  private onStep: (event: SequencerStepEvent) => void;

  constructor(options: PhaseSequencerOptions) {
    this.stepsPerCycle = options.stepsPerCycle ?? 16;
    this.stepLengthBeats = options.stepLengthBeats ?? 0.25;
    this.onStep = options.onStep;
    this.assertValid();
  }

  setStepsPerCycle(steps: number): void {
    this.stepsPerCycle = steps;
    this.assertValid();
  }

  setStepLengthBeats(stepLengthBeats: number): void {
    this.stepLengthBeats = stepLengthBeats;
    this.assertValid();
  }

  schedule(transport: TransportLike, windowStartTime: number, windowEndTime: number): void {
    // Convert the scheduling window from time to beats to keep sequencing phase-locked.
    const startBeat = transport.getBeatAtTime(windowStartTime);
    const endBeat = transport.getBeatAtTime(windowEndTime);
    if (endBeat <= startBeat) {
      return;
    }
    const stepLength = this.stepLengthBeats;
    const cycleBeats = this.stepsPerCycle * stepLength;
    const epsilon = 1e-9;
    // Snap to the next step boundary so windows never double-schedule a step.
    let stepIndex = Math.floor(startBeat / stepLength);
    let stepBeat = stepIndex * stepLength;
    if (stepBeat < startBeat + epsilon) {
      stepIndex += 1;
      stepBeat += stepLength;
    }
    while (stepBeat < endBeat - epsilon) {
      const time = transport.getTimeAtBeat(stepBeat);
      const stepInCycle = ((stepIndex % this.stepsPerCycle) + this.stepsPerCycle) % this.stepsPerCycle;
      const cycleIndex = Math.floor(stepIndex / this.stepsPerCycle);
      const phase = cycleBeats > 0 ? ((stepBeat % cycleBeats) + cycleBeats) % cycleBeats / cycleBeats : 0;
      this.onStep({
        time,
        beat: stepBeat,
        stepIndex,
        stepInCycle,
        cycleIndex,
        phase,
      });
      stepIndex += 1;
      stepBeat += stepLength;
    }
  }

  private assertValid(): void {
    if (this.stepsPerCycle <= 0) {
      throw new Error('PhaseSequencer: stepsPerCycle must be > 0.');
    }
    if (this.stepLengthBeats <= 0) {
      throw new Error('PhaseSequencer: stepLengthBeats must be > 0.');
    }
  }
}
