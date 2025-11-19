# Panner

The `Panner` component controls the stereo position of an audio signal, allowing you to place sounds anywhere in the stereo field from hard left to hard right. It supports CV modulation for auto-panning effects.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to pan |
| `output` | `ModStreamRef` | Required | Panned audio output |
| `label` | `string` | `'panner'` | Label for the component in metadata |
| `pan` | `number` | `0` | Initial pan position (-1 to 1) |
| `cv` | `ModStreamRef` | - | Optional CV input for modulation |
| `cvAmount` | `number` | `0.5` | Amount of CV modulation |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `pan` | `number` | Current pan position (-1 to 1) |
| `setPan` | `(value: number) => void` | Update the pan position |
| `isActive` | `boolean` | Whether the panner is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, Panner, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const panOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} />
      <Panner input={toneOut} output={panOut} pan={-0.5} />
      <Monitor input={panOut} />
    </>
  );
}
```

### With UI Control

```tsx
import { Panner } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const panOut = useRef(null);

  return (
    <Panner input={inputRef} output={panOut}>
      {({ pan, setPan }) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <span>L</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={pan}
              onChange={(e) => setPan(Number(e.target.value))}
              style={{ width: '200px' }}
            />
            <span>R</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            Pan: {pan === 0 ? 'Center' : pan < 0 ? `${Math.abs(pan * 100).toFixed(0)}% Left` : `${(pan * 100).toFixed(0)}% Right`}
          </div>
        </div>
      )}
    </Panner>
  );
}
```

### Auto-Panning with LFO

```tsx
import { LFO, ToneGenerator, Panner, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const panOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut}>
        {({ setFrequency, setWaveform }) => {
          React.useEffect(() => {
            setFrequency(0.5);  // Slow auto-pan
            setWaveform('sine');
          }, []);
          return null;
        }}
      </LFO>

      <ToneGenerator output={toneOut} />

      <Panner
        input={toneOut}
        output={panOut}
        pan={0}  // Start at center
        cv={lfoOut}
        cvAmount={1}  // Full range modulation
      />

      <Monitor input={panOut} />
    </>
  );
}
```

### Stereo Spread

```tsx
import { ToneGenerator, Panner, Mixer, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const tone1Out = useRef(null);
  const tone2Out = useRef(null);
  const pan1Out = useRef(null);
  const pan2Out = useRef(null);
  const mixOut = useRef(null);

  return (
    <>
      {/* Two detuned oscillators */}
      <ToneGenerator output={tone1Out} frequency={440} />
      <ToneGenerator output={tone2Out} frequency={442} />

      {/* Pan left and right */}
      <Panner input={tone1Out} output={pan1Out} pan={-0.7} />
      <Panner input={tone2Out} output={pan2Out} pan={0.7} />

      {/* Mix together */}
      <Mixer inputs={[pan1Out, pan2Out]} output={mixOut} />

      <Monitor input={mixOut} />
    </>
  );
}
```

### Rhythmic Auto-Pan

```tsx
import { Clock, ADSR, ToneGenerator, Panner, LFO, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const adsrOut = useRef(null);
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const panOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={120}>
        {({ start }) => {
          React.useEffect(() => { start(); }, []);
          return null;
        }}
      </Clock>

      <ADSR gate={clockOut} output={adsrOut} />

      {/* Fast LFO for auto-panning */}
      <LFO output={lfoOut}>
        {({ setFrequency, setWaveform }) => {
          React.useEffect(() => {
            setFrequency(4);  // 4 Hz auto-pan
            setWaveform('triangle');
          }, []);
          return null;
        }}
      </LFO>

      <ToneGenerator
        output={toneOut}
        frequency={330}
        cv={adsrOut}
        cvAmount={1.0}
      />

      <Panner
        input={toneOut}
        output={panOut}
        cv={lfoOut}
        cvAmount={0.8}
      />

      <Monitor input={panOut} />
    </>
  );
}
```

## Important Notes

### Pan Values

- `-1`: Hard left
- `0`: Center
- `1`: Hard right
- Values between -1 and 1 create intermediate positions

### CV Modulation

- CV signal modulates the pan position
- `cvAmount` controls the depth of modulation
- Positive CV moves right, negative CV moves left
- Base pan value + (CV signal × cvAmount)

### Stereo Imaging

- Panning creates width in a stereo mix
- Place similar sounds at different positions for clarity
- Use auto-panning for movement and interest
- Center important elements (kick, bass, vocals)

### Equal Power Panning

- Uses stereo panning that maintains constant perceived loudness
- Sound doesn't get quieter when panned to the sides
- Based on the Web Audio API's StereoPannerNode

::: tip Mixing Guidelines
- **Center**: Lead vocals, kick drum, snare, bass
- **Wide (±0.3 to ±0.7)**: Guitars, synths, backing vocals
- **Hard (±0.8 to ±1.0)**: Percussion, effects, ambient sounds
- Use automation or LFO modulation for dynamic movement
:::

## Related

- [LFO](/api/cv/lfo) - Auto-panning effects
- [Mixer](/api/mixers/mixer) - Combine multiple panned sources
- [Delay](/api/processors/delay) - Create stereo delays
- [Reverb](/api/processors/reverb) - Add spatial depth
