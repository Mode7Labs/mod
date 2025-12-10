# Simple Sampler

Build a drum machine and keyboard sampler with polyphonic playback and velocity control.

## What We'll Build

A sample-based instrument with:
- Drum pads with velocity-sensitive triggering
- Keyboard sampler with MIDI note pitching
- Sample slicer for chopping breakbeats
- LFO modulation for pitch effects

## Drum Machine

A classic 4-pad drum machine with velocity control:

```tsx
import {
  AudioProvider,
  Sampler,
  Mixer,
  Monitor,
  useModStream,
  Button,
  Slider,
  FilePicker
} from '@mode-7/mod';

function DrumMachine() {
  const kick = useModStream();
  const snare = useModStream();
  const hihat = useModStream();
  const clap = useModStream();
  const mixed = useModStream();

  const drums = [
    { name: 'Kick', output: kick, src: '/samples/kick.wav' },
    { name: 'Snare', output: snare, src: '/samples/snare.wav' },
    { name: 'Hi-Hat', output: hihat, src: '/samples/hihat.wav' },
    { name: 'Clap', output: clap, src: '/samples/clap.wav' },
  ];

  return (
    <AudioProvider>
      <div className="drum-machine">
        <h1>Drum Machine</h1>

        <div className="pads">
          {drums.map(drum => (
            <Sampler
              key={drum.name}
              output={drum.output}
              src={drum.src}
              maxPolyphony={4}
            >
              {({ trigger, isLoaded, loadFile, gain, setGain }) => (
                <div className="pad">
                  <h3>{drum.name}</h3>
                  <FilePicker
                    onFileSelect={loadFile}
                    accept="audio/*"
                  />
                  <div className="velocity-buttons">
                    <Button
                      onClick={() => trigger({ velocity: 0.3 })}
                      disabled={!isLoaded}
                    >
                      Soft
                    </Button>
                    <Button
                      onClick={() => trigger({ velocity: 0.6 })}
                      disabled={!isLoaded}
                    >
                      Med
                    </Button>
                    <Button
                      onClick={() => trigger({ velocity: 1.0 })}
                      disabled={!isLoaded}
                    >
                      Hard
                    </Button>
                  </div>
                  <Slider
                    value={gain}
                    onChange={setGain}
                    min={0}
                    max={2}
                    step={0.01}
                    label="Level"
                  />
                </div>
              )}
            </Sampler>
          ))}
        </div>

        <Mixer inputs={[kick, snare, hihat, clap]} output={mixed} />

        <Monitor input={mixed}>
          {({ gain, setGain }) => (
            <div className="master">
              <h2>Master</h2>
              <Slider
                value={gain}
                onChange={setGain}
                min={0}
                max={1}
                step={0.01}
                label="Volume"
              />
            </div>
          )}
        </Monitor>
      </div>
    </AudioProvider>
  );
}
```

## Keyboard Sampler

A chromatic keyboard using `triggerNote()` for MIDI pitch:

```tsx
import {
  AudioProvider,
  Sampler,
  Monitor,
  useModStream,
  Button,
  Slider
} from '@mode-7/mod';

function KeyboardSampler() {
  const output = useModStream();

  // One octave of MIDI notes (C4 to B4)
  const keys = [
    { note: 60, name: 'C', isBlack: false },
    { note: 61, name: 'C#', isBlack: true },
    { note: 62, name: 'D', isBlack: false },
    { note: 63, name: 'D#', isBlack: true },
    { note: 64, name: 'E', isBlack: false },
    { note: 65, name: 'F', isBlack: false },
    { note: 66, name: 'F#', isBlack: true },
    { note: 67, name: 'G', isBlack: false },
    { note: 68, name: 'G#', isBlack: true },
    { note: 69, name: 'A', isBlack: false },
    { note: 70, name: 'A#', isBlack: true },
    { note: 71, name: 'B', isBlack: false },
  ];

  return (
    <AudioProvider>
      <div className="keyboard-sampler">
        <h1>Keyboard Sampler</h1>

        <Sampler
          output={output}
          src="/samples/piano-c4.wav"
          rootNote={60}
          maxPolyphony={12}
        >
          {({ triggerNote, stopAll, isLoaded, activeVoices, maxPolyphony, loadFile }) => (
            <div>
              <FilePicker
                onFileSelect={loadFile}
                accept="audio/*"
                label="Load Sample (C4)"
              />

              <div className="keyboard">
                {keys.map(key => (
                  <Button
                    key={key.note}
                    className={key.isBlack ? 'black-key' : 'white-key'}
                    onClick={() => triggerNote(key.note)}
                    disabled={!isLoaded}
                  >
                    {key.name}
                  </Button>
                ))}
              </div>

              <div className="controls">
                <Button onClick={stopAll}>Stop All</Button>
                <span>Voices: {activeVoices}/{maxPolyphony}</span>
              </div>
            </div>
          )}
        </Sampler>

        <Monitor input={output} />
      </div>
    </AudioProvider>
  );
}
```

## Sample Slicer

Chop a loop into slices using `startOffset`:

