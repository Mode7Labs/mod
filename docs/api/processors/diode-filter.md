# Diode Filter

The `DiodeFilter` component is a nonlinear ladder-style filter implemented in an AudioWorklet. It provides cutoff, resonance, and drive, plus CV modulation of cutoff.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to filter |
| `output` | `ModStreamRef` | Required | Filtered audio output |
| `label` | `string` | `'diode-filter'` | Label for the component in metadata |
| `cutoff` | `number` | `1000` | Cutoff frequency in Hz (controlled or initial value) |
| `onCutoffChange` | `(cutoff: number) => void` | - | Callback when cutoff changes |
| `resonance` | `number` | `0.1` | Resonance amount (controlled or initial value) |
| `onResonanceChange` | `(resonance: number) => void` | - | Callback when resonance changes |
| `drive` | `number` | `0.0` | Input drive / saturation amount |
| `onDriveChange` | `(drive: number) => void` | - | Callback when drive changes |
| `enabled` | `boolean` | `true` | Enables/bypasses processing (true bypass) |
| `onEnabledChange` | `(enabled: boolean) => void` | - | Callback when enabled changes |
| `cv` | `ModStreamRef` | - | Optional CV input for cutoff modulation |
| `cvAmount` | `number` | `1000` | Amount of CV modulation in Hz |
| `onCvAmountChange` | `(cvAmount: number) => void` | - | Callback when cvAmount changes |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

| Property | Type | Description |
|----------|------|-------------|
| `cutoff` | `number` | Current cutoff in Hz |
| `setCutoff` | `(value: number) => void` | Update cutoff |
| `resonance` | `number` | Current resonance |
| `setResonance` | `(value: number) => void` | Update resonance |
| `drive` | `number` | Current drive |
| `setDrive` | `(value: number) => void` | Update drive |
| `cvAmount` | `number` | Current CV amount |
| `setCvAmount` | `(value: number) => void` | Update CV amount |
| `enabled` | `boolean` | Whether processing is enabled |
| `setEnabled` | `(value: boolean) => void` | Toggle enabled state |
| `isActive` | `boolean` | Whether the node is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, DiodeFilter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} waveform="sawtooth" />
      <DiodeFilter input={toneOut} output={filterOut} cutoff={900} resonance={0.7} drive={0.5} />
      <Monitor input={filterOut} />
    </>
  );
}
```

### With CV Modulation

```tsx
import { LFO, DiodeFilter, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const lfoOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} waveform="sawtooth" />
      <LFO output={lfoOut} frequency={0.5} amplitude={1.0} />
      <DiodeFilter input={toneOut} output={filterOut} cv={lfoOut} cvAmount={1200} />
      <Monitor input={filterOut} />
    </>
  );
}
```

## Notes

- The filter runs in an AudioWorklet for consistent audio-thread timing.
- `enabled={false}` bypasses the worklet and passes input directly to output.

## Related

- [Filter](/api/processors/filter) - Biquad filter alternative
- [LFO](/api/cv/lfo) - CV modulation source
