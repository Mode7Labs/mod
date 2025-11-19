# Monitor

The `Monitor` component connects audio signals to your speakers or headphones. It provides volume control, muting, and output device selection.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `input` | `ModStreamRef` | Required | Audio signal to output |
| `label` | `string` | `'monitor'` | Label for the component in metadata |
| `deviceId` | `string` | - | Optional device ID to pre-select an output device |
| `children` | `function` | - | Render prop function receiving control props |

## Render Props

When using the `children` render prop, the following controls are provided:

| Property | Type | Description |
|----------|------|-------------|
| `gain` | `number` | Current output gain (0-1+) |
| `setGain` | `(value: number) => void` | Update the output gain |
| `isMuted` | `boolean` | Whether the output is muted |
| `setMuted` | `(muted: boolean) => void` | Mute or unmute the output |
| `devices` | `AudioOutputDevice[]` | List of available output devices |
| `selectedDeviceId` | `string \| null` | Currently selected device ID |
| `selectDevice` | `(deviceId: string) => Promise<void>` | Select a different output device |
| `refreshDevices` | `() => Promise<void>` | Refresh the list of devices |
| `isActive` | `boolean` | Whether the monitor is active |

## Usage

### Basic Usage

```tsx
import { ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);

  return (
    <>
      <ToneGenerator output={toneOut} />
      <Monitor input={toneOut} />
    </>
  );
}
```

### With Volume Control

```tsx
import { Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const audioOut = useRef(null);

  return (
    <Monitor input={audioOut}>
      {({ gain, setGain, isMuted, setMuted }) => (
        <div>
          <div>
            <label>Volume: {(gain * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              disabled={isMuted}
            />
          </div>

          <button onClick={() => setMuted(!isMuted)}>
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
        </div>
      )}
    </Monitor>
  );
}
```

### With Device Selection

```tsx
import { Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const audioOut = useRef(null);

  return (
    <Monitor input={audioOut}>
      {({
        gain,
        setGain,
        isMuted,
        setMuted,
        devices,
        selectedDeviceId,
        selectDevice,
        refreshDevices
      }) => (
        <div>
          <div>
            <label>Output Device:</label>
            <select
              value={selectedDeviceId || ''}
              onChange={(e) => selectDevice(e.target.value)}
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <button onClick={refreshDevices}>Refresh</button>
          </div>

          <div>
            <label>Volume:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
              disabled={isMuted}
            />
            <span>{(gain * 100).toFixed(0)}%</span>
          </div>

          <button onClick={() => setMuted(!isMuted)}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>
      )}
    </Monitor>
  );
}
```

### Master Output Section

```tsx
import { Monitor } from '@mode-7/mod';
import { useRef, useState } from 'react';

function App() {
  const masterOut = useRef(null);
  const [peakLevel, setPeakLevel] = useState(0);

  return (
    <Monitor input={masterOut}>
      {({ gain, setGain, isMuted, setMuted }) => (
        <div style={{
          padding: '20px',
          border: '2px solid #333',
          borderRadius: '8px',
          backgroundColor: '#1a1a1a',
          color: '#fff'
        }}>
          <h3>Master Output</h3>

          {/* VU Meter Simulation */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${peakLevel * 100}%`,
                height: '100%',
                backgroundColor: peakLevel > 0.9 ? '#f00' : peakLevel > 0.7 ? '#ff0' : '#0f0',
                transition: 'width 0.1s'
              }} />
            </div>
          </div>

          {/* Volume Fader */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input
                type="range"
                orient="vertical"
                min="0"
                max="1"
                step="0.01"
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
                disabled={isMuted}
                style={{
                  writingMode: 'bt-lr',
                  appearance: 'slider-vertical',
                  width: '40px',
                  height: '200px',
                }}
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              {(gain * 100).toFixed(0)}%
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setMuted(!isMuted)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: isMuted ? '#f00' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isMuted ? 'MUTED' : 'MUTE'}
            </button>
            <button
              onClick={() => setGain(0.75)}
              style={{
                padding: '10px',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reset to 75%
            </button>
          </div>
        </div>
      )}
    </Monitor>
  );
}
```

### Multiple Monitors for Different Outputs

```tsx
import { Mixer, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const source1 = useRef(null);
  const source2 = useRef(null);
  const mixOut = useRef(null);

  return (
    <>
      {/* Main stereo output */}
      <Mixer inputs={[source1, source2]} output={mixOut} />
      <Monitor input={mixOut}>
        {({ gain, setGain }) => (
          <div>
            <h4>Main Output</h4>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        )}
      </Monitor>

      {/* Headphone output (could be a different mix) */}
      <Monitor input={source1}>
        {({ gain, setGain }) => (
          <div>
            <h4>Headphones (Source 1 Only)</h4>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gain}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        )}
      </Monitor>
    </>
  );
}
```

## Important Notes

### Volume Control

- Range: 0 to 1+ (0% to 100%+)
- 0 = Silent
- 1 = Unity gain (no change)
- >1 = Amplification (can cause distortion)
- Default: 1.0 (100%)

### Muting

- Mute sets gain to 0 temporarily
- Unmute restores previous gain value
- Mute is instant (no fade)

### Output Device Selection

- Requires browser support for AudioContext.setSinkId()
- Not all browsers support device selection
- Falls back gracefully if not supported
- Default device is usually the system default

### Multiple Monitors

- You can have multiple Monitor components
- Each connects to the audio context destination
- All Monitors output to the same physical device (unless using setSinkId)
- Useful for monitoring different signals separately

::: warning Hearing Protection
Always start with low volume and increase gradually. Loud audio can damage hearing. Be especially careful with:
- Headphones (sound is very close to ears)
- Feedback loops (can suddenly become very loud)
- Distortion and other effects (can increase perceived loudness)
:::

::: tip Best Practices
- Include a master volume control in your UI
- Provide a mute button for quick silencing
- Consider adding a visual level meter
- Start sessions at moderate volume (around 50-75%)
- Warn users before potentially loud operations
:::

## Related

- [Mixer](/api/mixers/mixer) - Combine multiple sources before monitoring
- [Compressor](/api/processors/compressor) - Prevent clipping at output
- [AudioProvider](/api/audio-provider) - Required wrapper for audio context
