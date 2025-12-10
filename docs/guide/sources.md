# Sources

Source modules generate or input audio signals. They are the starting point of any signal chain.

## Available Sources

### ToneGenerator
Generates pure tones using oscillators.

**Use for**: Synthesizers, test tones, drones  
**Waveforms**: Sine, square, sawtooth, triangle  
**API**: [ToneGenerator](/api/sources/tone-generator)

```tsx
<ToneGenerator output={ref} frequency={440} type="sine" gain={0.5} />
```

### NoiseGenerator
Generates different types of noise.

**Use for**: Percussion, wind sounds, texture  
**Types**: White, pink, brown  
**API**: [NoiseGenerator](/api/sources/noise-generator)

```tsx
<NoiseGenerator output={ref} type="white" gain={0.3} />
```

### Microphone
Captures audio from the user's microphone.

**Use for**: Live input, vocoders, effects processing  
**API**: [Microphone](/api/sources/microphone)

```tsx
<Microphone output={ref}>
  {({ isActive, error }) => (
    <div>{isActive ? 'Recording...' : 'Click to enable'}</div>
  )}
</Microphone>
```

### MP3Deck
Plays audio files from the user's computer.

**Use for**: Sample playback, backing tracks  
**Formats**: MP3, WAV, OGG, FLAC, M4A  
**API**: [MP3Deck](/api/sources/mp3-deck)

```tsx
<MP3Deck output={ref}>
  {({ loadFile, play, pause, currentTime, duration }) => (
    <div>
      <FilePicker onFileSelect={loadFile} accept="audio/*" />
      <button onClick={play}>Play</button>
    </div>
  )}
</MP3Deck>
```

### StreamingAudioDeck
Streams audio from URLs.

**Use for**: Internet radio, streaming services, remote audio
**Formats**: Any streamable audio format
**API**: [StreamingAudioDeck](/api/sources/streaming-audio-deck)

```tsx
<StreamingAudioDeck output={ref}>
  {({ url, setUrl, play, pause }) => (
    <div>
      <TextInput value={url} onChange={setUrl} type="url" />
      <button onClick={play}>Play Stream</button>
    </div>
  )}
</StreamingAudioDeck>
```

### Sampler

Polyphonic sample playback with velocity, MIDI notes, and CV modulation.

**Use for**: Drum machines, samplers, sound effects, keyboard instruments
**Formats**: WAV, MP3, OGG, AAC (any format supported by `decodeAudioData`)
**API**: [Sampler](/api/sources/sampler)

```tsx
<Sampler output={ref} src="/samples/kick.wav" maxPolyphony={8}>
  {({ trigger, triggerNote, isLoaded, activeVoices }) => (
    <div>
      <button onClick={() => trigger()} disabled={!isLoaded}>
        Trigger ({activeVoices}/8)
      </button>
      <button onClick={() => triggerNote(60)}>C4</button>
      <button onClick={() => triggerNote(64)}>E4</button>
      <button onClick={() => triggerNote(67)}>G4</button>
    </div>
  )}
</Sampler>
```

## Common Patterns

### Multiple Oscillators
```tsx
const osc1 = useModStream();
const osc2 = useModStream();
const mixed = useModStream();

<ToneGenerator output={osc1} frequency={220} />
<ToneGenerator output={osc2} frequency={440} />
<Mixer inputs={[osc1, osc2]} output={mixed} />
```

### Noise + Tone Layer
```tsx
const tone = useModStream();
const noise = useModStream();
const layered = useModStream();

<ToneGenerator output={tone} frequency={55} type="sine" />
<NoiseGenerator output={noise} type="pink" gain={0.1} />
<Mixer inputs={[tone, noise]} output={layered} />
```

### Live Processing
```tsx
const mic = useModStream();
const processed = useModStream();

<Microphone output={mic} />
<Reverb input={mic} output={processed} />
<Monitor input={processed} />
```

## Next Steps

- Explore [CV Generators](/guide/cv-generators)
- Learn about [Processors](/guide/processors)
- Build a [simple synthesizer](/guide/examples/simple-synth)
- Build a [drum machine and sampler](/guide/examples/simple-sampler)
