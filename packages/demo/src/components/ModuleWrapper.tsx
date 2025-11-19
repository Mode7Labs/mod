import React, { useState, useRef, useEffect } from 'react';
import './ModuleWrapper.css';

interface Position {
  x: number;
  y: number;
}

interface Port {
  id: string;
  type: 'input' | 'output';
  label: string;
}

interface ModuleWrapperProps {
  id: string;
  type: string;
  position: Position;
  ports: Port[];
  color?: string;
  onMove: (id: string, position: Position) => void;
  onDelete: (id: string) => void;
  onPortMouseDown?: (moduleId: string, portId: string, portType: 'input' | 'output', event: React.MouseEvent) => void;
  onPortMouseEnter?: (moduleId: string, portId: string) => void;
  onPortMouseLeave?: () => void;
  isPortConnected?: (portId: string) => boolean;
  hoveredPortId?: string;
  children: React.ReactNode;
}

// Helper function to determine if a color is light or dark
const isLightColor = (color?: string): boolean => {
  if (!color) return false;

  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
};

export const ModuleWrapper: React.FC<ModuleWrapperProps> = ({
  id,
  type,
  position,
  ports,
  color,
  onMove,
  onDelete,
  onPortMouseDown,
  onPortMouseEnter,
  onPortMouseLeave,
  isPortConnected,
  hoveredPortId,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const moduleRef = useRef<HTMLDivElement>(null);

  const inputPorts = ports.filter(p => p.type === 'input');
  const outputPorts = ports.filter(p => p.type === 'output');

  const textColor = isLightColor(color) ? '#2a2a2a' : '#ffffff';

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't start dragging if clicking on a port or control
    if ((e.target as HTMLElement).closest('.port') ||
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('select')) {
      return;
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={moduleRef}
      className={`module-wrapper ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        borderColor: color,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="module-wrapper-header" style={{ backgroundColor: color, color: textColor }}>
        <span className="module-wrapper-title">{type}</span>
        <button
          className="module-wrapper-delete"
          style={{ color: textColor }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          ×
        </button>
      </div>

      <div className="module-wrapper-body">
        {/* Input ports on the left */}
        {inputPorts.length > 0 && (
          <div className="ports-column ports-left">
            {inputPorts.map((port) => {
              const connected = isPortConnected?.(port.id) || false;
              const hovered = hoveredPortId === port.id;
              return (
                <div
                  key={port.id}
                  className={`port port-input ${connected ? 'port-connected' : ''} ${hovered ? 'port-hovered' : ''}`}
                  data-module-id={id}
                  data-port-id={port.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onPortMouseDown?.(id, port.id, 'input', e);
                  }}
                  onMouseEnter={() => onPortMouseEnter?.(id, port.id)}
                  onMouseLeave={() => onPortMouseLeave?.()}
                  title={port.label}
                >
                  <div className="port-dot" />
                  <span className="port-label">{port.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Module content (audio component UI) */}
        <div className="module-wrapper-content">
          {children}
        </div>

        {/* Output ports on the right */}
        {outputPorts.length > 0 && (
          <div className="ports-column ports-right">
            {outputPorts.map((port) => {
              const connected = isPortConnected?.(port.id) || false;
              const hovered = hoveredPortId === port.id;
              return (
                <div
                  key={port.id}
                  className={`port port-output ${connected ? 'port-connected' : ''} ${hovered ? 'port-hovered' : ''}`}
                  data-module-id={id}
                  data-port-id={port.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onPortMouseDown?.(id, port.id, 'output', e);
                  }}
                  onMouseEnter={() => onPortMouseEnter?.(id, port.id)}
                  onMouseLeave={() => onPortMouseLeave?.()}
                  title={port.label}
                >
                  <div className="port-dot" />
                  <span className="port-label">{port.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
