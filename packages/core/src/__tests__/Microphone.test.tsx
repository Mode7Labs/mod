import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Microphone, MicrophoneHandle, AudioDevice } from '../components/sources/Microphone';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices,
  },
  writable: true,
});

// Mock MediaStream
class MockMediaStream {
  private tracks: Array<{ stop: jest.Mock }> = [{ stop: jest.fn() }];

  getTracks() {
    return this.tracks;
  }
}

describe('Microphone', () => {
  const mockDevices: AudioDevice[] = [
    { deviceId: 'device-1', label: 'Microphone 1' },
    { deviceId: 'device-2', label: 'Microphone 2' },
    { deviceId: 'device-3', label: 'Microphone 3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockEnumerateDevices.mockResolvedValue([
      { kind: 'audioinput', deviceId: 'device-1', label: 'Microphone 1' },
      { kind: 'audioinput', deviceId: 'device-2', label: 'Microphone 2' },
      { kind: 'audioinput', deviceId: 'device-3', label: 'Microphone 3' },
      { kind: 'videoinput', deviceId: 'video-1', label: 'Camera 1' },
    ]);

    mockGetUserMedia.mockResolvedValue(new MockMediaStream());
  });

  describe('Render Props Pattern', () => {
    it('should render with default values', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output}>
          {({ gain, isMuted, devices, selectedDeviceId }) => (
            <div>
              <span>Gain: {gain}</span>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <span>Devices: {devices.length}</span>
              <span>Selected: {selectedDeviceId || 'none'}</span>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Gain: 1')).toBeInTheDocument();
        expect(getByText('Muted: no')).toBeInTheDocument();
        expect(getByText('Devices: 3')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Microphone output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Gain: 1')).toBeInTheDocument();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing muted state through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Microphone output={output}>
          {({ isMuted, setMuted }) => (
            <div>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <button onClick={() => setMuted(true)}>Mute</button>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Muted: no')).toBeInTheDocument();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });
    });

    it('should allow device selection through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Microphone output={output}>
          {({ selectedDeviceId, selectDevice }) => (
            <div>
              <span>Selected: {selectedDeviceId}</span>
              <button onClick={() => selectDevice('device-2')}>
                Select Device 2
              </button>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Selected: device-1')).toBeInTheDocument();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Selected: device-2')).toBeInTheDocument();
      });
    });

    it('should provide refreshDevices method through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Microphone output={output}>
          {({ devices, refreshDevices }) => (
            <div>
              <span>Devices: {devices.length}</span>
              <button onClick={refreshDevices}>Refresh</button>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Devices: 3')).toBeInTheDocument();
      });

      // Change mock data
      mockEnumerateDevices.mockResolvedValue([
        { kind: 'audioinput', deviceId: 'device-4', label: 'Microphone 4' },
      ]);

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Devices: 1')).toBeInTheDocument();
      });
    });

    it('should report isActive status', async () => {
      const output = createMockStreamRef();
      const { container } = render(
        <Microphone output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        const statusText = container.querySelector('[data-testid="status"]')?.textContent;
        expect(statusText).toMatch(/Active: (yes|no)/);
      });
    });

    it('should expose error state through render props', async () => {
      const output = createMockStreamRef();
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      const { getByText } = render(
        <Microphone output={output}>
          {({ error }) => (
            <div>
              <span>Error: {error || 'none'}</span>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText(/Error: Permission denied/)).toBeInTheDocument();
      });
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled gain prop', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output} gain={0.75}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Gain: 0.75')).toBeInTheDocument();
      });
    });

    it('should call onGainChange when gain changes', async () => {
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <Microphone output={output} gain={1.0} onGainChange={onGainChange}>
          {({ setGain }) => (
            <button onClick={() => setGain(0.3)}>Change</button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(0.3);
      });
    });

    it('should accept controlled isMuted prop', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output} isMuted={true}>
          {({ isMuted }) => <span>Muted: {isMuted ? 'yes' : 'no'}</span>}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });
    });

    it('should call onMutedChange when muted state changes', async () => {
      const output = createMockStreamRef();
      const onMutedChange = jest.fn();

      const { getByRole } = render(
        <Microphone output={output} isMuted={false} onMutedChange={onMutedChange}>
          {({ setMuted }) => (
            <button onClick={() => setMuted(true)}>Change</button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onMutedChange).toHaveBeenCalledWith(true);
      });
    });

    it('should accept controlled selectedDeviceId prop', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output} selectedDeviceId="device-2">
          {({ selectedDeviceId }) => <span>Selected: {selectedDeviceId}</span>}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Selected: device-2')).toBeInTheDocument();
      });
    });

    it('should call onSelectedDeviceIdChange when device changes', async () => {
      const output = createMockStreamRef();
      const onSelectedDeviceIdChange = jest.fn();

      const { getByRole } = render(
        <Microphone
          output={output}
          selectedDeviceId="device-1"
          onSelectedDeviceIdChange={onSelectedDeviceIdChange}
        >
          {({ selectDevice }) => (
            <button onClick={() => selectDevice('device-3')}>Change</button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSelectedDeviceIdChange).toHaveBeenCalledWith('device-3');
      });
    });

    it('should call onDevicesChange when devices are loaded', async () => {
      const output = createMockStreamRef();
      const onDevicesChange = jest.fn();

      render(
        <Microphone output={output} onDevicesChange={onDevicesChange}>
          {() => <div>Test</div>}
        </Microphone>
      );

      await waitFor(() => {
        expect(onDevicesChange).toHaveBeenCalledWith(mockDevices);
      });
    });

    it('should call onError when error occurs', async () => {
      const output = createMockStreamRef();
      const onError = jest.fn();
      mockGetUserMedia.mockRejectedValue(new Error('Access denied'));

      render(
        <Microphone output={output} onError={onError}>
          {() => <div>Test</div>}
        </Microphone>
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Access denied');
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', async () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<MicrophoneHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.gain).toBe(1.0);
          expect(state?.isMuted).toBe(false);
          expect(state?.devices).toHaveLength(3);
          expect(state?.selectedDeviceId).toBe('device-1');
          expect(state?.error).toBeNull();
        };

        return (
          <>
            <Microphone ref={ref} output={output} />
            <button onClick={handleClick}>Get State</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose selectDevice method through ref', async () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<MicrophoneHandle>(null);

        return (
          <>
            <Microphone ref={ref} output={output}>
              {({ selectedDeviceId }) => (
                <div>
                  <span>Selected: {selectedDeviceId}</span>
                  <button onClick={() => ref.current?.selectDevice('device-2')}>
                    Select Device
                  </button>
                </div>
              )}
            </Microphone>
          </>
        );
      };

      const { getByRole, getByText } = render(<TestComponent />);

      await waitFor(() => {
        expect(getByText('Selected: device-1')).toBeInTheDocument();
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Selected: device-2')).toBeInTheDocument();
      });
    });

    it('should expose refreshDevices method through ref', async () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<MicrophoneHandle>(null);

        const handleClick = async () => {
          await ref.current?.refreshDevices();
          const state = ref.current?.getState();
          expect(state?.devices).toBeDefined();
        };

        return (
          <>
            <Microphone ref={ref} output={output} />
            <button onClick={handleClick}>Refresh</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      act(() => {
        getByRole('button').click();
      });
    });
  });

  describe('Audio Context Integration', () => {
    it('should set output ref with correct structure', async () => {
      const output = createMockStreamRef();

      render(<Microphone output={output} />);

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      if (output.current) {
        expect(output.current.audioNode).toBeDefined();
        expect(output.current.gain).toBeDefined();
        expect(output.current.context).toBeDefined();
        expect(output.current.metadata).toEqual({
          label: 'microphone',
          sourceType: 'microphone',
        });
      }
    });

    it('should use custom label in metadata', async () => {
      const output = createMockStreamRef();

      render(<Microphone output={output} label="my-mic" />);

      await waitFor(() => {
        expect(output.current?.metadata?.label).toBe('my-mic');
      });
    });

    it('should update gain node value when gain changes', async () => {
      const output = createMockStreamRef();

      const { getByRole } = render(
        <Microphone output={output}>
          {({ setGain }) => (
            <button onClick={() => setGain(0.5)}>Change Gain</button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      const gainNode = output.current?.gain;

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(gainNode?.gain.value).toBe(0.5);
      });
    });

    it('should set gain to 0 when muted', async () => {
      const output = createMockStreamRef();

      const { getByRole } = render(
        <Microphone output={output}>
          {({ setMuted }) => (
            <button onClick={() => setMuted(true)}>Mute</button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      const gainNode = output.current?.gain;

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(gainNode?.gain.value).toBe(0);
      });
    });

    it('should cleanup on unmount', async () => {
      const output = createMockStreamRef();

      const { unmount } = render(<Microphone output={output} />);

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      const audioNode = output.current?.audioNode;
      const gain = output.current?.gain;
      const mockStream = await mockGetUserMedia.mock.results[0].value;

      unmount();

      if (audioNode && gain) {
        expect(audioNode.disconnect).toHaveBeenCalled();
        expect(gain.disconnect).toHaveBeenCalled();
      }

      // Verify media stream tracks are stopped
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();

      // Verify output ref is cleared
      expect(output.current).toBeNull();
    });

    it('should reconnect when device changes', async () => {
      const output = createMockStreamRef();

      const { getByRole } = render(
        <Microphone output={output}>
          {({ selectDevice }) => (
            <button onClick={() => selectDevice('device-2')}>
              Change Device
            </button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
        expect(mockGetUserMedia).toHaveBeenLastCalledWith({
          audio: { deviceId: { exact: 'device-2' } },
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle gain of 0', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Gain: 0')).toBeInTheDocument();
      });
    });

    it('should handle gain above 1', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output} gain={1.5}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Gain: 1.5')).toBeInTheDocument();
      });
    });

    it('should handle no devices available', async () => {
      mockEnumerateDevices.mockResolvedValue([]);

      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output}>
          {({ devices, selectedDeviceId }) => (
            <div>
              <span>Devices: {devices.length}</span>
              <span>Selected: {selectedDeviceId || 'none'}</span>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Devices: 0')).toBeInTheDocument();
        expect(getByText('Selected: none')).toBeInTheDocument();
      });
    });

    it('should handle devices without labels', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { kind: 'audioinput', deviceId: 'unlabeled-device', label: '' },
      ]);

      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output}>
          {({ devices }) => (
            <div>
              <span>Label: {devices[0]?.label}</span>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText(/Label: Microphone/)).toBeInTheDocument();
      });
    });

    it('should render without children', async () => {
      const output = createMockStreamRef();

      const { container } = render(<Microphone output={output} />);

      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      expect(container.firstChild).toBeNull();
    });

    it('should auto-select first device when none specified', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output}>
          {({ selectedDeviceId }) => (
            <span>Selected: {selectedDeviceId}</span>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Selected: device-1')).toBeInTheDocument();
      });
    });

    it('should use deviceId prop for initial selection', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output} deviceId="device-3">
          {({ selectedDeviceId }) => (
            <span>Selected: {selectedDeviceId}</span>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Selected: device-3')).toBeInTheDocument();
      });
    });

    it('should handle getUserMedia errors gracefully', async () => {
      const output = createMockStreamRef();
      const errorMessage = 'Microphone access denied';
      mockGetUserMedia.mockRejectedValue(new Error(errorMessage));

      const { getByText } = render(
        <Microphone output={output}>
          {({ error }) => (
            <div>
              <span>Error: {error || 'none'}</span>
            </div>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      });
    });

    it('should handle enumerateDevices errors gracefully', async () => {
      mockEnumerateDevices.mockRejectedValue(new Error('Device enumeration failed'));

      const output = createMockStreamRef();
      const { getByText } = render(
        <Microphone output={output}>
          {({ devices }) => (
            <span>Devices: {devices.length}</span>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(getByText('Devices: 0')).toBeInTheDocument();
      });
    });

    it('should stop previous stream when selecting new device', async () => {
      const output = createMockStreamRef();
      const firstStream = new MockMediaStream();
      const secondStream = new MockMediaStream();

      mockGetUserMedia
        .mockResolvedValueOnce(firstStream)
        .mockResolvedValueOnce(secondStream);

      const { getByRole } = render(
        <Microphone output={output}>
          {({ selectDevice }) => (
            <button onClick={() => selectDevice('device-2')}>
              Change Device
            </button>
          )}
        </Microphone>
      );

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
      });

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(firstStream.getTracks()[0].stop).toHaveBeenCalled();
      });
    });
  });
});