```tsx
import {
  AudioProvider,
  Sampler,
  Monitor,
  useModStream,
  Button,
  Slider
} from '@mode-7/mod';
import { useState } from 'react';

function SampleSlicer() {
  const output = useModStream();
  const [sliceCount, setSliceCount] = useState(8);

  return (
    <AudioProvider>
      <div className="slicer">
        <h1>Sample Slicer</h1>

        <Sampler output={output} maxPolyphony={8}>
          {({ trigger, duration, isLoaded, loadFile, stopAll }) => {
            const sliceDuration = duration / sliceCount;

            return (
              <div>
                <FilePicker
                  onFileSelect={loadFile}
                  accept="audio/*"
                  label="Load Loop"
                />

                <Slider
                  value={sliceCount}
                  onChange={setSliceCount}
                  min={2}
                  max={16}
                  step={1}
                  label="Slices"
                />

                <div className="slice-grid">
                  {Array.from({ length: sliceCount }, (_, i) => (
                    <Button
                      key={i}
                      onClick={() => trigger({ startOffset: i * sliceDuration })}
                      disabled={!isLoaded}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <div className="info">
                  Duration: {duration.toFixed(2)}s |
                  Slice: {sliceDuration.toFixed(3)}s
                </div>

                <Button onClick={stopAll}>Stop All</Button>
              </div>
            );
          }}
        </Sampler>

        <Monitor input={output} />
      </div>
    </AudioProvider>
  );
}
```

## With LFO Modulation

Add vibrato or pitch wobble using CV modulation:

```tsx
import {
  AudioProvider,
  Sampler,
  LFO,
  Monitor,
  useModStream,
  Button,
  Slider
} from '@mode-7/mod';

function ModulatedSampler() {
  const lfoOut = useModStream();
  const samplerOut = useModStream();

  return (
    <AudioProvider>
      <div className="modulated-sampler">
        <h1>Modulated Sampler</h1>

        <LFO output={lfoOut}>
          {({ frequency, setFrequency, amplitude, setAmplitude, waveform, setWaveform }) => (
            <div className="lfo">
              <h2>LFO</h2>
              <Slider
                value={frequency}
                onChange={setFrequency}
                min={0.1}
                max={20}
                step={0.1}
                label="Rate"
              />
              <Slider
                value={amplitude}
                onChange={setAmplitude}
                min={0}
                max={1}
                step={0.01}
                label="Depth"
              />
            </div>
          )}
        </LFO>

        <Sampler
          output={samplerOut}
          cv={lfoOut}
          cvAmount={0.5}
          cvTarget="playbackRate"
          loop={true}
          maxPolyphony={1}
        >
          {({ trigger, stop, isPlaying, isLoaded, loadFile }) => (
            <div className="sampler">
              <h2>Sampler</h2>
              <FilePicker onFileSelect={loadFile} accept="audio/*" />
              <Button
                onClick={() => isPlaying ? stop() : trigger()}
                disabled={!isLoaded}
              >
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
            </div>
          )}
        </Sampler>

        <Monitor input={samplerOut} />
      </div>
    </AudioProvider>
  );
}
```

## Gate-Triggered from Clock

Sync sample playback to a tempo using gate input:

```tsx
import {
  AudioProvider,
  Sampler,
  Clock,
  Monitor,
  useModStream,
  Slider
} from '@mode-7/mod';

function SyncedSampler() {
  const clockOut = useModStream();
  const samplerOut = useModStream();

  return (
    <AudioProvider>
      <div className="synced-sampler">
        <h1>Clock-Synced Sampler</h1>

        <Clock output={clockOut}>
          {({ bpm, setBpm, isRunning, start, stop }) => (
            <div className="clock">
              <h2>Clock</h2>
              <Slider
                value={bpm}
                onChange={setBpm}
                min={60}
                max={200}
                step={1}
                label="BPM"
              />
              <Button onClick={isRunning ? stop : start}>
                {isRunning ? 'Stop' : 'Start'}
              </Button>
            </div>
          )}
        </Clock>

        <Sampler
          output={samplerOut}
          src="/samples/hihat.wav"
          gate={clockOut}
          gateMode="trigger"
        >
          {({ gain, setGain, isLoaded }) => (
            <div className="sampler">
              <h2>Hi-Hat</h2>
              <Slider
                value={gain}
                onChange={setGain}
                min={0}
                max={1}
                step={0.01}
                label="Level"
                disabled={!isLoaded}
              />
            </div>
          )}
        </Sampler>

        <Monitor input={samplerOut} />
      </div>
    </AudioProvider>
  );
}
```

## How It Works

### Signal Flow (Drum Machine)

```
Kick ────┐
Snare ───┤
         ├──→ Mixer ──→ Monitor ──→ Speakers
Hi-Hat ──┤
Clap ────┘
```

### Signal Flow (Modulated Sampler)

```
LFO ──→ CV ──┐
             │
Sample ──→ Sampler ──→ Monitor ──→ Speakers
             ↑
          (modulates playbackRate)
```

### Key Concepts

- **Polyphony**: Multiple voices can play simultaneously (default: 8)
- **Voice Stealing**: When max polyphony is reached, oldest/quietest voice is stopped
- **triggerNote()**: Converts MIDI note to playback rate relative to `rootNote`
- **startOffset**: Start playback from a specific position in seconds
- **Gate Input**: Automatic triggering from clock or sequencer signals
- **CV Modulation**: Modulate `playbackRate` or `detune` from LFO/envelope

## Next Steps

- Build a [simple synthesizer](/guide/examples/simple-synth)
- Create [rhythmic patterns](/guide/examples/rhythmic-patterns) with sequencer
- Add [visualizations](/api/visualizations/oscilloscope)
- Explore [LFO modulation](/guide/examples/lfo-modulation)
