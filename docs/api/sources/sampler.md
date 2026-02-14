# Sampler

The `Sampler` component is a CV-controlled sample player designed for synthesizer-style use cases. It supports gate/trigger inputs for playback control, pitch CV modulation, and sample region slicing.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the audio signal |
| `gate` | `ModStreamRef` | - | Gate/trigger input for CV-controlled playback |
| `pitchCv` | `ModStreamRef` | - | Pitch CV input (modulates playback rate in semitones) |
| `label` | `string` | `'sampler'` | Label for the component in metadata |
| `enabled` | `boolean` | `true` | Whether the sampler responds to triggers |
| `src` | `string` | `''` | Audio source URL (controlled or initial value) |
| `onSrcChange` | `(src: string) => void` | - | Callback when source URL changes |
| `fileName` | `string` | `''` | Display name for the loaded file |
| `onFileNameChange` | `(name: string) => void` | - | Callback when file name changes |
| `gain` | `number` | `1.0` | Gain level 0-1+ (controlled or initial value) |
| `onGainChange` | `(gain: number) => void` | - | Callback when gain changes |
| `playbackMode` | `PlaybackMode` | `'one-shot'` | Playback behavior mode |
| `onPlaybackModeChange` | `(mode: PlaybackMode) => void` | - | Callback when mode changes |
| `startTime` | `number` | `0` | Sample region start time in seconds |
| `onStartTimeChange` | `(time: number) => void` | - | Callback when start time changes |
| `endTime` | `number` | `0` | Sample region end time (0 = end of file) |
| `onEndTimeChange` | `(time: number) => void` | - | Callback when end time changes |
| `pitch` | `number` | `0` | Base pitch offset in octaves |
| `onPitchChange` | `(pitch: number) => void` | - | Callback when pitch changes |
| `onPlayingChange` | `(isPlaying: boolean) => void` | - | Callback when playback state changes |
| `onTimeUpdate` | `(currentTime: number, duration: number) => void` | - | Callback when playback position updates |
| `onError` | `(error: string \| null) => void` | - | Callback when error state changes |
| `onEnd` | `() => void` | - | Callback when sample finishes playing |
| `children` | `function` | - | Render prop function receiving control props |

### Playback Modes

| Mode | Description |
|------|-------------|
| `'one-shot'` | Plays the sample once per trigger, ignoring gate-off |
| `'gate'` | Plays while gate is high, stops when gate goes low |
| `'loop'` | Loops the sample while gate is high, stops when gate goes low |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `src` | `string` | Current audio source URL |
| `setSrc` | `(src: string) => void` | Set audio source by URL |
| `fileName` | `string` | Display name for the loaded file |
| `setFileName` | `(name: string) => void` | Set the display file name |
| `loadFile` | `(file: File) => void` | Load audio from a File object |
| `gain` | `number` | Current gain level (0-1+) |
| `setGain` | `(value: number) => void` | Update the gain level |
| `playbackMode` | `PlaybackMode` | Current playback mode |
| `setPlaybackMode` | `(mode: PlaybackMode) => void` | Change playback mode |
| `startTime` | `number` | Sample region start time |
| `setStartTime` | `(time: number) => void` | Set region start |
| `endTime` | `number` | Sample region end time |
| `setEndTime` | `(time: number) => void` | Set region end |
| `pitch` | `number` | Base pitch offset in octaves |
| `setPitch` | `(value: number) => void` | Set pitch offset |
| `isPlaying` | `boolean` | Whether audio is currently playing |
| `trigger` | `() => void` | Manually trigger playback |
| `stop` | `() => void` | Stop playback |
| `currentTime` | `number` | Current playback position in seconds |
| `duration` | `number` | Total duration of audio in seconds |
| `sampleRate` | `number` | Audio context sample rate |
| `isActive` | `boolean` | Whether the sampler is active |
| `isReady` | `boolean` | Whether the audio is loaded and ready |
| `error` | `string \| null` | Error message if loading failed |

## Usage

### Basic One-Shot Sampler

```tsx
import { Sampler, Clock, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const samplerOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={120}>
        {({ start, stop, isRunning }) => (
          <button onClick={isRunning ? stop : start}>
            {isRunning ? 'Stop' : 'Start'}
          </button>
        )}
      </Clock>

      <Sampler output={samplerOut} gate={clockOut} playbackMode="one-shot">
        {({ loadFile, isReady }) => (
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
        )}
      </Sampler>

      <Monitor input={samplerOut} />
    </>
  );
}
```

### Sequencer-Triggered Sampler

```tsx
import { Sampler, Sequencer, Clock, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function DrumMachine() {
  const clockOut = useRef(null);
  const seqGate = useRef(null);
  const seqOut = useRef(null);
  const kickOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={120}>
        {({ start, stop, isRunning }) => (
          <button onClick={isRunning ? stop : start}>
            {isRunning ? 'Stop' : 'Start'}
          </button>
        )}
      </Clock>

      <Sequencer
        output={seqOut}
        gateOutput={seqGate}
        clock={clockOut}
        division={4}
      >
        {({ steps, setSteps }) => (
          <div>
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = [...steps];
                  next[i] = { ...next[i], active: !next[i].active };
                  setSteps(next);
                }}
                style={{ background: step.active ? '#4ade80' : '#e5e7eb' }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </Sequencer>

      <Sampler output={kickOut} gate={seqGate} playbackMode="one-shot">
        {({ loadFile }) => (
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
        )}
      </Sampler>

      <Monitor input={kickOut} />
    </>
  );
}
```

