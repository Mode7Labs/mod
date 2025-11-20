import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import './Select.css';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, options, placeholder }) => {
  // Filter out empty string values as Radix UI Select doesn't allow them
  const validOptions = options.filter(option => option.value !== '');

  // Ensure the current value exists in the options, otherwise use first valid option
  // Never pass an empty string to Radix UI Select
  const safeValue = validOptions.some(opt => opt.value === value)
    ? value
    : (validOptions[0]?.value || undefined);

  // If no valid options or no valid value, don't render the select
  if (!validOptions.length || !safeValue) {
    return <div className="select-trigger" style={{ opacity: 0.5 }}>{placeholder || 'No options'}</div>;
  }

  return (
    <SelectPrimitive.Root value={safeValue} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger className="select-trigger">
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="select-icon">
          <ChevronDown size={14} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="select-content">
          <SelectPrimitive.Viewport className="select-viewport">
            {validOptions.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="select-item">
                <SelectPrimitive.ItemIndicator className="select-item-indicator">
                  <Check size={14} />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
