# Transport System

The Transport system provides DAW-style timing and scheduling for sample-accurate sequencing and synchronization. It includes tempo control, beat/time conversion, and event scheduling.

## Overview

The Transport system consists of several components:

| Component | Purpose |
|-----------|---------|
| `TransportProvider` | React context provider for Transport integration |
| `useTransport` | Hook to access transport state and controls |
| `Transport` | Core timing engine (play/stop/seek/tempo) |
| `WorkletTransport` | AudioWorklet-based transport for sample-accurate ticks |
| `TransportBus` | Event bus for syncing components to transport |
| `Scheduler` | Lookahead scheduler for jitter-free event scheduling |
| `PhaseSequencer` | Utility for step sequencer patterns |

## TransportProvider

The recommended way to use Transport in MOD applications. Wraps the Transport class in a React context, following the same pattern as `AudioProvider`.

### Import

```tsx
import { TransportProvider, useTransport } from '@mode-7/mod';
```

### Usage

```tsx
import { AudioProvider, TransportProvider, useTransport, ToneGenerator, Monitor } from '@mode-7/mod';

function TransportControls() {
  const { isPlaying, bpm, currentBeat, start, stop, setBpm } = useTransport();

  return (
    <div>
      <button onClick={isPlaying ? stop : start}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <span>Beat: {currentBeat.toFixed(2)}</span>
      <input
        type="range"
        min={60}
        max={200}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
      />
      <span>{bpm} BPM</span>
    </div>
  );
}

function App() {
  return (
    <AudioProvider>
      <TransportProvider bpm={120}>
        <TransportControls />
        {/* Your audio components here */}
      </TransportProvider>
    </AudioProvider>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bpm` | `number` | `120` | Initial tempo in beats per minute |
| `startBeat` | `number` | `0` | Initial beat position |
| `children` | `ReactNode` | Required | Child components |

### useTransport Hook

Returns transport state and control functions:

| Property | Type | Description |
|----------|------|-------------|
| `transport` | `Transport \| null` | The underlying Transport instance |
| `isPlaying` | `boolean` | Whether transport is running |
| `bpm` | `number` | Current tempo |
| `currentBeat` | `number` | Current beat position (updates during playback) |
| `start` | `() => void` | Start playback |
| `stop` | `() => void` | Stop playback |
| `seek` | `(beat: number) => void` | Seek to beat position |
| `setBpm` | `(bpm: number) => void` | Change tempo |

## Transport

The core timing class that tracks playback position and tempo.

### Import

```tsx
import { Transport } from '@mode-7/mod';
```

### Usage

```tsx
const audioContext = new AudioContext();
const transport = new Transport(audioContext, { bpm: 120 });

// Start/stop
transport.start();
transport.stop();

// Get current position
const beat = transport.currentBeat;
const time = transport.currentTime;

// Seek to a beat position
transport.seek(8);

// Change tempo
transport.setTempo(140);

// Listen to events
transport.on('start', () => console.log('Started'));
transport.on('stop', () => console.log('Stopped'));
transport.on('tempo', () => console.log('Tempo changed'));
transport.on('seek', () => console.log('Seeked'));
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bpm` | `number` | `120` | Initial tempo in beats per minute |
| `startBeat` | `number` | `0` | Initial beat position |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isPlaying` | `boolean` | Whether transport is running |
| `bpm` | `number` | Current tempo |
| `currentTime` | `number` | Current AudioContext time |
| `currentBeat` | `number` | Current beat position |

### Methods

| Method | Description |
|--------|-------------|
| `start(atTime?)` | Start playback |
| `stop(atTime?)` | Stop playback |
| `seek(beat, atTime?)` | Seek to beat position |
| `setTempo(bpm, atTime?)` | Change tempo |
| `scheduleTempoChange(bpm, atTime)` | Schedule future tempo change |
| `getBeatAtTime(time)` | Convert time to beat |
| `getTimeAtBeat(beat)` | Convert beat to time |
| `getPhaseAtTime(time, cycleBeats)` | Get phase (0-1) within a cycle |
| `on(event, listener)` | Subscribe to events |
| `off(event, listener)` | Unsubscribe from events |

## WorkletTransport

An AudioWorklet-based transport that provides sample-accurate tick callbacks on the audio thread.

### Import

```tsx
import { WorkletTransport } from '@mode-7/mod';
```

### Usage

```tsx
const audioContext = new AudioContext();
const transport = await WorkletTransport.create(audioContext, { bpm: 140 });

// Listen to ticks (called on each audio frame)
transport.onTick((tick) => {
  console.log(`Beat: ${tick.beat}, Time: ${tick.time}, BPM: ${tick.bpm}`);
});

transport.start();
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bpm` | `number` | `120` | Initial tempo |
| `startBeat` | `number` | `0` | Initial beat position |
| `tickIntervalSec` | `number` | `0.025` | Tick interval (25ms default) |

### Tick Event

```tsx
interface TransportTick {
  type: 'tick';
  time: number;      // AudioContext time
  beat: number;      // Current beat position
  bpm: number;       // Current tempo
  running: boolean;  // Is transport playing
}
```

## Scheduler

A lookahead scheduler that provides jitter-free event scheduling by looking ahead into the audio timeline.

### Import

```tsx
import { Scheduler } from '@mode-7/mod';
```

### Usage

```tsx
const transport = new Transport(audioContext, { bpm: 120 });
const scheduler = new Scheduler(transport, { lookaheadMs: 100 });

// Add a schedulable object
scheduler.add(mySequencer);

// Start scheduling loop
transport.start();
scheduler.start();

