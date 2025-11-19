import React from 'react';
import './Slider.css';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  labelColor?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
  labelColor
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div className="slider-container">
      {label && (
        <div className="slider-header">
          <span className="slider-label" style={labelColor ? { color: labelColor } : undefined}>{label}</span>
          <span className="slider-value">{displayValue}</span>
        </div>
      )}
      <input
        type="range"
        className="slider"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};
