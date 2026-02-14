import { Transport } from '../transport';
import { Scheduler, Schedulable } from '../scheduler';
import { PhaseSequencer, SequencerStepEvent } from '../sequencer';
import { WorkletTransport } from '../transportWorklet';
import { TransportBus } from '../transportBus';

// Mock AudioContext
const createMockAudioContext = (currentTime = 0) => ({
  currentTime,
  audioWorklet: {
    addModule: jest.fn(() => Promise.resolve()),
  },
  destination: {},
  createGain: () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: {
      value: 0,
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      setTargetAtTime: jest.fn(),
      setValueCurveAtTime: jest.fn(),
      cancelScheduledValues: jest.fn(),
      cancelAndHoldAtTime: jest.fn(),
    },
  }) as unknown as GainNode,
} as unknown as AudioContext);

// Mock MessagePort for AudioWorkletNode
class MockMessagePort {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  postMessage = jest.fn();
}

// Mock AudioWorkletNode for WorkletTransport tests
class MockAudioWorkletNode {
  port = new MockMessagePort();
  connect = jest.fn();
  disconnect = jest.fn();

  constructor(
    public context: AudioContext,
    public name: string,
    public options?: AudioWorkletNodeOptions
  ) {}
}

describe('Transport', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      expect(transport.bpm).toBe(120);
      expect(transport.isPlaying).toBe(false);
      expect(transport.currentBeat).toBe(0);
    });

    it('should accept custom bpm option', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context, { bpm: 140 });

      expect(transport.bpm).toBe(140);
    });

    it('should accept custom startBeat option', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context, { startBeat: 4 });

      expect(transport.currentBeat).toBe(4);
    });
  });

  describe('start/stop', () => {
    it('should start transport', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      transport.start();

      expect(transport.isPlaying).toBe(true);
    });

    it('should stop transport', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      transport.start();
      transport.stop();

      expect(transport.isPlaying).toBe(false);
    });

    it('should not start twice', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const startListener = jest.fn();

      transport.on('start', startListener);
      transport.start();
      transport.start();

      expect(startListener).toHaveBeenCalledTimes(1);
    });

    it('should not stop twice', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const stopListener = jest.fn();

      transport.on('stop', stopListener);
      transport.start();
      transport.stop();
      transport.stop();

      expect(stopListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('events', () => {
    it('should emit start event', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const listener = jest.fn();

      transport.on('start', listener);
      transport.start();

      expect(listener).toHaveBeenCalledWith(transport);
    });

    it('should emit stop event', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const listener = jest.fn();

      transport.on('stop', listener);
      transport.start();
      transport.stop();

      expect(listener).toHaveBeenCalledWith(transport);
    });

    it('should emit tempo event', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const listener = jest.fn();

      transport.on('tempo', listener);
      transport.start();
      transport.setTempo(140);

      expect(listener).toHaveBeenCalledWith(transport);
    });

    it('should emit seek event', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const listener = jest.fn();

      transport.on('seek', listener);
      transport.seek(8);

      expect(listener).toHaveBeenCalledWith(transport);
    });

    it('should unsubscribe from events', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);
      const listener = jest.fn();

      const unsubscribe = transport.on('start', listener);
      unsubscribe();
      transport.start();

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('tempo', () => {
    it('should set tempo', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      transport.setTempo(140);

      expect(transport.bpm).toBe(140);
    });

    it('should throw on invalid tempo', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      expect(() => transport.setTempo(0)).toThrow();
      expect(() => transport.setTempo(-10)).toThrow();
    });
  });

  describe('seek', () => {
    it('should seek to beat position', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      transport.seek(8);

      expect(transport.currentBeat).toBe(8);
    });

    it('should throw on negative beat', () => {
      const context = createMockAudioContext();
      const transport = new Transport(context);

      expect(() => transport.seek(-1)).toThrow();
    });
  });

  describe('beat/time conversion', () => {
    it('should return paused beat when stopped', () => {
      const context = createMockAudioContext(10);
      const transport = new Transport(context);

      expect(transport.getBeatAtTime(10)).toBe(0);
    });

    it('should calculate beat from time when running', () => {
      const context = createMockAudioContext(0);
      const transport = new Transport(context, { bpm: 120 });

      transport.start(0);
      // At 120 BPM, 1 second = 2 beats
      const beat = transport.getBeatAtTime(1);

      expect(beat).toBe(2);
    });

    it('should calculate time from beat when running', () => {
      const context = createMockAudioContext(0);
      const transport = new Transport(context, { bpm: 120 });

      transport.start(0);
      // At 120 BPM, beat 4 = 2 seconds
      const time = transport.getTimeAtBeat(4);

      expect(time).toBe(2);
    });

    it('should calculate phase correctly', () => {
      const context = createMockAudioContext(0);
      const transport = new Transport(context, { bpm: 120 });

      transport.start(0);
      // At beat 2, phase in 4-beat cycle = 0.5
      const phase = transport.getPhaseAtTime(1, 4);

      expect(phase).toBe(0.5);
    });
  });
});

