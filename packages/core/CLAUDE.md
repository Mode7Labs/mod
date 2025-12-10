# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the MOD core library.

## Overview

The `@mode-7/mod` package is the main library containing all audio components, hooks, and UI controls. Zero external runtime dependencies—only React 18+ as peer dependency.

## Commands

```bash
# Build (uses tsup)
npm run build              # Build CJS + ESM + types

# Testing
npm run test               # Run tests (silent)
npm run test:verbose       # Run with output
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Run single test file
npm test -- --testPathPattern="Filter"

# Run specific test
npm test -- --testNamePattern="should render with default values"
```

## Directory Structure

```
src/
├── index.ts              # All public exports
├── types/
│   └── ModStream.ts      # Core types (ModStream, ModStreamRef)
├── context/
│   └── AudioContext.tsx  # AudioProvider wrapper
├── hooks/
│   ├── useModStream.ts           # Reactive ref for signal routing
│   ├── useControlledState.ts     # Controlled/uncontrolled pattern
│   └── useModStreamToMediaStream.ts
├── components/
│   ├── sources/          # Audio generators
│   │   ├── ToneGenerator.tsx
│   │   ├── NoiseGenerator.tsx
│   │   ├── Microphone.tsx
│   │   ├── MP3Deck.tsx
│   │   ├── StreamingAudioDeck.tsx
│   │   └── Sampler.tsx
│   ├── cv/               # Control voltage generators
│   │   ├── LFO.tsx
│   │   ├── ADSR.tsx
│   │   ├── Sequencer.tsx
│   │   └── Clock.tsx
│   ├── processors/       # Audio effects (17 components)
│   │   ├── Filter.tsx    # Reference implementation
│   │   ├── Delay.tsx
│   │   ├── Reverb.tsx
│   │   └── ...
│   ├── mixers/
│   │   ├── Mixer.tsx
│   │   └── CrossFade.tsx
│   ├── output/
│   │   └── Monitor.tsx
│   └── visualizations/
│       ├── Oscilloscope.tsx
│       ├── SpectrumAnalyzer.tsx
│       └── LevelMeter.tsx
├── modui/                # Pre-built UI components
│   ├── Slider.tsx + .css
│   ├── Knob.tsx + .css
│   ├── XYPad.tsx + .css
│   └── ...
└── __tests__/
    ├── setup.ts          # Web Audio API mocks
    ├── test-utils.tsx    # render(), createMockStreamRef()
    └── *.test.tsx        # Component tests
```

## Core Architecture

### ModStream Type

```typescript
interface ModStream {
  audioNode: AudioNode;      // The Web Audio node
  gain: GainNode;            // Output gain control
  context: AudioContext;     // Audio context reference
  metadata: {
    label?: string;
    sourceType?: 'microphone' | 'mp3' | 'stream' | 'tone' | 'processor' | 'mixer' | 'cv';
  };
}

type ModStreamRef = MutableRefObject<ModStream | null>;
```

### useModStream Hook

Creates reactive refs that trigger re-renders when connections change:

```typescript
const stream = useModStream('label');  // Optional label for debugging
```

### useControlledState Hook

Enables both controlled and uncontrolled component patterns:

```typescript
const [value, setValue] = useControlledState(
  controlledValue,  // From props (undefined = uncontrolled)
  defaultValue,     // Initial value
  onChange          // Optional callback
);
```

## Component Implementation Pattern

All audio components follow this structure (use [Filter.tsx](src/components/processors/Filter.tsx) as reference):

### 1. Type Definitions

```typescript
// Imperative handle for refs
export interface FilterHandle {
  getState: () => { frequency: number; Q: number; /* ... */ };
}

// Render props interface
export interface FilterRenderProps {
  frequency: number;
  setFrequency: (value: number) => void;
  // ... all controllable parameters
  isActive: boolean;
}

// Component props
export interface FilterProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  // Controlled props pattern
  frequency?: number;
  onFrequencyChange?: (frequency: number) => void;
  // CV modulation
  cv?: ModStreamRef;
  cvAmount?: number;
  // Bypass
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  // Render props
  children?: (props: FilterRenderProps) => ReactNode;
}
```

### 2. Component Body

```typescript
export const Filter = React.forwardRef<FilterHandle, FilterProps>((props, ref) => {
  const audioContext = useAudioContext();

  // Controlled/uncontrolled state
  const [frequency, setFrequency] = useControlledState(
    props.frequency, 1000, props.onFrequencyChange
  );

  // Web Audio node refs
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Create nodes on mount
  useEffect(() => {
    if (!audioContext) return;
    const node = audioContext.createBiquadFilter();
    // ... setup
    output.current = { audioNode: node, gain, context, metadata };
    return () => { /* cleanup */ };
  }, [audioContext]);

  // Handle input connections
  useEffect(() => { /* connect input.current.gain to filterNode */ }, [inputKey]);

  // Handle CV modulation
  useEffect(() => { /* connect cv to parameter */ }, [cv, cvAmount]);

  // Update parameters
  useEffect(() => { filterNodeRef.current.frequency.value = frequency; }, [frequency]);

  // Imperative handle
  useImperativeHandle(ref, () => ({ getState: () => ({ frequency, /* ... */ }) }));

  // Render
  return children ? <>{children({ frequency, setFrequency, /* ... */ })}</> : null;
});
```

### 3. Key Patterns

- **Input tracking**: Use `input.current?.audioNode ? String(input.current.audioNode) : 'null'` as effect dependency
- **Bypass routing**: When `enabled=false`, connect input directly to output gain, skipping the effect node
- **CV modulation**: Create a GainNode to scale CV signal, connect to AudioParam
- **Cleanup**: Disconnect all nodes in useEffect cleanup

## Testing

### Test Utilities

```typescript
import { render, createMockStreamRef } from './test-utils';

const input = createMockStreamRef();
const output = createMockStreamRef();

const { getByText } = render(
  <Filter input={input} output={output}>
    {({ frequency }) => <span>Freq: {frequency}</span>}
  </Filter>
);
```

### Test Structure

Each component test covers:
1. **Render Props Pattern** - Default values, parameter changes
2. **Controlled Props Pattern** - External state, callbacks
3. **Imperative Refs Pattern** - getState() method
4. **Audio Context Integration** - Output structure, metadata, cleanup
5. **Edge Cases** - Extreme values, multiple simultaneous changes
6. **Enabled/Bypass** - Toggle functionality

### Web Audio Mocks

[setup.ts](src/__tests__/setup.ts) provides mocks for:
- `AudioContext` and all create* methods
- `MediaStream` and `MediaDevices`
- Node connect/disconnect tracking

## Adding a New Component

1. **Create component** in appropriate `src/components/{category}/`
2. **Follow the pattern** from Filter.tsx
3. **Export from index.ts**:
   ```typescript
   export { NewComponent } from './components/category/NewComponent';
   export type { NewComponentProps, NewComponentRenderProps, NewComponentHandle } from './components/category/NewComponent';
   ```
4. **Add tests** in `src/__tests__/NewComponent.test.tsx`
5. **Update docs** in `docs/api/category/new-component.md`
6. **Update llm-guide.md** with component details

## Build Output

tsup generates:
- `dist/index.js` - CommonJS
- `dist/index.mjs` - ES Modules
- `dist/index.d.ts` - TypeScript declarations

## Related

- [packages/demo/CLAUDE.md](../demo/CLAUDE.md) - Playground integration (adding modules to visual editor)
- [docs/api/CLAUDE.md](../../docs/api/CLAUDE.md) - API doc templates (when documenting components)
