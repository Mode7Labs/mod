# Oscilloscope

The `Oscilloscope` component visualizes audio signals in the time domain, displaying the waveform of the input audio stream.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Reference to input audio signal to visualize |
| `fftSize` | `number` | `2048` | FFT size (must be power of 2 between 32-32768) |
| `children` | `function` | Required | Render prop function receiving visualization data |

## Render Props

When using the `children` render prop, the following data is provided:

| Property | Type | Description |
|----------|------|-------------|
| `dataArray` | `Uint8Array` | Time-domain audio data (waveform samples) |
| `bufferLength` | `number` | Length of the data array |
| `isActive` | `boolean` | Whether the oscilloscope is active and receiving data |

## Usage

### Basic Usage with Custom Canvas

```tsx
import { Oscilloscope } from '@mode-7/mod';
import { useRef, useEffect } from 'react';

function App() {
  const audioIn = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      {/* Your audio source */}
      <ToneGenerator output={audioIn} />

      {/* Oscilloscope visualization */}
      <Oscilloscope input={audioIn}>
        {({ dataArray, bufferLength, isActive }) => {
          // Custom canvas drawing
          useEffect(() => {
            if (!isActive || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw waveform
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 255.0;
              const y = v * canvas.height;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }

              x += sliceWidth;
            }

            ctx.stroke();
          }, [dataArray, bufferLength, isActive]);

          return <canvas ref={canvasRef} width={800} height={200} />;
        }}
      </Oscilloscope>
    </>
  );
}
```

### Using Pre-built Canvas Component

```tsx
import { Oscilloscope, OscilloscopeCanvas } from '@mode-7/mod';

function App() {
  const audioIn = useRef(null);

  return (
    <>
      <ToneGenerator output={audioIn} />

      <Oscilloscope input={audioIn}>
        {({ dataArray, bufferLength, isActive }) => (
          <div style={{ width: '100%', height: '200px' }}>
            {isActive ? (
              <OscilloscopeCanvas
                dataArray={dataArray}
                bufferLength={bufferLength}
                color="#00ff88"
                lineWidth={2}
              />
            ) : (
              <div>No Signal</div>
            )}
          </div>
        )}
      </Oscilloscope>
    </>
  );
}
```

## Notes

- The oscilloscope automatically adapts to changes in the audio source
- Higher `fftSize` values provide more detail but may impact performance
- The component uses `requestAnimationFrame` for smooth animations
- Works with any audio source (tone generators, microphones, audio files, etc.)
