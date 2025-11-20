# AudioProvider

The `AudioProvider` component initializes and manages the Web Audio context for your application. It must wrap all other mod components.

## Usage

```tsx
import { AudioProvider } from '@mode-7/mod';

function App() {
  return (
    <AudioProvider>
      {/* Your audio modules go here */}
    </AudioProvider>
  );
}
```

## Props

The AudioProvider accepts no props. The Audio Context is created automatically when the component mounts.

## Context

AudioProvider creates a React context that provides the AudioContext instance to all child components. You can access it using the `useAudioContext` hook:

```tsx
import { useAudioContext } from '@mode-7/mod';

function MyComponent() {
  const audioContext = useAudioContext();

  if (!audioContext) {
    return <div>Loading audio context...</div>;
  }

  return <div>Sample rate: {audioContext.sampleRate}Hz</div>;
}
```

## Important Notes

### User Gesture Requirement

On some browsers (particularly iOS Safari), the AudioContext must be resumed in response to a user gesture. The AudioProvider handles this automatically, but you may want to provide a "Start" button for the best user experience:

```tsx
import { AudioProvider, useAudioContext } from '@mode-7/mod';
import { useState } from 'react';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <AudioProvider>
      {!started && (
        <button onClick={() => setStarted(true)}>
          Start Audio
        </button>
      )}
      {started && (
        <YourAudioApp />
      )}
    </AudioProvider>
  );
}
```

### Single Instance

Only one AudioProvider should exist in your application. Nested AudioProviders are not supported and will cause issues.

::: warning
Do not nest AudioProvider components. Only one should exist at the root of your app.
:::

## Examples

### Basic Setup

```tsx
import { AudioProvider, ToneGenerator, Monitor } from '@mode-7/mod';
import { useRef } from 'react';

function App() {
  const toneOut = useRef(null);

  return (
    <AudioProvider>
      <ToneGenerator output={toneOut} />
      <Monitor input={toneOut} />
    </AudioProvider>
  );
}
```

### With User Activation

```tsx
import { AudioProvider } from '@mode-7/mod';
import { useState } from 'react';

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false);

  if (!audioEnabled) {
    return (
      <div>
        <h1>My Audio App</h1>
        <button onClick={() => setAudioEnabled(true)}>
          Enable Audio
        </button>
      </div>
    );
  }

  return (
    <AudioProvider>
      <MyAudioComponents />
    </AudioProvider>
  );
}
```

## Related

- [Getting Started](/guide/getting-started) - Start building with mod
- [API Overview](/api/overview) - Explore all available components
