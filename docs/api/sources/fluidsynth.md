# Fluidsynth

`Fluidsynth` loads [js-synthesizer](https://www.npmjs.com/package/js-synthesizer) + FluidSynth to render MIDI streams with configurable SoundFonts. It exposes render props for configuring the WASM asset path, swapping SoundFonts, and emitting MIDI events when MIDI data arrives through the provided `midiInput` stream.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `output` | `ModStreamRef` | Required | The Web Audio node that receives the synth output |
| `midiInput` | `ModStreamRef` | — | Optional MIDI bus to listen for incoming MIDI events |
| `label` | `string` | `'fluidsynth'` | Label included in `ModStream` metadata |
| `wasmBaseUrl` | `string` | `''` | URL prefix for `js-synthesizer` + FluidSynth assets; used when `loadScript` locates the files |
| `onWasmBaseUrlChange` | `(url: string) => void` | — | Callback when the wasm base URL changes |
| `soundFontUrl` | `string` | `'/sf2/microgm.sf2'` | URL of the SoundFont file to load |
| `onSoundFontUrlChange` | `(url: string) => void` | — | Callback when the SoundFont URL changes |
| `soundFontFileName` | `string` | `''` | Optional name of a locally loaded SoundFont |
| `onSoundFontFileNameChange` | `(name: string) => void` | — | Callback when the SoundFont name is updated |
| `soundFontFileDataUrl` | `string` | `''` | Data URL of an embedded SoundFont |
| `onSoundFontFileDataUrlChange` | `(dataUrl: string) => void` | — | Callback when the embedded SoundFont data updates |
| `gain` | `number` | `1.0` | Gain applied to the synth output |
| `onGainChange` | `(value: number) => void` | — | Callback when the gain changes |
| `children` | `(props: FluidsynthRenderProps) => ReactNode` | — | Render-prop function that exposes controls like `setGain` and `loadSoundFontFile` |

## Render Props

| Property | Type | Description |
|----------|------|-------------|
| `wasmBaseUrl` | `string` | Current URL base used to load the `js-synthesizer`/FluidSynth scripts |
| `setWasmBaseUrl` | `(url: string) => void` | Update the wasm asset base path |
| `soundFontUrl` | `string` | Current SoundFont URL |
| `setSoundFontUrl` | `(url: string) => void` | Switch to a new SoundFont URL |
| `soundFontFileName` | `string` | Name of the locally loaded SoundFont file |
| `setSoundFontFileName` | `(name: string) => void` | Update the local SoundFont filename |
| `soundFontFileDataUrl` | `string` | Embedded SoundFont data URL |
| `setSoundFontFileDataUrl` | `(dataUrl: string) => void` | Update the embedded SoundFont payload |
| `loadSoundFontFile` | `(file: File) => void` | Convenience helper to load SoundFonts via a `File` object |
| `gain` | `number` | Current gain value |
| `setGain` | `(value: number) => void` | Adjust the synth gain |
| `isReady` | `boolean` | `true` once the SoundFont has finished loading |
| `isSoundFontLoaded` | `boolean` | `true` when SoundFont data is available |
| `isSoundFontLoading` | `boolean` | `true` while a SoundFont is fetching |
| `error` | `string \\| null` | Last loading error, if any |
| `allNotesOff` | `() => void` | Trigger `allNotesOff`/`allSoundsOff` on the synth |

## Usage

```tsx
import { Fluidsynth, MidiPlayer } from '@mode-7/mod';
import { useRef } from 'react';

function Example() {
  const synthOut = useRef<null>(null);
  const midiBus = useRef<null>(null);

  return (
    <Fluidsynth output={synthOut} midiInput={midiBus}>
      {({ loadSoundFontFile, isReady, isSoundFontLoaded }) => (
        <div>
          <input
            type="file"
            accept=".sf2"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) loadSoundFontFile(file);
            }}
          />
          <div>
            {isSoundFontLoaded ? 'Loaded' : isReady ? 'Ready' : 'Loading...'}
          </div>
        </div>
      )}
    </Fluidsynth>
  );
}
```