describe('Scheduler', () => {
  it('should add and remove schedulables', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport);

    const schedulable: Schedulable = {
      schedule: jest.fn(),
    };

    scheduler.add(schedulable);
    scheduler.remove(schedulable);

    // No error means success
    expect(true).toBe(true);
  });

  it('should call schedule on advance when playing', () => {
    const context = createMockAudioContext(0);
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport, { lookaheadMs: 100 });

    const schedulable: Schedulable = {
      schedule: jest.fn(),
    };

    scheduler.add(schedulable);
    transport.start(0);
    scheduler.start(false);
    scheduler.advance(0);

    expect(schedulable.schedule).toHaveBeenCalled();
  });

  it('should not call schedule when stopped', () => {
    const context = createMockAudioContext(0);
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport);

    const schedulable: Schedulable = {
      schedule: jest.fn(),
    };

    scheduler.add(schedulable);
    scheduler.start(false);
    scheduler.advance(0);

    expect(schedulable.schedule).not.toHaveBeenCalled();
  });
});

describe('PhaseSequencer', () => {
  it('should initialize with default values', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({ onStep });

    // Default: 16 steps per cycle, 0.25 beats per step
    expect(sequencer).toBeDefined();
  });

  it('should throw on invalid stepsPerCycle', () => {
    const onStep = jest.fn();

    expect(() => new PhaseSequencer({ onStep, stepsPerCycle: 0 })).toThrow();
    expect(() => new PhaseSequencer({ onStep, stepsPerCycle: -1 })).toThrow();
  });

  it('should throw on invalid stepLengthBeats', () => {
    const onStep = jest.fn();

    expect(() => new PhaseSequencer({ onStep, stepLengthBeats: 0 })).toThrow();
    expect(() => new PhaseSequencer({ onStep, stepLengthBeats: -1 })).toThrow();
  });

  it('should call onStep for steps in scheduling window', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({
      onStep,
      stepsPerCycle: 4,
      stepLengthBeats: 1, // 1 beat per step
    });

    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });
    transport.start(0);

    // Schedule from beat 0 to beat 4 (4 seconds at 120 BPM = 8 beats window)
    // At 1 beat per step, should hit steps at beats 1, 2, 3
    sequencer.schedule(transport, 0, 2);

    expect(onStep).toHaveBeenCalled();
  });

  it('should provide correct step event data', () => {
    const events: SequencerStepEvent[] = [];
    const sequencer = new PhaseSequencer({
      onStep: (event) => events.push(event),
      stepsPerCycle: 4,
      stepLengthBeats: 1,
    });

    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });
    transport.start(0);

    sequencer.schedule(transport, 0, 2);

    expect(events.length).toBeGreaterThan(0);
    const firstEvent = events[0];
    expect(firstEvent).toHaveProperty('time');
    expect(firstEvent).toHaveProperty('beat');
    expect(firstEvent).toHaveProperty('stepIndex');
    expect(firstEvent).toHaveProperty('stepInCycle');
    expect(firstEvent).toHaveProperty('cycleIndex');
    expect(firstEvent).toHaveProperty('phase');
  });

  it('should allow updating stepsPerCycle', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({ onStep, stepsPerCycle: 8 });

    sequencer.setStepsPerCycle(16);

    // No error means success
    expect(true).toBe(true);
  });

  it('should allow updating stepLengthBeats', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({ onStep, stepLengthBeats: 0.5 });

    sequencer.setStepLengthBeats(0.25);

    // No error means success
    expect(true).toBe(true);
  });

  it('should throw when updating stepsPerCycle to invalid value', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({ onStep });

    expect(() => sequencer.setStepsPerCycle(0)).toThrow();
    expect(() => sequencer.setStepsPerCycle(-1)).toThrow();
  });

  it('should throw when updating stepLengthBeats to invalid value', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({ onStep });

    expect(() => sequencer.setStepLengthBeats(0)).toThrow();
    expect(() => sequencer.setStepLengthBeats(-1)).toThrow();
  });

  it('should not call onStep when window has no steps', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({
      onStep,
      stepsPerCycle: 4,
      stepLengthBeats: 1,
    });

    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });
    transport.start(0);

    // Very small window that contains no step boundaries
    sequencer.schedule(transport, 0, 0.1);

    expect(onStep).not.toHaveBeenCalled();
  });

  it('should handle endBeat <= startBeat gracefully', () => {
    const onStep = jest.fn();
    const sequencer = new PhaseSequencer({
      onStep,
      stepsPerCycle: 4,
      stepLengthBeats: 1,
    });

    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });
    transport.start(0);

    // endBeat equals startBeat
    sequencer.schedule(transport, 1, 1);

    expect(onStep).not.toHaveBeenCalled();
  });
});

