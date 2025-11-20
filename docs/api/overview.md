# API Overview

mod provides a comprehensive set of audio components organized into categories:

## Core

### AudioProvider

The root component that initializes the Web Audio context.

```tsx
<AudioProvider>
  {/* Your audio modules */}
</AudioProvider>
```

[Learn more →](/api/audio-provider)

## Sources

Components that generate audio signals:

- [ToneGenerator](/api/sources/tone-generator) - Oscillator with multiple waveforms
- [NoiseGenerator](/api/sources/noise-generator) - White and pink noise
- [Microphone](/api/sources/microphone) - Live audio input
- [MP3Deck](/api/sources/mp3-deck) - Audio file playback
- [StreamingAudioDeck](/api/sources/streaming-audio-deck) - Stream audio from URLs

## CV Generators

Components that generate control voltage signals for modulation:

- [LFO](/api/cv/lfo) - Low-frequency oscillator
- [ADSR](/api/cv/adsr) - Envelope generator with gate input
- [Sequencer](/api/cv/sequencer) - Step sequencer
- [Clock](/api/cv/clock) - Timing source for triggers

## Processors

Components that transform audio signals:

- [Filter](/api/processors/filter) - Multi-mode filter
- [Delay](/api/processors/delay) - Delay effect
- [Reverb](/api/processors/reverb) - Reverb effect
- [Compressor](/api/processors/compressor) - Dynamic range compressor
- [Distortion](/api/processors/distortion) - Distortion effect
- [Panner](/api/processors/panner) - Stereo panner
- [EQ](/api/processors/eq) - 3-band equalizer
- And many more...

## Mixers

Components that combine multiple audio signals:

- [Mixer](/api/mixers/mixer) - 4-channel mixer
- [CrossFade](/api/mixers/crossfade) - Crossfade between two inputs

## Output

Component for audio output:

- [Monitor](/api/output/monitor) - Audio output with device selection

## Visualizations

Components for visualizing audio signals:

- [Oscilloscope](/api/visualizations/oscilloscope) - Waveform visualization
- [SpectrumAnalyzer](/api/visualizations/spectrum-analyzer) - Frequency spectrum visualization
- [LevelMeter](/api/visualizations/level-meter) - Audio level meter with peak detection

## Common Patterns

### Component Structure

All mod components follow a consistent structure:

```tsx
<Component input={inputRef} output={outputRef}>
  {(controls) => (
    <YourUI {...controls} />
  )}
</Component>
```

### Props

- **input** - `ModStreamRef` - Reference to input audio stream (processors/mixers/output only)
- **output** - `ModStreamRef` - Reference to output audio stream (sources/processors only)
- **cv** - `ModStreamRef` - Reference to CV input (optional, for modulatable parameters)
- **gate** - `ModStreamRef` - Reference to gate input (ADSR only)
- **children** - Render prop function that receives control functions

### Render Props

Each component exposes controls through the render prop:

```tsx
{({ parameter, setParameter, ... }) => (
  <input
    value={parameter}
    onChange={(e) => setParameter(e.target.value)}
  />
)}
```

## Type Definitions

```tsx
import type {
  ModStreamRef,
  ModStream,
  ToneGeneratorProps,
  ToneGeneratorRenderProps,
  // ... etc
} from '@mode-7/mod';
```

## Next Steps

Explore the detailed API documentation for each component, or check out the [Getting Started Guide](/guide/getting-started) to start building.
