import '@testing-library/jest-dom';

// Mock Web Audio API for testing
class MockAudioContext {
  destination: AudioDestinationNode;
  currentTime: number = 0;
  sampleRate: number = 44100;
  state: AudioContextState = 'running';

  constructor() {
    this.destination = {} as AudioDestinationNode;
  }

  createGain(): GainNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        setTargetAtTime: jest.fn(),
        setValueCurveAtTime: jest.fn(),
        cancelScheduledValues: jest.fn(),
        cancelAndHoldAtTime: jest.fn(),
      },
    } as unknown as GainNode;
  }

  createOscillator(): OscillatorNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 440, setValueAtTime: jest.fn() },
      type: 'sine',
    } as unknown as OscillatorNode;
  }

  createBiquadFilter(): BiquadFilterNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      frequency: { value: 350, setValueAtTime: jest.fn() },
      Q: { value: 1, setValueAtTime: jest.fn() },
      gain: { value: 0, setValueAtTime: jest.fn() },
      type: 'lowpass',
    } as unknown as BiquadFilterNode;
  }

  createDelay(): DelayNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      delayTime: { value: 0, setValueAtTime: jest.fn() },
    } as unknown as DelayNode;
  }

  createStereoPanner(): StereoPannerNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      pan: { value: 0, setValueAtTime: jest.fn() },
    } as unknown as StereoPannerNode;
  }

  createConvolver(): ConvolverNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      buffer: null,
    } as unknown as ConvolverNode;
  }

  createDynamicsCompressor(): DynamicsCompressorNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      threshold: { value: -24, setValueAtTime: jest.fn() },
      knee: { value: 30, setValueAtTime: jest.fn() },
      ratio: { value: 12, setValueAtTime: jest.fn() },
      attack: { value: 0.003, setValueAtTime: jest.fn() },
      release: { value: 0.25, setValueAtTime: jest.fn() },
    } as unknown as DynamicsCompressorNode;
  }

  createWaveShaper(): WaveShaperNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      curve: null,
      oversample: '4x',
    } as unknown as WaveShaperNode;
  }

  createBufferSource(): AudioBufferSourceNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      buffer: null,
      loop: false,
      playbackRate: { value: 1, setValueAtTime: jest.fn() },
    } as unknown as AudioBufferSourceNode;
  }

  createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer {
    return {
      duration: length / sampleRate,
      length,
      numberOfChannels,
      sampleRate,
      getChannelData: (channel: number) => new Float32Array(length),
      copyFromChannel: jest.fn(),
      copyToChannel: jest.fn(),
    } as unknown as AudioBuffer;
  }

  createChannelMerger(numberOfInputs?: number): ChannelMergerNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as ChannelMergerNode;
  }

  createChannelSplitter(numberOfOutputs?: number): ChannelSplitterNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as ChannelSplitterNode;
  }

  createConstantSource(): ConstantSourceNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      offset: { value: 1, setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
    } as unknown as ConstantSourceNode;
  }

  createAnalyser(): AnalyserNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      fftSize: 2048,
      frequencyBinCount: 1024,
      smoothingTimeConstant: 0.8,
      getByteTimeDomainData: jest.fn((array: Uint8Array) => {
        // Fill with default center value (128)
        for (let i = 0; i < array.length; i++) {
          array[i] = 128;
        }
      }),
      getByteFrequencyData: jest.fn(),
      getFloatTimeDomainData: jest.fn(),
      getFloatFrequencyData: jest.fn(),
    } as unknown as AnalyserNode;
  }

  createScriptProcessor(
    bufferSize?: number,
    numberOfInputChannels?: number,
    numberOfOutputChannels?: number
  ): ScriptProcessorNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      bufferSize: bufferSize || 4096,
      onaudioprocess: null,
    } as unknown as ScriptProcessorNode;
  }

  createMediaElementSource(mediaElement: HTMLMediaElement): MediaElementAudioSourceNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      mediaElement,
    } as unknown as MediaElementAudioSourceNode;
  }

  createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      mediaStream,
    } as unknown as MediaStreamAudioSourceNode;
  }

  decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
    return Promise.resolve({
      duration: 1,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100,
    } as AudioBuffer);
  }

  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend(): Promise<void> {
    this.state = 'suspended';
    return Promise.resolve();
  }

  close(): Promise<void> {
    this.state = 'closed';
    return Promise.resolve();
  }
}

// Mock MediaStream API
class MockMediaStream {
  id: string = 'mock-stream-id';
  active: boolean = true;
  private tracks: MediaStreamTrack[] = [
    {
      stop: jest.fn(),
      enabled: true,
      id: 'mock-track-id',
      kind: 'audio',
      label: 'Mock Audio Track',
      muted: false,
      readyState: 'live',
    } as unknown as MediaStreamTrack,
  ];

  getTracks() {
    return this.tracks;
  }

  getAudioTracks() {
    return this.tracks.filter(t => t.kind === 'audio');
  }

  getVideoTracks() {
    return this.tracks.filter(t => t.kind === 'video');
  }
}

class MockMediaDevices {
  async getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    return new MockMediaStream() as unknown as MediaStream;
  }

  async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    return [
      {
        deviceId: 'default',
        kind: 'audioinput',
        label: 'Default Microphone',
        groupId: 'group1',
        toJSON: () => ({}),
      },
      {
        deviceId: 'output1',
        kind: 'audiooutput',
        label: 'Default Speaker',
        groupId: 'group1',
        toJSON: () => ({}),
      },
    ] as MediaDeviceInfo[];
  }
}

// Install mocks
global.AudioContext = MockAudioContext as any;
global.webkitAudioContext = MockAudioContext as any;

if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: new MockMediaDevices(),
  });
}

// Suppress expected console warnings during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress expected errors from component error handling and jsdom limitations
    if (
      message.includes('Failed to enumerate devices') ||
      message.includes('Not implemented: HTMLMediaElement') ||
      message.includes('Not implemented')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress expected warnings from component error states
    if (
      message.includes('error:') ||
      message.includes('Error:')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
