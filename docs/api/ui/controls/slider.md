# Slider

A versatile range slider component with optional increment/decrement buttons, perfect for audio parameter control.

## Demo

### Interactive Example

<script setup>
import { ref } from 'vue';
const volume = ref(75);
const frequency = ref(440);
const pan = ref(0);
</script>

<div style="padding: 2rem; background: #1a1a1a; border-radius: 8px; margin: 1rem 0;">
  <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.75rem; color: #999;">Volume</span>
        <span style="font-size: 0.75rem; color: #4CAF50; font-weight: 600;">{{ volume }}%</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button @click="volume = Math.max(0, volume - 1)" style="width: 20px; height: 20px; background: #2a2a2a; border: 1px solid #444; border-radius: 3px; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; padding-bottom: 2px;">−</button>
        <input type="range" v-model="volume" min="0" max="100" style="flex: 1; height: 6px; -webkit-appearance: none; background: #3a3a3a; border: 1px solid #444; border-radius: 3px; outline: none;" />
        <button @click="volume = Math.min(100, volume + 1)" style="width: 20px; height: 20px; background: #2a2a2a; border: 1px solid #444; border-radius: 3px; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; padding-bottom: 2px;">+</button>
      </div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.75rem; color: #999;">Frequency</span>
        <span style="font-size: 0.75rem; color: #4CAF50; font-weight: 600;">{{ frequency }} Hz</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button @click="frequency = Math.max(20, frequency - 10)" style="width: 20px; height: 20px; background: #2a2a2a; border: 1px solid #444; border-radius: 3px; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; padding-bottom: 2px;">−</button>
        <input type="range" v-model="frequency" min="20" max="2000" step="10" style="flex: 1; height: 6px; -webkit-appearance: none; background: #3a3a3a; border: 1px solid #444; border-radius: 3px; outline: none;" />
        <button @click="frequency = Math.min(2000, frequency + 10)" style="width: 20px; height: 20px; background: #2a2a2a; border: 1px solid #444; border-radius: 3px; color: #999; cursor: pointer; display: flex; align-items: center; justify-content: center; padding-bottom: 2px;">+</button>
      </div>
    </div>
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.75rem; color: #999;">Pan</span>
        <span style="font-size: 0.75rem; color: #4CAF50; font-weight: 600;">{{ pan > 0 ? 'R' + pan : pan < 0 ? 'L' + Math.abs(pan) : 'C' }}</span>
      </div>
      <input type="range" v-model="pan" min="-50" max="50" style="width: 100%; height: 6px; -webkit-appearance: none; background: #3a3a3a; border: 1px solid #444; border-radius: 3px; outline: none;" />
    </div>
  </div>
</div>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
}
input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.7);
}
button:hover {
  background: #333 !important;
  border-color: #555 !important;
  color: #4CAF50 !important;
}
</style>

## Features

- Continuous value control with min/max/step
- Optional +/- increment buttons
- Label and value display
- Custom value formatting
- Disabled state support
- Full accessibility (ARIA labels, keyboard support)
- Completely customizable styling

## Import

```tsx
import { Slider } from '@mode-7/mod';
import '@mode-7/mod/dist/index.css'; // Optional default styles
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | Required | Current slider value |
| `onChange` | `(value: number) => void` | Required | Value change callback |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `scale` | `'linear' \| 'log'` | `'linear'` | Scale type (log requires min > 0) |
| `label` | `string` | - | Optional label text |
| `unit` | `string` | `''` | Unit suffix (e.g., "Hz", "%") |
| `formatValue` | `(value: number) => string` | - | Custom value formatter |
| `showButtons` | `boolean` | `true` | Show +/- buttons |
| `disabled` | `boolean` | `false` | Disable the slider |
| `className` | `string` | `''` | Container class |
| `labelClassName` | `string` | `''` | Label class |
| `valueClassName` | `string` | `''` | Value display class |
| `controlClassName` | `string` | `''` | Control wrapper class |
| `buttonClassName` | `string` | `''` | Button class |
| `inputClassName` | `string` | `''` | Range input class |

## Usage

### Basic Usage

```tsx
import { Slider } from '@mode-7/mod';
import { useState } from 'react';

