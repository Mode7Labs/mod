# Reverb

The `Reverb` component adds spatial depth and ambience to audio signals using convolution-based reverb. It simulates the sound of different acoustic spaces.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to process |
| `output` | `ModStreamRef` | Required | Reverb output |
| `label` | `string` | `'reverb'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `wet` | `number` | Wet/dry mix (0-1) |
| `setWet` | `(value: number) => void` | Update the wet/dry mix |
| `duration` | `number` | Reverb duration in seconds |
| `setDuration` | `(value: number) => void` | Update the duration |
| `decay` | `number` | Decay rate (1-10) |
| `setDecay` | `(value: number) => void` | Update the decay rate |
| `isActive` | `boolean` | Whether the reverb is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, Reverb, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const reverbOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} />
      <Reverb input={toneOut} output={reverbOut} />
      <Monitor input={reverbOut} />
    </>
  );
}
```

### With UI Controls

```tsx
import { Reverb } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const reverbOut = useRef(null);

  return (
    <Reverb input={inputRef} output={reverbOut}>
      {({ wet, setWet, duration, setDuration, decay, setDecay }) => (
        <div>
          <div>
            <label>Mix: {(wet * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={wet}
              onChange={(e) => setWet(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Duration: {duration.toFixed(1)}s</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Decay: {decay.toFixed(1)}</label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={decay}
              onChange={(e) => setDecay(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </Reverb>
  );
}
```

### Reverb Presets

```tsx
import { Reverb } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const reverbOut = useRef(null);

  const presets = {
    smallRoom: { duration: 0.5, decay: 2, wet: 0.2 },
    mediumRoom: { duration: 1.0, decay: 2.5, wet: 0.3 },
    largeHall: { duration: 2.5, decay: 3, wet: 0.4 },
    cathedral: { duration: 4.0, decay: 4, wet: 0.5 },
    plate: { duration: 1.5, decay: 1.5, wet: 0.3 },
  };

  return (
    <Reverb input={inputRef} output={reverbOut}>
      {({ setWet, setDuration, setDecay }) => (
        <div>
          <h3>Presets:</h3>
          {Object.entries(presets).map(([name, settings]) => (
            <button
              key={name}
              onClick={() => {
                setDuration(settings.duration);
                setDecay(settings.decay);
                setWet(settings.wet);
              }}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      )}
    </Reverb>
  );
}
```

### Vocal Reverb Chain

```tsx
import { Microphone, Filter, Compressor, Reverb, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const micOut = useRef(null);
  const filterOut = useRef(null);
  const compOut = useRef(null);
  const reverbOut = useRef(null);

  return (
    <>
      <Microphone output={micOut} />

      {/* High-pass filter to remove rumble */}
      <Filter
        input={micOut}
        output={filterOut}
        type="highpass"
        frequency={80}
      />

      {/* Compression for consistent levels */}
      <Compressor input={filterOut} output={compOut} />

      {/* Reverb for space */}
      <Reverb input={compOut} output={reverbOut}>
        {({ setWet, setDuration, setDecay }) => {
          React.useEffect(() => {
            setWet(0.3);
            setDuration(1.5);
            setDecay(2.5);
          }, []);
          return null;
        }}
      </Reverb>

      <Monitor input={reverbOut} />
    </>
  );
}
```

## Important Notes

### Duration

- Controls the length of the reverb tail
- Short (0.1-0.5s): Small rooms, tight spaces
- Medium (0.5-2s): Normal rooms, studios
- Long (2-5s): Large halls, cathedrals
- Very long durations increase CPU usage

### Decay

- Controls how quickly the reverb fades out
- Lower values (1-2): Natural, realistic decay
- Medium values (2-4): Enhanced, musical decay
- High values (4-10): Slow, ethereal decay
- Higher decay values create denser reverb

### Wet/Dry Mix

- 0 = 100% dry (no reverb)
- 0.2-0.3 = Subtle ambience
- 0.4-0.6 = Noticeable space
- 0.7-1.0 = Heavy, atmospheric reverb

### Impulse Response

- The reverb uses algorithmically generated impulse responses
- Changes to duration or decay regenerate the impulse response
- This may cause a brief audio glitch when changing parameters

### Performance Considerations

- Reverb is CPU-intensive due to convolution
- Longer durations require more processing
- Consider using a single reverb for multiple sources via a mixer

::: tip Creative Uses
Try extreme settings for creative effects:
- Very short duration + high decay = metallic plate sound
- Very long duration + low decay = infinite ambience
- Adjust in real-time for special effects
:::

## Related

- [Delay](/api/processors/delay) - For distinct echo effects
- [Filter](/api/processors/filter) - Shape the reverb tone
- [Compressor](/api/processors/compressor) - Control reverb dynamics
