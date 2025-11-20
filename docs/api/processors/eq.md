# EQ

The `EQ` (Equalizer) component provides three-band frequency control for shaping the tonal balance of audio signals. It includes low shelf, mid peaking, and high shelf filters.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to equalize |
| `output` | `ModStreamRef` | Required | Equalized audio output |
| `label` | `string` | `'eq'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `lowGain` | `number` | Low frequency gain in dB (-40 to 40) |
| `setLowGain` | `(value: number) => void` | Update the low gain |
| `midGain` | `number` | Mid frequency gain in dB (-40 to 40) |
| `setMidGain` | `(value: number) => void` | Update the mid gain |
| `highGain` | `number` | High frequency gain in dB (-40 to 40) |
| `setHighGain` | `(value: number) => void` | Update the high gain |
| `lowFreq` | `number` | Low shelf frequency in Hz |
| `setLowFreq` | `(value: number) => void` | Update the low frequency |
| `highFreq` | `number` | High shelf frequency in Hz |
| `setHighFreq` | `(value: number) => void` | Update the high frequency |
| `isActive` | `boolean` | Whether the EQ is active |

## Usage

### Basic Usage

```tsx
import { MP3Deck, EQ, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const deckOut = useRef(null);
  const eqOut = useRef(null);

  return (
    <>
      <MP3Deck output={deckOut}>
        {({ loadFile }) => (
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
        )}
      </MP3Deck>
      <EQ input={deckOut} output={eqOut} />
      <Monitor input={eqOut} />
    </>
  );
}
```

### With UI Controls

```tsx
import { EQ } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const eqOut = useRef(null);

  return (
    <EQ input={inputRef} output={eqOut}>
      {({
        lowGain,
        setLowGain,
        midGain,
        setMidGain,
        highGain,
        setHighGain,
        lowFreq,
        setLowFreq,
        highFreq,
        setHighFreq
      }) => (
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Low Band */}
          <div style={{ textAlign: 'center' }}>
            <h4>Low</h4>
            <input
              type="range"
              orient="vertical"
              min="-40"
              max="40"
              step="0.1"
              value={lowGain}
              onChange={(e) => setLowGain(Number(e.target.value))}
              style={{ writingMode: 'bt-lr', height: '150px' }}
            />
            <div>{lowGain.toFixed(1)} dB</div>
            <div>
              <label>Freq:</label>
              <input
                type="number"
                min="20"
                max="500"
                value={lowFreq}
                onChange={(e) => setLowFreq(Number(e.target.value))}
                style={{ width: '60px' }}
              />
              <span> Hz</span>
            </div>
          </div>

          {/* Mid Band */}
          <div style={{ textAlign: 'center' }}>
            <h4>Mid</h4>
            <input
              type="range"
              orient="vertical"
              min="-40"
              max="40"
              step="0.1"
              value={midGain}
              onChange={(e) => setMidGain(Number(e.target.value))}
              style={{ writingMode: 'bt-lr', height: '150px' }}
            />
            <div>{midGain.toFixed(1)} dB</div>
            <div>(Auto)</div>
          </div>

          {/* High Band */}
          <div style={{ textAlign: 'center' }}>
            <h4>High</h4>
            <input
              type="range"
              orient="vertical"
              min="-40"
              max="40"
              step="0.1"
              value={highGain}
              onChange={(e) => setHighGain(Number(e.target.value))}
              style={{ writingMode: 'bt-lr', height: '150px' }}
            />
            <div>{highGain.toFixed(1)} dB</div>
            <div>
              <label>Freq:</label>
              <input
                type="number"
                min="1000"
                max="20000"
                value={highFreq}
                onChange={(e) => setHighFreq(Number(e.target.value))}
                style={{ width: '70px' }}
              />
              <span> Hz</span>
            </div>
          </div>
        </div>
      )}
    </EQ>
  );
}
```

### EQ Presets

```tsx
import { EQ } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const eqOut = useRef(null);

  const presets = {
    flat: { lowGain: 0, midGain: 0, highGain: 0 },
    brighten: { lowGain: -2, midGain: 2, highGain: 6 },
    warmth: { lowGain: 4, midGain: -1, highGain: -2 },
    presence: { lowGain: -3, midGain: 5, highGain: 3 },
    bassBoost: { lowGain: 8, midGain: 0, highGain: -2 },
    scoop: { lowGain: 4, midGain: -6, highGain: 4 },
    telephone: { lowGain: -20, midGain: 6, highGain: -20 },
  };

  return (
    <EQ input={inputRef} output={eqOut}>
      {({ setLowGain, setMidGain, setHighGain }) => (
        <div>
          <h3>EQ Presets:</h3>
          {Object.entries(presets).map(([name, settings]) => (
            <button
              key={name}
              onClick={() => {
                setLowGain(settings.lowGain);
                setMidGain(settings.midGain);
                setHighGain(settings.highGain);
              }}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      )}
    </EQ>
  );
}
```

### Vocal Processing Chain

```tsx
import { Microphone, Filter, EQ, Compressor, Reverb, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const micOut = useRef(null);
  const filterOut = useRef(null);
  const eqOut = useRef(null);
  const compOut = useRef(null);
  const reverbOut = useRef(null);

  return (
    <>
      <Microphone output={micOut} />

      {/* Remove low-end rumble */}
      <Filter
        input={micOut}
        output={filterOut}
        type="highpass"
        frequency={80}
      />

      {/* Shape tone */}
      <EQ input={filterOut} output={eqOut}>
        {({ setLowGain, setMidGain, setHighGain, setLowFreq, setHighFreq }) => {
          React.useEffect(() => {
            setLowFreq(200);
            setLowGain(-2);    // Reduce muddiness
            setMidGain(3);     // Add presence
            setHighFreq(8000);
            setHighGain(4);    // Add air
          }, []);
          return null;
        }}
      </EQ>

      {/* Control dynamics */}
      <Compressor input={eqOut} output={compOut} />

      {/* Add space */}
      <Reverb input={compOut} output={reverbOut} />

      <Monitor input={reverbOut} />
    </>
  );
}
```

### Controlled Props

Manage EQ state externally using controlled props:

```tsx
import { EQ } from '@mode-7/mod';
import { useRef, useState } from 'react';

function App() {
  const inputRef = useRef(null);
  const eqOut = useRef(null);

  const [lowGain, setLowGain] = useState(0);
  const [midGain, setMidGain] = useState(0);
  const [highGain, setHighGain] = useState(0);

  // Preset functions
  const applyBrighten = () => {
    setLowGain(-2);
    setMidGain(2);
    setHighGain(6);
  };

  return (
    <>
      <EQ
        input={inputRef}
        output={eqOut}
        lowGain={lowGain}
        onLowGainChange={setLowGain}
        midGain={midGain}
        onMidGainChange={setMidGain}
        highGain={highGain}
        onHighGainChange={setHighGain}
      />

      <button onClick={applyBrighten}>Brighten</button>
      <button onClick={() => { setLowGain(0); setMidGain(0); setHighGain(0); }}>
        Reset
      </button>
    </>
  );
}
```

### Imperative Refs

Control EQ programmatically using refs:

```tsx
import { EQ, EQHandle } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const inputRef = useRef(null);
  const eqOut = useRef(null);
  const eqRef = useRef<EQHandle>(null);

  useEffect(() => {
    if (eqRef.current) {
      // Apply vocal presence boost
      eqRef.current.setLowFreq(200);
      eqRef.current.setLowGain(-2);
      eqRef.current.setMidGain(3);
      eqRef.current.setHighFreq(8000);
      eqRef.current.setHighGain(4);

      // Get current state
      const state = eqRef.current.getState();
      console.log('EQ settings:', state);
    }
  }, []);

  return (
    <EQ
      ref={eqRef}
      input={inputRef}
      output={eqOut}
    />
  );
}
```

## Important Notes

### Frequency Bands

1. **Low Band (Low Shelf)**
   - Default frequency: 250 Hz
   - Affects all frequencies below the set frequency
   - Use for bass, kick drum, fundamental tones

2. **Mid Band (Peaking)**
   - Frequency is automatically calculated as the geometric mean of low and high
   - With defaults: √(250 × 4000) ≈ 1000 Hz
   - Use for body, warmth, presence

3. **High Band (High Shelf)**
   - Default frequency: 4000 Hz
   - Affects all frequencies above the set frequency
   - Use for brilliance, air, clarity

### Gain Values

- 0 dB: No change (flat)
- Positive values: Boost frequencies
- Negative values: Cut frequencies
- Range: -40 dB to +40 dB
- Subtle changes (±3 dB) often work best

### Filter Types

- **Low Shelf**: Boosts/cuts all frequencies below the cutoff
- **Mid Peaking**: Boosts/cuts frequencies around the center (bell curve)
- **High Shelf**: Boosts/cuts all frequencies above the cutoff

### Default Values

- Low Gain: 0 dB
- Mid Gain: 0 dB
- High Gain: 0 dB
- Low Frequency: 250 Hz
- High Frequency: 4000 Hz

::: tip EQ Tips
- **Cut rather than boost** when possible (cleaner sound)
- **Start with small adjustments** (1-3 dB)
- **Use your ears** more than your eyes
- **A/B compare** with the original often
- **Less is more** - don't over-EQ
:::

## Related

- [Filter](/api/processors/filter) - Single-band filtering with more control
- [Compressor](/api/processors/compressor) - Dynamic control
- [Monitor](/api/output/monitor) - Listen to your adjustments
