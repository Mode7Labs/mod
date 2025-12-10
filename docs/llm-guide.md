---
layout: doc
title: Building mod Apps with AI Assistants
---

# Building mod Apps with AI Assistants

This guide helps AI assistants (LLMs) effectively build audio applications using mod. If you're an AI helping a user build a mod app, this page provides everything you need.

## Quick Start

mod is a React library for building modular audio applications using the Web Audio API. Components represent audio modules that you connect together like a modular synthesizer.

### Basic Template

```tsx
import { AudioProvider, ToneGenerator, Monitor, useModStream } from '@mode-7/mod';

function App() {
  const audio = useModStream();

  return (
    <AudioProvider>
      <ToneGenerator output={audio} frequency={440} type="sine" gain={0.5} />
      <Monitor input={audio} />
    </AudioProvider>
  );
}
```

## Essential Rules

1. **Always wrap in AudioProvider** - All mod components must be inside `<AudioProvider>`
2. **Use useModStream for connections** - Create refs with `const ref = useModStream()`
3. **Every chain needs Monitor** - Audio won't play without `<Monitor input={ref} />`
4. **Import from @mode-7/mod** - All components come from this package
5. **Sources → Processors → Monitor** - Signal flows through connected refs

## Component Categories

### Sources (Audio Generators)
Generate or input audio signals. Have `output` prop only.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| [ToneGenerator](/api/sources/tone-generator) | Pure tones | frequency, type (sine/square/sawtooth/triangle), gain |
| [NoiseGenerator](/api/sources/noise-generator) | Noise | type (white/pink/brown), gain |
| [Microphone](/api/sources/microphone) | Mic input | gain |
| [MP3Deck](/api/sources/mp3-deck) | Audio files | src, loop, gain |
| [StreamingAudioDeck](/api/sources/streaming-audio-deck) | Streaming audio | url, loop, gain |
| [Sampler](/api/sources/sampler) | Sample playback | polyphony, velocity, MIDI notes, gate |

### CV Generators (Modulation)
Generate control voltage signals. Have `output` prop, connect to `cvInput` of processors.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| [LFO](/api/cv/lfo) | Cyclic modulation | rate (Hz), waveform, depth |
| [ADSR](/api/cv/adsr) | Envelopes | attack, decay, sustain, release |
| [Sequencer](/api/cv/sequencer) | Step patterns | steps (array), bpm |
| [Clock](/api/cv/clock) | Tempo sync | bpm |

### Processors (Effects)
Transform audio. Have `input` and `output` props. Can have `cvInput` for modulation.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| [Filter](/api/processors/filter) | Frequency filtering | type, frequency, Q, cvInput, cvTarget, cvAmount |
| [Delay](/api/processors/delay) | Echo | delayTime, feedback, mix |
| [Reverb](/api/processors/reverb) | Spatial reverb | roomSize, damping, mix |
| [Distortion](/api/processors/distortion) | Distortion/overdrive | drive, type |
| [Compressor](/api/processors/compressor) | Dynamics | threshold, ratio, attack, release |
| [Tremolo](/api/processors/tremolo) | Amplitude modulation | rate, depth |
| [Chorus](/api/processors/chorus) | Chorus | rate, depth, delay |
| [Phaser](/api/processors/phaser) | Phase shifting | rate, depth, stages |
| [Flanger](/api/processors/flanger) | Flanging | rate, depth, feedback |
| [Panner](/api/processors/panner) | Stereo panning | pan (-1 to 1) |
| [EQ](/api/processors/eq) | Equalization | lowGain, midGain, highGain |
| [BitCrusher](/api/processors/bitcrusher) | Lo-fi degradation | bits, sampleRate |
| [Limiter](/api/processors/limiter) | Peak limiting | threshold |
| [Gate](/api/processors/gate) | Noise gate | threshold |
| [AutoWah](/api/processors/autowah) | Auto-wah | baseFrequency, sensitivity |
| [RingModulator](/api/processors/ringmodulator) | Ring modulation | frequency |
| [VCA](/api/processors/vca) | Voltage controlled amp | gain, cv, cvAmount |

### Mixers
Combine multiple signals. Have multiple inputs, one output.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| [Mixer](/api/mixers/mixer) | Mix N channels | inputs (array of refs) |
| [CrossFade](/api/mixers/crossfade) | Blend two sources | inputs ([ref, ref]), mix (0-1), mode |

### Output
Send to speakers. Have `input` prop only.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| [Monitor](/api/output/monitor) | Output to speakers | gain, mute |

### Visualizations
Observe audio without affecting it. Have `input` prop.

| Component | Purpose | Render Props |
|-----------|---------|--------------|
| [Oscilloscope](/api/visualizations/oscilloscope) | Waveform | dataArray, bufferLength |
| [SpectrumAnalyzer](/api/visualizations/spectrum-analyzer) | Frequency spectrum | dataArray, bufferLength |
| [LevelMeter](/api/visualizations/level-meter) | Audio levels | level, peak, isClipping |

