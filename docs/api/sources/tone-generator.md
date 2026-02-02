# ToneGenerator

The `ToneGenerator` component creates an oscillator that generates tones at a specific frequency. It supports multiple waveforms and can be modulated by CV signals.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the generated audio signal |
| `label` | `string` | `'tone-generator'` | Label for the component in metadata |
| `frequency` | `number` | `440` | Frequency in Hz (controlled or initial value) |
| `onFrequencyChange` | `(frequency: number) => void` | - | Callback when frequency changes |
| `gain` | `number` | `0.3` | Gain level 0-1 (controlled or initial value) |
| `onGainChange` | `(gain: number) => void` | - | Callback when gain changes |
| `waveform` | `OscillatorType` | `'square'` | Waveform type (controlled or initial value): `'sine'`, `'square'`, `'sawtooth'`, or `'triangle'` |
| `onWaveformChange` | `(waveform: OscillatorType) => void` | - | Callback when waveform changes |
| `cv` | `ModStreamRef` | - | Optional CV input for frequency/detune modulation |
| `cvAmount` | `number` | `100` | Amount of CV modulation to apply |
| `cvTarget` | `CVTarget` | `'frequency'` | CV modulation target: `'frequency'` (Hz) or `'detune'` (cents) |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `frequency` | `number` | Current frequency in Hz |
| `setFrequency` | `(value: number) => void` | Update the frequency |
| `gain` | `number` | Current gain level (0-1) |
| `setGain` | `(value: number) => void` | Update the gain level |
| `waveform` | `OscillatorType` | Current waveform type |
| `setWaveform` | `(type: OscillatorType) => void` | Update the waveform type |
| `isActive` | `boolean` | Whether the oscillator is running |

## Usage

### Basic Usage

```tsx
import { ToneGenerator } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);

  return (
    <ToneGenerator
      output={toneOut}
      frequency={440}
      waveform="sine"
      gain={0.5}
    />
  );
}
```

### With Render Props (UI Controls)

```tsx
import { ToneGenerator } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);

  return (
    <ToneGenerator output={toneOut}>
      {({ frequency, setFrequency, waveform, setWaveform, gain, setGain }) => (
        <div>
          <div>
            <label>Frequency: {frequency}Hz</label>
            <input
              type="range"
              min="20"
              max="2000"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Waveform:</label>
            <select value={waveform} onChange={(e) => setWaveform(e.target.value as any)}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          <div>
            <label>Gain: {gain.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </ToneGenerator>
  );
}
```

### With LFO Modulation (Frequency)

```tsx
import { ToneGenerator, LFO } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut} />
      <ToneGenerator
        output={toneOut}
        frequency={440}
        cv={lfoOut}
        cvAmount={200}  // Modulate frequency by ±200Hz
        cvTarget="frequency"  // Default - modulates in Hz
      />
    </>
  );
}
```

### With Sequencer Pitch CV (Detune)

For musical pitch control from a sequencer, use `cvTarget="detune"` which modulates in cents (100 cents = 1 semitone):

```tsx
import { ToneGenerator, Sequencer, Clock, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function MelodicSynth() {
  const clockOut = useRef(null);
  const seqCv = useRef(null);
  const seqGate = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={120} />
      <Sequencer output={seqCv} gateOutput={seqGate} clock={clockOut} />
      <ToneGenerator
        output={toneOut}
        frequency={261.63}  // Middle C
        cv={seqCv}
        cvAmount={100}  // 1 semitone per unit of CV
        cvTarget="detune"  // Modulates in cents for musical intervals
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Controlled Props

You can control the ToneGenerator from external state using controlled props:

```tsx
import { ToneGenerator, Monitor } from '@mode-7/mod';
import { useState, useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const [frequency, setFrequency] = useState(440);
  const [gain, setGain] = useState(0.5);
  const [waveform, setWaveform] = useState<OscillatorType>('sine');

  return (
    <>
      <ToneGenerator
        output={toneOut}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        gain={gain}
        onGainChange={setGain}
        waveform={waveform}
        onWaveformChange={setWaveform}
      />

      <div>
        <label>Frequency: {frequency}Hz</label>
        <input
          type="range"
          min="20"
          max="2000"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Waveform:</label>
        <select value={waveform} onChange={(e) => setWaveform(e.target.value as OscillatorType)}>
          <option value="sine">Sine</option>
          <option value="square">Square</option>
          <option value="sawtooth">Sawtooth</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>

      <Monitor input={toneOut} />
    </>
  );
}
```

### Imperative Refs

For programmatic control, you can use refs to access the component's state:

```tsx
import { ToneGenerator, ToneGeneratorHandle, Monitor } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const toneRef = useRef<ToneGeneratorHandle>(null);
  const toneOut = useRef(null);

  useEffect(() => {
    // Access current state
    if (toneRef.current) {
      const state = toneRef.current.getState();
      console.log('Current frequency:', state.frequency);
      console.log('Current gain:', state.gain);
      console.log('Current waveform:', state.waveform);
    }
  }, []);

  return (
    <>
      <ToneGenerator ref={toneRef} output={toneOut} />
      <Monitor input={toneOut} />
    </>
  );
}
```

**Note:** The imperative handle provides read-only access via `getState()`. To control the component programmatically, use the controlled props pattern shown above.

## Important Notes

- The oscillator starts immediately when the component mounts
- The oscillator is stopped and cleaned up when the component unmounts
- CV modulation adds to the base frequency/detune value
- All waveform types are standard Web Audio oscillator waveforms

### CV Target Modes

| Mode | Unit | Use Case |
|------|------|----------|
| `'frequency'` | Hz | Vibrato, frequency sweeps, direct Hz control |
| `'detune'` | Cents | Musical pitch control (100 cents = 1 semitone, 1200 = 1 octave) |

**When to use `'detune'`:**
- Sequencer-driven melodies where CV represents note values
- Pitch bend effects
- Precise musical intervals

**When to use `'frequency'`:**
- LFO vibrato effects
- Frequency sweeps and sound design
- Direct frequency modulation in Hz

## Related

- [LFO](/api/cv/lfo) - Low Frequency Oscillator for modulation
- [Filter](/api/processors/filter) - Process the tone with filtering
- [Monitor](/api/output/monitor) - Output the tone to speakers
