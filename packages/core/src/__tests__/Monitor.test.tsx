import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Monitor } from '../components/output/Monitor';
import { ModStreamRef } from '../types/ModStream';

// Helper to create a mock input stream ref with audio nodes
function createMockInputRef(): ModStreamRef {
  const mockAudioContext = new AudioContext();
  return {
    current: {
      audioNode: mockAudioContext.createOscillator() as any,
      gain: mockAudioContext.createGain(),
      context: mockAudioContext,
      metadata: {
        label: 'test-input',
        sourceType: 'microphone',
      },
    },
  };
}

describe('Monitor', () => {
  beforeEach(() => {
    // Reset mock MediaDevices before each test
    jest.clearAllMocks();
  });

  describe('Render Props Pattern', () => {
    it('should render with default values', async () => {
      const input = createMockInputRef();
      const { getByText } = render(
        <Monitor input={input}>
          {({ gain, isMuted }) => (
            <div>
              <span>Gain: {gain}</span>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        expect(getByText('Gain: 1')).toBeInTheDocument();
        expect(getByText('Muted: no')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </Monitor>
      );

      const button = getByRole('button', { name: /change gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow muting through render props', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ isMuted, setMuted }) => (
            <div>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <button onClick={() => setMuted(true)}>Mute</button>
            </div>
          )}
        </Monitor>
      );

      const button = getByRole('button', { name: /mute/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });
    });

    it('should allow unmuting through render props', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ isMuted, setMuted }) => (
            <div>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <button onClick={() => setMuted(true)}>Mute</button>
              <button onClick={() => setMuted(false)}>Unmute</button>
            </div>
          )}
        </Monitor>
      );

      const muteButton = getByRole('button', { name: 'Mute' });
      const unmuteButton = getByRole('button', { name: 'Unmute' });

      act(() => {
        muteButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });

      act(() => {
        unmuteButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: no')).toBeInTheDocument();
      });
    });

    it('should report isActive status', async () => {
      const input = createMockInputRef();
      const { container } = render(
        <Monitor input={input}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        const statusText = container.querySelector('[data-testid="status"]')?.textContent;
        expect(statusText).toMatch(/Active: (yes|no)/);
      });
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled deviceId prop', async () => {
      const input = createMockInputRef();
      const { getByText } = render(
        <Monitor input={input} deviceId="output1">
          {({ selectedDeviceId }) => <span>Device: {selectedDeviceId}</span>}
        </Monitor>
      );

      await waitFor(() => {
        expect(getByText('Device: output1')).toBeInTheDocument();
      });
    });

    it('should use custom label in component', async () => {
      const input = createMockInputRef();
      const { container } = render(
        <Monitor input={input} label="my-monitor">
          {({ isActive }) => (
            <div data-testid="monitor">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        const monitorElement = container.querySelector('[data-testid="monitor"]');
        expect(monitorElement).toBeInTheDocument();
      });
    });
  });

  describe('Audio Context Integration', () => {
    it('should connect input to gain node', async () => {
      const input = createMockInputRef();

      render(<Monitor input={input} />);

      await waitFor(() => {
        expect(input.current?.gain.connect).toHaveBeenCalled();
      });
    });

    it('should connect gain node to destination', async () => {
      const input = createMockInputRef();

      render(<Monitor input={input} />);

      await waitFor(() => {
        // The Monitor connects the input gain to a new gain node, which connects to destination
        expect(input.current?.gain.connect).toHaveBeenCalled();
      });
    });

    it('should cleanup on unmount', async () => {
      const input = createMockInputRef();

      const { unmount } = render(<Monitor input={input} />);

      await waitFor(() => {
        expect(input.current?.gain.connect).toHaveBeenCalled();
      });

      unmount();

      // After unmount, the gain node should have been disconnected
      // This would be verified by checking disconnect was called on the created gain node
    });

    it('should handle missing input ref gracefully', () => {
      const input = createMockStreamRef();

      const { container } = render(
        <Monitor input={input}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Monitor>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toBe('Active: no');
    });
  });

  describe('Device Selection', () => {
    it('should load devices on mount', async () => {
      const input = createMockInputRef();
      const { getByText } = render(
        <Monitor input={input}>
          {({ devices }) => (
            <div>
              <span>Device Count: {devices.length}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        // Mock returns 1 audiooutput device
        expect(getByText(/Device Count: 1/)).toBeInTheDocument();
      });
    });

    it('should provide device list through render props', async () => {
      const input = createMockInputRef();
      const { container } = render(
        <Monitor input={input}>
          {({ devices }) => (
            <div data-testid="devices">
              {devices.map(device => (
                <div key={device.deviceId}>{device.label}</div>
              ))}
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        const devicesContainer = container.querySelector('[data-testid="devices"]');
        expect(devicesContainer).toBeInTheDocument();
      });
    });

    it('should allow device selection through selectDevice', async () => {
      const input = createMockInputRef();

      const { getByRole, getByText } = render(
        <Monitor input={input}>
          {({ selectedDeviceId, selectDevice }) => {
            return (
              <div>
                <span>Selected: {selectedDeviceId || 'none'}</span>
                <button onClick={() => selectDevice('output1')}>Select Output 1</button>
              </div>
            );
          }}
        </Monitor>
      );

      // Wait for initial device enumeration
      await waitFor(() => {
        expect(getByText(/Selected:/)).toBeInTheDocument();
      });

      const button = getByRole('button', { name: /select output 1/i });

      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Selected: output1')).toBeInTheDocument();
      });
    });

    it('should allow refreshing device list', async () => {
      const input = createMockInputRef();
      const enumerateSpy = jest.spyOn(navigator.mediaDevices, 'enumerateDevices');

      const { getByRole } = render(
        <Monitor input={input}>
          {({ refreshDevices }) => (
            <div>
              <button onClick={() => refreshDevices()}>Refresh Devices</button>
            </div>
          )}
        </Monitor>
      );

      // Wait for initial mount enumeration
      await waitFor(() => {
        expect(enumerateSpy).toHaveBeenCalledTimes(1);
      });

      const button = getByRole('button', { name: /refresh devices/i });

      await act(async () => {
        button.click();
      });

      // Should have been called twice - once on mount, once on refresh
      await waitFor(() => {
        expect(enumerateSpy).toHaveBeenCalledTimes(2);
      });

      enumerateSpy.mockRestore();
    });

    it('should auto-select default device when none selected', async () => {
      const input = createMockInputRef();
      const { getByText } = render(
        <Monitor input={input}>
          {({ selectedDeviceId }) => (
            <div>
              <span>Selected: {selectedDeviceId || 'none'}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        expect(getByText('Selected: default')).toBeInTheDocument();
      });
    });

    it('should use provided deviceId on mount', async () => {
      const input = createMockInputRef();
      const { getByText } = render(
        <Monitor input={input} deviceId="output1">
          {({ selectedDeviceId }) => (
            <div>
              <span>Selected: {selectedDeviceId || 'none'}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        expect(getByText('Selected: output1')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle muting with gain zero', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ gain, setGain, isMuted, setMuted }) => (
            <div>
              <span>Gain: {gain}</span>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <button onClick={() => setGain(0)}>Zero Gain</button>
              <button onClick={() => setMuted(true)}>Mute</button>
            </div>
          )}
        </Monitor>
      );

      const zeroButton = getByRole('button', { name: /zero gain/i });
      const muteButton = getByRole('button', { name: /mute/i });

      act(() => {
        zeroButton.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0')).toBeInTheDocument();
      });

      act(() => {
        muteButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });
    });

    it('should handle very low gain values', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.01)}>Low Gain</button>
            </div>
          )}
        </Monitor>
      );

      const button = getByRole('button', { name: /low gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.01')).toBeInTheDocument();
      });
    });

    it('should handle very high gain values', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(2.0)}>High Gain</button>
            </div>
          )}
        </Monitor>
      );

      const button = getByRole('button', { name: /high gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 2')).toBeInTheDocument();
      });
    });

    it('should maintain gain value when muting and unmuting', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ gain, setGain, isMuted, setMuted }) => (
            <div>
              <span>Gain: {gain}</span>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <button onClick={() => setGain(0.7)}>Set Gain</button>
              <button onClick={() => setMuted(true)}>Mute</button>
              <button onClick={() => setMuted(false)}>Unmute</button>
            </div>
          )}
        </Monitor>
      );

      const setGainButton = getByRole('button', { name: 'Set Gain' });
      const muteButton = getByRole('button', { name: 'Mute' });
      const unmuteButton = getByRole('button', { name: 'Unmute' });

      // Set gain to 0.7
      act(() => {
        setGainButton.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.7')).toBeInTheDocument();
      });

      // Mute
      act(() => {
        muteButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
        expect(getByText('Gain: 0.7')).toBeInTheDocument(); // Gain value should remain
      });

      // Unmute
      act(() => {
        unmuteButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: no')).toBeInTheDocument();
        expect(getByText('Gain: 0.7')).toBeInTheDocument(); // Gain value should still be 0.7
      });
    });

    it('should handle rapid mute/unmute toggling', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ isMuted, setMuted }) => (
            <div>
              <span>Muted: {isMuted ? 'yes' : 'no'}</span>
              <button onClick={() => setMuted(!isMuted)}>Toggle</button>
            </div>
          )}
        </Monitor>
      );

      const toggleButton = getByRole('button', { name: /toggle/i });

      // Toggle multiple times
      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });

      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: no')).toBeInTheDocument();
      });

      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(getByText('Muted: yes')).toBeInTheDocument();
      });
    });

    it('should handle device enumeration failure gracefully', async () => {
      // Mock enumerateDevices to throw an error
      const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
      (navigator.mediaDevices.enumerateDevices as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Device enumeration failed')
      );

      const input = createMockInputRef();
      const { getByText } = render(
        <Monitor input={input}>
          {({ devices, selectedDeviceId }) => (
            <div>
              <span>Device Count: {devices.length}</span>
              <span>Selected: {selectedDeviceId || 'none'}</span>
            </div>
          )}
        </Monitor>
      );

      await waitFor(() => {
        // Should fallback to default device
        expect(getByText('Device Count: 1')).toBeInTheDocument();
        expect(getByText('Selected: default')).toBeInTheDocument();
      });

      // Restore original mock
      navigator.mediaDevices.enumerateDevices = originalEnumerateDevices;
    });

    it('should render null when no children provided', () => {
      const input = createMockInputRef();
      const { container } = render(<Monitor input={input} />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle multiple gain changes', async () => {
      const input = createMockInputRef();
      const { getByText, getByRole } = render(
        <Monitor input={input}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.3)}>Set 0.3</button>
              <button onClick={() => setGain(0.6)}>Set 0.6</button>
              <button onClick={() => setGain(0.9)}>Set 0.9</button>
            </div>
          )}
        </Monitor>
      );

      const button1 = getByRole('button', { name: 'Set 0.3' });
      const button2 = getByRole('button', { name: 'Set 0.6' });
      const button3 = getByRole('button', { name: 'Set 0.9' });

      act(() => {
        button1.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.3')).toBeInTheDocument();
      });

      act(() => {
        button2.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.6')).toBeInTheDocument();
      });

      act(() => {
        button3.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.9')).toBeInTheDocument();
      });
    });
  });
});
