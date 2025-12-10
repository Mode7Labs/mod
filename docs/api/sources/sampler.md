# Sampler

The `Sampler` component provides polyphonic sample playback with velocity-sensitive triggering, MIDI note support, and CV modulation. It uses `AudioBufferSourceNode` for high-quality, low-latency playback ideal for drum machines, samplers, and sound effects.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the audio signal |
| `label` | `string` | `'sampler'` | Label for the component in metadata |
| `src` | `string` | - | Sample URL to load on mount |
| `buffer` | `ArrayBuffer` | - | Pre-loaded audio data |
| `playbackRate` | `number` | `1.0` | Playback speed (0.5 = half speed, 2.0 = double) |
| `onPlaybackRateChange` | `(rate: number) => void` | - | Callback when playback rate changes |
| `detune` | `number` | `0` | Pitch adjustment in cents |
| `onDetuneChange` | `(cents: number) => void` | - | Callback when detune changes |
| `gain` | `number` | `1.0` | Output volume (0-1+) |
| `onGainChange` | `(gain: number) => void` | - | Callback when gain changes |
| `loop` | `boolean` | `false` | Whether voices loop |
| `onLoopChange` | `(loop: boolean) => void` | - | Callback when loop changes |
| `loopStart` | `number` | `0` | Loop start point in seconds |
| `onLoopStartChange` | `(time: number) => void` | - | Callback when loopStart changes |
| `loopEnd` | `number` | `0` | Loop end point (0 = end of sample) |
| `onLoopEndChange` | `(time: number) => void` | - | Callback when loopEnd changes |
| `enabled` | `boolean` | `true` | Whether triggering is enabled |
| `onEnabledChange` | `(enabled: boolean) => void` | - | Callback when enabled changes |
| `maxPolyphony` | `number` | `8` | Maximum simultaneous voices |
| `voiceStealingMode` | `'oldest' \| 'quietest' \| 'none'` | `'oldest'` | How to handle voice overflow |
| `gate` | `ModStreamRef` | - | Gate input for automatic triggering |
| `gateMode` | `'gate' \| 'trigger'` | `'trigger'` | Gate behavior mode |
| `rootNote` | `number` | `60` | MIDI note that plays at original pitch |
| `cv` | `ModStreamRef` | - | CV modulation input |
| `cvAmount` | `number` | `0.5` | CV modulation depth |
| `onCvAmountChange` | `(amount: number) => void` | - | Callback when cvAmount changes |
| `cvTarget` | `'playbackRate' \| 'detune'` | `'playbackRate'` | Parameter to modulate |
| `onLoad` | `(duration: number) => void` | - | Callback when sample loads |
| `onLoadStart` | `() => void` | - | Callback when loading begins |
| `onError` | `(error: string) => void` | - | Callback on load error |
| `onTrigger` | `(voiceId: string) => void` | - | Callback when voice starts |
| `onEnd` | `(voiceId: string) => void` | - | Callback when voice ends |
| `children` | `function` | - | Render prop function |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `isLoaded` | `boolean` | Whether sample is loaded |
| `isLoading` | `boolean` | Whether sample is loading |
| `error` | `string \| null` | Error message if loading failed |
| `duration` | `number` | Sample duration in seconds |
| `sampleRate` | `number \| null` | Sample rate in Hz |
| `numberOfChannels` | `number \| null` | Number of audio channels |
| `isPlaying` | `boolean` | Whether any voice is playing |
| `activeVoices` | `number` | Count of active voices |
| `maxPolyphony` | `number` | Maximum voices allowed |
| `trigger` | `(options?: TriggerOptions) => string \| null` | Start a voice, returns voice ID |
| `triggerNote` | `(midiNote: number, options?: TriggerOptions) => string \| null` | Trigger at MIDI pitch |
| `stop` | `(voiceId?: string) => void` | Stop specific or last voice |
| `stopAll` | `() => void` | Stop all voices |
| `loadFile` | `(file: File) => void` | Load sample from File |
| `loadUrl` | `(url: string) => void` | Load sample from URL |
| `playbackRate` | `number` | Current playback rate |
| `setPlaybackRate` | `(value: number) => void` | Set playback rate |
| `detune` | `number` | Current detune in cents |
| `setDetune` | `(value: number) => void` | Set detune |
| `gain` | `number` | Current gain level |
| `setGain` | `(value: number) => void` | Set gain level |
| `loop` | `boolean` | Whether looping is enabled |
| `setLoop` | `(value: boolean) => void` | Enable/disable looping |
| `loopStart` | `number` | Loop start in seconds |
| `setLoopStart` | `(value: number) => void` | Set loop start |
| `loopEnd` | `number` | Loop end in seconds |
| `setLoopEnd` | `(value: number) => void` | Set loop end |
| `enabled` | `boolean` | Whether triggering is enabled |
| `setEnabled` | `(value: boolean) => void` | Enable/disable triggering |
| `cvAmount` | `number` | CV modulation amount |
| `setCvAmount` | `(value: number) => void` | Set CV amount |
| `isActive` | `boolean` | Whether output is connected |

