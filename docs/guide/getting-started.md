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

## Understanding the Patterns

mod components support three different usage patterns:

### 1. Render Props Pattern (shown above)

Best for building interactive UIs where each module needs custom controls:

```tsx
<ToneGenerator output={outputRef}>
  {({ frequency, setFrequency, gain, setGain }) => (
    <YourCustomUI
      frequency={frequency}
      onFrequencyChange={setFrequency}
      gain={gain}
      onGainChange={setGain}
    />
  )}
</ToneGenerator>
```

### 2. Controlled Props Pattern

Ideal when you need external state management or want to control multiple modules from parent state:

```tsx
import { useState } from 'react';

function App() {
  const [frequency, setFrequency] = useState(440);
  const [gain, setGain] = useState(0.5);

  return (
    <ToneGenerator
      output={outputRef}
      frequency={frequency}
      onFrequencyChange={setFrequency}
      gain={gain}
      onGainChange={setGain}
    />
  );
}
```

### 3. Imperative Refs Pattern

Perfect for automation, sequencing, or when you need direct programmatic control:

```tsx
import { ToneGeneratorHandle } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const toneRef = useRef<ToneGeneratorHandle>(null);

  useEffect(() => {
    // Direct programmatic control
    if (toneRef.current) {
      toneRef.current.setFrequency(440);
      toneRef.current.setGain(0.5);

      // Get current state
      const state = toneRef.current.getState();
      console.log(state.frequency, state.gain);
    }
  }, []);

  return <ToneGenerator ref={toneRef} output={outputRef} />;
}
```

All three patterns can be mixed and matched in the same application.

## Next Steps

- Explore the [API Reference](/api/overview) for all available modules
- Try the interactive [Playground](/playground/index.html) to experiment with different module combinations
- Read about [AudioProvider](/api/audio-provider) to understand the audio context
