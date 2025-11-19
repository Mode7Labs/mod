# Getting Started

This guide will help you build your first audio application with mod.

## Installation

Install mod using your favorite package manager:

::: code-group
```bash [npm]
npm install @mode-7/mod
```

```bash [yarn]
yarn add @mode-7/mod
```

```bash [pnpm]
pnpm add @mode-7/mod
```
:::

## Prerequisites

mod requires React 18 or higher:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@mode-7/mod": "^0.1.0"
  }
}
```

## Your First Synth

Let's build a simple synthesizer with a tone generator and volume control.

### Step 1: Wrap with AudioProvider

The `AudioProvider` component initializes the Web Audio context and must wrap all mod components:

```tsx
import { AudioProvider } from '@mode-7/mod';

function App() {
  return (
    <AudioProvider>
      {/* Your audio modules go here */}
    </AudioProvider>
  );
}
```

### Step 2: Add a Tone Generator

Create a tone generator that outputs audio:

```tsx
import { AudioProvider, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);

  return (
    <AudioProvider>
      <ToneGenerator output={toneOut}>
        {({ frequency, setFrequency, gain, setGain }) => (
          <div>
            <label>
              Frequency: {frequency}Hz
              <input
                type="range"
                min="20"
                max="2000"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
            </label>
            <label>
              Volume: {gain.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
              />
            </label>
          </div>
        )}
      </ToneGenerator>

      <Monitor input={toneOut} />
    </AudioProvider>
  );
}
```

### Step 3: Add Effects

Let's add a filter to shape the sound:

```tsx
import { AudioProvider, ToneGenerator, Filter, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const filterOut = useRef(null);

  return (
    <AudioProvider>
      <ToneGenerator output={toneOut}>
        {({ frequency, setFrequency, gain, setGain }) => (
          <div>
            <h3>Oscillator</h3>
            <label>
              Frequency: {frequency}Hz
              <input
                type="range"
                min="20"
                max="2000"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
            </label>
            <label>
              Volume: {gain.toFixed(2)}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
              />
            </label>
          </div>
        )}
      </ToneGenerator>

      <Filter input={toneOut} output={filterOut}>
        {({ frequency, setFrequency, Q, setQ, type, setType }) => (
          <div>
            <h3>Filter</h3>
            <label>
              Cutoff: {frequency}Hz
              <input
                type="range"
                min="20"
                max="20000"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
              />
            </label>
            <label>
              Resonance: {Q.toFixed(2)}
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={Q}
                onChange={(e) => setQ(Number(e.target.value))}
              />
            </label>
            <label>
              Type:
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="lowpass">Lowpass</option>
                <option value="highpass">Highpass</option>
                <option value="bandpass">Bandpass</option>
              </select>
            </label>
          </div>
        )}
      </Filter>

      <Monitor input={filterOut}>
        {({ gain, setGain, isMuted, setMuted }) => (
          <div>
            <h3>Output</h3>
            <label>
              Master Volume: {gain.toFixed(2)}
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
              />
            </label>
            <button onClick={() => setMuted(!isMuted)}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        )}
      </Monitor>
    </AudioProvider>
  );
}
```

## Understanding the Pattern

Every mod component follows the same pattern:

1. **Import** the components you need
2. **Create refs** for connecting modules
3. **Pass refs** as `input` and `output` props
4. **Use render props** to build your UI

```tsx
// 1. Import
import { ToneGenerator } from '@mode-7/mod';

// 2. Create ref
const outputRef = useRef(null);

// 3. Pass ref and 4. Use render props
<ToneGenerator output={outputRef}>
  {(controls) => (
    <YourCustomUI {...controls} />
  )}
</ToneGenerator>
```

## Next Steps

- Learn about [CV Modulation](/guide/cv-modulation) to create dynamic, evolving sounds
- Explore the [API Reference](/api/overview) for all available modules
- Check out more [Examples](/guide/examples/simple-synth)
