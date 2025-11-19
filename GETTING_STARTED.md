# Getting Started with Mod Audio

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Core Library

```bash
npm run build --workspace=packages/core
```

### 3. Run the Demo

```bash
npm run dev --workspace=packages/demo
```

The demo will be available at http://localhost:5173 (or the next available port).

## Project Structure

```
mod/
├── packages/
│   ├── core/                    # Core library (@mod-audio/core)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── sources/     # Source components (ToneGenerator, Microphone, etc.)
│   │   │   │   ├── processors/  # Effect processors (Delay, Reverb)
│   │   │   │   ├── mixers/      # Mixing components (CrossFade, Mixer)
│   │   │   │   └── output/      # Output component (Monitor)
│   │   │   ├── context/         # React Context for AudioContext
│   │   │   ├── hooks/           # useModStream hook
│   │   │   ├── types/           # TypeScript types
│   │   │   └── index.ts         # Main export
│   │   ├── dist/                # Built library (generated)
│   │   └── package.json
│   │
│   └── demo/                    # Demo application
│       ├── src/
│       │   ├── App.tsx          # Demo page with examples
│       │   ├── App.css          # Styles
│       │   └── main.tsx         # Entry point
│       └── package.json
│
├── package.json                 # Root workspace config
└── README.md                    # Main documentation
```

## Development Workflow

### Building the Core Library

```bash
# Build once
npm run build --workspace=packages/core

# Watch mode (rebuild on changes)
npm run dev --workspace=packages/core
```

### Running the Demo

```bash
npm run dev --workspace=packages/demo
```

### Build Everything

```bash
npm run build:all
```

## Publishing to npm

### 1. Update Version

Edit `packages/core/package.json` and bump the version:

```json
{
  "version": "0.2.0"
}
```

### 2. Build

```bash
npm run build --workspace=packages/core
```

### 3. Publish

```bash
cd packages/core
npm publish --access public
```

## Adding to Your Project

Once published, install in any React project:

```bash
npm install @mod-audio/core
```

Then use in your app:

```tsx
import {
  AudioProvider,
  useModStream,
  ToneGenerator,
  Monitor
} from '@mod-audio/core';

function MyAudioApp() {
  const tone = useModStream();

  return (
    <AudioProvider>
      <ToneGenerator output={tone} frequency={440} />
      <Monitor input={tone} />
    </AudioProvider>
  );
}
```

## Available Components

### Sources (No Input → Output)
- `ToneGenerator` - Square wave oscillator
- `Microphone` - Live microphone input
- `MP3Deck` - Audio file playback
- `StreamingAudioDeck` - Streaming audio

### Processors (Input → Output)
- `Delay` - Echo/delay effect
- `Reverb` - Reverb/room effect

### Mixers (Multiple Inputs → Output)
- `CrossFade` - Blend two inputs
- `Mixer` - Combine multiple inputs

### Output (Input → Speakers)
- `Monitor` - Audio output

## Examples in Demo

The demo app showcases:
1. Simple tone generator
2. Tone with delay effect
3. Tone with reverb effect
4. CrossFade between two tones
5. Multi-input mixer (3 tones in a chord)
6. Microphone with reverb

## Browser Requirements

- Chrome/Edge 35+
- Firefox 25+
- Safari 14.1+

## Troubleshooting

### Demo won't start
Make sure you've built the core library first:
```bash
npm run build --workspace=packages/core
```

### TypeScript errors
Make sure all dependencies are installed:
```bash
npm install
```

### No audio output
- Check browser permissions for microphone (if using Microphone component)
- Make sure your volume is up
- Open browser console to check for errors
- Some browsers require user interaction before playing audio

## Next Steps

1. Explore the demo app for usage examples
2. Read the [Core Library README](./packages/core/README.md) for API docs
3. Check out the [Main README](./README.md) for architecture overview
4. Start building your own audio components!