### ModUI Components
Pre-styled UI controls for audio apps. All imported from `@mode-7/mod`.

#### Slider
Range slider with optional +/- buttons.

**Props:**
- `value: number` (required) - Current value
- `onChange: (value: number) => void` (required) - Change handler
- `min: number` - Minimum value (default: 0)
- `max: number` - Maximum value (default: 100)
- `step: number` - Step increment (default: 1)
- `label: string` - Label text
- `unit: string` - Unit suffix (e.g., "Hz", "%")
- `formatValue: (value: number) => string` - Custom formatter
- `showButtons: boolean` - Show +/- buttons (default: true)
- `disabled: boolean` - Disable slider (default: false)

**Example:**
```tsx
import { Slider } from '@mode-7/mod';

<Slider
  value={frequency}
  onChange={setFrequency}
  min={20}
  max={2000}
  label="Frequency"
  unit=" Hz"
/>
```

#### Knob
Rotary knob control.

**Props:**
- `value: number` (required) - Current value
- `onChange: (value: number) => void` (required) - Change handler
- `min: number` - Minimum value (default: 0)
- `max: number` - Maximum value (default: 100)
- `step: number` - Step increment (default: 1)
- `label: string` - Label text
- `size: number` - Knob size in pixels (default: 64)
- `sensitivity: number` - Drag sensitivity (default: 1)
- `formatValue: (value: number) => string` - Custom formatter
- `disabled: boolean` - Disable knob (default: false)

**Example:**
```tsx
import { Knob } from '@mode-7/mod';

<Knob
  value={cutoff}
  onChange={setCutoff}
  min={20}
  max={20000}
  label="Cutoff"
  size={72}
/>
```

#### Button
Styled button component.

**Props:**
- `onClick: () => void` - Click handler
- `active: boolean` - Active/pressed state
- `disabled: boolean` - Disable button
- `children: ReactNode` - Button content
- `className: string` - Additional classes

**Example:**
```tsx
import { Button } from '@mode-7/mod';

<Button onClick={handlePlay} active={isPlaying}>
  {isPlaying ? 'Stop' : 'Play'}
</Button>
```

#### Select
Dropdown select component.

**Props:**
- `value: string` (required) - Current value
- `onChange: (value: string) => void` (required) - Change handler
- `options: Array<{value: string, label: string}>` (required) - Options
- `label: string` - Label text
- `disabled: boolean` - Disable select

**Example:**
```tsx
import { Select } from '@mode-7/mod';

<Select
  value={waveform}
  onChange={setWaveform}
  label="Waveform"
  options={[
    { value: 'sine', label: 'Sine' },
    { value: 'square', label: 'Square' },
    { value: 'sawtooth', label: 'Sawtooth' }
  ]}
/>
```

#### XYPad
2D touchpad control for controlling two parameters simultaneously.

**Props:**
- `x: number` (required) - X value (0-1)
- `y: number` (required) - Y value (0-1)
- `onXChange: (value: number) => void` (required) - X change handler
- `onYChange: (value: number) => void` (required) - Y change handler
- `width: number` - Pad width (default: 200)
- `height: number` - Pad height (default: 200)
- `xLabel: string` - X axis label
- `yLabel: string` - Y axis label
- `disabled: boolean` - Disable pad

**Example:**
```tsx
import { XYPad } from '@mode-7/mod';

<XYPad
  x={xPos}
  y={yPos}
  onXChange={setXPos}
  onYChange={setYPos}
  xLabel="Cutoff"
  yLabel="Resonance"
  width={250}
  height={250}
/>
```

#### FilePicker
File input component.

**Props:**
- `onFileSelect: (file: File) => void` (required) - File selection handler
- `accept: string` - Accepted file types (e.g., "audio/*")
- `label: string` - Label text
- `buttonText: string` - Button text (default: "Choose File")

**Example:**
```tsx
import { FilePicker } from '@mode-7/mod';

<FilePicker
  onFileSelect={(file) => loadAudioFile(file)}
  accept="audio/*"
  label="Load Audio"
/>
```

#### TextInput
Text input component.

**Props:**
- `value: string` (required) - Current value
- `onChange: (value: string) => void` (required) - Change handler
- `label: string` - Label text
- `placeholder: string` - Placeholder text
- `disabled: boolean` - Disable input
- `type: string` - Input type (default: "text")

**Example:**
```tsx
import { TextInput } from '@mode-7/mod';

<TextInput
  value={projectName}
  onChange={setProjectName}
  label="Project Name"
  placeholder="Enter name..."
/>
```

#### ProgressBar
Progress indicator component.

**Props:**
- `value: number` (required) - Progress value (0-100)
- `label: string` - Label text
- `showValue: boolean` - Show value text (default: true)
- `indeterminate: boolean` - Show indeterminate animation

**Example:**
```tsx
import { ProgressBar } from '@mode-7/mod';

<ProgressBar
  value={loadProgress}
  label="Loading..."
  showValue={true}
/>
```

