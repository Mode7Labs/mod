# MidiPlayer

`MidiPlayer` reads MIDI files/URLs, feeds a MIDI bus, and optionally listens to Clock/Start/Stop inputs for transport control. Its render props surface playback controls, metadata, position tracking, and MIDI file state so you can build MIDI transport UIs.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | MIDI output bus that other modules (e.g. `Fluidsynth`) can subscribe to |
| `startInput` | `ModStreamRef` | — | Optional CV gateway to trigger the module via a `Start` pulse |
| `stopInput` | `ModStreamRef` | — | Optional CV input for `Stop` pulses |
| `clockInput` | `ModStreamRef` | — | Optional clock gate for tick synchronization |
| `label` | `string` | `'midi-player'` | Metadata label |
| `midiFileName` | `string` | `''` | Name of the currently loaded MIDI file |
| `onMidiFileNameChange` | `(name: string) => void` | — | Callback when MIDI file name updates |
| `midiFileDataUrl` | `string` | `''` | Embedded MIDI data URL |
| `onMidiFileDataUrlChange` | `(dataUrl: string) => void` | — | Callback when the data URL changes |
| `midiUrl` | `string` | `''` | Remote MIDI file URL |
| `onMidiUrlChange` | `(url: string) => void` | — | Callback when the MIDI URL changes |
| `bpm` | `number` | `120` | Manual tempo applied when no clock is connected |
| `onBpmChange` | `(value: number) => void` | — | Callback when the BPM changes |
| `children` | `(props: MidiPlayerRenderProps) => ReactNode` | — | Render prop that exposes all playback controls |

## Render Props

| Property | Type | Description |
|----------|------|-------------|
| `midiFileName` | `string` | Name of the loaded MIDI file |
| `setMidiFileName` | `(name: string) => void` | Update the file name |
| `midiFileDataUrl` | `string` | Embedded data URL |
| `setMidiFileDataUrl` | `(dataUrl: string) => void` | Update the embedded data |
| `midiUrl` | `string` | Remote MIDI URL |
| `setMidiUrl` | `(url: string) => void` | Change the fetched URL |
| `loadMidiFile` | `(file: File) => void` | Load MIDI via a `File` object |
| `bpm` | `number` | Current tempo value |
| `setBpm` | `(value: number) => void` | Adjust the BPM |
| `isPlaying` | `boolean` | Whether the player is running |
| `isLoaded` | `boolean` | `true` when MIDI data is parsed |
| `isClockConnected` | `boolean` | `true` when a clock stream is wired |
| `isStartConnected` | `boolean` | `true` if a start CV input exists |
| `isStopConnected` | `boolean` | `true` if a stop CV input exists |
| `play` | `() => void` | Start playback |
| `pause` | `() => void` | Pause playback |
| `stop` | `() => void` | Stop playback and reset playback position |
| `position` | `number` | Current playback position (seconds or ticks) |
| `duration` | `number` | MIDI duration in seconds |
| `positionUnit` | `'seconds' | 'ticks'` | Unit used for the slider |
| `positionStep` | `number` | Slider step size (`1` for ticks, `0.01` for seconds) |
| `positionMax` | `number` | Slider maximum value |
| `setPosition` | `(value: number) => void` | Seek to an absolute position |
| `metadata` | `MidiMetadata \| null` | Parsed metadata such as tracks/tempo |
| `error` | `string \| null` | Load errors, if any |

## Usage

```tsx
import { MidiPlayer, Fluidsynth } from '@mode-7/mod';
import { useRef } from 'react';

function MidiPlayback() {
  const midiBus = useRef<null>(null);

  return (
    <div>
      <MidiPlayer output={midiBus} midiUrl="/samples/bach.mid" bpm={140}>
        {({ play, pause, metadata, isLoaded }) => (
          <div>
            <button onClick={play} disabled={!isLoaded}>Play</button>
            <button onClick={pause}>Pause</button>
            <p>{metadata ? `${metadata.tracks} tracks` : 'No metadata yet'}</p>
          </div>
        )}
      </MidiPlayer>
      <Fluidsynth output={useRef(null)} midiInput={midiBus} />
    </div>
  );
}
```
