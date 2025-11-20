# ADSR

The `ADSR` component generates envelope signals that shape sound over time. It provides Attack, Decay, Sustain, and Release stages, perfect for controlling amplitude, filter cutoff, or other parameters.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the envelope signal |
| `gate` | `ModStreamRef` | - | Optional gate input to trigger the envelope |
| `label` | `string` | `'adsr'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `attack` | `number` | Attack time in seconds |
| `setAttack` | `(value: number) => void` | Update attack time |
| `decay` | `number` | Decay time in seconds |
| `setDecay` | `(value: number) => void` | Update decay time |
| `sustain` | `number` | Sustain level (0-1) |
| `setSustain` | `(value: number) => void` | Update sustain level |
| `release` | `number` | Release time in seconds |
| `setRelease` | `(value: number) => void` | Update release time |
| `trigger` | `() => void` | Manually trigger the envelope |
| `releaseGate` | `() => void` | Manually release the envelope |
| `isActive` | `boolean` | Whether the envelope is active |

## Usage

### Basic Manual Trigger

```tsx
import { ADSR, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const adsrOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <ADSR output={adsrOut}>
        {({ trigger, releaseGate }) => (
          <button
            onMouseDown={trigger}
            onMouseUp={releaseGate}
          >
            Press to Play
          </button>
        )}
      </ADSR>
      <ToneGenerator
        output={toneOut}
        cv={adsrOut}
        cvAmount={1.0}
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### With Full Controls

```tsx
import { ADSR } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const adsrOut = useRef(null);

  return (
    <ADSR output={adsrOut}>
      {({
        attack,
        setAttack,
        decay,
        setDecay,
        sustain,
        setSustain,
        release,
        setRelease,
        trigger,
        releaseGate
      }) => (
        <div>
          <div>
            <label>Attack: {attack.toFixed(3)}s</label>
            <input
              type="range"
              min="0.001"
              max="2"
              step="0.001"
              value={attack}
              onChange={(e) => setAttack(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Decay: {decay.toFixed(3)}s</label>
            <input
              type="range"
              min="0.001"
              max="2"
              step="0.001"
              value={decay}
              onChange={(e) => setDecay(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Sustain: {sustain.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sustain}
              onChange={(e) => setSustain(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Release: {release.toFixed(3)}s</label>
            <input
              type="range"
              min="0.001"
              max="5"
              step="0.001"
              value={release}
              onChange={(e) => setRelease(Number(e.target.value))}
            />
          </div>

          <button onMouseDown={trigger} onMouseUp={releaseGate}>
            Trigger
          </button>
        </div>
      )}
    </ADSR>
  );
}
```

### Filter Envelope

```tsx
import { ADSR, ToneGenerator, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const adsrOut = useRef(null);
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <ADSR output={adsrOut}>
        {({ trigger, releaseGate, setAttack, setDecay, setSustain, setRelease }) => {
          React.useEffect(() => {
            setAttack(0.01);
            setDecay(0.2);
            setSustain(0.3);
            setRelease(0.5);
          }, []);

          return (
            <button onMouseDown={trigger} onMouseUp={releaseGate}>
              Play Note
            </button>
          );
        }}
      </ADSR>
      <ToneGenerator output={toneOut} frequency={220} waveform="sawtooth" />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={200}
        cv={adsrOut}
        cvAmount={3000}  // Envelope modulates filter from 200Hz to 3200Hz
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

### With Clock/Sequencer Gate

```tsx
import { ADSR, Clock, ToneGenerator, Monitor } from '@mode-7/mod';
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
            {isRunning ? 'Stop' : 'Start'} Clock
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

### Controlled Props

You can control the ADSR from external state using controlled props:

```tsx
import { ADSR, ToneGenerator, Monitor } from '@mode-7/mod';
import { useState, useRef } from 'react';

function App() {
  const adsrOut = useRef(null);
  const toneOut = useRef(null);
  const [attack, setAttack] = useState(0.01);
  const [decay, setDecay] = useState(0.1);
  const [sustain, setSustain] = useState(0.7);
  const [release, setRelease] = useState(0.3);

  return (
    <>
      <ADSR
        output={adsrOut}
        attack={attack}
        onAttackChange={setAttack}
        decay={decay}
        onDecayChange={setDecay}
        sustain={sustain}
        onSustainChange={setSustain}
        release={release}
        onReleaseChange={setRelease}
      >
        {({ trigger, releaseGate }) => (
          <button onMouseDown={trigger} onMouseUp={releaseGate}>
            Play Note
          </button>
        )}
      </ADSR>

      <div>
        <label>Attack: {attack.toFixed(3)}s</label>
        <input
          type="range"
          min="0.001"
          max="2"
          step="0.001"
          value={attack}
          onChange={(e) => setAttack(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Sustain: {sustain.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={sustain}
          onChange={(e) => setSustain(Number(e.target.value))}
        />
      </div>

      <ToneGenerator output={toneOut} cv={adsrOut} cvAmount={1.0} />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Imperative Refs

For programmatic control, you can use refs to access methods directly:

```tsx
import { ADSR, ADSRHandle, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const adsrRef = useRef<ADSRHandle>(null);
  const adsrOut = useRef(null);
  const toneOut = useRef(null);

  useEffect(() => {
    // Direct programmatic control
    if (adsrRef.current) {
      adsrRef.current.setAttack(0.01);
      adsrRef.current.setDecay(0.1);
      adsrRef.current.setSustain(0.7);
      adsrRef.current.setRelease(0.3);

      // Get current state
      const state = adsrRef.current.getState();
      console.log(state.attack, state.decay, state.sustain, state.release);
    }
  }, []);

  const playNote = (durationMs: number) => {
    if (!adsrRef.current) return;

    adsrRef.current.trigger();
    setTimeout(() => {
      adsrRef.current?.releaseGate();
    }, durationMs);
  };

  const playMelody = () => {
    const notes = [
      { duration: 200 },
      { duration: 400 },
      { duration: 200 },
      { duration: 600 },
    ];

    let delay = 0;
    notes.forEach((note) => {
      setTimeout(() => playNote(note.duration), delay);
      delay += note.duration + 100; // Add gap between notes
    });
  };

  return (
    <>
      <ADSR ref={adsrRef} output={adsrOut} />
      <ToneGenerator output={toneOut} frequency={440} cv={adsrOut} cvAmount={1.0} />
      <button onClick={playMelody}>Play Melody</button>
      <Monitor input={toneOut} />
    </>
  );
}
```

## Important Notes

### ADSR Stages

1. **Attack**: Time to rise from 0 to peak (1.0)
2. **Decay**: Time to fall from peak to sustain level
3. **Sustain**: Level held while gate is open (not a time value!)
4. **Release**: Time to fall from sustain to 0 after gate closes

### Gate Input

- Connect a Clock or Sequencer to the `gate` prop for automatic triggering
- The gate input detects rising and falling edges
- Rising edge triggers attack, falling edge triggers release

### Manual Triggering

- Use `trigger()` and `releaseGate()` from render props
- `trigger()` starts the attack phase
- `releaseGate()` starts the release phase
- Useful for keyboard-style interfaces

### Default Values

- Attack: 0.01s (10ms)
- Decay: 0.1s (100ms)
- Sustain: 0.7 (70%)
- Release: 0.3s (300ms)

## Related

- [Clock](/api/cv/clock) - Generate gate signals for triggering
- [Sequencer](/api/cv/sequencer) - Sequenced gate patterns
- [ToneGenerator](/api/sources/tone-generator) - Modulate amplitude
- [Filter](/api/processors/filter) - Modulate filter cutoff