// Stop
scheduler.stop();
```

### Schedulable Interface

Objects added to the scheduler must implement:

```tsx
interface Schedulable {
  schedule(transport: TransportLike, windowStartTime: number, windowEndTime: number): void;
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lookaheadMs` | `number` | `100` | How far ahead to schedule (ms) |
| `intervalMs` | `number` | `25` | Scheduler tick interval (ms) |

## PhaseSequencer

A utility for implementing step sequencer patterns. Implements the `Schedulable` interface.

### Import

```tsx
import { PhaseSequencer } from '@mode-7/mod';
```

### Usage

```tsx
const sequencer = new PhaseSequencer({
  stepsPerCycle: 16,
  stepLengthBeats: 0.25, // 16th notes
  onStep: (event) => {
    console.log(`Step ${event.stepInCycle} at beat ${event.beat}`);
    // Trigger notes, envelopes, etc.
  },
});

const scheduler = new Scheduler(transport);
scheduler.add(sequencer);
transport.start();
scheduler.start();
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stepsPerCycle` | `number` | `16` | Steps in one cycle |
| `stepLengthBeats` | `number` | `0.25` | Beat duration per step |
| `onStep` | `function` | Required | Callback for each step |

### Step Event

```tsx
interface SequencerStepEvent {
  time: number;       // AudioContext time for this step
  beat: number;       // Beat position
  stepIndex: number;  // Absolute step index
  stepInCycle: number; // Step within current cycle (0 to stepsPerCycle-1)
  cycleIndex: number; // Which cycle we're in
  phase: number;      // Phase within cycle (0-1)
}
```

## TransportBus

An event bus that bridges different transport types and provides a unified event interface.

### Import

```tsx
import { TransportBus } from '@mode-7/mod';
```

### Usage

```tsx
const transport = await WorkletTransport.create(audioContext);
const bus = new TransportBus(transport);

// Listen to unified events
bus.on('tick', (tick) => {
  // Update UI, etc.
});

bus.on('start', () => console.log('Started'));
bus.on('stop', () => console.log('Stopped'));

// Clean up
bus.dispose();
```

## Complete Example with TransportProvider

The recommended approach using React context:

```tsx
import {
  AudioProvider,
  TransportProvider,
  useTransport,
  ToneGenerator,
  Monitor,
} from '@mode-7/mod';
import { useRef } from 'react';

function TransportControls() {
  const { isPlaying, bpm, currentBeat, start, stop, setBpm } = useTransport();

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button onClick={isPlaying ? stop : start}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <span style={{ margin: '0 1rem' }}>
        Beat: {currentBeat.toFixed(2)}
      </span>
      <input
        type="range"
        min={60}
        max={200}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
      />
      <span>{bpm} BPM</span>
    </div>
  );
}

function Synth() {
  const toneOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} frequency={440} />
      <Monitor input={toneOut} />
    </>
  );
}

function App() {
  return (
    <AudioProvider>
      <TransportProvider bpm={120}>
        <TransportControls />
        <Synth />
      </TransportProvider>
    </AudioProvider>
  );
}
```

## Advanced Example with Scheduler

For more complex sequencing with lookahead scheduling:

```tsx
import {
  Transport,
  Scheduler,
  PhaseSequencer,
  ToneGenerator,
  ADSR,
  Monitor,
} from '@mode-7/mod';
import { useRef, useEffect, useState } from 'react';

function StepSequencer() {
  const toneOut = useRef(null);
  const adsrOut = useRef(null);
  const [transport, setTransport] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioContext = new AudioContext();
    const t = new Transport(audioContext, { bpm: 120 });
    const scheduler = new Scheduler(t, { lookaheadMs: 100 });

    const notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale

    const sequencer = new PhaseSequencer({
      stepsPerCycle: 8,
      stepLengthBeats: 0.5, // 8th notes
      onStep: (event) => {
        const note = notes[event.stepInCycle % notes.length];
        const freq = 440 * Math.pow(2, (note - 69) / 12);
        // Trigger note (you'd update your ToneGenerator here)
        console.log(`Play note ${note} (${freq.toFixed(1)} Hz) at ${event.time}`);
      },
    });

    scheduler.add(sequencer);
    setTransport({ transport: t, scheduler });

    return () => {
      scheduler.stop();
    };
  }, []);

  const togglePlay = () => {
    if (!transport) return;

    if (isPlaying) {
      transport.transport.stop();
      transport.scheduler.stop();
    } else {
      transport.transport.start();
      transport.scheduler.start();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <button onClick={togglePlay}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <ToneGenerator output={toneOut} frequency={440} />
      <ADSR input={toneOut} output={adsrOut} />
      <Monitor input={adsrOut} />
    </div>
  );
}
```

## Notes

### Timing Accuracy

- `Transport` uses JavaScript timing, suitable for most UI-driven applications
- `WorkletTransport` runs on the audio thread for sample-accurate timing
- Use `Scheduler` with a lookahead for jitter-free event scheduling

### Tempo Changes

- Tempo changes are tracked with a tempo map for accurate beat/time conversion
- `setTempo()` changes tempo immediately
- `scheduleTempoChange()` schedules a tempo change for a future time

### Phase Calculation

The `getPhaseAtTime()` method returns a value from 0-1 representing position within a cycle. Useful for:
- LFO phase synchronization
- Visualizations
- Swing/groove calculations

## Related

- [Clock](/api/cv/clock) - Simpler clock pulse generator
- [Sequencer](/api/cv/sequencer) - Step sequencer component
- [LFO](/api/cv/lfo) - Low-frequency oscillator
