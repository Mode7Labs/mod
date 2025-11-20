# mod

<p align="center">
  <img src="./packages/demo/assets/logo.png" alt="mod logo" width="120">
</p>

<p align="center">
  <strong>Modular Web Audio components for React</strong>
</p>

<p align="center">
  Build powerful audio applications with composable, modular components
</p>

<p align="center">
  <a href="https://mode-7.github.io/mod">Website</a> •
  <a href="https://mode-7.github.io/mod/playground">Playground</a> •
  <a href="https://mode-7.github.io/mod/docs">Documentation</a>
</p>

---

## Overview

**mod** is a React library for building modular audio applications using the Web Audio API. Compose audio processing chains with declarative React components, just like building a modular synthesizer.

## Features

- 🎛️ **Modular Design** - Composable audio components that can be connected in any configuration
- ⚡ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🎨 **Flexible API** - Three usage patterns: render props, controlled props, or imperative refs
- 🔌 **Extensive Module Library** - Sources, processors, CV generators, mixers, and more
- 📊 **Real-time Control** - React-driven parameter control with smooth automation
- 🎵 **Professional Audio** - Built on the Web Audio API for high-quality sound

## Installation

```bash
npm install @mode-7/mod
```

## Quick Start

mod components support three different usage patterns:

### 1. Render Props Pattern (UI-focused)

```tsx
import { AudioProvider, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function SimpleSynth() {
  const toneOut = useRef(null);

  return (
    <AudioProvider>
      <ToneGenerator output={toneOut}>
        {({ frequency, setFrequency, gain, setGain }) => (
          <div>
            <input
              type="range"
              min="20"
              max="2000"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        )}
      </ToneGenerator>

      <Monitor input={toneOut}>
        {({ gain, setGain, isMuted, setMuted }) => (
          <div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
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

### 2. Controlled Props Pattern (React-like state control)

```tsx
import { AudioProvider, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef, useState } from 'react';

function SimpleSynth() {
  const toneOut = useRef(null);
  const [frequency, setFrequency] = useState(440);
  const [gain, setGain] = useState(0.5);

  return (
    <AudioProvider>
      <ToneGenerator
        output={toneOut}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        gain={gain}
        onGainChange={setGain}
      />

      <input
        type="range"
        min="20"
        max="2000"
        value={frequency}
        onChange={(e) => setFrequency(Number(e.target.value))}
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={gain}
        onChange={(e) => setGain(Number(e.target.value))}
      />

      <Monitor input={toneOut} />
    </AudioProvider>
  );
}
```

### 3. Imperative Refs Pattern (Programmatic control)

```tsx
import { AudioProvider, ToneGenerator, Monitor, ToneGeneratorHandle } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function SimpleSynth() {
  const toneOut = useRef(null);
  const toneRef = useRef<ToneGeneratorHandle>(null);

  useEffect(() => {
    // Programmatically control the tone generator
    const interval = setInterval(() => {
      if (toneRef.current) {
        const state = toneRef.current.getState();
        // Sweep frequency
        const newFreq = state.frequency * 1.05;
        toneRef.current.setFrequency(newFreq > 2000 ? 220 : newFreq);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <AudioProvider>
      <ToneGenerator ref={toneRef} output={toneOut} />
      <Monitor input={toneOut} />
    </AudioProvider>
  );
}
```

## Module Categories

### Sources
- **ToneGenerator** - Oscillator with sine, square, sawtooth, and triangle waveforms
- **NoiseGenerator** - White and pink noise generator
- **Microphone** - Live audio input from microphone
- **MP3Deck** - Audio file playback with loop control
- **StreamingAudioDeck** - Stream audio from URLs

### CV (Control Voltage)
- **LFO** - Low-frequency oscillator for modulation
- **ADSR** - Attack-Decay-Sustain-Release envelope generator with gate input
- **Sequencer** - Step sequencer for creating rhythmic patterns
- **Clock** - Precise timing source for triggering envelopes and sequencers

### Processors
- **Filter** - Multi-mode filter (lowpass, highpass, bandpass, etc.)
- **Delay** - Delay effect with feedback control
- **Reverb** - Convolution reverb with adjustable decay
- **Compressor** - Dynamic range compression
- **Distortion** - Waveshaping distortion
- **Panner** - Stereo panning
- **EQ** - 3-band equalizer
- **Chorus** - Chorus effect
- **Phaser** - Phaser effect
- **Flanger** - Flanger effect
- **Tremolo** - Amplitude modulation
- **BitCrusher** - Lo-fi bit reduction
- **Limiter** - Peak limiter
- **Gate** - Noise gate
- **AutoWah** - Envelope-following filter
- **RingModulator** - Ring modulation effect

### Mixers
- **Mixer** - 4-channel mixer with level control
- **CrossFade** - Crossfade between two inputs with multiple curve modes

### Output
- **Monitor** - Audio output with device selection and muting

## Architecture

mod follows a modular architecture inspired by hardware synthesizers:

1. **Wrap your app in `<AudioProvider>`** - Initializes the Web Audio context
2. **Create modules** - Each module is a React component representing an audio node
3. **Connect modules** - Pass refs between modules to create audio chains
4. **Control modules** - Choose from three patterns:
   - **Render props** - Build custom UIs with complete control
   - **Controlled props** - Manage state externally with React patterns
   - **Imperative refs** - Direct programmatic control via ref methods

## Usage Patterns

### When to Use Each Pattern

- **Render Props**: Best for building interactive UIs where each module needs custom controls
- **Controlled Props**: Ideal when you need external state management or want to control multiple modules from parent state
- **Imperative Refs**: Perfect for automation, sequencing, or when you need direct programmatic control without React state

All three patterns can be mixed and matched in the same application.

## CV Modulation

Connect CV (Control Voltage) sources to audio module parameters:

```tsx
const lfoOut = useRef(null);
const toneOut = useRef(null);

<LFO output={lfoOut} />
<ToneGenerator cv={lfoOut} output={toneOut} />
<Monitor input={toneOut} />
```

## Rhythmic Triggering

Use the Clock module to trigger ADSR envelopes:

```tsx
const clockOut = useRef(null);
const adsrOut = useRef(null);
const toneOut = useRef(null);

<Clock output={clockOut} />
<ADSR gate={clockOut} output={adsrOut} />
<ToneGenerator cv={adsrOut} output={toneOut} />
<Monitor input={toneOut} />
```

## Browser Support

mod requires a modern browser with Web Audio API support:

- Chrome 35+
- Firefox 25+
- Safari 14.1+
- Edge 79+

## Development

```bash
# Install dependencies
npm install

# Start demo app
npm run dev

# Build library
npm run build

# Build all packages
npm run build:all
```

## Examples

Check out the [Playground](https://mode-7.github.io/mod/playground) to see mod in action and experiment with different module combinations.

## Documentation

Full documentation is available at [mode-7.github.io/mod/docs](https://mode-7.github.io/mod/docs)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  Made with ❤️ for the Web Audio community
</p>
