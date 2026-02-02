# VCA (Voltage Controlled Amplifier)

The `VCA` component controls the amplitude (volume) of an audio signal using a control voltage input. Essential for creating dynamic effects, envelope-controlled notes, and amplitude modulation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to amplify |
| `output` | `ModStreamRef` | Required | Amplified audio output |
| `label` | `string` | `'vca'` | Label for the component in metadata |
| `gain` | `number` | `0.0` | Initial gain/amplitude (0-2+) |
| `onGainChange` | `(gain: number) => void` | - | Callback when gain changes |
| `cv` | `ModStreamRef` | - | Optional CV input for gain modulation |
| `cvAmount` | `number` | `1.0` | Amount of CV modulation to apply |
| `enabled` | `boolean` | `true` | Enables/bypasses processing (true bypass) |
| `onEnabledChange` | `(enabled: boolean) => void` | `-` | Callback when enabled state changes |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `gain` | `number` | Current gain value (0-2+) |
| `setGain` | `(value: number) => void` | Update the gain value |
| `enabled` | `boolean` | Whether processing is enabled or bypassed |
| `setEnabled` | `(value: boolean) => void` | Toggle enabled/bypass state |
| `isActive` | `boolean` | Whether the VCA is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, VCA, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const vcaOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} frequency={440} />
      <VCA input={toneOut} output={vcaOut} gain={0.5} />
      <Monitor input={vcaOut} />
    </>
  );
}
```

### With UI Control

```tsx
import { VCA, Slider } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const input = useRef(null);
  const output = useRef(null);

  return (
    <VCA input={input} output={output}>
      {({ gain, setGain }) => (
        <Slider
          label="Volume"
          value={gain}
          onChange={setGain}
          min={0}
          max={2}
          step={0.01}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />
      )}
    </VCA>
  );
}
```

### Envelope-Controlled Amplitude (Classic Synth)

The most common use of a VCA - controlling note amplitude with an ADSR envelope:

```tsx
import { ToneGenerator, ADSR, VCA, Monitor, Sequencer, useModStream } from '@mode-7/mod';

function Synth() {
  const toneOut = useModStream();
  const adsrOut = useModStream();
  const sequencerCV = useModStream();
  const sequencerGate = useModStream();
  const vcaOut = useModStream();

  return (
    <>
      {/* Step sequencer provides pitch CV and gate triggers */}
      <Sequencer output={sequencerCV} gateOutput={sequencerGate} />

      {/* Tone generator with pitch controlled by sequencer */}
      <ToneGenerator
        output={toneOut}
        frequency={440}
        cv={sequencerCV}
        cvAmount={1000} // 1000Hz modulation range
      />

      {/* ADSR envelope triggered by sequencer gate */}
      <ADSR gate={sequencerGate} output={adsrOut} />

      {/* VCA applies envelope to tone */}
      <VCA
        input={toneOut}
        output={vcaOut}
        cv={adsrOut}
        gain={0} // Start silent, envelope controls volume
      />

      <Monitor input={vcaOut} />
    </>
  );
}
```

### Tremolo Effect with LFO

```tsx
import { LFO, ToneGenerator, VCA, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const lfoOut = useRef(null);
  const toneOut = useRef(null);
  const vcaOut = useRef(null);

  return (
    <>
      <LFO output={lfoOut} frequency={5} />
      <ToneGenerator output={toneOut} frequency={440} />
      <VCA
        input={toneOut}
        output={vcaOut}
        cv={lfoOut}
        cvAmount={0.5} // 50% modulation depth
        gain={0.5} // Base gain at 50%
      />
      <Monitor input={vcaOut} />
    </>
  );
}
```

### Ring Modulation

Use a VCA with an audio-rate modulator for ring modulation effects:

```tsx
import { ToneGenerator, VCA, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const carrierOut = useRef(null);
  const modulatorOut = useRef(null);
  const vcaOut = useRef(null);

  return (
    <>
      <ToneGenerator output={carrierOut} frequency={440} type="sine" />
      <ToneGenerator output={modulatorOut} frequency={100} type="sine" />
      <VCA
        input={carrierOut}
        output={vcaOut}
        cv={modulatorOut}
        gain={0.5}
      />
      <Monitor input={vcaOut} />
    </>
  );
}
```

### Side-Chain Compression (Ducking)

```tsx
import { ToneGenerator, ADSR, VCA, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const musicOut = useRef(null);
  const kickTrigger = useRef(null);
  const envelopeOut = useRef(null);
  const duckedOut = useRef(null);

  return (
    <>
      {/* Background music */}
      <ToneGenerator output={musicOut} frequency={220} />

      {/* Kick drum trigger (could be from sequencer gate) */}
      <Clock output={kickTrigger} bpm={120} />

      {/* Fast attack, medium release envelope */}
      <ADSR
        gate={kickTrigger}
        output={envelopeOut}
        attack={0.001}
        decay={0.01}
        sustain={0}
        release={0.3}
      />

      {/* Duck the music when kick hits */}
      <VCA
        input={musicOut}
        output={duckedOut}
        cv={envelopeOut}
        cvAmount={-1} // Negative = inverse envelope
        gain={1}
      />

      <Monitor input={duckedOut} />
    </>
  );
}
```

### Controlled Props

Manage VCA state externally:

```tsx
import { VCA } from '@mode-7/mod';
import { useRef, useState } from 'react';

function App() {
  const input = useRef(null);
  const output = useRef(null);
  const [gain, setGain] = useState(1.0);

  return (
    <>
      <VCA
        input={input}
        output={output}
        gain={gain}
        onGainChange={setGain}
      />

      <button onClick={() => setGain(0)}>Mute</button>
      <button onClick={() => setGain(0.5)}>50%</button>
      <button onClick={() => setGain(1.0)}>100%</button>
    </>
  );
}
```

## Important Notes

### Gain Values

- **0** = Silent (muted)
- **1** = Unity gain (100%, no change)
- **>1** = Amplification (can cause clipping!)
- Values can exceed 1.0 for gain boost

### CV Modulation

The CV input **multiplies** with the base `gain` value:
- If `gain=0.5` and CV=1.0, output gain = 0.5
- If `gain=1.0` and CV=0.5, output gain = 0.5
- If `gain=0` and CV=1.0, output gain = 0 (CV has no effect)

For envelope control, set `gain=0` and let the CV fully control amplitude.

### cvAmount Parameter

The `cvAmount` scales the CV signal:
- `cvAmount=1.0` - Full CV modulation
- `cvAmount=0.5` - 50% CV modulation depth
- `cvAmount=0` - No CV modulation
- Negative values invert the CV signal (useful for ducking)

### Clipping Prevention

When using CV modulation, the total gain (base + CV) can exceed safe levels:
- Monitor your output levels
- Use a Limiter or Compressor after the VCA
- Keep base gain lower when using CV modulation

## Related

- [ADSR](/api/cv/adsr) - Envelope generator for controlling VCA
- [LFO](/api/cv/lfo) - Low-frequency oscillator for tremolo effects
- [Compressor](/api/processors/compressor) - Prevent clipping
- [Monitor](/api/output/monitor) - Control overall output level
- [Sequencer](/api/cv/sequencer) - Step sequencer with gate output