#### OscilloscopeCanvas
Pre-built canvas oscilloscope visualization.

**Props:**
- `dataArray: Uint8Array` (required) - Waveform data from Oscilloscope component
- `bufferLength: number` (required) - Buffer length from Oscilloscope component
- `width: number` - Canvas width (default: 300)
- `height: number` - Canvas height (default: 150)
- `strokeColor: string` - Line color (default: "#4CAF50")
- `backgroundColor: string` - Background color (default: "#1a1a1a")

**Example:**
```tsx
import { Oscilloscope, OscilloscopeCanvas } from '@mode-7/mod';

<Oscilloscope input={audioRef}>
  {({ dataArray, bufferLength }) => (
    <OscilloscopeCanvas
      dataArray={dataArray}
      bufferLength={bufferLength}
      width={400}
      height={200}
      strokeColor="#00ff00"
    />
  )}
</Oscilloscope>
```

#### SpectrumAnalyzerCanvas
Pre-built canvas spectrum analyzer visualization.

**Props:**
- `dataArray: Uint8Array` (required) - Frequency data from SpectrumAnalyzer component
- `bufferLength: number` (required) - Buffer length from SpectrumAnalyzer component
- `width: number` - Canvas width (default: 300)
- `height: number` - Canvas height (default: 150)
- `barColor: string` - Bar color (default: "#4CAF50")
- `backgroundColor: string` - Background color (default: "#1a1a1a")
- `barGap: number` - Gap between bars (default: 2)

**Example:**
```tsx
import { SpectrumAnalyzer, SpectrumAnalyzerCanvas } from '@mode-7/mod';

<SpectrumAnalyzer input={audioRef}>
  {({ dataArray, bufferLength }) => (
    <SpectrumAnalyzerCanvas
      dataArray={dataArray}
      bufferLength={bufferLength}
      width={400}
      height={200}
      barColor="#ff9800"
    />
  )}
</SpectrumAnalyzer>
```

#### LevelMeterCanvas
Pre-built canvas level meter visualization.

**Props:**
- `level: number` (required) - Current level (0-1) from LevelMeter component
- `peak: number` (required) - Peak level (0-1) from LevelMeter component
- `isClipping: boolean` (required) - Clipping indicator from LevelMeter component
- `width: number` - Meter width (default: 20)
- `height: number` - Meter height (default: 150)
- `orientation: 'vertical' | 'horizontal'` - Meter orientation (default: 'vertical')
- `normalColor: string` - Normal level color (default: "#4CAF50")
- `warningColor: string` - Warning level color (default: "#FF9800")
- `clipColor: string` - Clipping color (default: "#F44336")

**Example:**
```tsx
import { LevelMeter, LevelMeterCanvas } from '@mode-7/mod';

<LevelMeter input={audioRef}>
  {({ level, peak, isClipping }) => (
    <LevelMeterCanvas
      level={level}
      peak={peak}
      isClipping={isClipping}
      width={30}
      height={200}
    />
  )}
</LevelMeter>
```

## Common Patterns

### 1. Basic Signal Chain
```tsx
const signal = useModStream();

<ToneGenerator output={signal} frequency={440} />
<Monitor input={signal} />
```

### 2. Source → Effect → Output
```tsx
const dry = useModStream();
const wet = useModStream();

<ToneGenerator output={dry} />
<Filter input={dry} output={wet} frequency={1000} Q={5} />
<Monitor input={wet} />
```

### 3. Multiple Effects Chain
```tsx
const source = useModStream();
const filtered = useModStream();
const delayed = useModStream();
const reverbed = useModStream();

<NoiseGenerator output={source} />
<Filter input={source} output={filtered} />
<Delay input={filtered} output={delayed} />
<Reverb input={delayed} output={reverbed} />
<Monitor input={reverbed} />
```

### 4. Mixing Multiple Sources
```tsx
const tone1 = useModStream();
const tone2 = useModStream();
const mixed = useModStream();

<ToneGenerator output={tone1} frequency={220} />
<ToneGenerator output={tone2} frequency={440} />
<Mixer inputs={[tone1, tone2]} output={mixed} />
<Monitor input={mixed} />
```

### 5. CV Modulation (LFO → Filter)
```tsx
const audio = useModStream();
const lfo = useModStream();
const filtered = useModStream();

<ToneGenerator output={audio} frequency={220} />
<LFO output={lfo} rate={2} waveform="sine" />
<Filter
  input={audio}
  output={filtered}
  frequency={1000}
  cvInput={lfo}
  cvTarget="frequency"
  cvAmount={5000}
/>
<Monitor input={filtered} />
```

### 6. Envelope-Controlled Filter
```tsx
const audio = useModStream();
const env = useModStream();
const filtered = useModStream();

<NoiseGenerator output={audio} />
<ADSR output={env} attack={0.01} decay={0.2} sustain={0.3} release={0.5}>
  {({ trigger }) => <button onClick={trigger}>Trigger</button>}
</ADSR>
<Filter
  input={audio}
  output={filtered}
  cvInput={env}
  cvTarget="frequency"
  cvAmount={8000}
/>
<Monitor input={filtered} />
```

