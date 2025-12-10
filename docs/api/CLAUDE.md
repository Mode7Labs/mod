# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the MOD API reference documentation.

## Overview

API reference documentation for all MOD components. Each component has its own markdown file documenting props, render props, usage patterns, and examples.

## Directory Structure

```
api/
├── overview.md           # API landing page
├── audio-provider.md     # AudioProvider context
├── sources/              # 6 audio source components
│   ├── tone-generator.md
│   ├── noise-generator.md
│   ├── microphone.md
│   ├── mp3-deck.md
│   ├── streaming-audio-deck.md
│   └── sampler.md
├── cv/                   # 4 control voltage generators
│   ├── lfo.md
│   ├── adsr.md
│   ├── sequencer.md
│   └── clock.md
├── processors/           # 17 audio processors
│   ├── filter.md         # Reference doc (most complete)
│   ├── delay.md
│   ├── reverb.md
│   └── ... (14 more)
├── mixers/               # 2 mixer components
│   ├── mixer.md
│   └── crossfade.md
├── output/
│   └── monitor.md        # Audio output
├── visualizations/       # 3 visualization components
│   ├── oscilloscope.md
│   ├── spectrum-analyzer.md
│   └── level-meter.md
├── hooks/                # 2 hooks
│   ├── use-mod-stream.md
│   └── use-mod-stream-to-media-stream.md
└── ui/                   # ModUI components
    ├── overview.md
    ├── controls/         # Slider, Knob, XYPad, Button, Select, etc.
    └── visualizations/   # Canvas renderers
```

## Documentation Template

All component docs follow this structure:

### 1. Title and Description

```markdown
# ComponentName

Brief description of what the component does and its primary use case.
```

### 2. Props Table

```markdown
## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio input |
| `output` | `ModStreamRef` | Required | Audio output |
| `param` | `number` | `defaultValue` | Description |
| `onParamChange` | `(value: number) => void` | - | Callback |
| `cv` | `ModStreamRef` | - | CV input for modulation |
| `cvAmount` | `number` | `value` | CV modulation amount |
| `enabled` | `boolean` | `true` | Bypass toggle |
| `children` | `function` | - | Render prop function |
```

### 3. Render Props Table

```markdown
## Render Props

| Property | Type | Description |
|----------|------|-------------|
| `param` | `number` | Current value |
| `setParam` | `(value: number) => void` | Setter |
| `isActive` | `boolean` | Whether active |
```

### 4. Usage Examples

Required sections:

```markdown
## Usage

### Basic Usage
<!-- Minimal props example -->

### With UI Controls
<!-- Render props pattern example -->

### With LFO/CV Modulation
<!-- CV modulation example (if applicable) -->

### Controlled Props
<!-- External state management example -->

### Imperative Refs
<!-- getState() access example -->
```

### 5. Important Notes

```markdown
## Important Notes

- Parameter ranges and recommendations
- Behavior edge cases
- Performance considerations
```

### 6. Related Components

```markdown
## Related

- [Component](/api/category/component) - Brief description
```

## File Naming Conventions

- Lowercase with hyphens: `tone-generator.md`, `spectrum-analyzer.md`
- Match component name but kebab-case: `ToneGenerator` → `tone-generator.md`

## Writing Guidelines

1. **Props tables must include**:
   - All controllable parameters with controlled/uncontrolled pattern props
   - CV inputs if supported (`cv`, `cvAmount`)
   - `enabled`/`onEnabledChange` for processors
   - `children` render prop

2. **Code examples must**:
   - Import from `@mode-7/mod`
   - Use `useRef(null)` for stream refs
   - Show complete, runnable code
   - Include `Monitor` component when audio output is expected

3. **Render props examples should show**:
   - Full destructuring of available controls
   - Working UI with HTML inputs or ModUI components

4. **CV modulation examples should explain**:
   - What parameter is being modulated
   - Effect of `cvAmount` value
   - Calculation: `baseValue + (cvSignal × cvAmount)`

## Adding New API Documentation

1. Create file: `api/{category}/{component-name}.md`
2. Follow template structure above
3. Add to sidebar in `docs/.vitepress/config.mjs`:
   ```javascript
   {
     text: 'Category',
     items: [
       { text: 'ComponentName', link: '/api/category/component-name' },
     ]
   }
   ```
4. Update [docs/llm-guide.md](../llm-guide.md) with component summary
5. Cross-link from related components' "Related" sections

## Reference Documentation

- [filter.md](processors/filter.md) - Most complete processor doc (use as template)
- [tone-generator.md](sources/tone-generator.md) - Complete source doc
- [lfo.md](cv/lfo.md) - CV generator doc pattern

## Common Patterns to Document

### Three Usage Patterns

Every component doc should show:
1. **Basic** - Just props, no children
2. **Render props** - Using `children` function
3. **Controlled** - External state with `value`/`onChange` props
4. **Imperative** - Using `ref` and `getState()`

### CV Modulation

For CV-capable components, show:
```tsx
<LFO output={lfo} frequency={2} />
<Component
  input={audio}
  output={out}
  param={baseValue}
  cv={lfo}
  cvAmount={modulationRange}
/>
```

### Bypass/Enable

For processors with `enabled` prop:
```tsx
<Processor
  input={in}
  output={out}
  enabled={isEnabled}
  onEnabledChange={setIsEnabled}
/>
```
