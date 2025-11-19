# Mixer

The `Mixer` component combines multiple audio signals into a single output, with independent level control for each input. Essential for creating multi-source audio applications.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inputs` | `ModStreamRef[]` | Required | Array of audio signals to mix |
| `output` | `ModStreamRef` | Required | Mixed audio output |
| `label` | `string` | `'mixer'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `levels` | `number[]` | Array of level values (0-1+) for each input |
| `setLevels` | `(levels: number[]) => void` | Update all levels at once |
| `setLevel` | `(index: number, value: number) => void` | Update a single level |
| `isActive` | `boolean` | Whether the mixer is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, NoiseGenerator, Mixer, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const tone1Out = useRef(null);
  const tone2Out = useRef(null);
  const noiseOut = useRef(null);
  const mixOut = useRef(null);

  return (
    <>
      <ToneGenerator output={tone1Out} frequency={220} />
      <ToneGenerator output={tone2Out} frequency={330} />
      <NoiseGenerator output={noiseOut} type="white" />

      <Mixer
        inputs={[tone1Out, tone2Out, noiseOut]}
        output={mixOut}
      />

      <Monitor input={mixOut} />
    </>
  );
}
```

### With Fader Controls

```tsx
import { Mixer } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const input1 = useRef(null);
  const input2 = useRef(null);
  const input3 = useRef(null);
  const input4 = useRef(null);
  const mixOut = useRef(null);

  const channelNames = ['Kick', 'Snare', 'Hi-Hat', 'Bass'];

  return (
    <Mixer
      inputs={[input1, input2, input3, input4]}
      output={mixOut}
    >
      {({ levels, setLevel }) => (
        <div style={{ display: 'flex', gap: '20px' }}>
          {levels.map((level, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <label>{channelNames[index]}</label>
              <input
                type="range"
                orient="vertical"
                min="0"
                max="1.5"
                step="0.01"
                value={level}
                onChange={(e) => setLevel(index, Number(e.target.value))}
                style={{
                  writingMode: 'bt-lr',
                  appearance: 'slider-vertical',
                  height: '150px',
                  width: '30px',
                }}
              />
              <div>{(level * 100).toFixed(0)}%</div>
              <button onClick={() => setLevel(index, level > 0 ? 0 : 1)}>
                {level > 0 ? 'Mute' : 'Unmute'}
              </button>
            </div>
          ))}
        </div>
      )}
    </Mixer>
  );
}
```

### Submixer Setup

```tsx
import { ToneGenerator, Filter, Mixer, Reverb, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  // Individual sources
  const tone1Out = useRef(null);
  const tone2Out = useRef(null);
  const tone3Out = useRef(null);

  // Processed versions
  const filter1Out = useRef(null);
  const filter2Out = useRef(null);
  const filter3Out = useRef(null);

  // Submixes
  const dryMixOut = useRef(null);
  const reverbOut = useRef(null);

  // Master
  const masterOut = useRef(null);

  return (
    <>
      {/* Sources */}
      <ToneGenerator output={tone1Out} frequency={220} />
      <ToneGenerator output={tone2Out} frequency={330} />
      <ToneGenerator output={tone3Out} frequency={440} />

      {/* Processing */}
      <Filter input={tone1Out} output={filter1Out} type="lowpass" frequency={800} />
      <Filter input={tone2Out} output={filter2Out} type="lowpass" frequency={1200} />
      <Filter input={tone3Out} output={filter3Out} type="lowpass" frequency={1600} />

      {/* Submixer for dry signals */}
      <Mixer
        inputs={[filter1Out, filter2Out, filter3Out]}
        output={dryMixOut}
      />

      {/* Reverb send */}
      <Reverb input={dryMixOut} output={reverbOut} />

      {/* Master mixer */}
      <Mixer inputs={[dryMixOut, reverbOut]} output={masterOut}>
        {({ setLevel }) => {
          React.useEffect(() => {
            setLevel(0, 0.8);  // Dry at 80%
            setLevel(1, 0.4);  // Reverb at 40%
          }, []);
          return null;
        }}
      </Mixer>

      <Monitor input={masterOut} />
    </>
  );
}
```

### Dynamic Routing

```tsx
import { Mixer } from '@mode-7/mod';
import { useRef, useState } from 'react';

function App() {
  const [numChannels, setNumChannels] = useState(4);
  const inputs = Array.from({ length: numChannels }, () => useRef(null));
  const mixOut = useRef(null);

  return (
    <div>
      <div>
        <label>Number of channels:</label>
        <input
          type="number"
          min="1"
          max="16"
          value={numChannels}
          onChange={(e) => setNumChannels(Number(e.target.value))}
        />
      </div>

      <Mixer inputs={inputs} output={mixOut}>
        {({ levels, setLevel, setLevels }) => (
          <div>
            <button onClick={() => setLevels(levels.map(() => 1))}>
              Reset All to 100%
            </button>
            <button onClick={() => setLevels(levels.map(() => 0))}>
              Mute All
            </button>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {levels.map((level, index) => (
                <div key={index}>
                  <div>Ch {index + 1}</div>
                  <input
                    type="range"
                    orient="vertical"
                    min="0"
                    max="1"
                    step="0.01"
                    value={level}
                    onChange={(e) => setLevel(index, Number(e.target.value))}
                    style={{ writingMode: 'bt-lr', height: '100px' }}
                  />
                  <div>{(level * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Mixer>
    </div>
  );
}
```

## Important Notes

### Level Values

- 0 = Silent (muted)
- 1 = Unity gain (100%, no change)
- >1 = Amplification (can cause clipping!)
- Values can exceed 1.0 for gain boost

### Number of Inputs

- No hard limit on the number of inputs
- Each input gets its own gain control
- More inputs = more mixing overhead
- Levels array matches the order of inputs array

### Mixing Behavior

- All inputs are summed together
- Each input is scaled by its level value
- Output can exceed the normal range if levels are too high
- Consider using a Compressor after the mixer to prevent clipping

### Initial Levels

- All channels start at 1.0 (unity gain) by default
- Use `setLevels()` or `setLevel()` to adjust on mount

::: warning Clipping Prevention
When mixing multiple sources, the combined output can exceed safe levels and cause distortion. Monitor your levels and consider:
- Keeping individual channel levels below 1.0
- Using a Compressor or Limiter after the mixer
- Reducing the overall output gain on the Monitor
:::

## Related

- [CrossFade](/api/mixers/crossfade) - Mix two signals with crossfading
- [Compressor](/api/processors/compressor) - Prevent clipping
- [Monitor](/api/output/monitor) - Control overall output level
- [Panner](/api/processors/panner) - Position sources in stereo