### 7. Crossfade Between Sources
```tsx
const sourceA = useModStream();
const sourceB = useModStream();
const output = useModStream();

<ToneGenerator output={sourceA} frequency={220} />
<NoiseGenerator output={sourceB} type="white" />
<CrossFade inputs={[sourceA, sourceB]} output={output} mix={0.5} />
<Monitor input={output} />
```

### 8. With UI Controls (Render Props)
```tsx
const audio = useModStream();

<ToneGenerator output={audio}>
  {({ frequency, setFrequency, type, setType, gain, setGain }) => (
    <div>
      <Slider value={frequency} onChange={setFrequency} min={20} max={2000} label="Frequency" />
      <Select
        value={type}
        onChange={setType}
        options={[
          { value: 'sine', label: 'Sine' },
          { value: 'square', label: 'Square' },
          { value: 'sawtooth', label: 'Sawtooth' },
          { value: 'triangle', label: 'Triangle' },
        ]}
      />
      <Slider value={gain} onChange={setGain} min={0} max={1} step={0.01} label="Gain" />
    </div>
  )}
</ToneGenerator>
<Monitor input={audio} />
```

### 9. With Visualization
```tsx
const audio = useModStream();

<ToneGenerator output={audio} />

<Oscilloscope input={audio}>
  {({ dataArray, bufferLength }) => (
    <OscilloscopeCanvas dataArray={dataArray} bufferLength={bufferLength} height={150} />
  )}
</Oscilloscope>

<Monitor input={audio} />
```

### 10. Controlled Props Pattern
```tsx
const [frequency, setFrequency] = useState(440);
const [gain, setGain] = useState(0.5);
const audio = useModStream();

<ToneGenerator
  output={audio}
  frequency={frequency}
  onFrequencyChange={setFrequency}
  gain={gain}
  onGainChange={setGain}
/>
```

## Component Usage Patterns

mod components support three patterns:

### 1. Render Props (Most Common)
```tsx
<ToneGenerator output={ref}>
  {({ frequency, setFrequency, gain, setGain }) => (
    <div>
      <input value={frequency} onChange={e => setFrequency(+e.target.value)} />
    </div>
  )}
</ToneGenerator>
```

### 2. Controlled Props
```tsx
const [freq, setFreq] = useState(440);

<ToneGenerator output={ref} frequency={freq} onFrequencyChange={setFreq} />
```

### 3. Imperative Refs
```tsx
const toneRef = useRef<ToneGeneratorHandle>(null);

useEffect(() => {
  toneRef.current?.setFrequency(880);
}, []);

<ToneGenerator ref={toneRef} output={ref} />
```

## CV Modulation

Connect CV generators to processors using `cvInput`, `cvTarget`, and `cvAmount`:

```tsx
<LFO output={lfoRef} rate={5} />
<Filter
  input={audioRef}
  output={outRef}
  frequency={1000}        // Base frequency
  cvInput={lfoRef}        // CV source
  cvTarget="frequency"    // What to modulate
  cvAmount={3000}         // Modulation depth (±3000Hz)
/>
```

**Common cvTargets:**
- Filter: `frequency`, `Q`
- Processors: Check component docs for available targets

## Signal Flow Rules

1. **Sources** have `output` only
2. **Processors** have `input` AND `output`
3. **Mixers** have `inputs` (array) AND `output`
4. **Monitor** has `input` only
5. **CV generators** have `output`, connect to `cvInput` props
6. **Visualizations** have `input`, don't affect audio

## Complete Example: Simple Synthesizer

```tsx
import {
  AudioProvider,
  ToneGenerator,
  Filter,
  ADSR,
  Monitor,
  useModStream,
  Slider,
  Select,
  Button
} from '@mode-7/mod';
import { useState } from 'react';

function Synth() {
  const osc = useModStream();
  const env = useModStream();
  const filtered = useModStream();
  const [frequency, setFrequency] = useState(440);

  return (
    <AudioProvider>
      <h1>Simple Synth</h1>

      {/* Oscillator */}
      <ToneGenerator output={osc} frequency={frequency}>
        {({ type, setType, gain, setGain }) => (
          <div>
            <Slider
              value={frequency}
              onChange={setFrequency}
              min={20}
              max={2000}
              label="Frequency"
            />
            <Select
              value={type}
              onChange={setType}
              options={[
                { value: 'sine', label: 'Sine' },
                { value: 'square', label: 'Square' },
                { value: 'sawtooth', label: 'Sawtooth' },
              ]}
            />
            <Slider value={gain} onChange={setGain} min={0} max={1} label="Level" />
          </div>
        )}
      </ToneGenerator>

      {/* Envelope */}
      <ADSR output={env}>
        {({ attack, setAttack, decay, setDecay, sustain, setSustain, release, setRelease, trigger }) => (
          <div>
            <h3>Envelope</h3>
            <Button onClick={trigger}>Trigger</Button>
            <Slider value={attack} onChange={setAttack} min={0.001} max={2} label="Attack" />
            <Slider value={decay} onChange={setDecay} min={0.001} max={2} label="Decay" />
            <Slider value={sustain} onChange={setSustain} min={0} max={1} label="Sustain" />
            <Slider value={release} onChange={setRelease} min={0.001} max={5} label="Release" />
          </div>
        )}
      </ADSR>

      {/* Filter with envelope modulation */}
      <Filter
        input={osc}
        output={filtered}
        cvInput={env}
        cvTarget="frequency"
        cvAmount={8000}
      >
        {({ frequency, setFrequency, Q, setQ }) => (
          <div>
            <h3>Filter</h3>
            <Slider value={frequency} onChange={setFrequency} min={20} max={20000} label="Cutoff" />
            <Slider value={Q} onChange={setQ} min={0.1} max={30} label="Resonance" />
          </div>
        )}
      </Filter>

      {/* Output */}
      <Monitor input={filtered}>
        {({ gain, setGain, isMuted, setMuted }) => (
          <div>
            <Slider value={gain} onChange={setGain} min={0} max={1} label="Master" />
            <Button active={isMuted} onClick={() => setMuted(!isMuted)}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
        )}
      </Monitor>
    </AudioProvider>
  );
}
```