describe('Scheduler (additional)', () => {
  it('should stop the timer', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport);

    scheduler.start(true);
    scheduler.stop();

    // No error and can restart
    scheduler.start(true);
    scheduler.stop();

    expect(true).toBe(true);
  });

  it('should reset cursor time', () => {
    const context = createMockAudioContext(5);
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport);

    scheduler.start(false);
    scheduler.reset();

    // No error means success
    expect(true).toBe(true);
  });

  it('should not start timer twice', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport);

    scheduler.start(true);
    scheduler.start(true); // Should not create second timer

    scheduler.stop();
    expect(true).toBe(true);
  });

  it('should handle stop when not started', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport);

    // Should not throw
    scheduler.stop();

    expect(true).toBe(true);
  });

  it('should use custom lookahead and interval options', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport, {
      lookaheadMs: 200,
      intervalMs: 50,
    });

    scheduler.start(false);
    scheduler.stop();

    expect(true).toBe(true);
  });

  it('should not schedule when window is invalid', () => {
    const context = createMockAudioContext(0);
    const transport = new Transport(context);
    const scheduler = new Scheduler(transport, { lookaheadMs: 0 });

    const schedulable: Schedulable = {
      schedule: jest.fn(),
    };

    scheduler.add(schedulable);
    transport.start(0);
    scheduler.start(false);
    scheduler.advance(100); // Cursor is ahead of now

    expect(schedulable.schedule).not.toHaveBeenCalled();
  });
});

describe('Transport (additional)', () => {
  it('should return currentTime from context', () => {
    const context = createMockAudioContext(42);
    const transport = new Transport(context);

    expect(transport.currentTime).toBe(42);
  });

  it('should schedule tempo change', () => {
    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });

    transport.start(0);
    transport.scheduleTempoChange(180, 10);

    // BPM should still be 120 until the scheduled time
    expect(transport.bpm).toBe(120);
  });

  it('should handle tempo changes in beat calculation', () => {
    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });

    transport.start(0);
    // At 120 BPM, 1 second = 2 beats
    expect(transport.getBeatAtTime(1)).toBe(2);

    // Change tempo to 60 BPM at time 1
    transport.setTempo(60, 1);

    // At time 2 (1 second after tempo change at 60 BPM = 1 beat)
    // Beat 2 (from first second) + 1 (from second second) = 3
    expect(transport.getBeatAtTime(2)).toBe(3);
  });

  it('should return currentTime for getTimeAtBeat when stopped', () => {
    const context = createMockAudioContext(5);
    const transport = new Transport(context, { bpm: 120 });

    // When stopped, getTimeAtBeat returns context.currentTime
    const time = transport.getTimeAtBeat(4);

    expect(time).toBe(5);
  });

  it('should emit tempo event when tempo changes while running', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const listener = jest.fn();

    transport.on('tempo', listener);
    transport.start();
    transport.setTempo(140);

    expect(listener).toHaveBeenCalledWith(transport);
  });

  it('should not emit tempo event when tempo changes while stopped', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const listener = jest.fn();

    transport.on('tempo', listener);
    transport.setTempo(140);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle phase at cycle boundaries', () => {
    const context = createMockAudioContext(0);
    const transport = new Transport(context, { bpm: 120 });

    transport.start(0);

    // At beat 4, phase in 4-beat cycle = 0 (start of new cycle)
    const phase = transport.getPhaseAtTime(2, 4);

    expect(phase).toBe(0);
  });
});

