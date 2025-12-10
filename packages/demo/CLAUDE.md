# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the MOD playground demo application.

## Overview

Interactive visual playground for the MOD library. Users drag modules onto a canvas, connect them with patch cables, and build audio processing chains visually—like a virtual modular synthesizer rack.

Deployed to GitHub Pages at `mode7labs.github.io/mod/playground/`.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Build to docs/public/playground/
npm run preview   # Preview built app
```

## Build Configuration

Vite config ([vite.config.ts](vite.config.ts)):
- **base**: `/mod/playground/` (GitHub Pages subpath)
- **outDir**: `../../docs/public/playground` (embeds in docs site)

## Directory Structure

```
src/
├── main.tsx              # React entry point
├── App.tsx               # Main application (ModularSynth)
├── App.css               # Global styles
├── index.css             # Base CSS
├── types.ts              # ModuleDefinition type
├── moduleDefinitions.ts  # All module configs
└── components/
    ├── ModuleWrapper.tsx     # Draggable module container
    ├── ModuleWrapper.css     # Module styling
    └── ModuleRenderer.tsx    # Renders MOD components with ModUI
```

## Architecture

### App.tsx - Main Application

The `ModularSynth` component manages:

1. **State**:
   - `modules: ModuleData[]` - Active modules on canvas
   - `connections: Connection[]` - Patch cable connections
   - `draggingConnection` - In-progress cable drag
   - `streamRefs: Map<string, RefObject>` - Audio stream refs per port

2. **Module Management**:
   - `addModule(type, position)` - Creates module with ports based on definition
   - `moveModule(id, position)` - Updates module position
   - `deleteModule(id)` - Removes module and its connections
   - `toggleModuleEnabled(id)` - Bypass toggle for processors

3. **Connection Management**:
   - `handlePortMouseDown` - Start cable drag from output port
   - `handleCanvasMouseUp` - Complete connection to input port
   - `handleWireClick` - Delete connection
   - `getStreamRef(portId)` - Get/create stream ref for a port

4. **Rendering**:
   - SVG layer for bezier curve patch cables
   - Module grid with sidebar palette
   - Drag-and-drop from sidebar to canvas

### moduleDefinitions.ts

Registry of all available modules:

```typescript
interface ModuleDefinition {
  type: string;           // Component name (e.g., 'ToneGenerator')
  label: string;          // Display name
  category: 'source' | 'cv' | 'processor' | 'mixer' | 'output' | 'visualization';
  color: string;          // Hex color for module header
  inputs: number;         // Number of audio input ports
  outputs: number;        // Number of audio output ports
  defaultParams: Record<string, any>;  // Initial parameter values
}
```

### ModuleWrapper.tsx

Draggable container for each module:
- Header with module name, delete button, bypass toggle
- Input ports on left side
- Output ports on right side
- Content area for ModuleRenderer

### ModuleRenderer.tsx

Large switch statement that renders the appropriate MOD component for each module type:
- Maps `inputStreams`, `outputStreams`, `cvInputStreams` to component props
- Uses ModUI components (Slider, Knob, XYPad, Select, Button) for controls
- Handles special cases (CV ports, gate inputs, multiple outputs)

## Key Patterns

### Stream Ref Management

```typescript
const streamRefs = useRef<Map<string, any>>(new Map());

const getStreamRef = (portId: string) => {
  if (!streamRefs.current.has(portId)) {
    streamRefs.current.set(portId, { current: null });
  }
  return streamRefs.current.get(portId);
};
```

### Connection to Streams

For each module instance:
```typescript
// Audio inputs - find connected output ports
const inputStreams = inputPorts.map(port => {
  const connection = connections.find(c => c.to.portId === port.id);
  return connection ? getStreamRef(connection.from.portId) : null;
});

// CV inputs - similar but keyed by CV type
const cvInputStreams: { [key: string]: RefObject | null } = {};
cvPorts.forEach(port => {
  const connection = connections.find(c => c.to.portId === port.id);
  cvInputStreams[key] = connection ? getStreamRef(connection.from.portId) : null;
});

// Outputs - always create refs
const outputStreams = outputPorts.map(port => getStreamRef(port.id));
```

### Patch Cable Rendering

SVG bezier curves between port positions:
```typescript
const midX = (fromPos.x + toPos.x) / 2;
const path = `M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${toPos.y}, ${toPos.x} ${toPos.y}`;
```

## Adding a New Module

1. **Add definition** to `moduleDefinitions.ts`:
   ```typescript
   NewModule: {
     type: 'NewModule',
     label: 'New Module',
     category: 'processor',
     color: '#hex',
     inputs: 1,
     outputs: 1,
     defaultParams: { param: defaultValue },
   },
   ```

2. **Add render case** to `ModuleRenderer.tsx`:
   ```tsx
   case 'NewModule':
     return output ? (
       <NewModule input={input || { current: null }} output={output} enabled={enabled}>
         {(controls) => (
           <div>
             <ModUISlider
               label="Param"
               value={controls.param}
               onChange={controls.setParam}
               min={0} max={100} step={1}
             />
           </div>
         )}
       </NewModule>
     ) : null;
   ```

3. **Add sidebar button** in `App.tsx` (already automatic if using `renderModuleButton`)

4. **Handle CV ports** if needed in `addModule()`:
   ```typescript
   } else if (type === 'NewModule') {
     ports.push({ id: `${id}-cv-param`, type: 'input', label: 'CV' });
   }
   ```

## Dependencies

- `@mode-7/mod` - Core library (workspace link)
- `lucide-react` - Icons for buttons
- `react`, `react-dom` - React 18
- `vite` - Build tool

## Related

- [packages/core/CLAUDE.md](../core/CLAUDE.md) - Component implementation patterns (for understanding MOD components)
- [docs/api/CLAUDE.md](../../docs/api/CLAUDE.md) - API doc templates (when documenting new modules)
