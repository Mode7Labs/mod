import React from 'react';
import './Slider.css';

export type SliderScale = 'linear' | 'log';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  scale?: SliderScale;
  label?: string;
  unit?: string;
  formatValue?: (value: number) => string;
  showButtons?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  controlClassName?: string;
  buttonClassName?: string;
  inputClassName?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  scale = 'linear',
  label,
  unit = '',
  formatValue,
  showButtons = true,
  disabled = false,
  className = '',
  labelClassName = '',
  valueClassName = '',
  controlClassName = '',
  buttonClassName = '',
  inputClassName = '',
}) => {
  const isLogScale = scale === 'log';
  const canUseLog = isLogScale && min > 0 && max > 0 && max > min;
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  const clampValue = (nextValue: number) => Math.min(max, Math.max(min, nextValue));

  const logMin = Math.max(min, 1e-6);
  const logMax = Math.max(max, logMin + 1e-6);
  const logRange = Math.log(logMax) - Math.log(logMin);
  const valueToT = (nextValue: number) =>
    (Math.log(Math.max(logMin, nextValue)) - Math.log(logMin)) / logRange;
  const tToValue = (t: number) =>
    Math.exp(Math.log(logMin) + t * logRange);

  const handleDecrement = () => {
    if (disabled) return;
    onChange(clampValue(value - step));
  };

  const handleIncrement = () => {
    if (disabled) return;
    onChange(clampValue(value + step));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const rawValue = parseFloat(e.target.value);
    const nextValue = canUseLog ? tToValue(rawValue) : rawValue;
    onChange(clampValue(nextValue));
  };

  // Default styles that can be overridden
  const defaultStyles = {
    container: `modui-slider ${className}`,
    header: `modui-slider-header`,
    label: `modui-slider-label ${labelClassName}`,
    value: `modui-slider-value ${valueClassName}`,
    control: `modui-slider-control ${controlClassName}`,
    button: `modui-slider-button ${buttonClassName}`,
    input: `modui-slider-input ${inputClassName}`,
  };

  const inputMin = canUseLog ? 0 : min;
  const inputMax = canUseLog ? 1 : max;
  const inputStep = canUseLog ? 0.001 : step;
  const inputValue = canUseLog ? valueToT(clampValue(value)) : value;

  return (
    <div className={defaultStyles.container}>
      {label && (
        <div className={defaultStyles.header}>
          <span className={defaultStyles.label}>{label}</span>
          <span className={defaultStyles.value}>{displayValue}</span>
        </div>
      )}
      <div className={defaultStyles.control}>
        {showButtons && (
          <button
            className={`${defaultStyles.button} modui-slider-button-minus`}
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            type="button"
            aria-label="Decrease"
          >
            −
          </button>
        )}
        <input
          type="range"
          className={defaultStyles.input}
          value={inputValue}
          onChange={handleInputChange}
          min={inputMin}
          max={inputMax}
          step={inputStep}
          disabled={disabled}
          aria-label={label || 'Slider'}
        />
        {showButtons && (
          <button
            className={`${defaultStyles.button} modui-slider-button-plus`}
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            type="button"
            aria-label="Increase"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

Slider.displayName = 'Slider';