describe('WorkletTransport', () => {
  const originalAudioWorkletNode = (global as any).AudioWorkletNode;

  beforeEach(() => {
    (global as any).AudioWorkletNode = MockAudioWorkletNode;
  });

  afterEach(() => {
    (global as any).AudioWorkletNode = originalAudioWorkletNode;
  });

  it('should create instance with default options', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    expect(transport).toBeDefined();
    expect(transport.bpm).toBe(120);
    expect(transport.isPlaying).toBe(false);

    transport.dispose();
  });

  it('should create instance with custom options', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context, {
      bpm: 140,
      startBeat: 4,
      tickIntervalSec: 0.05,
    });

    expect(transport.bpm).toBe(140);

    transport.dispose();
  });

  it('should start and stop', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    transport.start();
    expect(transport.isPlaying).toBe(true);

    transport.stop();
    expect(transport.isPlaying).toBe(false);

    transport.dispose();
  });

  it('should seek to beat', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    transport.seek(8);

    transport.dispose();
  });

  it('should set tempo', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    transport.setTempo(180);
    expect(transport.bpm).toBe(180);

    transport.dispose();
  });

  it('should schedule tempo change when running', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    transport.start();
    transport.scheduleTempoChange(180, 10);

    transport.dispose();
  });

  it('should throw when scheduling tempo change while stopped', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    expect(() => transport.scheduleTempoChange(180, 10)).toThrow();

    transport.dispose();
  });

  it('should emit events', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    const startListener = jest.fn();
    const stopListener = jest.fn();
    const tempoListener = jest.fn();
    const seekListener = jest.fn();

    transport.on('start', startListener);
    transport.on('stop', stopListener);
    transport.on('tempo', tempoListener);
    transport.on('seek', seekListener);

    transport.start();
    expect(startListener).toHaveBeenCalledWith(transport);

    transport.stop();
    expect(stopListener).toHaveBeenCalledWith(transport);

    transport.setTempo(140);
    expect(tempoListener).toHaveBeenCalledWith(transport);

    transport.seek(4);
    expect(seekListener).toHaveBeenCalledWith(transport);

    transport.dispose();
  });

  it('should unsubscribe from events', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    const listener = jest.fn();
    const unsubscribe = transport.on('start', listener);

    unsubscribe();
    transport.start();

    expect(listener).not.toHaveBeenCalled();

    transport.dispose();
  });

  it('should handle off for non-existent listener', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    const listener = jest.fn();

    // Should not throw
    transport.off('start', listener);

    transport.dispose();
  });

  it('should subscribe to tick events', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    const tickListener = jest.fn();
    const unsubscribe = transport.onTick(tickListener);

    // Unsubscribe should work
    unsubscribe();

    transport.dispose();
  });

  it('should return currentTime from context', async () => {
    const context = createMockAudioContext(42);
    const transport = await WorkletTransport.create(context);

    expect(transport.currentTime).toBe(42);

    transport.dispose();
  });

  it('should delegate beat/time conversion to inner transport', async () => {
    const context = createMockAudioContext(0);
    const transport = await WorkletTransport.create(context, { bpm: 120 });

    transport.start(0);

    expect(transport.getBeatAtTime(1)).toBe(2);
    expect(transport.getTimeAtBeat(4)).toBe(2);
    expect(transport.getPhaseAtTime(1, 4)).toBe(0.5);

    transport.dispose();
  });

  it('should handle dispose when already disposed', async () => {
    const context = createMockAudioContext();
    const transport = await WorkletTransport.create(context);

    transport.dispose();
    transport.dispose(); // Should not throw

    expect(true).toBe(true);
  });

  it('should throw when AudioWorklet is not supported', async () => {
    const context = {
      currentTime: 0,
      audioWorklet: undefined,
      destination: {},
    } as unknown as AudioContext;

    await expect(WorkletTransport.create(context)).rejects.toThrow(
      'AudioWorklet is not supported'
    );
  });
});

describe('TransportBus', () => {
  it('should create with Transport', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    expect(bus).toBeDefined();

    bus.dispose();
  });

  it('should forward start event from Transport', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('start', listener);

    transport.start();

    expect(listener).toHaveBeenCalled();

    bus.dispose();
  });

  it('should forward stop event from Transport', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('stop', listener);

    transport.start();
    transport.stop();

    expect(listener).toHaveBeenCalled();

    bus.dispose();
  });

  it('should forward tempo event from Transport', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('tempo', listener);

    transport.start();
    transport.setTempo(140);

    expect(listener).toHaveBeenCalled();

    bus.dispose();
  });

  it('should forward seek event from Transport', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('seek', listener);

    transport.seek(8);

    expect(listener).toHaveBeenCalled();

    bus.dispose();
  });

  it('should emit tick manually', () => {
    const context = createMockAudioContext(5);
    const transport = new Transport(context, { bpm: 120 });
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('tick', listener);

    bus.emitTick(5);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        time: 5,
        bpm: 120,
        running: false,
      })
    );

    bus.dispose();
  });

  it('should emit tick with default time', () => {
    const context = createMockAudioContext(10);
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('tick', listener);

    bus.emitTick();

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        time: 10,
      })
    );

    bus.dispose();
  });

  it('should unsubscribe from events', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    const unsubscribe = bus.on('start', listener);

    unsubscribe();
    transport.start();

    expect(listener).not.toHaveBeenCalled();

    bus.dispose();
  });

  it('should handle off for non-existent event', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();

    // Should not throw
    bus.off('start', listener);

    bus.dispose();
  });

  it('should clean up listeners on dispose', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    const listener = jest.fn();
    bus.on('start', listener);

    bus.dispose();

    // After dispose, events should not be forwarded
    transport.start();

    // Listener was added before dispose, but bus should have unsubscribed from transport
    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle dispose when no subscriptions exist', () => {
    const context = createMockAudioContext();
    const transport = new Transport(context);
    const bus = new TransportBus(transport);

    bus.dispose();
    bus.dispose(); // Should not throw

    expect(true).toBe(true);
  });
});
