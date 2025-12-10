# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the MOD documentation.

## Overview

Documentation site built with VitePress, deployed to GitHub Pages at `mode7labs.github.io/mod/`.

**Nested CLAUDE.md files** for detailed guidance:

- [api/CLAUDE.md](api/CLAUDE.md) - API reference doc templates, writing guidelines
- [guide/CLAUDE.md](guide/CLAUDE.md) - User guide structure, learning path, example patterns

## Commands

```bash
# From repository root
npm run docs:dev      # Start dev server (hot reload)
npm run docs:build    # Build for production
npm run docs:preview  # Preview built site

# Playground is embedded at /playground/ via public/ directory
```

## Directory Structure

```
docs/
├── .vitepress/
│   ├── config.mjs     # VitePress config (nav, sidebar, theme)
│   ├── theme/         # Custom theme overrides
│   └── dist/          # Built output
├── guide/             # User guides and tutorials
│   ├── getting-started.md
│   ├── architecture.md
│   ├── cv-modulation.md
│   └── examples/      # Code examples
├── api/               # Component API reference
│   ├── overview.md
│   ├── sources/       # ToneGenerator, Microphone, etc.
│   ├── processors/    # Filter, Delay, Reverb, etc.
│   ├── cv/            # LFO, ADSR, Sequencer, Clock
│   ├── mixers/        # Mixer, CrossFade
│   ├── output/        # Monitor
│   ├── visualizations/
│   ├── hooks/
│   └── ui/            # ModUI components
│       ├── controls/  # Slider, Knob, XYPad, etc.
│       └── visualizations/
├── public/            # Static assets
│   ├── logo.png
│   └── playground/    # Embedded playground app
├── index.md           # Homepage (VitePress home layout)
└── llm-guide.md       # AI assistant reference
```

## Key Configuration

### VitePress Config ([.vitepress/config.mjs](.vitepress/config.mjs))

- **base**: `/mod/` (GitHub Pages path)
- **nav**: Guide, API, UI, Playground links
- **sidebar**: Separate configs for `/guide/`, `/api/`, `/api/ui/`

### Frontmatter Patterns

```yaml
# Homepage (index.md)
---
layout: home
hero:
  name: MOD
  actions: [...]
features: [...]
---

# Regular pages
---
layout: doc
title: Page Title
---
```

## Documentation Conventions

See nested CLAUDE.md files for detailed templates and guidelines:

- **API docs**: [api/CLAUDE.md](api/CLAUDE.md) - Props tables, render props, usage examples
- **User guides**: [guide/CLAUDE.md](guide/CLAUDE.md) - Progressive learning, code examples

## Special Files

### [llm-guide.md](llm-guide.md)

Comprehensive AI assistant reference containing:
- Component quick reference tables
- 10+ common patterns with code
- Signal flow rules
- Troubleshooting guide
- Full synthesizer example

**Update this file when adding new components.**

### [index.md](index.md)

Homepage using VitePress home layout with:
- Hero section
- Feature grid
- Quick code examples
- Component overview

## Playground Integration

The playground app (built from `packages/demo/`) is copied to `public/playground/` and served at `/playground/`. It runs independently of VitePress.

```bash
# Build playground separately
npm run playground:build
```

## Adding New Documentation

| Type | Steps |
|------|-------|
| **API page** | 1. Create `api/{category}/{component}.md` (see [api/CLAUDE.md](api/CLAUDE.md) for template) 2. Add to sidebar in `.vitepress/config.mjs` 3. Update `llm-guide.md` |
| **Guide** | 1. Create `guide/{topic}.md` (see [guide/CLAUDE.md](guide/CLAUDE.md) for template) 2. Add to sidebar 3. Update "Next Steps" links |

## Links

- Live docs: https://mode7labs.github.io/mod/
- Playground: https://mode7labs.github.io/mod/playground/
- Source components: `../packages/core/src/components/`
