# What is mod?

**mod** is a React library for building modular audio applications using the Web Audio API. It provides a set of composable components that represent audio processing modules, allowing you to create complex audio signal chains with familiar React patterns.

## Philosophy

mod is inspired by hardware modular synthesizers, where you build audio processing chains by connecting individual modules with patch cables. Each mod component represents an audio module - a source, processor, mixer, or output - and you connect them together using React refs.

## Key Concepts

### Modular Architecture

Just like a hardware modular synth, mod applications are built from individual modules:

- **Sources** - Generate audio (oscillators, noise, microphone input, audio files)
- **CV Generators** - Create control voltages for modulation (LFO, envelopes, sequencers)
- **Processors** - Transform audio (filters, effects, dynamics)
- **Mixers** - Combine multiple audio sources
- **Output** - Send audio to speakers

### Headless Components

mod components use the render props pattern, giving you complete control over the UI. Each component handles the audio processing while exposing controls through a render prop function.

```tsx
<ToneGenerator output={ref}>
  {({ frequency, setFrequency, gain, setGain }) => (
    <div>
      {/* Your custom UI here */}
      <input value={frequency} onChange={(e) => setFrequency(e.target.value)} />
    </div>
  )}
</ToneGenerator>
```

### Type-Safe

Built with TypeScript from the ground up, mod provides comprehensive type definitions for all components, props, and render prop functions.

## Use Cases

mod is perfect for building:

- **Musical instruments** - Synthesizers, drum machines, samplers
- **Audio effects processors** - Real-time audio processing for live input
- **Generative music** - Algorithmic composition and sound design
- **Educational tools** - Teaching audio synthesis and signal processing
- **Interactive experiences** - Audio-reactive visualizations and games
- **DAW components** - Building blocks for digital audio workstations

## Browser Support

mod requires a modern browser with Web Audio API support:

- Chrome 35+
- Firefox 25+
- Safari 14.1+
- Edge 79+

## Next Steps

Ready to get started? Check out the [Getting Started](/guide/getting-started) guide or jump straight to the [API Reference](/api/overview).
