# Delay

The `Delay` component creates echo effects by delaying the input signal and feeding it back. It provides wet/dry mix control for blending the delayed signal with the original.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to delay |
| `output` | `ModStreamRef` | Required | Delayed audio output |
| `label` | `string` | `'delay'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `time` | `number` | Delay time in seconds (0-5) |
| `setTime` | `(value: number) => void` | Update the delay time |
| `feedback` | `number` | Feedback amount (0-1) |
| `setFeedback` | `(value: number) => void` | Update the feedback |
| `wet` | `number` | Wet/dry mix (0-1) |
| `setWet` | `(value: number) => void` | Update the wet/dry mix |
| `isActive` | `boolean` | Whether the delay is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, Delay, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);
  const delayOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} />
      <Delay
        input={toneOut}
        output={delayOut}
      />
      <Monitor input={delayOut} />
    </>
  );
}
```

### With UI Controls

```tsx
import { Delay } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null);
  const delayOut = useRef(null);

  return (
    <Delay input={inputRef} output={delayOut}>
      {({ time, setTime, feedback, setFeedback, wet, setWet }) => (
        <div>
          <div>
            <label>Delay Time: {time.toFixed(3)}s</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.001"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Feedback: {(feedback * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="0.95"
              step="0.01"
              value={feedback}
              onChange={(e) => setFeedback(Number(e.target.value))}
            />
          </div>

          <div>
            <label>Mix: {(wet * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={wet}
              onChange={(e) => setWet(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </Delay>
  );
}
```

### Rhythmic Delay

```tsx
import { ToneGenerator, ADSR, Delay, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const adsrOut = useRef(null);
  const toneOut = useRef(null);
  const delayOut = useRef(null);

  return (
    <>
      <ADSR output={adsrOut}>
        {({ trigger, releaseGate }) => (
          <button onMouseDown={trigger} onMouseUp={releaseGate}>
            Trigger
          </button>
        )}
      </ADSR>
      <ToneGenerator output={toneOut} cv={adsrOut} cvAmount={1.0} />
      <Delay input={toneOut} output={delayOut}>
        {({ setTime, setFeedback, setWet }) => {
          React.useEffect(() => {
            setTime(0.375);  // Dotted eighth note at 120 BPM
            setFeedback(0.6);
            setWet(0.4);
          }, []);
          return null;
        }}
      </Delay>
      <Monitor input={delayOut} />
    </>
  );
}
```

### Ping Pong Delay Effect

```tsx
import { MP3Deck, Delay, Panner, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const deckOut = useRef(null);
  const delay1Out = useRef(null);
  const delay2Out = useRef(null);
  const pan1Out = useRef(null);
  const pan2Out = useRef(null);

  return (
    <>
      <MP3Deck output={deckOut}>
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
      </MP3Deck>

      {/* First delay - panned left */}
      <Delay input={deckOut} output={delay1Out}>
        {({ setTime, setFeedback, setWet }) => {
          React.useEffect(() => {
            setTime(0.25);
            setFeedback(0.5);
            setWet(0.5);
          }, []);
          return null;
        }}
      </Delay>
      <Panner input={delay1Out} output={pan1Out} pan={-0.7} />

      {/* Second delay - panned right */}
      <Delay input={deckOut} output={delay2Out}>
        {({ setTime, setFeedback, setWet }) => {
          React.useEffect(() => {
            setTime(0.5);
            setFeedback(0.5);
            setWet(0.5);
          }, []);
          return null;
        }}
      </Delay>
      <Panner input={delay2Out} output={pan2Out} pan={0.7} />

      <Monitor input={pan1Out} />
      <Monitor input={pan2Out} />
    </>
  );
}
```

## Important Notes

### Delay Time

- Range: 0 to 5 seconds
- Longer delays create distinct echoes
- Shorter delays (10-50ms) create doubling effects
- Very short delays (<10ms) create comb filtering

### Feedback

- Controls how many times the delay repeats
- Range: 0 to 1
- 0 = single echo
- 0.5 = moderate repeats
- 0.9+ = many repeats (near infinite)
- Values >= 1.0 will cause runaway feedback!

### Wet/Dry Mix

- 0 = 100% dry (original signal only)
- 0.5 = 50/50 mix
- 1 = 100% wet (delayed signal only)
- Adjust to taste based on the effect you want

### Tempo Sync

To sync delay time to tempo, use this formula:
```
delayTime = (60 / bpm) * beatDivision
```

Common beat divisions:
- Whole note: 4
- Half note: 2
- Quarter note: 1
- Eighth note: 0.5
- Dotted eighth: 0.75
- Sixteenth note: 0.25

::: warning Feedback Warning
Be careful with high feedback values! Values above 0.95 can cause extremely loud, potentially harmful audio. Always start with lower values and increase gradually.
:::

## Related

- [Reverb](/api/processors/reverb) - For ambient space effects
- [Panner](/api/processors/panner) - Create stereo delays
- [Filter](/api/processors/filter) - Filter the delayed signal
