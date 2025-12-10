# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MOD is a React library for building modular audio applications using the Web Audio API. Components represent audio modules that connect together like a hardware modular synthesizer, with refs acting as "patch cables" between modules.

**Nested CLAUDE.md files** provide deeper context:

- [packages/core/CLAUDE.md](packages/core/CLAUDE.md) - Component implementation patterns, testing
- [packages/demo/CLAUDE.md](packages/demo/CLAUDE.md) - Playground architecture, adding modules
- [docs/CLAUDE.md](docs/CLAUDE.md) - VitePress config, site structure
  - [docs/api/CLAUDE.md](docs/api/CLAUDE.md) - API reference templates, writing guidelines
  - [docs/guide/CLAUDE.md](docs/guide/CLAUDE.md) - User guide structure, learning path

## Commands

```bash
# Development
npm install              # Install all workspace dependencies
npm run dev              # Start demo playground (Vite dev server)

# Building
npm run build            # Build core library only
npm run build:all        # Build all packages

# Testing (run from packages/core)
npm run test             # Run tests (silent)
npm run test:verbose     # Run tests with output
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Run single test
npm test -- --testPathPattern="Filter"

# Documentation
npm run docs:dev         # Start VitePress dev server
npm run docs:build       # Build documentation
```

## Architecture

### Package Structure

- `packages/core/` - Main library (`@mode-7/mod`)
- `packages/demo/` - Playground application
- `docs/` - VitePress documentation

### Core Library Structure (`packages/core/src/`)

```
src/
├── components/
│   ├── sources/        # 6: ToneGenerator, NoiseGenerator, Microphone, MP3Deck, StreamingAudioDeck, Sampler
│   ├── processors/     # 17: Filter, Delay, Reverb, Compressor, Distortion, EQ, VCA, etc.
│   ├── cv/             # 4: LFO, ADSR, Sequencer, Clock
│   ├── mixers/         # 2: Mixer (4-ch), CrossFade
│   ├── output/         # 1: Monitor
│   └── visualizations/ # 3: Oscilloscope, SpectrumAnalyzer, LevelMeter
├── context/
│   └── AudioContext.tsx  # AudioProvider context wrapper
├── hooks/
│   ├── useModStream.ts              # Creates reactive refs for signal routing
│   ├── useControlledState.ts        # Controlled/uncontrolled state pattern
│   └── useModStreamToMediaStream.ts # Convert ModStream to MediaStream (for WebRTC, etc.)
├── modui/              # 11 UI components: Slider, Knob, XYPad, Button, Select, etc.
└── types/
    └── ModStream.ts    # Core ModStream and ModStreamRef types
```

### Signal Flow Pattern

All audio flows through `ModStreamRef` connections:

```tsx
const stream = useModStream();  // Creates connection point

<Source output={stream} />      // Outputs to stream
<Processor input={stream} output={nextStream} />
<Monitor input={finalStream} />  // Required for audio output
```

### Core Type: ModStream

```typescript
interface ModStream {
  audioNode: AudioNode;
  gain: GainNode;
  context: AudioContext;
  metadata: { label?: string; sourceType?: string };
}
type ModStreamRef = MutableRefObject<ModStream | null>;
```

## Component Patterns

All audio components follow three usage patterns:

### 1. Render Props (Primary Pattern)
```tsx
<Filter input={in} output={out}>
  {({ frequency, setFrequency, Q, setQ }) => (
    <Slider value={frequency} onChange={setFrequency} />
  )}
</Filter>
```

### 2. Controlled Props
```tsx
<Filter
  input={in}
  output={out}
  frequency={freq}
  onFrequencyChange={setFreq}
/>
```

### 3. Imperative Refs
```tsx
const filterRef = useRef<FilterHandle>(null);
filterRef.current?.getState();
```

### Standard Component Structure

Every processor component follows this pattern (see `Filter.tsx` as reference):

1. **Props Interface**: `ComponentProps` with `input`, `output`, controlled props, callbacks, CV inputs
2. **Handle Interface**: `ComponentHandle` with `getState()` method
3. **RenderProps Interface**: State values and setters for render props pattern
4. **useControlledState**: Handles both controlled and uncontrolled modes
5. **Web Audio Node Management**: Created in `useEffect`, cleaned up on unmount
6. **CV Modulation**: Optional `cv` prop with `cvAmount` for parameter modulation
7. **Enabled/Bypass**: `enabled` prop with bypass routing when disabled

### CV Modulation

Connect CV generators (LFO, ADSR, Sequencer) to modulate processor parameters:

```tsx
<LFO output={lfo} frequency={5} />
<Filter input={audio} output={out} cv={lfo} cvAmount={5000} />
```

## Testing

Tests use Jest with React Testing Library. Web Audio API is mocked in `setup.ts`.

### Test Utilities (`__tests__/test-utils.tsx`)

- `render()` - Wraps components in AudioProvider
- `createMockStreamRef()` - Creates mock ModStreamRef

### Test Structure

Each component test covers:
- Render props pattern
- Controlled props pattern
- Imperative refs pattern
- Audio context integration
- Edge cases and cleanup

## Common Development Tasks

| Task | Steps |
|------|-------|
| **Add new processor** | 1. Create `packages/core/src/components/processors/Name.tsx` (copy Filter.tsx pattern) 2. Export from `index.ts` 3. Add test in `__tests__/Name.test.tsx` 4. Add to `packages/demo/src/moduleDefinitions.ts` 5. Add render case in `ModuleRenderer.tsx` 6. Create docs at `docs/api/processors/name.md` |
| **Add CV support** | Add `cv?: ModStreamRef` and `cvAmount?: number` props, create GainNode to scale CV, connect to AudioParam |
| **Debug audio routing** | Check: 1. AudioProvider wraps components 2. Monitor component exists 3. All refs passed correctly 4. Browser audio context not suspended |
| **Run specific test** | `npm test -- --testPathPattern="ComponentName"` |

## Key Files

- [packages/core/src/index.ts](packages/core/src/index.ts) - All public exports
- [packages/core/src/types/ModStream.ts](packages/core/src/types/ModStream.ts) - Core types
- [packages/core/src/components/processors/Filter.tsx](packages/core/src/components/processors/Filter.tsx) - Reference component implementation
- [packages/demo/src/moduleDefinitions.ts](packages/demo/src/moduleDefinitions.ts) - Module registry for playground
- [docs/llm-guide.md](docs/llm-guide.md) - Complete API reference for AI assistants
