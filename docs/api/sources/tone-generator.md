# ToneGenerator

The `ToneGenerator` component creates an oscillator that generates tones at a specific frequency. It supports multiple waveforms and can be modulated by CV signals.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the generated audio signal |
| `label` | `string` | `'tone-generator'` | Label for the component in metadata |
| `frequency` | `number` | `440` | Initial frequency in Hz |
| `gain` | `number` | `0.3` | Initial gain level (0-1) |
| `waveform` | `OscillatorType` | `'square'` | Waveform type: `'sine'`, `'square'`, `'sawtooth'`, or `'triangle'` |
| `cv` | `ModStreamRef` | - | Optional CV input for frequency modulation |
| `cvAmount` | `number` | `100` | Amount of CV modulation to apply to frequency |
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

### With LFO Modulation

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
      />
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

For programmatic control, you can use refs to access methods directly:

```tsx
import { ToneGenerator, ToneGeneratorHandle, Monitor } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const toneRef = useRef<ToneGeneratorHandle>(null);
  const toneOut = useRef(null);

  useEffect(() => {
    // Direct programmatic control
    if (toneRef.current) {
      toneRef.current.setFrequency(440);
      toneRef.current.setGain(0.5);
      toneRef.current.setWaveform('sine');

      // Get current state
      const state = toneRef.current.getState();
      console.log(state.frequency, state.gain, state.waveform);
    }
  }, []);

  const playMelody = () => {
    if (!toneRef.current) return;

    const notes = [440, 494, 523, 587, 659, 698, 784, 880];
    let index = 0;

    const interval = setInterval(() => {
      if (index < notes.length && toneRef.current) {
        toneRef.current.setFrequency(notes[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300);
  };

  return (
    <>
      <ToneGenerator ref={toneRef} output={toneOut} />
      <button onClick={playMelody}>Play Melody</button>
      <Monitor input={toneOut} />
    </>
  );
}
```

## Important Notes

- The oscillator starts immediately when the component mounts
- The oscillator is stopped and cleaned up when the component unmounts
- CV modulation adds to the base frequency value
- All waveform types are standard Web Audio oscillator waveforms

## Related

- [LFO](/api/cv/lfo) - Low Frequency Oscillator for modulation
- [Filter](/api/processors/filter) - Process the tone with filtering
- [Monitor](/api/output/monitor) - Output the tone to speakers
