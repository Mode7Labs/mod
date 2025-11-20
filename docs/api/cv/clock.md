# Clock

The `Clock` component generates precise timing pulses (gate signals) that can trigger envelopes, sync sequencers, or create rhythmic patterns.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the clock pulses |
| `label` | `string` | `'clock'` | Label for the component in metadata |
| `bpm` | `number` | `120` | Initial tempo in beats per minute |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `bpm` | `number` | Current tempo in beats per minute |
| `setBpm` | `(value: number) => void` | Update the tempo |
| `isRunning` | `boolean` | Whether the clock is running |
| `start` | `() => void` | Start the clock |
| `stop` | `() => void` | Stop the clock |
| `reset` | `() => void` | Stop the clock and reset |

## Usage

### Basic Usage

```tsx
import { Clock, ADSR, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const adsrOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <Clock output={clockOut}>
        {({ start, stop, isRunning }) => (
          <button onClick={isRunning ? stop : start}>
            {isRunning ? 'Stop' : 'Start'}
          </button>
        )}
      </Clock>
      <ADSR gate={clockOut} output={adsrOut} />
      <ToneGenerator output={toneOut} cv={adsrOut} cvAmount={1.0} />
      <Monitor input={toneOut} />
    </>
  );
}
```

### With Tempo Control

```tsx
import { Clock } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);

  return (
    <Clock output={clockOut}>
      {({ bpm, setBpm, isRunning, start, stop, reset }) => (
        <div>
          <div>
            <button onClick={start} disabled={isRunning}>Start</button>
            <button onClick={stop} disabled={!isRunning}>Stop</button>
            <button onClick={reset}>Reset</button>
          </div>

          <div>
            <label>Tempo: {bpm} BPM</label>
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>

          <div>
            <button onClick={() => setBpm(60)}>60</button>
            <button onClick={() => setBpm(90)}>90</button>
            <button onClick={() => setBpm(120)}>120</button>
            <button onClick={() => setBpm(140)}>140</button>
            <button onClick={() => setBpm(180)}>180</button>
          </div>
        </div>
      )}
    </Clock>
  );
}
```

### Triggering Multiple Envelopes

```tsx
import { Clock, ADSR, ToneGenerator, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const ampEnvOut = useRef(null);
  const filterEnvOut = useRef(null);
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={128}>
        {({ start }) => {
          React.useEffect(() => { start(); }, []);
          return null;
        }}
      </Clock>

      {/* Amplitude envelope */}
      <ADSR
        gate={clockOut}
        output={ampEnvOut}
      />

      {/* Filter envelope with different settings */}
      <ADSR
        gate={clockOut}
        output={filterEnvOut}
      >
        {({ setAttack, setDecay, setSustain, setRelease }) => {
          React.useEffect(() => {
            setAttack(0.001);
            setDecay(0.3);
            setSustain(0.2);
            setRelease(0.2);
          }, []);
          return null;
        }}
      </ADSR>

      <ToneGenerator output={toneOut} cv={ampEnvOut} cvAmount={1.0} />
      <Filter
        input={toneOut}
        output={filterOut}
        cv={filterEnvOut}
        cvAmount={2000}
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

### Rhythmic Pattern with Sequencer

```tsx
import { Clock, Sequencer, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const seqOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={120}>
        {({ start, isRunning }) => {
          React.useEffect(() => {
            if (!isRunning) start();
          }, []);
          return null;
        }}
      </Clock>

      <Sequencer output={seqOut} numSteps={16}>
        {({ setSteps }) => {
          React.useEffect(() => {
            // Create a rhythmic pattern
            setSteps([
              1.0, 0.0, 0.5, 0.0, 0.8, 0.0, 0.3, 0.0,
              1.0, 0.0, 0.5, 0.0, 0.6, 0.4, 0.2, 0.0,
            ]);
          }, []);
          return null;
        }}
      </Sequencer>

      <ToneGenerator
        output={toneOut}
        frequency={100}
        cv={seqOut}
        cvAmount={200}
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Controlled Props

You can control the Clock from external state using controlled props:

```tsx
import { Clock, ADSR, ToneGenerator, Monitor } from '@mode-7/mod';
import { useState, useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const adsrOut = useRef(null);
  const toneOut = useRef(null);
  const [bpm, setBpm] = useState(120);
  const [isRunning, setRunning] = useState(false);

  return (
    <>
      <Clock
        output={clockOut}
        bpm={bpm}
        onBpmChange={setBpm}
        isRunning={isRunning}
        onRunningChange={setRunning}
      />

      <div>
        <button onClick={() => setRunning(!isRunning)}>
          {isRunning ? 'Stop' : 'Start'}
        </button>
      </div>

      <div>
        <label>Tempo: {bpm} BPM</label>
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
        />
      </div>

      <ADSR gate={clockOut} output={adsrOut} />
      <ToneGenerator output={toneOut} cv={adsrOut} cvAmount={1.0} />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Imperative Refs

For programmatic control, you can use refs to access methods directly:

```tsx
import { Clock, ClockHandle, ADSR, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const clockRef = useRef<ClockHandle>(null);
  const clockOut = useRef(null);
  const adsrOut = useRef(null);
  const toneOut = useRef(null);

  useEffect(() => {
    // Direct programmatic control
    if (clockRef.current) {
      clockRef.current.setBpm(120);
      clockRef.current.start();

      // Get current state
      const state = clockRef.current.getState();
      console.log(state.bpm, state.isRunning);
    }
  }, []);

  const tempoRamp = () => {
    if (!clockRef.current) return;

    let currentBpm = 60;
    clockRef.current.setBpm(currentBpm);
    clockRef.current.start();

    const interval = setInterval(() => {
      if (currentBpm < 180 && clockRef.current) {
        currentBpm += 5;
        clockRef.current.setBpm(currentBpm);
      } else {
        clearInterval(interval);
      }
    }, 500);
  };

  const tapTempo = () => {
    // Implement tap tempo functionality
    // This is a simplified example
    if (!clockRef.current) return;

    const now = Date.now();
    // Store tap times and calculate BPM
    // For demo purposes, just set a tempo
    clockRef.current.setBpm(140);
    clockRef.current.start();
  };

  return (
    <>
      <Clock ref={clockRef} output={clockOut} />
      <ADSR gate={clockOut} output={adsrOut} />
      <ToneGenerator output={toneOut} cv={adsrOut} cvAmount={1.0} />
      <button onClick={tempoRamp}>Tempo Ramp (60-180 BPM)</button>
      <button onClick={tapTempo}>Tap Tempo</button>
      <Monitor input={toneOut} />
    </>
  );
}
```

## Important Notes

### Clock Pulses

- Each pulse is a short 10ms trigger
- Pulses go from 0 to 1 and back to 0
- Pulse timing is precise and based on BPM

### BPM Range

- Typical range: 40-240 BPM
- Lower values create slower rhythms
- Higher values create faster rhythms
- Can be changed while the clock is running

### Gate Outputs

- The clock output is compatible with any component accepting gate inputs
- Most commonly used with ADSR envelopes
- Can also trigger sequencers or other CV modules

### Sync Considerations

- The clock starts immediately when `start()` is called
- Changing BPM while running adjusts timing smoothly
- `reset()` stops the clock and can be used to resync

## Related

- [ADSR](/api/cv/adsr) - Trigger envelopes with clock pulses
- [Sequencer](/api/cv/sequencer) - Can be synced to clock tempo
- [ToneGenerator](/api/sources/tone-generator) - Create rhythmic patterns
