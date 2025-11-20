import { useState, useCallback } from 'react';

/**
 * Hook for managing state that can be either controlled or uncontrolled.
 * Follows React's controlled component pattern (similar to <input>).
 *
 * @param controlledValue - The controlled value (from props)
 * @param defaultValue - The default value for uncontrolled mode
 * @param onChange - Callback fired when value changes
 * @returns [value, setValue] - Current value and setter function
 */
export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback((newValue: T) => {
    // Only update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(newValue);
    }
    // Always call onChange callback if provided
    onChange?.(newValue);
  }, [isControlled, onChange]);

  return [value, setValue];
}
