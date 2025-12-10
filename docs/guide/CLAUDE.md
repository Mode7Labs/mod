# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the MOD user guide documentation.

## Overview

Progressive learning guides teaching MOD concepts from basics to advanced patterns. Designed to be read in order, building knowledge incrementally.

## Directory Structure

```
guide/
├── what-is-mod.md         # Introduction and overview
├── installation.md        # npm install, setup
├── getting-started.md     # First audio chain
├── architecture.md        # Core concepts, ModStream, signal flow
├── audio-context.md       # AudioProvider deep dive
├── connecting-modules.md  # Refs as patch cables
├── sources.md             # Audio generators overview
├── cv-generators.md       # LFO, ADSR, Sequencer, Clock
├── cv-modulation.md       # Using CV to modulate parameters
├── processors.md          # Effects overview
├── mixers.md              # Combining signals
├── output.md              # Monitor and audio output
└── examples/              # Complete working examples
    ├── simple-synth.md    # Full synthesizer
    ├── simple-sampler.md  # Drum machine and sampler
    ├── lfo-modulation.md  # Vibrato and tremolo
    └── rhythmic-patterns.md # Sequencer-based patterns
```

## Learning Path

The guides follow a progressive structure:

### 1. Introduction (what-is-mod → installation → getting-started)

- What MOD is and why it exists
- Installation and project setup
- First working audio example

### 2. Core Concepts (architecture → audio-context → connecting-modules)

- Three-layer architecture (React → MOD → Web Audio)
- AudioProvider and context lifecycle
- ModStreamRef and signal routing

### 3. Module Types (sources → cv-generators → processors → mixers → output)

- Each module category explained
- Available components in each category
- Common props and patterns

### 4. Advanced Patterns (cv-modulation)

- CV signal concepts
- Modulation targets and amounts
- Common modulation patterns (vibrato, tremolo, filter sweep)

### 5. Examples (examples/)

- Complete, runnable applications
- Combines concepts from all previous guides

## Guide Structure Template

Each guide follows this structure:

```markdown
# Title

Brief introduction explaining what this guide covers.

## Core Concept

Main conceptual explanation with diagrams if helpful.

## Basic Example

```tsx
// Minimal working code
```

## Detailed Breakdown

Step-by-step explanation of the example.

## Common Patterns

Multiple use cases and variations.

## Best Practices

Tips and recommendations.

## Next Steps

Links to related guides.
```

## Writing Guidelines

### Tone and Style

- **Progressive disclosure**: Start simple, add complexity
- **Practical first**: Lead with working code, explain after
- **Visual aids**: Use ASCII diagrams for signal flow
- **Conversational**: "We'll build..." not "The user will..."

### Code Examples

1. **Always runnable**: Examples should work when copied
2. **Include imports**: Show all necessary imports
3. **Use useModStream**: Prefer the hook over raw `useRef(null)`
4. **Show signal flow**: Comment the audio path
5. **End with Monitor**: Examples producing audio need output

### Signal Flow Diagrams

Use ASCII art for clarity:

```
Source ──→ Processor ──→ Monitor ──→ Speakers
              ↑
           CV (LFO)
```

### Cross-Linking

- Link to API docs for component details: `[Filter](/api/processors/filter)`
- Link to related guides: `[CV Modulation](/guide/cv-modulation)`
- Link to examples: `[Simple Synth example](/guide/examples/simple-synth)`

## Example Documentation Pattern

Examples in `examples/` follow this structure:

```markdown
# Example Title

Brief description of what we're building.

## What We'll Build

Bullet list of features.

## Complete Code

Full working example (copy-paste ready).

## How It Works

### Signal Flow

ASCII diagram of audio routing.

### Section Explanations

Break down each part of the code.

## Next Steps

Links to extend the example.
```

## Adding New Guides

### New Concept Guide

1. Create `guide/{topic}.md`
2. Follow the guide structure template
3. Add to sidebar in `docs/.vitepress/config.mjs`:
   ```javascript
   {
     text: 'Guide',
     items: [
       // ... existing items
       { text: 'New Topic', link: '/guide/new-topic' },
     ]
   }
   ```
4. Add "Next Steps" links from related guides
5. Update previous guide's "Next Steps" to include new guide

### New Example

1. Create `guide/examples/{example-name}.md`
2. Follow example documentation pattern
3. Add to sidebar under Examples section
4. Link from relevant concept guides

## Key Concepts to Maintain

When writing or editing guides, ensure these concepts are consistent:

### ModStreamRef

```typescript
type ModStreamRef = React.RefObject<ModStream | null>;
```

Created via `useModStream()` hook, acts as "patch cable" between modules.

### Three Usage Patterns

1. **Render props**: `<Component>{(controls) => ...}</Component>`
2. **Controlled props**: `value={x} onChange={setX}`
3. **Imperative refs**: `ref.current?.getState()`

### CV Modulation Formula

```
finalValue = baseValue + (cvSignal × cvAmount)
```

### Signal Chain Requirement

```
Source → [Processors] → Monitor
```

Audio only plays when connected to Monitor component.

## Related Files

- [../llm-guide.md](../llm-guide.md) - AI reference (keep in sync)
- [../api/](../api/) - Detailed API reference
- [../../packages/core/CLAUDE.md](../../packages/core/CLAUDE.md) - Implementation details
