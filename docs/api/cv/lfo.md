# LFO

The `LFO` (Low Frequency Oscillator) component generates slow-moving control voltage signals for modulating other parameters. It's essential for creating vibrato, tremolo, filter sweeps, and other modulation effects.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the CV signal |
| `label` | `string` | `'lfo'` | Label for the component in metadata |
| `frequency` | `number` | `1` | Frequency in Hz (controlled or initial value), typically 0.1-20 Hz |
| `onFrequencyChange` | `(frequency: number) => void` | - | Callback when frequency changes |
| `amplitude` | `number` | `1` | Amplitude 0-4 (controlled or initial value) |
| `onAmplitudeChange` | `(amplitude: number) => void` | - | Callback when amplitude changes |
| `waveform` | `LFOWaveform` | `'sine'` | Waveform type (controlled or initial value) |
| `onWaveformChange` | `(waveform: LFOWaveform) => void` | - | Callback when waveform changes |
| `direction` | `SawtoothDirection` | `'up'` | Sawtooth direction: `'up'` (rising) or `'down'` (falling) |
| `onDirectionChange` | `(direction: SawtoothDirection) => void` | - | Callback when direction changes |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `frequency` | `number` | Current frequency in Hz (typically 0.1-20 Hz) |
| `setFrequency` | `(value: number) => void` | Update the frequency |
| `amplitude` | `number` | Current amplitude (0-4) |
| `setAmplitude` | `(value: number) => void` | Update the amplitude |
| `waveform` | `LFOWaveform` | Current waveform type |
| `setWaveform` | `(value: LFOWaveform) => void` | Update the waveform |
| `direction` | `SawtoothDirection` | Current sawtooth direction |
| `setDirection` | `(value: SawtoothDirection) => void` | Update the direction |
| `isActive` | `boolean` | Whether the LFO is running |

### Waveform Types

- `'sine'` - Smooth, rounded modulation
- `'square'` - Hard on/off switching
- `'sawtooth'` - Linear ramp (direction controls up or down)
- `'triangle'` - Linear up and down
- `'sampleHold'` - Random stepped values (classic S&H)

### Sawtooth Direction

When using the `'sawtooth'` waveform, the `direction` prop controls the wave shape:

- `'up'` - Rising ramp (0 → 1, then instant reset)
- `'down'` - Falling ramp (1 → 0, then instant reset)

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
import { LFO, LFOWaveform } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);

  return (
    <LFO output={lfoOut}>
      {({ frequency, setFrequency, amplitude, setAmplitude, waveform, setWaveform, direction, setDirection }) => (
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
              max="4"
              step="0.01"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Waveform:</label>
            <select value={waveform} onChange={(e) => setWaveform(e.target.value as LFOWaveform)}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
              <option value="sampleHold">Sample & Hold</option>
            </select>
          </div>

          {waveform === 'sawtooth' && (
            <div>
              <label>Direction:</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value as 'up' | 'down')}>
                <option value="up">Up (Rising)</option>
                <option value="down">Down (Falling)</option>
              </select>
            </div>
          )}
        </div>
      )}
    </LFO>
  );
}
```

### Sample & Hold for Random Modulation

The `'sampleHold'` waveform generates random stepped values at the LFO frequency, creating classic synthesizer S&H effects:

```tsx
import { LFO, ToneGenerator, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function RandomFilterSweep() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut} waveform="sampleHold" frequency={4} />
      <ToneGenerator output={toneOut} waveform="sawtooth" frequency={110} />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={1000}
        cv={lfoOut}
        cvAmount={2000}
      />
      <Monitor input={filterOut} />
    </>
  );
}
```

### Falling Sawtooth for Envelope-Like Shapes

```tsx
import { LFO, Filter, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function DecayingSweep() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      {/* Falling sawtooth creates a decay-like shape */}
      <LFO output={lfoOut} waveform="sawtooth" direction="down" frequency={2} />
      <ToneGenerator output={toneOut} waveform="square" frequency={220} />
      <Filter
        input={toneOut}
        output={filterOut}
        type="lowpass"
        frequency={200}
        cv={lfoOut}
        cvAmount={3000}
      />
      <Monitor input={filterOut} />
    </>
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
      <LFO output={lfoOut} frequency={0.5} waveform="triangle" />
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
import { LFO, ToneGenerator, VCA, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const vcaOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut} frequency={5} amplitude={0.5} waveform="sine" />
      <ToneGenerator output={toneOut} frequency={440} />
      <VCA
        input={toneOut}
        output={vcaOut}
        cv={lfoOut}
        gain={0.5}  // Base gain
      />
      <Monitor input={vcaOut} />
    </>
  );
}
```

### Controlled Props

You can control the LFO from external state using controlled props:

```tsx
import { LFO, LFOWaveform, SawtoothDirection, ToneGenerator, Monitor } from '@mode-7/mod';
import { useState, useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const [frequency, setFrequency] = useState(2.0);
  const [amplitude, setAmplitude] = useState(1.0);
  const [waveform, setWaveform] = useState<LFOWaveform>('sine');
  const [direction, setDirection] = useState<SawtoothDirection>('up');

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
        direction={direction}
        onDirectionChange={setDirection}
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
          max="4"
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

For programmatic access to state, you can use refs:

```tsx
import { LFO, LFOHandle, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const lfoRef = useRef<LFOHandle>(null);
  const lfoOut = useRef(null);
  const toneOut = useRef(null);

  useEffect(() => {
    // Access current state
    if (lfoRef.current) {
      const state = lfoRef.current.getState();
      console.log('Frequency:', state.frequency);
      console.log('Amplitude:', state.amplitude);
      console.log('Waveform:', state.waveform);
      console.log('Direction:', state.direction);
    }
  }, []);

  return (
    <>
      <LFO ref={lfoRef} output={lfoOut} />
      <ToneGenerator
        output={toneOut}
        frequency={440}
        cv={lfoOut}
        cvAmount={20}  // Vibrato of ±20Hz
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

**Note:** The imperative handle provides read-only access via `getState()`. To control the LFO programmatically, use the controlled props pattern shown above.

## Important Notes

### Frequency Range

- LFOs typically operate at sub-audio frequencies (0.1 - 20 Hz)
- Lower frequencies create slow, sweeping modulations
- Higher frequencies create faster, vibrato-like effects
- At very high frequencies (20+ Hz), the LFO enters audio rate

### Amplitude Clamping

- Amplitude is clamped to the range 0-4
- Values above 1 can be useful for driving certain modulation targets harder

### Sample & Hold Timing

- The `'sampleHold'` waveform updates at the LFO frequency
- Values are random in the range -1 to +1
- Minimum interval is 5ms to prevent performance issues

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
- [VCA](/api/processors/vca) - Modulate amplitude for tremolo
- [Panner](/api/processors/panner) - Modulate stereo position
- [ADSR](/api/cv/adsr) - For envelope-based modulation
