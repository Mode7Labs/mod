# MP3Deck

The `MP3Deck` component loads and plays local audio files (MP3, WAV, etc.). It provides playback controls, seeking, and looping capabilities.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | Reference to output the audio signal |
| `label` | `string` | `'mp3-deck'` | Label for the component in metadata |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `src` | `string` | Current audio source URL |
| `setSrc` | `(src: string) => void` | Set audio source by URL |
| `loadFile` | `(file: File) => void` | Load audio from a File object |
| `gain` | `number` | Current gain level (0-1+) |
| `setGain` | `(value: number) => void` | Update the gain level |
| `loop` | `boolean` | Whether the audio loops |
| `setLoop` | `(value: boolean) => void` | Enable or disable looping |
| `isPlaying` | `boolean` | Whether audio is currently playing |
| `play` | `() => void` | Start playback |
| `pause` | `() => void` | Pause playback |
| `stop` | `() => void` | Stop playback and reset to start |
| `currentTime` | `number` | Current playback position in seconds |
| `duration` | `number` | Total duration of audio in seconds |
| `seek` | `(time: number) => void` | Seek to a specific time in seconds |
| `isActive` | `boolean` | Whether the audio deck is active |
| `error` | `string \| null` | Error message if loading failed |

## Usage

### Basic Usage

```tsx
import { MP3Deck, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const deckOut = useRef(null);

  return (
    <>
      <MP3Deck output={deckOut}>
        {({ setSrc, play }) => (
          <button onClick={() => {
            setSrc('/path/to/audio.mp3');
            play();
          }}>
            Load and Play
          </button>
        )}
      </MP3Deck>
      <Monitor input={deckOut} />
    </>
  );
}
```

### Full Playback Controls

```tsx
import { MP3Deck } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const deckOut = useRef(null);

  return (
    <MP3Deck output={deckOut}>
      {({
        loadFile,
        isPlaying,
        play,
        pause,
        stop,
        currentTime,
        duration,
        seek,
        loop,
        setLoop,
        gain,
        setGain,
        error
      }) => (
        <div>
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}

          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadFile(file);
            }}
          />

          <div>
            <button onClick={play} disabled={isPlaying}>Play</button>
            <button onClick={pause} disabled={!isPlaying}>Pause</button>
            <button onClick={stop}>Stop</button>
          </div>

          <div>
            <label>
              Position: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </label>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
              />
              Loop
            </label>
          </div>

          <div>
            <label>Volume: {gain.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </MP3Deck>
  );
}
```

### With Effects Chain

```tsx
import { MP3Deck, Filter, Delay, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const deckOut = useRef(null);
  const filterOut = useRef(null);
  const delayOut = useRef(null);

  return (
    <>
      <MP3Deck output={deckOut}>
        {({ loadFile, play, pause, isPlaying }) => (
          <div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  loadFile(file);
                  setTimeout(play, 100); // Auto-play after load
                }
              }}
            />
            <button onClick={isPlaying ? pause : play}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        )}
      </MP3Deck>
      <Filter input={deckOut} output={filterOut} type="lowpass" frequency={2000} />
      <Delay input={filterOut} output={delayOut} time={0.5} feedback={0.3} />
      <Monitor input={delayOut} />
    </>
  );
}
```

## Important Notes

### Supported Formats

- MP3, WAV, OGG, AAC, and other formats supported by the browser's `<audio>` element
- Format support varies by browser

### Loading Audio

- Use `setSrc()` for URLs (local or remote)
- Use `loadFile()` for File objects from `<input type="file">`
- Audio must be loaded before playback can start

### CORS Considerations

- Remote audio files must have appropriate CORS headers
- The `crossOrigin="anonymous"` attribute is set automatically

::: tip User Gesture Required
Some browsers require a user gesture (like a button click) before audio can play. Make sure playback is triggered by user interaction.
:::

## Related

- [StreamingAudioDeck](/api/sources/streaming-audio-deck) - For streaming audio (internet radio, live streams)
- [Monitor](/api/output/monitor) - Output to speakers
- [Filter](/api/processors/filter) - Process the audio
