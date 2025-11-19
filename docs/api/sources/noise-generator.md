# NoiseGenerator

The `NoiseGenerator` component creates white or pink noise. It can be used as a sound source or modulation source and supports CV-based amplitude modulation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the generated audio signal |
| `label` | `string` | `'noise-generator'` | Label for the component in metadata |
| `gain` | `number` | `0.3` | Initial gain level (0-1) |
| `type` | `NoiseType` | `'white'` | Noise type: `'white'` or `'pink'` |
| `cv` | `ModStreamRef` | - | Optional CV input for amplitude modulation |
| `cvAmount` | `number` | `0.3` | Amount of CV modulation to apply to amplitude |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `gain` | `number` | Current gain level (0-1) |
| `setGain` | `(value: number) => void` | Update the gain level |
| `type` | `NoiseType` | Current noise type |
| `setType` | `(value: NoiseType) => void` | Update the noise type |
| `isActive` | `boolean` | Whether the noise generator is active |

## Usage

### Basic Usage

```tsx
import { NoiseGenerator } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const noiseOut = useRef(null);

  return (
    <NoiseGenerator
      output={noiseOut}
      type="white"
      gain={0.3}
    />
  );
}
```

### With Render Props (UI Controls)

```tsx
import { NoiseGenerator } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const noiseOut = useRef(null);

  return (
    <NoiseGenerator output={noiseOut}>
      {({ type, setType, gain, setGain }) => (
        <div>
          <div>
            <label>Noise Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="white">White Noise</option>
              <option value="pink">Pink Noise</option>
            </select>
          </div>
          <div>
            <label>Gain: {gain.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </NoiseGenerator>
  );
}
```

### With ADSR Envelope

```tsx
import { NoiseGenerator, ADSR } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const adsrOut = useRef(null);
  const noiseOut = useRef(null);

  return (
    <>
      <ADSR output={adsrOut}>
        {({ trigger, releaseGate }) => (
          <div>
            <button onMouseDown={trigger} onMouseUp={releaseGate}>
              Trigger
            </button>
          </div>
        )}
      </ADSR>
      <NoiseGenerator
        output={noiseOut}
        cv={adsrOut}
        cvAmount={1.0}  // Full envelope control
      />
    </>
  );
}
```

## Important Notes

### Noise Types

- **White Noise**: Contains equal energy across all frequencies, sounds like static
- **Pink Noise**: Contains equal energy per octave, sounds more natural (1/f noise)

### CV Modulation

- When CV is connected, it controls the amplitude multiplier
- CV value of 0 results in silence, CV value of 1 results in full volume
- The `cvAmount` parameter scales the CV signal's effect

## Related

- [Filter](/api/processors/filter) - Shape the noise with filtering
- [ADSR](/api/cv/adsr) - Envelope for amplitude control
- [Monitor](/api/output/monitor) - Output to speakers
