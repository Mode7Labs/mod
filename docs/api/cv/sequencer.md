# Sequencer

The `Sequencer` component generates a sequence of CV values that step through a pattern. Perfect for creating melodic sequences, rhythmic patterns, or stepped modulation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the CV sequence |
| `gateOutput` | `ModStreamRef` | - | Optional separate output for gate/trigger signals |
| `label` | `string` | `'sequencer'` | Label for the component in metadata |
| `numSteps` | `number` | `8` | Number of steps in the sequence |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `steps` | `number[]` | Array of step values (0-1) |
| `setSteps` | `(steps: number[]) => void` | Update all step values |
| `currentStep` | `number` | Currently playing step index |
| `bpm` | `number` | Tempo in beats per minute |
| `setBpm` | `(value: number) => void` | Update the tempo |
| `isPlaying` | `boolean` | Whether the sequencer is running |
| `play` | `() => void` | Start the sequencer |
| `pause` | `() => void` | Pause the sequencer |
| `reset` | `() => void` | Stop and reset to first step |

## Usage

### Basic Usage

```tsx
import { Sequencer, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const seqOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <Sequencer output={seqOut}>
        {({ play, pause, isPlaying }) => (
          <button onClick={isPlaying ? pause : play}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
      </Sequencer>
      <ToneGenerator
        output={toneOut}
        frequency={200}
        cv={seqOut}
        cvAmount={400}  // Modulate frequency by sequence values
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### Step Sequencer with UI

```tsx
import { Sequencer } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const seqOut = useRef(null);

  return (
    <Sequencer output={seqOut} numSteps={16}>
      {({
        steps,
        setSteps,
        currentStep,
        bpm,
        setBpm,
        isPlaying,
        play,
        pause,
        reset
      }) => (
        <div>
          <div>
            <button onClick={play} disabled={isPlaying}>Play</button>
            <button onClick={pause} disabled={!isPlaying}>Pause</button>
            <button onClick={reset}>Reset</button>
          </div>

          <div>
            <label>BPM: {bpm}</label>
            <input
              type="range"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {steps.map((value, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <input
                  type="range"
                  orient="vertical"
                  min="0"
                  max="1"
                  step="0.01"
                  value={value}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index] = Number(e.target.value);
                    setSteps(newSteps);
                  }}
                  style={{
                    writingMode: 'bt-lr',
                    appearance: 'slider-vertical',
                    width: '20px',
                    height: '100px',
                  }}
                />
                <div
                  style={{
                    width: '20px',
                    height: '10px',
                    backgroundColor: currentStep === index ? 'blue' : 'gray',
                    marginTop: '4px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Sequencer>
  );
}
```

### Melodic Sequence

```tsx
import { Sequencer, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const seqOut = useRef(null);
  const toneOut = useRef(null);

  // Convert MIDI notes to 0-1 range
  const notesToSteps = (notes: number[]) => {
    const min = Math.min(...notes);
    const max = Math.max(...notes);
    const range = max - min || 1;
    return notes.map(note => (note - min) / range);
  };

  // C major scale pattern
  const melody = [60, 62, 64, 65, 67, 69, 71, 72]; // MIDI notes
  const steps = notesToSteps(melody);

  return (
    <>
      <Sequencer output={seqOut} numSteps={8}>
        {({ setSteps, setBpm, play, isPlaying }) => {
          React.useEffect(() => {
            setSteps(steps);
            setBpm(120);
            if (!isPlaying) play();
          }, []);
          return null;
        }}
      </Sequencer>
      <ToneGenerator
        output={toneOut}
        frequency={220}  // Base frequency (A3)
        cv={seqOut}
        cvAmount={880}  // Range for melody
        waveform="square"
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

### With ADSR Envelope

```tsx
import { Sequencer, ADSR, Clock, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const clockOut = useRef(null);
  const seqOut = useRef(null);
  const adsrOut = useRef(null);
  const toneOut = useRef(null);

  return (
    <>
      <Clock output={clockOut}>
        {({ start, stop, isRunning, setBpm }) => {
          React.useEffect(() => {
            setBpm(120);
            start();
          }, []);
          return null;
        }}
      </Clock>
      <Sequencer output={seqOut} numSteps={8} />
      <ADSR gate={clockOut} output={adsrOut} />
      <ToneGenerator
        output={toneOut}
        frequency={220}
        cv={seqOut}
        cvAmount={440}
      />
      <Monitor input={toneOut} />
    </>
  );
}
```

## Important Notes

### Step Values

- Each step value is in the range 0-1
- Scale these values using the receiving module's `cvAmount` parameter
- For frequency modulation, map 0-1 to your desired frequency range

### Timing

- The BPM parameter controls how fast the sequence plays
- Each step represents one beat
- Default BPM is 120

### Sequence Length

- Set via `numSteps` prop (default 8)
- Steps array is initialized with 0.5 for each step
- Can be changed dynamically via `setSteps()`

### Playback

- Sequence loops continuously when playing
- `reset()` stops playback and returns to step 0
- Current step is shown in `currentStep` property

## Related

- [Clock](/api/cv/clock) - Generate gate signals in sync with the sequence
- [ADSR](/api/cv/adsr) - Add envelopes to each step
- [ToneGenerator](/api/sources/tone-generator) - Create melodies
- [Filter](/api/processors/filter) - Modulate filter cutoff