## Troubleshooting

### No Audio Output
- ✅ Check AudioProvider wraps all components
- ✅ Check Monitor is connected
- ✅ Check browser autoplay policy (user must interact first)
- ✅ Check volume/gain settings

### TypeScript Errors
- ✅ Import types: `import type { ModStreamRef } from '@mode-7/mod'`
- ✅ Use component-specific Handle types for refs

### Connection Errors
- ✅ Sources connect to `input` props
- ✅ Processors output to other processors' `input`
- ✅ Always end with Monitor
- ✅ CV generators connect to `cvInput`, not `input`

## Documentation Links

- **Getting Started**: [/guide/getting-started](/guide/getting-started)
- **Architecture**: [/guide/architecture](/guide/architecture)
- **Audio Context**: [/guide/audio-context](/guide/audio-context)
- **Connecting Modules**: [/guide/connecting-modules](/guide/connecting-modules)
- **CV Modulation**: [/guide/cv-modulation](/guide/cv-modulation)
- **API Reference**: [/api/overview](/api/overview)
- **Examples**: [/guide/examples/simple-synth](/guide/examples/simple-synth)

## Quick Reference Card

```tsx
// Install
npm install @mode-7/mod

// Import
import {
  AudioProvider,
  ToneGenerator,
  Filter,
  Monitor,
  useModStream
} from '@mode-7/mod';

// Create connections
const ref = useModStream();

// Basic structure
<AudioProvider>
  <Source output={ref1} />
  <Processor input={ref1} output={ref2} />
  <Monitor input={ref2} />
</AudioProvider>

// Modulation
<CVGenerator output={cvRef} />
<Processor cvInput={cvRef} cvTarget="paramName" cvAmount={100} />
```

---

## Detailed Component API

### ToneGenerator - Audio Oscillator

Generates pure tones at specified frequencies with multiple waveforms.

**Props:**
- `output: ModStreamRef` (required) - Output stream reference
- `frequency: number` - Frequency in Hz (default: 440)
- `onFrequencyChange: (freq: number) => void` - Frequency change callback
- `gain: number` - Gain level 0-1 (default: 0.3)
- `onGainChange: (gain: number) => void` - Gain change callback
- `waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'` - Waveform type (default: 'square')
- `onWaveformChange: (waveform: OscillatorType) => void` - Waveform change callback
- `cv: ModStreamRef` - CV input for frequency modulation
- `cvAmount: number` - CV modulation depth (default: 100)
- `label: string` - Component label (default: 'tone-generator')

**Render Props:**
```tsx
{({ frequency, setFrequency, gain, setGain, waveform, setWaveform, isActive }) => ReactNode}
```

**Example - With UI:**
```tsx
const tone = useModStream();

<ToneGenerator output={tone}>
  {({ frequency, setFrequency, waveform, setWaveform }) => (
    <div>
      <Slider value={frequency} onChange={setFrequency} min={20} max={2000} label="Freq" />
      <Select
        value={waveform}
        onChange={setWaveform}
        options={[
          { value: 'sine', label: 'Sine' },
          { value: 'square', label: 'Square' }
        ]}
      />
    </div>
  )}
</ToneGenerator>
```

### Filter - Frequency Filter

Filters audio frequencies with multiple filter types and CV modulation support.

**Props:**
- `input: ModStreamRef` (required) - Input stream
- `output: ModStreamRef` (required) - Output stream
- `frequency: number` - Cutoff frequency in Hz (default: 1000)
- `onFrequencyChange: (freq: number) => void` - Frequency change callback
- `Q: number` - Resonance/Q factor (default: 1)
- `onQChange: (q: number) => void` - Q change callback
- `type: 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'allpass' | 'lowshelf' | 'highshelf' | 'peaking'` - Filter type (default: 'lowpass')
- `onTypeChange: (type: BiquadFilterType) => void` - Type change callback
- `cvInput: ModStreamRef` - CV modulation input
- `cvTarget: 'frequency' | 'Q'` - Which parameter to modulate
- `cvAmount: number` - Modulation depth (default: 1000)
- `label: string` - Component label