## TriggerOptions

Options for the `trigger()` and `triggerNote()` methods:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `velocity` | `number` | `1` | Trigger velocity (0-1), affects voice gain |
| `startOffset` | `number` | `0` | Start position in seconds |
| `playbackRate` | `number` | - | Override default playback rate |
| `detune` | `number` | - | Override default detune |
| `loop` | `boolean` | - | Override default loop setting |

## Helper Function

```typescript
import { midiNoteToPlaybackRate } from '@mode-7/mod';

// Convert MIDI note to playback rate
// Middle C (60) = 1.0, C5 (72) = 2.0, C3 (48) = 0.5
const rate = midiNoteToPlaybackRate(72);       // 2.0
const rate = midiNoteToPlaybackRate(60, 48);   // 2.0 (relative to C3)
```

## Usage

### Basic Drum Machine

```tsx
import { Sampler, Monitor, useModStream } from '@mode-7/mod';

function DrumPad() {
  const output = useModStream();

  return (
    <>
      <Sampler output={output} src="/samples/kick.wav">
        {({ trigger, isLoaded, activeVoices }) => (
          <button
            onClick={() => trigger()}
            disabled={!isLoaded}
          >
            Kick ({activeVoices}/8)
          </button>
        )}
      </Sampler>
      <Monitor input={output} />
    </>
  );
}
```

### Velocity-Sensitive Pads

```tsx
import { Sampler, Monitor, useModStream } from '@mode-7/mod';

function VelocityPad() {
  const output = useModStream();

  return (
    <>
      <Sampler output={output} src="/samples/snare.wav" maxPolyphony={4}>
        {({ trigger, isLoaded }) => (
          <div>
            <button onClick={() => trigger({ velocity: 0.3 })}>Soft</button>
            <button onClick={() => trigger({ velocity: 0.6 })}>Medium</button>
            <button onClick={() => trigger({ velocity: 1.0 })}>Hard</button>
          </div>
        )}
      </Sampler>
      <Monitor input={output} />
    </>
  );
}
```

### MIDI Keyboard Sampler

```tsx
import { Sampler, Monitor, useModStream } from '@mode-7/mod';

function KeyboardSampler() {
  const output = useModStream();

  return (
    <>
      <Sampler output={output} src="/samples/piano-c4.wav" rootNote={60}>
        {({ triggerNote, stopAll, isLoaded }) => (
          <div>
            {/* Piano keys - C4 to B4 */}
            {[60, 62, 64, 65, 67, 69, 71, 72].map((note) => (
              <button
                key={note}
                onClick={() => triggerNote(note)}
                disabled={!isLoaded}
              >
                {note}
              </button>
            ))}
            <button onClick={stopAll}>Stop All</button>
          </div>
        )}
      </Sampler>
      <Monitor input={output} />
    </>
  );
}
```

### Sample Slicer with Start Offset

```tsx
import { Sampler, Monitor, useModStream } from '@mode-7/mod';

function SampleSlicer() {
  const output = useModStream();

  return (
    <>
      <Sampler output={output} src="/samples/break.wav">
        {({ trigger, duration, isLoaded }) => {
          const sliceCount = 8;
          const sliceDuration = duration / sliceCount;

          return (
            <div>
              {Array.from({ length: sliceCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => trigger({ startOffset: i * sliceDuration })}
                  disabled={!isLoaded}
                >
                  Slice {i + 1}
                </button>
              ))}
            </div>
          );
        }}
      </Sampler>
      <Monitor input={output} />
    </>
  );
}
```

### Looping Ambient Pad

```tsx
import { Sampler, Monitor, useModStream } from '@mode-7/mod';

function AmbientPad() {
  const output = useModStream();

  return (
    <>
      <Sampler
        output={output}
        src="/samples/pad.wav"
        loop={true}
        maxPolyphony={1}
      >
        {({ trigger, stop, isPlaying, isLoaded, playbackRate, setPlaybackRate }) => (
          <div>
            <button
              onClick={() => isPlaying ? stop() : trigger()}
              disabled={!isLoaded}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(Number(e.target.value))}
            />
          </div>
        )}
      </Sampler>
      <Monitor input={output} />
    </>
  );
}
```

