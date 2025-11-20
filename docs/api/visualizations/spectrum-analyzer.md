# SpectrumAnalyzer

The `SpectrumAnalyzer` component visualizes audio signals in the frequency domain, displaying the amplitude of different frequency components.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Reference to input audio signal to visualize |
| `fftSize` | `number` | `2048` | FFT size (must be power of 2 between 32-32768) |
| `minDecibels` | `number` | `-90` | Minimum power value in the scaling range |
| `maxDecibels` | `number` | `-10` | Maximum power value in the scaling range |
| `smoothingTimeConstant` | `number` | `0.8` | Averaging constant (0-1, higher = smoother) |
| `children` | `function` | Required | Render prop function receiving visualization data |

## Render Props

When using the `children` render prop, the following data is provided:

| Property | Type | Description |
|----------|------|-------------|
| `dataArray` | `Uint8Array` | Frequency-domain audio data |
| `bufferLength` | `number` | Length of the data array |
| `minDb` | `number` | Minimum decibel value |
| `maxDb` | `number` | Maximum decibel value |
| `isActive` | `boolean` | Whether the analyzer is active and receiving data |

## Usage

### Basic Usage with Custom Canvas

```tsx
import { SpectrumAnalyzer } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const audioIn = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      {/* Your audio source */}
      <ToneGenerator output={audioIn} />

      {/* Spectrum analyzer */}
      <SpectrumAnalyzer input={audioIn} fftSize={2048}>
        {({ dataArray, bufferLength, isActive }) => {
          useEffect(() => {
            if (!isActive || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw frequency bars
            const barWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * canvas.height;
              const hue = (i / bufferLength) * 360;

              ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
              ctx.fillRect(
                x,
                canvas.height - barHeight,
                barWidth,
                barHeight
              );

              x += barWidth;
            }
          }, [dataArray, bufferLength, isActive]);

          return <canvas ref={canvasRef} width={800} height={200} />;
        }}
      </SpectrumAnalyzer>
    </>
  );
}
```

### Using Pre-built Canvas Component

```tsx
import { SpectrumAnalyzer, SpectrumCanvas } from '@mode-7/mod';

function App() {
  const audioIn = useRef(null);

  return (
    <>
      <ToneGenerator output={audioIn} />

      <SpectrumAnalyzer
        input={audioIn}
        fftSize={2048}
        minDecibels={-90}
        maxDecibels={-10}
      >
        {({ dataArray, bufferLength, isActive }) => (
          <div style={{ width: '100%', height: '200px' }}>
            {isActive ? (
              <SpectrumCanvas
                dataArray={dataArray}
                bufferLength={bufferLength}
                color="#00ff88"
                backgroundColor="#0a0a0a"
                barGap={2}
              />
            ) : (
              <div>No Signal</div>
            )}
          </div>
        )}
      </SpectrumAnalyzer>
    </>
  );
}
```

## Configuration

### FFT Size

The `fftSize` determines the frequency resolution:
- Larger values (e.g., 8192) provide higher frequency resolution but slower updates
- Smaller values (e.g., 512) provide faster updates but lower resolution
- Must be a power of 2 between 32 and 32768

### Decibel Range

Adjust `minDecibels` and `maxDecibels` to control the sensitivity:
- Lower `minDecibels` (e.g., -100) shows quieter sounds
- Higher `minDecibels` (e.g., -60) focuses on louder sounds
- The range determines the dynamic range of the visualization

### Smoothing

The `smoothingTimeConstant` controls temporal smoothing:
- `0` = No smoothing (instant response)
- `0.8` = Default (smooth visualization)
- `1` = Maximum smoothing (very slow response)

## Notes

- The analyzer automatically adapts to changes in the audio source
- Frequency data ranges from 0 Hz to half the sample rate (typically 22,050 Hz)
- The component uses `requestAnimationFrame` for smooth animations
- Works with any audio source