**Render Props:**
```tsx
{({ frequency, setFrequency, Q, setQ, type, setType }) => ReactNode}
```

**Example - CV Modulated Filter:**
```tsx
const audio = useModStream();
const lfo = useModStream();
const filtered = useModStream();

<NoiseGenerator output={audio} />
<LFO output={lfo} rate={3} waveform="sine" />
<Filter
  input={audio}
  output={filtered}
  frequency={1000}
  Q={5}
  type="lowpass"
  cvInput={lfo}
  cvTarget="frequency"
  cvAmount={5000}  // ±5000Hz modulation
/>
<Monitor input={filtered} />
```

### LFO - Low Frequency Oscillator

Generates control voltage signals for modulation.

**Props:**
- `output: ModStreamRef` (required) - CV output stream
- `rate: number` - Frequency in Hz (default: 1)
- `onRateChange: (rate: number) => void` - Rate change callback
- `waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'` - Waveform (default: 'sine')
- `onWaveformChange: (waveform: OscillatorType) => void` - Waveform change callback
- `depth: number` - Modulation depth 0-1 (default: 1)
- `onDepthChange: (depth: number) => void` - Depth change callback
- `label: string` - Component label

**Render Props:**
```tsx
{({ rate, setRate, waveform, setWaveform, depth, setDepth }) => ReactNode}
```

### ADSR - Envelope Generator

Attack-Decay-Sustain-Release envelope generator for controlling parameters over time.

**Props:**
- `output: ModStreamRef` (required) - CV output stream
- `attack: number` - Attack time in seconds (default: 0.1)
- `onAttackChange: (attack: number) => void` - Attack change callback
- `decay: number` - Decay time in seconds (default: 0.1)
- `onDecayChange: (decay: number) => void` - Decay change callback
- `sustain: number` - Sustain level 0-1 (default: 0.7)
- `onSustainChange: (sustain: number) => void` - Sustain change callback
- `release: number` - Release time in seconds (default: 0.3)
- `onReleaseChange: (release: number) => void` - Release change callback
- `label: string` - Component label

**Render Props:**
```tsx
{({
  attack, setAttack,
  decay, setDecay,
  sustain, setSustain,
  release, setRelease,
  trigger: () => void  // Function to trigger the envelope
}) => ReactNode}
```

**Example - Envelope-Controlled VCA:**
```tsx
const audio = useModStream();
const env = useModStream();
const output = useModStream();

<NoiseGenerator output={audio} />
<ADSR output={env} attack={0.01} decay={0.2} sustain={0.3} release={0.5}>
  {({ trigger }) => <Button onClick={trigger}>Trigger</Button>}
</ADSR>
<VCA input={audio} output={output} cvInput={env} cvAmount={1} />
<Monitor input={output} />
```

### Delay - Echo Effect

Creates echo/delay effects with feedback control.

**Props:**
- `input: ModStreamRef` (required) - Input stream
- `output: ModStreamRef` (required) - Output stream
- `delayTime: number` - Delay time in seconds (default: 0.3)
- `onDelayTimeChange: (time: number) => void` - Delay time change callback
- `feedback: number` - Feedback amount 0-0.9 (default: 0.5)
- `onFeedbackChange: (feedback: number) => void` - Feedback change callback
- `mix: number` - Dry/wet mix 0-1 (default: 0.5)
- `onMixChange: (mix: number) => void` - Mix change callback
- `label: string` - Component label

**Render Props:**
```tsx
{({ delayTime, setDelayTime, feedback, setFeedback, mix, setMix }) => ReactNode}
```

### Reverb - Reverberation Effect

Adds spatial reverb to audio signals.

**Props:**
- `input: ModStreamRef` (required) - Input stream
- `output: ModStreamRef` (required) - Output stream
- `roomSize: number` - Room size 0-1 (default: 0.5)
- `onRoomSizeChange: (size: number) => void` - Room size change callback
- `damping: number` - High frequency damping 0-1 (default: 0.5)
- `onDampingChange: (damping: number) => void` - Damping change callback
- `mix: number` - Dry/wet mix 0-1 (default: 0.3)
- `onMixChange: (mix: number) => void` - Mix change callback
- `label: string` - Component label

**Render Props:**
```tsx
{({ roomSize, setRoomSize, damping, setDamping, mix, setMix }) => ReactNode}
```

### Mixer - Audio Mixer

Combines multiple audio signals into one output.

**Props:**
- `inputs: ModStreamRef[]` (required) - Array of input streams to mix
- `output: ModStreamRef` (required) - Mixed output stream
- `gains: number[]` - Individual gain levels for each input (0-1)
- `onGainsChange: (gains: number[]) => void` - Gains change callback
- `label: string` - Component label