### With LFO Modulation

```tsx
import { Sampler, LFO, Monitor, useModStream } from '@mode-7/mod';

function ModulatedSampler() {
  const lfoOut = useModStream();
  const samplerOut = useModStream();

  return (
    <>
      <LFO output={lfoOut} frequency={2} amplitude={0.5} />
      <Sampler
        output={samplerOut}
        src="/samples/synth.wav"
        cv={lfoOut}
        cvAmount={0.5}
        cvTarget="playbackRate"
        loop={true}
      >
        {({ trigger, stop, isPlaying, isLoaded }) => (
          <button onClick={() => isPlaying ? stop() : trigger()}>
            {isPlaying ? 'Stop' : 'Play with Vibrato'}
          </button>
        )}
      </Sampler>
      <Monitor input={samplerOut} />
    </>
  );
}
```

### Gate-Triggered from Sequencer

```tsx
import { Sampler, Clock, Monitor, useModStream } from '@mode-7/mod';

function SequencedSampler() {
  const clockOut = useModStream();
  const samplerOut = useModStream();

  return (
    <>
      <Clock output={clockOut} bpm={120} />
      <Sampler
        output={samplerOut}
        src="/samples/hihat.wav"
        gate={clockOut}
        gateMode="trigger"
      />
      <Monitor input={samplerOut} />
    </>
  );
}
```

### Imperative Control

```tsx
import { Sampler, SamplerHandle, Monitor, useModStream } from '@mode-7/mod';
import { useRef } from 'react';

function ImperativeSampler() {
  const samplerRef = useRef<SamplerHandle>(null);
  const output = useModStream();

  const playChord = () => {
    // Play C major chord
    samplerRef.current?.triggerNote(60, { velocity: 0.8 }); // C
    samplerRef.current?.triggerNote(64, { velocity: 0.7 }); // E
    samplerRef.current?.triggerNote(67, { velocity: 0.7 }); // G
  };

  const getInfo = () => {
    const state = samplerRef.current?.getState();
    console.log('Active voices:', state?.activeVoices);
    console.log('Is playing:', state?.isPlaying);
  };

  return (
    <>
      <Sampler ref={samplerRef} output={output} src="/samples/piano.wav" />
      <button onClick={playChord}>Play Chord</button>
      <button onClick={() => samplerRef.current?.stopAll()}>Stop All</button>
      <button onClick={getInfo}>Log State</button>
      <Monitor input={output} />
    </>
  );
}
```

## Voice Stealing Modes

When `maxPolyphony` is reached, the `voiceStealingMode` determines which voice to stop:

| Mode | Behavior |
|------|----------|
| `'oldest'` | Stops the voice that started first |
| `'quietest'` | Stops the voice with lowest velocity |
| `'none'` | Rejects new trigger, returns `null` |

## Important Notes

### Sample vs MP3Deck

- **Sampler**: Uses `AudioBufferSourceNode` - sample is decoded into memory. Best for short samples, drum hits, effects. Supports polyphony and precise triggering.
- **MP3Deck**: Uses `HTMLAudioElement` - streams audio. Best for long tracks, music playback. No polyphony but supports seeking.

### Supported Formats

- WAV, MP3, OGG, AAC, and other formats supported by `decodeAudioData`
- Format support varies by browser

### Memory Considerations

- Audio buffers are stored in memory
- Large samples increase memory usage
- Consider using shorter samples or lower bit depths for memory-constrained applications

### Gate Mode Behavior

- **`'trigger'` (default)**: Rising edge triggers one-shot playback. Voice plays until sample ends or manually stopped.
- **`'gate'`**: Rising edge triggers, falling edge stops. Voice only plays while gate is high.

::: tip Reverse Playback
Set `playbackRate` to a negative value for reverse playback:
```tsx
trigger({ playbackRate: -1 });
```
:::

## Related

- [MP3Deck](/api/sources/mp3-deck) - For streaming playback of longer audio files
- [ToneGenerator](/api/sources/tone-generator) - For synthesized tones
- [LFO](/api/cv/lfo) - For modulation
- [ADSR](/api/cv/adsr) - For envelope control
- [Monitor](/api/output/monitor) - Output to speakers
