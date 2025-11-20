# LevelMeter

The `LevelMeter` component provides real-time audio level monitoring with RMS level display, peak detection, and clipping indicators.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Reference to input audio signal to measure |
| `fftSize` | `number` | `2048` | FFT size for analysis (must be power of 2 between 32-32768) |
| `peakHoldTime` | `number` | `1000` | Time in milliseconds to hold peak value |
| `clipThreshold` | `number` | `0.95` | Threshold for clipping indicator (0-1) |
| `children` | `function` | Required | Render prop function receiving level data |

## Render Props

When using the `children` render prop, the following data is provided:

| Property | Type | Description |
|----------|------|-------------|
| `level` | `number` | Current RMS level (0-1) |
| `peak` | `number` | Peak level with hold (0-1) |
| `isClipping` | `boolean` | Whether the signal is clipping |
| `isActive` | `boolean` | Whether the meter is active and receiving data |

## Usage

### Basic Usage with Custom UI

```tsx
import { LevelMeter } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const audioIn = useRef(null);

  return (
    <>
      {/* Your audio source */}
      <ToneGenerator output={audioIn} />

      {/* Level meter */}
      <LevelMeter input={audioIn} peakHoldTime={1500}>
        {({ level, peak, isClipping, isActive }) => (
          <div>
            <div>Level: {(level * 100).toFixed(0)}%</div>
            <div>Peak: {(peak * 100).toFixed(0)}%</div>
            {isClipping && <div style={{ color: 'red' }}>CLIPPING!</div>}

            {/* Visual bar */}
            <div style={{
              width: '100%',
              height: '20px',
              background: '#222',
              position: 'relative'
            }}>
              <div style={{
                width: `${level * 100}%`,
                height: '100%',
                background: isClipping ? '#f00' : '#0f0',
                transition: 'width 0.05s'
              }} />
              {peak > 0 && (
                <div style={{
                  position: 'absolute',
                  left: `${peak * 100}%`,
                  top: 0,
                  width: '2px',
                  height: '100%',
                  background: '#fff'
                }} />
              )}
            </div>
          </div>
        )}
      </LevelMeter>
    </>
  );
}
```

### Using Pre-built Canvas Component

```tsx
import { LevelMeter, LevelMeterCanvas } from '@mode-7/mod';

function App() {
  const audioIn = useRef(null);

  return (
    <>
      <ToneGenerator output={audioIn} />

      <LevelMeter input={audioIn}>
        {({ level, peak, isClipping, isActive }) => (
          <div style={{ width: '100%', height: '60px' }}>
            {isActive ? (
              <LevelMeterCanvas
                level={level}
                peak={peak}
                isClipping={isClipping}
                orientation="horizontal"
              />
            ) : (
              <div>No Signal</div>
            )}
          </div>
        )}
      </LevelMeter>
    </>
  );
}
```

### Vertical Orientation

```tsx
<LevelMeter input={audioIn}>
  {({ level, peak, isClipping, isActive }) => (
    <div style={{ width: '40px', height: '200px' }}>
      <LevelMeterCanvas
        level={level}
        peak={peak}
        isClipping={isClipping}
        orientation="vertical"
      />
    </div>
  )}
</LevelMeter>
```

## Configuration

### Peak Hold Time

The `peakHoldTime` prop controls how long peak values are displayed:
- `500` = Half a second (quick reset)
- `1000` = One second (default)
- `3000` = Three seconds (long hold for catching transients)

### Clip Threshold

The `clipThreshold` determines when clipping is detected:
- `0.95` = Detect clipping at 95% of maximum (default, safe)
- `1.0` = Only detect actual clipping (0 dBFS)
- Lower values provide earlier warning of potential clipping

## Level Calculation

The LevelMeter calculates two metrics:

1. **RMS Level** - Root Mean Square average of the signal
   - Represents the perceived loudness
   - Smoothly follows the audio envelope
   - Used for the main level bar

2. **Peak Level** - Maximum absolute value in the analysis window
   - Catches transients and peaks
   - Held for the specified `peakHoldTime`
   - Used for the peak indicator

## Notes

- The meter automatically adapts to changes in the audio source
- RMS calculation provides more accurate loudness measurement than simple peak detection
- The clipping indicator helps prevent distortion
- Works with any audio source
- Use multiple meters to monitor different points in your signal chain