**Render Props:**
```tsx
{({ gains, setGains, setGain: (index: number, gain: number) => void }) => ReactNode}
```

**Example - Mixing Three Sources:**
```tsx
const osc1 = useModStream();
const osc2 = useModStream();
const noise = useModStream();
const mixed = useModStream();

<ToneGenerator output={osc1} frequency={220} />
<ToneGenerator output={osc2} frequency={330} />
<NoiseGenerator output={noise} type="white" />

<Mixer inputs={[osc1, osc2, noise]} output={mixed}>
  {({ gains, setGain }) => (
    <div>
      <Slider value={gains[0]} onChange={(v) => setGain(0, v)} label="Osc 1" />
      <Slider value={gains[1]} onChange={(v) => setGain(1, v)} label="Osc 2" />
      <Slider value={gains[2]} onChange={(v) => setGain(2, v)} label="Noise" />
    </div>
  )}
</Mixer>

<Monitor input={mixed} />
```

### NoiseGenerator - Noise Source

Generates different types of noise (white, pink, brown).

**Props:**
- `output: ModStreamRef` (required) - Output stream
- `type: 'white' | 'pink' | 'brown'` - Noise type (default: 'white')
- `onTypeChange: (type: NoiseType) => void` - Type change callback
- `gain: number` - Gain level 0-1 (default: 0.3)
- `onGainChange: (gain: number) => void` - Gain change callback
- `label: string` - Component label

**Render Props:**
```tsx
{({ type, setType, gain, setGain }) => ReactNode}
```

### MP3Deck - Audio File Player

Plays audio files (MP3, WAV, etc.).

**Props:**
- `output: ModStreamRef` (required) - Output stream
- `src: string` - Audio file URL (default: '')
- `onSrcChange: (src: string) => void` - Source change callback
- `loop: boolean` - Loop playback (default: false)
- `onLoopChange: (loop: boolean) => void` - Loop change callback
- `gain: number` - Gain level 0-1 (default: 1)
- `onGainChange: (gain: number) => void` - Gain change callback
- `autoplay: boolean` - Auto-play when loaded (default: false)
- `label: string` - Component label

**Render Props:**
```tsx
{({
  src, setSrc,
  loop, setLoop,
  gain, setGain,
  isPlaying,
  play: () => void,
  pause: () => void,
  stop: () => void,
  currentTime: number,
  duration: number,
  seek: (time: number) => void
}) => ReactNode}
```

**Example - Audio Player with Controls:**
```tsx
const audio = useModStream();

<MP3Deck output={audio} src="/audio/track.mp3">
  {({ isPlaying, play, pause, currentTime, duration, seek, gain, setGain }) => (
    <div>
      <Button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
      <Slider
        value={currentTime}
        onChange={seek}
        min={0}
        max={duration}
        label="Position"
      />
      <Slider value={gain} onChange={setGain} min={0} max={1} label="Volume" />
    </div>
  )}
</MP3Deck>
```

### Sampler - Polyphonic Sample Playback

Plays audio samples with polyphony, velocity, and MIDI note support. Uses AudioBufferSourceNode for low-latency triggering.

**Props:**
- `output: ModStreamRef` (required) - Output stream
- `src: string` - Sample URL to load
- `playbackRate: number` - Playback speed (default: 1.0)
- `detune: number` - Pitch adjustment in cents (default: 0)
- `gain: number` - Output volume 0-1+ (default: 1)
- `loop: boolean` - Loop playback (default: false)
- `loopStart: number` - Loop start in seconds (default: 0)
- `loopEnd: number` - Loop end in seconds (default: 0 = end)
- `maxPolyphony: number` - Max simultaneous voices (default: 8)
- `voiceStealingMode: 'oldest' | 'quietest' | 'none'` - How to handle overflow (default: 'oldest')
- `gate: ModStreamRef` - Gate input for automatic triggering
- `gateMode: 'gate' | 'trigger'` - Gate behavior (default: 'trigger')
- `rootNote: number` - MIDI note for original pitch (default: 60)
- `cv: ModStreamRef` - CV modulation input
- `cvAmount: number` - Modulation depth (default: 0.5)
- `cvTarget: 'playbackRate' | 'detune'` - Modulation target (default: 'playbackRate')

**Render Props:**
```tsx
{({
  isLoaded, isLoading, error, duration, isPlaying, activeVoices, maxPolyphony,
  trigger, triggerNote, stop, stopAll, loadFile, loadUrl,
  playbackRate, setPlaybackRate, detune, setDetune, gain, setGain,
  loop, setLoop, loopStart, setLoopStart, loopEnd, setLoopEnd
}) => ReactNode}
```

**Trigger Options:**
```tsx
trigger({ velocity: 0.8, startOffset: 0.5, playbackRate: 1.5 });
triggerNote(60);  // Trigger at MIDI note 60 (middle C)
triggerNote(72, { velocity: 0.7 });  // Trigger at C5 with velocity
```

