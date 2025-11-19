# Filter

The `Filter` component applies frequency-based filtering to audio signals. It supports all standard biquad filter types and can be modulated by CV signals.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to filter |
| `output` | `ModStreamRef` | Required | Filtered audio output |
| `label` | `string` | `'filter'` | Label for the component in metadata |
| `frequency` | `number` | `1000` | Initial cutoff/center frequency in Hz |
| `Q` | `number` | `1` | Quality factor (resonance) |
| `type` | `BiquadFilterType` | `'lowpass'` | Filter type |
| `gain` | `number` | `0` | Gain in dB (for peaking/shelving filters) |
| `cv` | `ModStreamRef` | - | Optional CV input for frequency modulation |
| `cvAmount` | `number` | `1000` | Amount of CV modulation in Hz |
| `children` | `function` | - | Render prop function receiving control props |

### Filter Types

- `'lowpass'` - Allows frequencies below cutoff
- `'highpass'` - Allows frequencies above cutoff
- `'bandpass'` - Allows frequencies around cutoff
- `'lowshelf'` - Boost/cut frequencies below cutoff
- `'highshelf'` - Boost/cut frequencies above cutoff
- `'peaking'` - Boost/cut frequencies around cutoff
- `'notch'` - Remove frequencies around cutoff
- `'allpass'` - Phase shift without amplitude change

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `frequency` | `number` | Current frequency in Hz |
| `setFrequency` | `(value: number) => void` | Update the frequency |
| `Q` | `number` | Current Q factor |
| `setQ` | `(value: number) => void` | Update the Q factor |
| `type` | `BiquadFilterType` | Current filter type |
| `setType` | `(value: BiquadFilterType) => void` | Update the filter type |
| `gain` | `number` | Current gain in dB |
| `setGain` | `(value: number) => void` | Update the gain |
| `isActive` | `boolean` | Whether the filter is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} waveform="sawtooth" />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={800}
        Q={5}
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

### With UI Controls

```tsx
import { Filter } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <Filter input={toneOut} output={filterOut}>
      {({ frequency, setFrequency, Q, setQ, type, setType, gain, setGain }) => (
        <div>
          <div>
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="lowpass">Low Pass</option>
              <option value="highpass">High Pass</option>
              <option value="bandpass">Band Pass</option>
              <option value="lowshelf">Low Shelf</option>
              <option value="highshelf">High Shelf</option>
              <option value="peaking">Peaking</option>
              <option value="notch">Notch</option>
              <option value="allpass">All Pass</option>
            </select>
          </div>

          <div>
            <label>Frequency: {frequency.toFixed(0)} Hz</label>
            <input
              type="range"
              min="20"
              max="20000"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Q (Resonance): {Q.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={Q}
              onChange={(e) => setQ(Number(e.target.value))}
            />
          </div>

          {['peaking', 'lowshelf', 'highshelf'].includes(type) && (
            <div>
              <label>Gain: {gain.toFixed(1)} dB</label>
              <input
                type="range"
                min="-40"
                max="40"
                step="0.1"
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      )}
    </Filter>
  );
}
```

### With LFO Modulation

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
          React.useEffect(() => {
            setFrequency(0.5);
            setWaveform('sine');
          }, []);
          return null;
        }}
      </LFO>
      <ToneGenerator output={toneOut} waveform="sawtooth" frequency={110} />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={500}
        Q={10}
        cv={lfoOut}
        cvAmount={2000}  // Sweep from 500Hz to 2500Hz
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

### Classic Synth Filter

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
            setDecay(0.3);
            setSustain(0.2);
            setRelease(0.5);
          }, []);

          return (
            <button onMouseDown={trigger} onMouseUp={releaseGate}>
              Play
            </button>
          );
        }}
      </ADSR>
      <ToneGenerator output={toneOut} frequency={110} waveform="sawtooth" />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={200}
        Q={8}
        cv={adsrOut}
        cvAmount={4000}  // Envelope modulates from 200Hz to 4200Hz
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

## Important Notes

### Frequency Range

- Valid range: 20 Hz to 20,000 Hz (human hearing range)
- Typical synth filter range: 50 Hz to 10,000 Hz
- Higher Q values at extreme frequencies may cause instability

### Q Factor (Resonance)

- Controls the sharpness of the filter
- Low Q (0.1-1): Gentle, smooth filtering
- Medium Q (1-5): Normal filtering
- High Q (5-20): Resonant, emphasized peak
- Very high Q can cause self-oscillation

### CV Modulation

- CV modulates the cutoff frequency
- Base frequency + (CV signal × cvAmount)
- Negative CV values will reduce frequency below base

### Filter Type Usage

- **Lowpass**: Classic synth filter, removes highs
- **Highpass**: Removes lows, thins out sound
- **Bandpass**: Vocal/formant-like sounds
- **Peaking**: Boost/cut specific frequencies (EQ)
- **Shelving**: Boost/cut all frequencies above/below cutoff

## Related

- [LFO](/api/cv/lfo) - Modulate filter frequency
- [ADSR](/api/cv/adsr) - Envelope-controlled filter sweeps
- [EQ](/api/processors/eq) - Multi-band equalization
- [ToneGenerator](/api/sources/tone-generator) - Signal source
