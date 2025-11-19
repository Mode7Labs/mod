# Distortion

The `Distortion` component adds harmonic distortion and overdrive to audio signals using waveshaping. Perfect for guitar-style effects or creative sound design.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to distort |
| `output` | `ModStreamRef` | Required | Distorted audio output |
| `label` | `string` | `'distortion'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `amount` | `number` | Distortion amount (0-200) |
| `setAmount` | `(value: number) => void` | Update the distortion amount |
| `isActive` | `boolean` | Whether the distortion is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, Distortion, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const distOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} waveform="sine" />
      <Distortion input={toneOut} output={distOut} />
      <Monitor input={distOut} />
    </>
  );
}
```

### With UI Controls

```tsx
import { Distortion } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const distOut = useRef(null);

  return (
    <Distortion input={inputRef} output={distOut}>
      {({ amount, setAmount }) => (
        <div>
          <label>Distortion: {amount.toFixed(0)}</label>
          <input
            type="range"
            min="0"
            max="200"
            step="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      )}
    </Distortion>
  );
}
```

### Guitar Pedal Style

```tsx
import { Microphone, Distortion, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const micOut = useRef(null);
  const distOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <Microphone output={micOut} />

      <Distortion input={micOut} output={distOut}>
        {({ amount, setAmount }) => (
          <div>
            <h3>Drive</h3>
            <input
              type="range"
              min="0"
              max="150"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        )}
      </Distortion>

      {/* Tone control (lowpass filter) */}
      <Filter input={distOut} output={filterOut}>
        {({ frequency, setFrequency }) => (
          <div>
            <h3>Tone</h3>
            <input
              type="range"
              min="500"
              max="8000"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </div>
        )}
      </Filter>

      <Monitor input={filterOut} />
    </>
  );
}
```

### Distortion Types

```tsx
import { Distortion, Filter } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const distOut = useRef(null);
  const filterOut = useRef(null);

  const distortionTypes = {
    clean: 0,
    warmOverdrive: 30,
    crunch: 70,
    heavyDistortion: 120,
    fuzz: 180,
  };

  return (
    <>
      <Distortion input={inputRef} output={distOut}>
        {({ setAmount }) => (
          <div>
            <h3>Distortion Type:</h3>
            {Object.entries(distortionTypes).map(([name, value]) => (
              <button
                key={name}
                onClick={() => setAmount(value)}
              >
                {name.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        )}
      </Distortion>

      {/* Add filtering to shape the tone */}
      <Filter
        input={distOut}
        output={filterOut}
        type="lowpass"
        frequency={4000}
        Q={1}
      />
    </>
  );
}
```

### Creative Sound Design

```tsx
import { ToneGenerator, LFO, Distortion, Filter, Delay, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const distOut = useRef(null);
  const filterOut = useRef(null);
  const delayOut = useRef(null);

  return (
    <>
      {/* Modulated oscillator */}
      <LFO output={lfoOut}>
        {({ setFrequency }) => {
          React.useEffect(() => { setFrequency(0.2); }, []);
          return null;
        }}
      </LFO>

      <ToneGenerator
        output={toneOut}
        frequency={55}
        waveform="triangle"
        cv={lfoOut}
        cvAmount={30}
      />

      {/* Heavy distortion */}
      <Distortion input={toneOut} output={distOut}>
        {({ setAmount }) => {
          React.useEffect(() => { setAmount(150); }, []);
          return null;
        }}
      </Distortion>

      {/* Filter to tame harsh highs */}
      <Filter
        input={distOut}
        output={filterOut}
        type="lowpass"
        frequency={2000}
        Q={2}
      />

      {/* Delay for space */}
      <Delay input={filterOut} output={delayOut}>
        {({ setTime, setFeedback, setWet }) => {
          React.useEffect(() => {
            setTime(0.375);
            setFeedback(0.4);
            setWet(0.3);
          }, []);
          return null;
        }}
      </Delay>

      <Monitor input={delayOut} />
    </>
  );
}
```

## Important Notes

### Distortion Amount

- 0: No distortion (clean signal)
- 1-50: Subtle warmth and harmonic richness
- 50-100: Overdrive, guitar amp-like
- 100-150: Heavy distortion, aggressive tone
- 150-200: Extreme fuzz, square wave-like

### Waveshaping Algorithm

- Uses a mathematical waveshaping curve
- Creates odd and even harmonics
- 4x oversampling is applied to reduce aliasing
- Higher amounts create more harmonic content

### Volume Considerations

- Distortion can significantly increase perceived loudness
- The output gain is automatically compensated
- Consider using a Compressor after distortion for consistent levels

### Tone Shaping

- Combine with a Filter to shape the distorted tone
- Lowpass filter after distortion for warmer, smoother tones
- Highpass filter before distortion for tighter, focused distortion
- Use EQ to sculpt specific frequency ranges

::: tip Best Practices
- Start with low amounts and increase gradually
- Pair with a lowpass filter to remove harsh high frequencies
- Use in combination with other effects for rich textures
- Experiment with different input waveforms for varied results
:::

::: warning Volume Warning
Distortion can create loud, harsh sounds. Start with low monitoring volumes and adjust carefully.
:::

## Related

- [Filter](/api/processors/filter) - Shape the distorted tone
- [Compressor](/api/processors/compressor) - Control dynamics
- [EQ](/api/processors/eq) - Sculpt frequency balance
- [Delay](/api/processors/delay) - Add space and depth
