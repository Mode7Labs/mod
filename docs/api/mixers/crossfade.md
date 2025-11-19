# CrossFade

The `CrossFade` component smoothly blends between two audio signals with various crossfade curves. Perfect for DJ-style mixing, transitions, and creative blending effects.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inputs` | `[ModStreamRef, ModStreamRef]` | Required | Exactly two audio signals to crossfade |
| `output` | `ModStreamRef` | Required | Crossfaded audio output |
| `label` | `string` | `'crossfade'` | Label for the component in metadata |
| `mode` | `CrossFadeMode` | `'equal-power'` | Crossfade curve type |
| `children` | `function` | - | Render prop function receiving control props |

### Crossfade Modes

- `'linear'` - Simple linear crossfade (can have volume dip in middle)
- `'equal-power'` - Constant power using cosine curves (recommended)
- `'equal-gain'` - Equal gain crossfade
- `'exponential'` - Exponential curve for smoother transitions
- `'dj-cut'` - DJ-style sharp cut in the middle
- `'smooth-step'` - S-curve using smoothstep function

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `mix` | `number` | Mix position (0-1) |
| `setMix` | `(value: number) => void` | Update the mix position |
| `mode` | `CrossFadeMode` | Current crossfade mode |
| `setMode` | `(mode: CrossFadeMode) => void` | Update the crossfade mode |
| `isActive` | `boolean` | Whether the crossfade is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, CrossFade, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const tone1Out = useRef(null);
  const tone2Out = useRef(null);
  const fadeOut = useRef(null);

  return (
    <>
      <ToneGenerator output={tone1Out} frequency={220} />
      <ToneGenerator output={tone2Out} frequency={440} />

      <CrossFade
        inputs={[tone1Out, tone2Out]}
        output={fadeOut}
      />

      <Monitor input={fadeOut} />
    </>
  );
}
```

### DJ Mixer Style

```tsx
import { CrossFade } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const deck1Out = useRef(null);
  const deck2Out = useRef(null);
  const fadeOut = useRef(null);

  return (
    <CrossFade inputs={[deck1Out, deck2Out]} output={fadeOut}>
      {({ mix, setMix, mode, setMode }) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>A</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mix}
              onChange={(e) => setMix(Number(e.target.value))}
              style={{ width: '300px' }}
            />
            <span>B</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            {mix === 0 && 'Deck A Only'}
            {mix === 1 && 'Deck B Only'}
            {mix > 0 && mix < 1 && `Mix: ${(mix * 100).toFixed(0)}% B`}
          </div>

          <div style={{ marginTop: '20px' }}>
            <label>Crossfade Curve:</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="equal-power">Equal Power (Smooth)</option>
              <option value="dj-cut">DJ Cut (Sharp)</option>
              <option value="linear">Linear</option>
              <option value="smooth-step">Smooth Step</option>
            </select>
          </div>
        </div>
      )}
    </CrossFade>
  );
}
```

### Automated Crossfade

```tsx
import { MP3Deck, CrossFade, LFO, Monitor } from '@mode-7/mod';
import { useRef, useState } from 'react';

function App() {
  const [autoFade, setAutoFade] = useState(false);
  const deck1Out = useRef(null);
  const deck2Out = useRef(null);
  const lfoOut = useRef(null);
  const fadeOut = useRef(null);

  return (
    <>
      <MP3Deck output={deck1Out}>
        {({ setSrc }) => (
          <button onClick={() => setSrc('/track1.mp3')}>
            Load Track 1
          </button>
        )}
      </MP3Deck>

      <MP3Deck output={deck2Out}>
        {({ setSrc }) => (
          <button onClick={() => setSrc('/track2.mp3')}>
            Load Track 2
          </button>
        )}
      </MP3Deck>

      {autoFade && (
        <LFO output={lfoOut}>
          {({ setFrequency, setWaveform, setAmplitude }) => {
            React.useEffect(() => {
              setFrequency(0.1);  // 10 second cycle
              setWaveform('triangle');
              setAmplitude(0.5);
            }, []);
            return null;
          }}
        </LFO>
      )}

      <CrossFade inputs={[deck1Out, deck2Out]} output={fadeOut}>
        {({ mix, setMix }) => (
          <div>
            <button onClick={() => setAutoFade(!autoFade)}>
              {autoFade ? 'Manual Mode' : 'Auto Fade Mode'}
            </button>

            {!autoFade && (
              <div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={mix}
                  onChange={(e) => setMix(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        )}
      </CrossFade>

      <Monitor input={fadeOut} />
    </>
  );
}
```

### A/B Comparison Tool

```tsx
import { CrossFade } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const processedOut = useRef(null);
  const unprocessedOut = useRef(null);
  const fadeOut = useRef(null);

  return (
    <CrossFade inputs={[unprocessedOut, processedOut]} output={fadeOut} mode="dj-cut">
      {({ mix, setMix }) => (
        <div>
          <h3>A/B Comparison</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setMix(0)}>
              A (Unprocessed)
            </button>
            <button onClick={() => setMix(0.5)}>
              50/50 Mix
            </button>
            <button onClick={() => setMix(1)}>
              B (Processed)
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={mix}
              onChange={(e) => setMix(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Unprocessed</span>
              <span>Processed</span>
            </div>
          </div>
        </div>
      )}
    </CrossFade>
  );
}
```

## Important Notes

### Mix Values

- 0 = 100% Input A, 0% Input B
- 0.5 = 50% Input A, 50% Input B
- 1 = 0% Input A, 100% Input B

### Crossfade Modes

**Equal Power** (Recommended)
- Maintains constant perceived loudness
- No volume dip in the middle
- Most natural sounding
- Best for music mixing

**DJ Cut**
- Sharp transition in the middle (45-55%)
- Quick crossfade in the center
- Sounds like a switch
- Best for DJ-style cuts

**Linear**
- Simple linear blend
- Can have slight volume dip at 50%
- Good for fades to/from silence

**Smooth Step**
- S-curve transition
- Slow at the edges, fast in middle
- Smooth, musical fades

**Exponential**
- Curved transition
- More gradual than linear
- Smooth crossfades

### Common Uses

- **DJ Mixing**: Blend between two tracks
- **A/B Testing**: Compare processed vs unprocessed audio
- **Sound Design**: Morph between two sounds
- **Transitions**: Smooth scene changes
- **Layer Blending**: Mix two versions of the same material

::: tip DJ Techniques
- Use 'equal-power' for smooth blends
- Use 'dj-cut' for quick switches
- Keep mix at 0 or 1 when not transitioning
- Practice transitions with the crossfade curve that feels right
:::

## Related

- [Mixer](/api/mixers/mixer) - Mix multiple sources with independent levels
- [MP3Deck](/api/sources/mp3-deck) - DJ-style audio playback
- [LFO](/api/cv/lfo) - Automate crossfade position
- [Monitor](/api/output/monitor) - Listen to the mix