function MyComponent() {
  const [volume, setVolume] = useState(50);

  return (
    <Slider
      value={volume}
      onChange={setVolume}
      min={0}
      max={100}
      label="Volume"
      unit="%"
    />
  );
}
```

### Without Buttons

```tsx
<Slider
  value={value}
  onChange={setValue}
  showButtons={false}
  label="Pan"
  min={-1}
  max={1}
  step={0.01}
/>
```

### With Custom Formatting

```tsx
<Slider
  value={frequency}
  onChange={setFrequency}
  min={20}
  max={20000}
  step={1}
  label="Frequency"
  formatValue={(val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)} kHz`;
    }
    return `${val.toFixed(0)} Hz`;
  }}
/>
```

### Logarithmic Scale

For parameters like frequency that work better on a logarithmic scale, use the `scale="log"` prop:

```tsx
import { useState } from 'react';

function LogSlider() {
  const [frequency, setFrequency] = useState(440);

  return (
    <Slider
      value={frequency}
      onChange={setFrequency}
      min={20}
      max={20000}
      scale="log"
      label="Frequency"
      formatValue={(val) => `${val.toFixed(0)} Hz`}
    />
  );
}
```

The logarithmic scale automatically converts the slider position so that frequency changes feel more natural - moving the slider the same distance produces the same perceived pitch change regardless of position.

**Note:** The `scale="log"` prop requires `min > 0` since logarithms are undefined for zero or negative values.

### With Tailwind Styling

```tsx
<Slider
  value={value}
  onChange={setValue}
  label="Gain"
  unit=" dB"
  className="w-full p-2"
  labelClassName="text-gray-400 text-xs uppercase tracking-wide"
  valueClassName="text-emerald-500 text-xs font-mono"
  buttonClassName="bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-400 hover:text-emerald-500"
  inputClassName="accent-emerald-500"
/>
```

### Disabled State

```tsx
<Slider
  value={value}
  onChange={setValue}
  label="Locked Parameter"
  disabled={true}
/>
```

### Multiple Sliders

```tsx
function EQControls() {
  const [low, setLow] = useState(0);
  const [mid, setMid] = useState(0);
  const [high, setHigh] = useState(0);

  return (
    <div className="eq-controls">
      <Slider
        value={low}
        onChange={setLow}
        min={-12}
        max={12}
        step={0.1}
        label="Low"
        unit=" dB"
      />
      <Slider
        value={mid}
        onChange={setMid}
        min={-12}
        max={12}
        step={0.1}
        label="Mid"
        unit=" dB"
      />
      <Slider
        value={high}
        onChange={setHigh}
        min={-12}
        max={12}
        step={0.1}
        label="High"
        unit=" dB"
      />
    </div>
  );
}
```

## CSS Classes

The Slider component uses the following CSS classes:

- `.modui-slider` - Container element
- `.modui-slider-header` - Header with label and value
- `.modui-slider-label` - Label text
- `.modui-slider-value` - Value display
- `.modui-slider-control` - Control wrapper (input + buttons)
- `.modui-slider-button` - Button elements (both + and -)
- `.modui-slider-button-minus` - Decrement button
- `.modui-slider-button-plus` - Increment button
- `.modui-slider-input` - Range input element

## Styling Examples

### Custom Theme

```css
.modui-slider {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.modui-slider-label {
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modui-slider-value {
  color: white;
  font-weight: bold;
}

.modui-slider-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.modui-slider-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.modui-slider-input::-webkit-slider-thumb {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

### Minimal Style

```css
.modui-slider {
  width: 100%;
}

.modui-slider-header {
  margin-bottom: 0.25rem;
}

.modui-slider-label,
.modui-slider-value {
  font-size: 10px;
  color: #666;
}

.modui-slider-button {
  display: none; /* Hide buttons for minimal look */
}

.modui-slider-input {
  height: 2px;
  background: #e0e0e0;
  border: none;
}

.modui-slider-input::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  background: #333;
  box-shadow: none;
}
```

## Accessibility

The Slider component includes:

- `aria-label` attributes for screen readers
- Keyboard support (arrow keys work on the range input)
- Proper `disabled` state handling
- Focus indicators
- Semantic button elements with `type="button"`

## Related

- [ModUI Overview](/api/ui/overview)
