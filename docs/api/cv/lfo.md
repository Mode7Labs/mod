# LFO

The `LFO` (Low Frequency Oscillator) component generates slow-moving control voltage signals for modulating other parameters. It's essential for creating vibrato, tremolo, filter sweeps, and other modulation effects.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the CV signal |
| `label` | `string` | `'lfo'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `frequency` | `number` | Current frequency in Hz (typically 0.1-20 Hz) |
| `setFrequency` | `(value: number) => void` | Update the frequency |
| `amplitude` | `number` | Current amplitude (0-1) |
| `setAmplitude` | `(value: number) => void` | Update the amplitude |
| `waveform` | `LFOWaveform` | Current waveform type |
| `setWaveform` | `(value: LFOWaveform) => void` | Update the waveform |
| `isActive` | `boolean` | Whether the LFO is running |

### Waveform Types

- `'sine'` - Smooth, rounded modulation
- `'square'` - Hard on/off switching
- `'sawtooth'` - Linear ramp up, instant reset
- `'triangle'` - Linear up and down

## Usage

### Basic Usage

```tsx
import { LFO, ToneGenerator, Monitor } from '@mode-7/mod';
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
        cvAmount={50}  // Vibrato of ±50Hz
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### With UI Controls

```tsx
import { LFO } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);

  return (
    <LFO output={lfoOut}>
      {({ frequency, setFrequency, amplitude, setAmplitude, waveform, setWaveform }) => (
        <div>
          <div>
            <label>Frequency: {frequency.toFixed(2)} Hz</label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Amplitude: {amplitude.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
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
        </div>
      )}
    </LFO>
  );
}
```

### Filter Sweep

```tsx
import { LFO, ToneGenerator, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut}>
        {({ setFrequency, setWaveform }) => {
          // Initialize on mount
          React.useEffect(() => {
            setFrequency(0.5);  // Slow sweep
            setWaveform('triangle');
          }, []);
          return null;
        }}
      </LFO>
      <ToneGenerator output={toneOut} waveform="sawtooth" />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={500}
        cv={lfoOut}
        cvAmount={2000}  // Sweep from 500Hz to 2500Hz
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

### Tremolo Effect

```tsx
import { LFO, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut}>
        {({ setFrequency, setAmplitude, setWaveform }) => {
          React.useEffect(() => {
            setFrequency(5);  // 5 Hz tremolo
            setAmplitude(0.5);
            setWaveform('sine');
          }, []);
          return null;
        }}
      </LFO>
      <ToneGenerator
        output={toneOut}
        frequency={440}
        // Note: For amplitude modulation, use with a VCA or gain control
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Controlled Props

You can control the LFO from external state using controlled props:

```tsx
import { LFO, ToneGenerator, Monitor } from '@mode-7/mod';
import { useState, useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const [frequency, setFrequency] = useState(2.0);
  const [amplitude, setAmplitude] = useState(1.0);
  const [waveform, setWaveform] = useState<LFOWaveform>('sine');

  return (
    <>
      <LFO
        output={lfoOut}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        amplitude={amplitude}
        onAmplitudeChange={setAmplitude}
        waveform={waveform}
        onWaveformChange={setWaveform}
      />

      <div>
        <label>LFO Rate: {frequency.toFixed(2)} Hz</label>
        <input
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Depth: {amplitude.toFixed(2)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={amplitude}
          onChange={(e) => setAmplitude(Number(e.target.value))}
        />
      </div>

      <ToneGenerator
        output={toneOut}
        frequency={440}
        cv={lfoOut}
        cvAmount={100}
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Imperative Refs

For programmatic control, you can use refs to access methods directly:

```tsx
import { LFO, LFOHandle, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const lfoRef = useRef<LFOHandle>(null);
  const lfoOut = useRef(null);
  const toneOut = useRef(null);

  useEffect(() => {
    // Direct programmatic control
    if (lfoRef.current) {
      lfoRef.current.setFrequency(2.0);
      lfoRef.current.setAmplitude(1.0);
      lfoRef.current.setWaveform('sine');

      // Get current state
      const state = lfoRef.current.getState();
      console.log(state.frequency, state.amplitude, state.waveform);
    }
  }, []);

  const createVibratoEffect = () => {
    if (!lfoRef.current) return;

    // Gradually increase vibrato depth
    let depth = 0;
    const interval = setInterval(() => {
      if (depth < 1.0 && lfoRef.current) {
        depth += 0.05;
        lfoRef.current.setAmplitude(Math.min(1.0, depth));
        lfoRef.current.setFrequency(5 + depth * 2); // Speed up as depth increases
      } else {
        clearInterval(interval);
      }
    }, 100);
  };

  return (
    <>
      <LFO ref={lfoRef} output={lfoOut} />
      <ToneGenerator
        output={toneOut}
        frequency={440}
        cv={lfoOut}
        cvAmount={20}  // Vibrato of ±20Hz
      />
      <button onClick={createVibratoEffect}>Create Vibrato Effect</button>
      <Monitor input={toneOut} />
    </>
  );
}
```

## Important Notes

### Frequency Range

- LFOs typically operate at sub-audio frequencies (0.1 - 20 Hz)
- Lower frequencies create slow, sweeping modulations
- Higher frequencies create faster, vibrato-like effects
- At very high frequencies (20+ Hz), the LFO enters audio rate

### Modulation Depth

- The `amplitude` parameter controls the output level of the CV signal
- The receiving module's `cvAmount` parameter scales this further
- Together, these control the depth of modulation

### Starting Phase

- The LFO starts immediately when mounted
- Initial phase is 0 (starting from the waveform's minimum value for most types)

## Related

- [ToneGenerator](/api/sources/tone-generator) - Modulate frequency for vibrato
- [Filter](/api/processors/filter) - Modulate filter cutoff
- [Panner](/api/processors/panner) - Modulate stereo position
- [ADSR](/api/cv/adsr) - For envelope-based modulation
