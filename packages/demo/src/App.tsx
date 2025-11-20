import React, { useState, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import {
  AudioProvider,
  // Sources
  ToneGenerator,
  NoiseGenerator,
  Microphone,
  MP3Deck,
  StreamingAudioDeck,
  // CV
  LFO,
  ADSR,
  Sequencer,
  // Processors
  Filter,
  Delay,
  Reverb,
  Compressor,
  Distortion,
  Panner,
  EQ,
  Chorus,
  Phaser,
  Flanger,
  Tremolo,
  BitCrusher,
  Limiter,
  Gate,
  AutoWah,
  RingModulator,
  // Mixers
  CrossFade,
  Mixer,
  // Output
  Monitor,
  // Visualizations
  Oscilloscope,
  SpectrumAnalyzer,
  LevelMeter,
} from '@mode-7/mod';
import { ModuleWrapper } from './components/ModuleWrapper';
import { ModuleRenderer } from './components/ModuleRenderer';
import { MODULE_DEFINITIONS } from './moduleDefinitions';
import logo from '../assets/logo.png';
import './App.css';

interface Position {
  x: number;
  y: number;
}

interface Port {
  id: string;
  type: 'input' | 'output';
  label: string;
}

interface ModuleData {
  id: string;
  type: string;
  position: Position;
  ports: Port[];
  color: string;
}

interface Connection {
  id: string;
  from: { moduleId: string; portId: string };
  to: { moduleId: string; portId: string };
}

function ModularSynth() {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingConnection, setDraggingConnection] = useState<{
    from: { moduleId: string; portId: string };
    mousePos: Position;
  } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ moduleId: string; portId: string } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef<Position>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const portPositionCacheRef = useRef<Map<string, Position>>(new Map());

  // Create stream refs map
  const streamRefs = useRef<Map<string, any>>(new Map());

  const getStreamRef = (portId: string) => {
    if (!streamRefs.current.has(portId)) {
      streamRefs.current.set(portId, { current: null });
    }
    return streamRefs.current.get(portId);
  };

  const addModule = (type: string, position?: Position) => {
    const id = `module-${Date.now()}`;
    const ports: Port[] = [];
    const definition = MODULE_DEFINITIONS[type];

    // Create input ports based on definition
    for (let i = 0; i < definition.inputs; i++) {
      const portId = `${id}-in-${i}`;
      ports.push({
        id: portId,
        type: 'input',
        label: definition.inputs === 1 ? 'In' : `In ${i + 1}`,
      });
    }

    // Add CV input ports for modules that support CV modulation
    if (type === 'Filter') {
      ports.push({ id: `${id}-cv-freq`, type: 'input', label: 'CV' });
    } else if (type === 'ToneGenerator') {
      ports.push({ id: `${id}-cv-freq`, type: 'input', label: 'CV' });
    } else if (type === 'NoiseGenerator') {
      ports.push({ id: `${id}-cv-gain`, type: 'input', label: 'CV' });
    } else if (type === 'Panner') {
      ports.push({ id: `${id}-cv-pan`, type: 'input', label: 'CV' });
    } else if (type === 'ADSR') {
      ports.push({ id: `${id}-cv-gate`, type: 'input', label: 'Gate' });
    }

    // Create output ports based on definition
    for (let i = 0; i < definition.outputs; i++) {
      const portId = `${id}-out-${i}`;
      ports.push({
        id: portId,
        type: 'output',
        label: definition.outputs === 1 ? 'Out' : `Out ${i + 1}`,
      });
    }

    const newModule: ModuleData = {
      id,
      type,
      position: position || { x: 100 + modules.length * 20, y: 100 + modules.length * 20 },
      ports,
      color: definition.color,
    };
    setModules([...modules, newModule]);
  };

  const moveModule = (id: string, position: Position) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, position } : m));
    clearPortPositionCache();
  };

  const deleteModule = (id: string) => {
    setModules(prev => prev.filter(m => m.id !== id));
    // Also remove connections to/from this module
    setConnections(prev => prev.filter(c =>
      c.from.moduleId !== id && c.to.moduleId !== id
    ));
  };

  // Clear port position cache when modules move
  const clearPortPositionCache = () => {
    portPositionCacheRef.current.clear();
  };

  // Get position of a port element with caching
  const getPortPosition = (moduleId: string, portId: string): Position | null => {
    const cacheKey = `${moduleId}-${portId}`;

    // Check cache first
    if (portPositionCacheRef.current.has(cacheKey)) {
      return portPositionCacheRef.current.get(cacheKey)!;
    }

    // Find the port dot element directly
    const portDot = document.querySelector(
      `[data-module-id="${moduleId}"][data-port-id="${portId}"] .port-dot`
    ) as HTMLElement;

    if (!portDot || !canvasRef.current) return null;

    const dotRect = portDot.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const position = {
      x: dotRect.left + dotRect.width / 2 - canvasRect.left,
      y: dotRect.top + dotRect.height / 2 - canvasRect.top,
    };

    // Cache the result
    portPositionCacheRef.current.set(cacheKey, position);

    return position;
  };

  // Handle starting to drag a connection
  const handlePortMouseDown = (moduleId: string, portId: string, portType: 'input' | 'output', event: React.MouseEvent) => {
    event.stopPropagation();

    // Only allow dragging from output ports
    if (portType !== 'output') return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    setDraggingConnection({
      from: { moduleId, portId },
      mousePos: {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top,
      },
    });
  };

  // Handle mouse move while dragging - use RAF for smooth updates
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingConnection || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    };

    // Throttle state updates with requestAnimationFrame
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        setDraggingConnection({
          ...draggingConnection,
          mousePos: mousePosRef.current,
        });
        rafIdRef.current = null;
      });
    }
  };

  // Handle mouse up to complete connection
  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (!draggingConnection) return;

    // Cancel any pending RAF updates
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Use hoveredPort if available (more reliable than target detection)
    if (hoveredPort) {
      const module = modules.find(m => m.id === hoveredPort.moduleId);
      const port = module?.ports.find(p => p.id === hoveredPort.portId);

      // Check if it's an input port and not from the same module
      if (port?.type === 'input' && hoveredPort.moduleId !== draggingConnection.from.moduleId) {
        // Find and delete any existing connection to this input port first
        const existingConnection = connections.find(c => c.to.portId === hoveredPort.portId);
        if (existingConnection) {
          // Remove the old connection first (this will trigger cleanup in the components)
          // Use flushSync to force this update to complete before the next one
          flushSync(() => {
            setConnections(prev => prev.filter(c => c.id !== existingConnection.id));
          });
        }

        // Create the new connection
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: draggingConnection.from,
          to: { moduleId: hoveredPort.moduleId, portId: hoveredPort.portId },
        };

        // Add the new connection
        setConnections(prev => [...prev, newConnection]);
      }
    }

    setDraggingConnection(null);
    setHoveredPort(null);
  };

  // Handle clicking on a wire to delete it
  const handleWireClick = (connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find the connection being removed
    const connectionToRemove = connections.find(c => c.id === connectionId);

    // Remove the connection
    setConnections(prev => prev.filter(c => c.id !== connectionId));

    // Important: Don't clean up the stream ref here - other connections might use the same output port
    // The inputStreams mapping will handle returning null for disconnected inputs
  };

  // Check if a port is connected
  const isPortConnected = (portId: string): boolean => {
    return connections.some(c => c.from.portId === portId || c.to.portId === portId);
  };

  // Handle canvas drop for adding modules
  const handleCanvasDrop = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const moduleType = (e as any).dataTransfer?.getData('moduleType');
    if (moduleType && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      addModule(moduleType, { x, y });
    }
  };

  const handleCanvasDragOver = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if ((e as any).dataTransfer) {
      (e as any).dataTransfer.dropEffect = 'copy';
    }
  };

  // Helper to render a draggable module button
  const renderModuleButton = (type: string) => (
    <button
      key={type}
      onClick={() => addModule(type)}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('moduleType', type)}
      style={{ borderLeft: `4px solid ${MODULE_DEFINITIONS[type].color}`, cursor: 'grab' }}
    >
      {MODULE_DEFINITIONS[type].label}
    </button>
  );

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <a href="/mod/" className="sidebar-header">
          <img src={logo} alt="MOD Logo" className="sidebar-logo" />
          <h1 className="sidebar-title">MOD</h1>
        </a>

        <div className="module-category">
          <h3>Sources</h3>
          {renderModuleButton('ToneGenerator')}
          {renderModuleButton('NoiseGenerator')}
          {renderModuleButton('Microphone')}
          {renderModuleButton('MP3Deck')}
          {renderModuleButton('StreamingAudioDeck')}
        </div>

        <div className="module-category">
          <h3>CV</h3>
          {renderModuleButton('LFO')}
          {renderModuleButton('ADSR')}
          {renderModuleButton('Sequencer')}
          {renderModuleButton('Clock')}
        </div>

        <div className="module-category">
          <h3>Processors</h3>
          {renderModuleButton('Filter')}
          {renderModuleButton('Delay')}
          {renderModuleButton('Reverb')}
          {renderModuleButton('Compressor')}
          {renderModuleButton('Distortion')}
          {renderModuleButton('Panner')}
          {renderModuleButton('EQ')}
          {renderModuleButton('Chorus')}
          {renderModuleButton('Phaser')}
          {renderModuleButton('Flanger')}
          {renderModuleButton('Tremolo')}
          {renderModuleButton('BitCrusher')}
          {renderModuleButton('Limiter')}
          {renderModuleButton('Gate')}
          {renderModuleButton('AutoWah')}
          {renderModuleButton('RingModulator')}
        </div>

        <div className="module-category">
          <h3>Mixers</h3>
          {renderModuleButton('CrossFade')}
          {renderModuleButton('Mixer')}
        </div>

        <div className="module-category">
          <h3>Output</h3>
          {renderModuleButton('Monitor')}
        </div>

        <div className="module-category">
          <h3>Visualizations</h3>
          {renderModuleButton('Oscilloscope')}
          {renderModuleButton('SpectrumAnalyzer')}
          {renderModuleButton('LevelMeter')}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="canvas"
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop as any}
      >
        {/* SVG for wires */}
        <svg className="wires-svg">
          {/* Render existing connections - memoized */}
          {useMemo(() => connections.map((conn) => {
            const fromPos = getPortPosition(conn.from.moduleId, conn.from.portId);
            const toPos = getPortPosition(conn.to.moduleId, conn.to.portId);

            if (!fromPos || !toPos) return null;

            // Create a smooth curve
            const midX = (fromPos.x + toPos.x) / 2;
            const path = `M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${toPos.y}, ${toPos.x} ${toPos.y}`;

            return (
              <g key={conn.id}>
                {/* Invisible thick path for easier clicking */}
                <path
                  d={path}
                  stroke="transparent"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleWireClick(conn.id, e)}
                />
                {/* Visible wire */}
                <path
                  d={path}
                  stroke="#4CAF50"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.5))',
                    pointerEvents: 'none'
                  }}
                />
              </g>
            );
          }), [connections, modules])}

          {/* Render dragging connection */}
          {draggingConnection && (() => {
            const fromPos = getPortPosition(draggingConnection.from.moduleId, draggingConnection.from.portId);
            if (!fromPos) return null;

            const midX = (fromPos.x + draggingConnection.mousePos.x) / 2;
            const path = `M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${draggingConnection.mousePos.y}, ${draggingConnection.mousePos.x} ${draggingConnection.mousePos.y}`;

            return (
              <path
                d={path}
                stroke="#4CAF50"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
                strokeDasharray="5,5"
                style={{ pointerEvents: 'none' }}
              />
            );
          })()}
        </svg>

        {modules.map((module) => {
          const inputPorts = module.ports.filter(p => p.type === 'input' && !p.label.startsWith('CV') && p.label !== 'Gate');
          const outputPorts = module.ports.filter(p => p.type === 'output');
          const cvPorts = module.ports.filter(p => p.type === 'input' && (p.label === 'CV' || p.label === 'Gate'));

          // Get connected input streams for each input port (excluding CV)
          const inputStreams = inputPorts.map(port => {
            const connection = connections.find(c => c.to.portId === port.id);
            return connection ? getStreamRef(connection.from.portId) : null;
          });

          // Get CV input streams
          const cvInputStreams: { [key: string]: React.RefObject<any> | null } = {};
          cvPorts.forEach(port => {
            const connection = connections.find(c => c.to.portId === port.id);
            const key = port.id.split('-').slice(-2).join('-'); // Extract 'cv-freq', 'cv-gain', etc.
            cvInputStreams[key] = connection ? getStreamRef(connection.from.portId) : null;
          });

          // Get output stream refs for each output port
          const outputStreams = outputPorts.map(port => getStreamRef(port.id));

          return (
            <ModuleWrapper
              key={module.id}
              id={module.id}
              type={module.type}
              position={module.position}
              ports={module.ports}
              color={module.color}
              onMove={moveModule}
              onDelete={deleteModule}
              onPortMouseDown={handlePortMouseDown}
              onPortMouseEnter={(moduleId, portId) => setHoveredPort({ moduleId, portId })}
              onPortMouseLeave={() => setHoveredPort(null)}
              isPortConnected={isPortConnected}
              hoveredPortId={hoveredPort?.moduleId === module.id ? hoveredPort.portId : undefined}
            >
              <ModuleRenderer
                moduleType={module.type}
                inputStreams={inputStreams}
                outputStreams={outputStreams}
                cvInputStreams={cvInputStreams}
              />
            </ModuleWrapper>
          );
        })}
      </div>
    </div>
  );
}

function App2() {
  return (
    <AudioProvider>
      <ModularSynth />
    </AudioProvider>
  );
}

export default App2;