**Example - Drum Pad:**
```tsx
const output = useModStream();

<Sampler output={output} src="/samples/kick.wav">
  {({ trigger, isLoaded, activeVoices }) => (
    <button onClick={() => trigger()} disabled={!isLoaded}>
      Kick ({activeVoices}/8)
    </button>
  )}
</Sampler>
```

**Example - MIDI Keyboard:**
```tsx
const output = useModStream();

<Sampler output={output} src="/samples/piano.wav" rootNote={60}>
  {({ triggerNote, stopAll, isLoaded }) => (
    <div>
      {[60, 62, 64, 65, 67, 69, 71, 72].map(note => (
        <button key={note} onClick={() => triggerNote(note)} disabled={!isLoaded}>
          {note}
        </button>
      ))}
      <button onClick={stopAll}>Stop All</button>
    </div>
  )}
</Sampler>
```

**Helper Function:**
```tsx
import { midiNoteToPlaybackRate } from '@mode-7/mod';

const rate = midiNoteToPlaybackRate(72);        // 2.0 (octave up from 60)
const rate = midiNoteToPlaybackRate(48, 60);    // 0.5 (octave down)
```

### VCA - Voltage Controlled Amplifier

Controls gain/volume with CV modulation.

**Props:**
- `input: ModStreamRef` (required) - Input stream
- `output: ModStreamRef` (required) - Output stream
- `gain: number` - Base gain 0-1 (default: 1)
- `onGainChange: (gain: number) => void` - Gain change callback
- `cvInput: ModStreamRef` - CV modulation input
- `cvAmount: number` - Modulation depth 0-1 (default: 1)
- `label: string` - Component label

**Render Props:**
```tsx
{({ gain, setGain }) => ReactNode}
```

### Oscilloscope - Waveform Visualizer

Visualizes audio waveforms. Use with OscilloscopeCanvas or custom visualization.

**Props:**
- `input: ModStreamRef` (required) - Audio input to visualize
- `fftSize: number` - FFT size (default: 2048, must be power of 2)
- `label: string` - Component label

**Render Props:**
```tsx
{({
  dataArray: Uint8Array,     // Waveform data
  bufferLength: number        // Data buffer length
}) => ReactNode}
```

### SpectrumAnalyzer - Frequency Visualizer

Visualizes frequency spectrum. Use with SpectrumAnalyzerCanvas or custom visualization.

**Props:**
- `input: ModStreamRef` (required) - Audio input to analyze
- `fftSize: number` - FFT size (default: 2048, must be power of 2)
- `smoothingTimeConstant: number` - Smoothing 0-1 (default: 0.8)
- `label: string` - Component label

**Render Props:**
```tsx
{({
  dataArray: Uint8Array,     // Frequency data
  bufferLength: number        // Data buffer length
}) => ReactNode}
```

### LevelMeter - Audio Level Meter

Measures audio levels with peak detection and clipping indicator.

**Props:**
- `input: ModStreamRef` (required) - Audio input to measure
- `label: string` - Component label

**Render Props:**
```tsx
{({
  level: number,         // Current RMS level 0-1
  peak: number,          // Peak level 0-1
  isClipping: boolean    // True if clipping detected
}) => ReactNode}
```

## Important Notes for AI Assistants

### Common Mistakes to Avoid

1. **Missing AudioProvider** - Always wrap everything in `<AudioProvider>`
2. **No Monitor** - Audio won't play without `<Monitor input={finalStream} />`
3. **Wrong prop names** - It's `output` not `out`, `input` not `in`, `cvInput` not `cv` (except for ToneGenerator which uses `cv`)
4. **Forgetting useModStream** - Create refs with `const ref = useModStream()`, not `useRef(null)`
5. **CV vs Audio inputs** - CV generators connect to `cvInput`, audio sources connect to `input`
6. **Import errors** - Everything imports from `@mode-7/mod`, including UI components

### Signal Flow Checklist

- ✅ AudioProvider wraps all mod components
- ✅ Create stream refs with `useModStream()`
- ✅ Sources (ToneGenerator, NoiseGenerator, etc.) have `output` prop
- ✅ Processors (Filter, Delay, etc.) have both `input` and `output` props
- ✅ CV generators (LFO, ADSR) connect to `cvInput` props
- ✅ Final output goes to `<Monitor input={...} />`
- ✅ All components are connected in a valid chain

### Quick Debugging

**No sound?**
- Check AudioProvider is wrapping components
- Check Monitor is connected to final output
- Check browser autoplay policy (user must interact first)
- Check gain/volume levels

**TypeScript errors?**
- Import types: `import type { ModStreamRef } from '@mode-7/mod'`
- Use component-specific Handle types for refs

**Connection errors?**
- Audio flows: Source → Processor → Monitor
- CV flows: CV Generator → Processor's cvInput
- Never connect CV to audio inputs or vice versa

---

**For detailed examples and advanced patterns, explore the full documentation at [/guide/getting-started](/guide/getting-started)**
