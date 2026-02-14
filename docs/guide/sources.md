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

### Fluidsynth
Loads FluidSynth via `js-synthesizer` so you can synthesize MIDI data with real SoundFonts.

**Use for**: Live MIDI playback and SoundFont experimentation  
**API**: [Fluidsynth](/api/sources/fluidsynth)

```tsx
<Fluidsynth output={audioOut} midiInput={midiBus} wasmBaseUrl="/mod/playground/js-synthesizer/" />
```

### MidiPlayer
Schedules MIDI files against Clock/Start/Stop inputs and pushes MIDI events into downstream modules like `Fluidsynth`.

**Use for**: Backing tracks, lessons, or transport-synced MIDI playback  
**API**: [MidiPlayer](/api/sources/midi-player)

```tsx
<MidiPlayer output={midiBus} midiUrl="/samples/song.mid" bpm={128}>
  {({ play }) => <button onClick={play}>Play MIDI</button>}
</MidiPlayer>
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