### Pitch-Modulated Sampler

```tsx
import { Sampler, Sequencer, Clock, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function MelodicSampler() {
  const clockOut = useRef(null);
  const seqCv = useRef(null);
  const seqGate = useRef(null);
  const samplerOut = useRef(null);

  return (
    <>
      <Clock output={clockOut} bpm={120}>
        {({ start, stop, isRunning }) => (
          <button onClick={isRunning ? stop : start}>
            {isRunning ? 'Stop' : 'Start'}
          </button>
        )}
      </Clock>

      <Sequencer
        output={seqCv}
        gateOutput={seqGate}
        clock={clockOut}
        division={4}
      >
        {({ steps, setSteps }) => (
          <div>
            {steps.map((step, i) => (
              <div key={i}>
                <input
                  type="checkbox"
                  checked={step.active}
                  onChange={() => {
                    const next = [...steps];
                    next[i] = { ...next[i], active: !next[i].active };
                    setSteps(next);
                  }}
                />
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={step.value}
                  onChange={(e) => {
                    const next = [...steps];
                    next[i] = { ...next[i], value: Number(e.target.value) };
                    setSteps(next);
                  }}
                />
                <span>{step.value} st</span>
              </div>
            ))}
          </div>
        )}
      </Sequencer>

      <Sampler
        output={samplerOut}
        gate={seqGate}
        pitchCv={seqCv}
        playbackMode="one-shot"
      >
        {({ loadFile, pitch, setPitch }) => (
          <div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadFile(file);
              }}
            />
            <label>
              Base Pitch: {pitch} oct
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
              />
            </label>
          </div>
        )}
      </Sampler>

      <Monitor input={samplerOut} />
    </>
  );
}
```

### Sample Region Slicing

```tsx
import { Sampler, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function SampleSlicer() {
  const samplerOut = useRef(null);

  return (
    <>
      <Sampler output={samplerOut} playbackMode="loop">
        {({
          loadFile,
          trigger,
          stop,
          isPlaying,
          startTime,
          setStartTime,
          endTime,
          setEndTime,
          duration,
          currentTime,
        }) => (
          <div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadFile(file);
              }}
            />

            <div>
              <button onClick={isPlaying ? stop : trigger}>
                {isPlaying ? 'Stop' : 'Play'}
              </button>
            </div>

            <div>
              <label>
                Start: {startTime.toFixed(2)}s
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                />
              </label>
            </div>

            <div>
              <label>
                End: {(endTime || duration).toFixed(2)}s
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={endTime || duration}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                />
              </label>
            </div>

            <div>Position: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s</div>
          </div>
        )}
      </Sampler>

      <Monitor input={samplerOut} />
    </>
  );
}
```

### Gate Mode (Hold to Play)

```tsx
import { Sampler, LFO, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function GatedSampler() {
  const lfoOut = useRef(null);
  const samplerOut = useRef(null);

  return (
    <>
      {/* Square LFO acts as a gate source */}
      <LFO output={lfoOut} waveform="square" frequency={0.5} />

      <Sampler
        output={samplerOut}
        gate={lfoOut}
        playbackMode="gate"
      >
        {({ loadFile }) => (
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFile(file);
            }}
          />
        )}
      </Sampler>

      <Monitor input={samplerOut} />
    </>
  );
}
```

## Migration Notes

### Input Order Change (v0.1.12+)

**Breaking Change:** The input order for the Sampler component in the demo/playground has been updated:

**Old order (before v0.1.12):**
1. Gate
2. Pitch CV

**New order (v0.1.12+):**
1. Pitch CV
2. Gate

**Impact:** If you have saved patches that use the Sampler component with connections to both inputs, the connections will be reversed after updating. You will need to reconnect them in the correct order.

**Component Props:** The component props (`gate` and `pitchCv`) are unchanged - this only affects the visual input port order in modular patch editors.

## Behavior Notes

### Pitch CV

- Pitch CV values are interpreted as semitones (-24 to +24 range)
- Combined with base `pitch` prop (in octaves)
- Final playback rate is clamped to 0.25x - 4x

### Gate Detection

- Rising edge (signal crosses above 0.5) triggers playback
- Falling edge (signal crosses below 0.2) stops playback (in gate/loop modes)
- Hysteresis prevents rapid re-triggering

### Sample Regions

- `startTime` and `endTime` define a playable region within the sample
- Setting `endTime` to 0 uses the full sample length
- Playback position is clamped to the region boundaries

## Sampler vs MP3Deck

| Feature | Sampler | MP3Deck |
|---------|---------|---------|
| Use case | CV-controlled synthesis | DJ-style playback |
| Trigger | Gate/CV input | Manual play/pause |
| Pitch control | CV modulation | Fixed rate |
| Sample regions | Yes | No |
| Playback modes | one-shot, gate, loop | play, loop |
| Seeking | No | Yes |

Use **Sampler** when you need:
- Sequencer/clock-triggered playback
- CV-controlled pitch shifting
- Sample slicing and looping regions
- Integration with modular synthesis patches

Use **MP3Deck** when you need:
- Manual playback controls (play/pause/stop)
- Seeking and scrubbing
- Simple file playback without CV control

## Related

- [MP3Deck](/api/sources/mp3-deck) - For manual playback control
- [Sequencer](/api/cv/sequencer) - Trigger samples with step sequences
- [Clock](/api/cv/clock) - Clock source for rhythmic triggering
- [Monitor](/api/output/monitor) - Output to speakers
