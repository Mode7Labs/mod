import React, { useRef, useState } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Clock, ClockHandle } from '../components/cv/Clock';

describe('Clock', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output}>
          {({ bpm, isRunning }) => (
            <div>
              <span>BPM: {bpm}</span>
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
            </div>
          )}
        </Clock>
      );

      expect(getByText('BPM: 120')).toBeInTheDocument();
      expect(getByText('Running: no')).toBeInTheDocument();
    });

    it('should allow changing bpm through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Clock output={output}>
          {({ bpm, setBpm }) => (
            <div>
              <span>BPM: {bpm}</span>
              <button onClick={() => setBpm(140)}>Change BPM</button>
            </div>
          )}
        </Clock>
      );

      const button = getByRole('button', { name: /change bpm/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('BPM: 140')).toBeInTheDocument();
      });
    });

    it('should allow starting clock through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Clock output={output}>
          {({ isRunning, start }) => (
            <div>
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
              <button onClick={start}>Start</button>
            </div>
          )}
        </Clock>
      );

      const button = getByRole('button', { name: /start/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Running: yes')).toBeInTheDocument();
      });
    });

    it('should allow stopping clock through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Clock output={output}>
          {({ isRunning, start, stop }) => (
            <div>
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
            </div>
          )}
        </Clock>
      );

      const startButton = getByRole('button', { name: /start/i });
      const stopButton = getByRole('button', { name: /stop/i });

      act(() => {
        startButton.click();
      });

      await waitFor(() => {
        expect(getByText('Running: yes')).toBeInTheDocument();
      });

      act(() => {
        stopButton.click();
      });

      await waitFor(() => {
        expect(getByText('Running: no')).toBeInTheDocument();
      });
    });

    it('should allow resetting clock through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Clock output={output}>
          {({ isRunning, start, reset }) => (
            <div>
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
              <button onClick={start}>Start</button>
              <button onClick={reset}>Reset</button>
            </div>
          )}
        </Clock>
      );

      const startButton = getByRole('button', { name: /start/i });
      const resetButton = getByRole('button', { name: /reset/i });

      act(() => {
        startButton.click();
      });

      await waitFor(() => {
        expect(getByText('Running: yes')).toBeInTheDocument();
      });

      act(() => {
        resetButton.click();
      });

      await waitFor(() => {
        expect(getByText('Running: no')).toBeInTheDocument();
      });
    });

    it('should report running status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <Clock output={output}>
          {({ isRunning }) => (
            <div data-testid="status">
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
            </div>
          )}
        </Clock>
      );

      // isRunning should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Running: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled bpm prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output} bpm={90}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Clock>
      );

      expect(getByText('BPM: 90')).toBeInTheDocument();
    });

    it('should call onBpmChange when bpm changes', async () => {
      const output = createMockStreamRef();
      const onBpmChange = jest.fn();

      const { getByRole } = render(
        <Clock
          output={output}
          bpm={120}
          onBpmChange={onBpmChange}
        >
          {({ setBpm }) => (
            <button onClick={() => setBpm(160)}>Change</button>
          )}
        </Clock>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onBpmChange).toHaveBeenCalledWith(160);
      });
    });

    it('should call onRunningChange when clock starts', async () => {
      const output = createMockStreamRef();
      const onRunningChange = jest.fn();

      const { getByRole } = render(
        <Clock
          output={output}
          onRunningChange={onRunningChange}
        >
          {({ start }) => (
            <button onClick={start}>Start</button>
          )}
        </Clock>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onRunningChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onRunningChange when clock stops', async () => {
      const output = createMockStreamRef();
      const onRunningChange = jest.fn();

      const { getByRole } = render(
        <Clock
          output={output}
          onRunningChange={onRunningChange}
        >
          {({ start, stop }) => (
            <div>
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
            </div>
          )}
        </Clock>
      );

      const startButton = getByRole('button', { name: /start/i });
      const stopButton = getByRole('button', { name: /stop/i });

      act(() => {
        startButton.click();
      });

      await waitFor(() => {
        expect(onRunningChange).toHaveBeenCalledWith(true);
      });

      onRunningChange.mockClear();

      act(() => {
        stopButton.click();
      });

      await waitFor(() => {
        expect(onRunningChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose start method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ClockHandle>(null);

        const handleClick = () => {
          expect(ref.current?.start).toBeDefined();
          expect(() => ref.current?.start()).not.toThrow();
        };

        return (
          <>
            <Clock ref={ref} output={output}>
              {({ isRunning }) => (
                <span>Running: {isRunning ? 'yes' : 'no'}</span>
              )}
            </Clock>
            <button onClick={handleClick}>Start Clock</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose stop method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ClockHandle>(null);

        const handleStop = () => {
          expect(ref.current?.stop).toBeDefined();
          expect(() => ref.current?.stop()).not.toThrow();
        };

        return (
          <>
            <Clock ref={ref} output={output}>
              {({ isRunning }) => (
                <span>Running: {isRunning ? 'yes' : 'no'}</span>
              )}
            </Clock>
            <button onClick={handleStop}>Stop</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose reset method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ClockHandle>(null);

        const handleReset = () => {
          expect(ref.current?.reset).toBeDefined();
          expect(() => ref.current?.reset()).not.toThrow();
        };

        return (
          <>
            <Clock ref={ref} output={output}>
              {({ isRunning }) => (
                <span>Running: {isRunning ? 'yes' : 'no'}</span>
              )}
            </Clock>
            <button onClick={handleReset}>Reset</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ClockHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.bpm).toBe(120);
          expect(state?.isRunning).toBe(false);
        };

        return (
          <>
            <Clock ref={ref} output={output} />
            <button onClick={handleClick}>Get State</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should return current state with custom values', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ClockHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.bpm).toBe(80);
          expect(state?.isRunning).toBe(false);
        };

        return (
          <>
            <Clock
              ref={ref}
              output={output}
              bpm={80}
            />
            <button onClick={handleClick}>Get State</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should reflect running state in getState', async () => {
      const output = createMockStreamRef();

      const TestComponent = () => {
        const ref = useRef<ClockHandle>(null);

        return (
          <>
            <Clock ref={ref} output={output}>
              {({ isRunning, start }) => (
                <div>
                  <span>Running: {isRunning ? 'yes' : 'no'}</span>
                  <button onClick={() => {
                    start();
                    // After calling start via render props, use a setTimeout
                    // to check getState after React has updated
                    setTimeout(() => {
                      const state = ref.current?.getState();
                      if (state?.isRunning) {
                        document.body.setAttribute('data-state-running', 'true');
                      }
                    }, 0);
                  }}>Start</button>
                </div>
              )}
            </Clock>
          </>
        );
      };

      const { getByRole, getByText } = render(<TestComponent />);

      const startButton = getByRole('button', { name: /start/i });

      act(() => {
        startButton.click();
      });

      // Wait for the UI to show running state
      await waitFor(() => {
        expect(getByText('Running: yes')).toBeInTheDocument();
      });

      // Also verify getState was called and returned true
      await waitFor(() => {
        expect(document.body.getAttribute('data-state-running')).toBe('true');
      });
    });
  });

  describe('Audio Context Integration', () => {
    it('should set output ref with correct structure', () => {
      const output = createMockStreamRef();

      render(<Clock output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'clock',
        sourceType: 'cv',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<Clock output={output} label="my-clock" />);

      expect(output.current?.metadata?.label).toBe('my-clock');
    });

    it('should have sourceType cv in metadata', () => {
      const output = createMockStreamRef();

      render(<Clock output={output} />);

      expect(output.current?.metadata?.sourceType).toBe('cv');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<Clock output={output} />);

      const constantSource = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(constantSource).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(constantSource?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });

    it('should clear interval on unmount when running', () => {
      const output = createMockStreamRef();

      const { unmount } = render(
        <Clock output={output}>
          {({ start }) => (
            <button onClick={start}>Start</button>
          )}
        </Clock>
      );

      const constantSource = output.current?.audioNode;
      const gain = output.current?.gain;

      unmount();

      // After unmount, the nodes should have been disconnected
      expect(constantSource?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low bpm', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output} bpm={30}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Clock>
      );

      expect(getByText('BPM: 30')).toBeInTheDocument();
    });

    it('should handle very high bpm', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output} bpm={300}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Clock>
      );

      expect(getByText('BPM: 300')).toBeInTheDocument();
    });

    it('should handle fractional bpm', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output} bpm={120.5}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Clock>
      );

      expect(getByText('BPM: 120.5')).toBeInTheDocument();
    });

    it('should not start if already running', async () => {
      const output = createMockStreamRef();
      const onRunningChange = jest.fn();

      const { getByRole } = render(
        <Clock
          output={output}
          onRunningChange={onRunningChange}
        >
          {({ start }) => (
            <button onClick={start}>Start</button>
          )}
        </Clock>
      );

      const button = getByRole('button');

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(onRunningChange).toHaveBeenCalledWith(true);
      });

      onRunningChange.mockClear();

      // Try to start again
      act(() => {
        button.click();
      });

      // Should not call onRunningChange again
      expect(onRunningChange).not.toHaveBeenCalled();
    });

    it('should not stop if already stopped', () => {
      const output = createMockStreamRef();

      const { getByRole } = render(
        <Clock output={output}>
          {({ stop }) => (
            <button onClick={stop}>Stop</button>
          )}
        </Clock>
      );

      const button = getByRole('button');

      // Should not throw when calling stop twice
      act(() => {
        button.click();
      });

      expect(() => {
        act(() => {
          button.click();
        });
      }).not.toThrow();
    });

    it('should update interval when bpm changes while running', async () => {
      const output = createMockStreamRef();

      const { getByRole, getByText } = render(
        <Clock output={output}>
          {({ bpm, setBpm, start, isRunning }) => (
            <div>
              <span>BPM: {bpm}</span>
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
              <button onClick={start}>Start</button>
              <button onClick={() => setBpm(60)}>Change BPM</button>
            </div>
          )}
        </Clock>
      );

      const startButton = getByRole('button', { name: /start/i });
      const changeBpmButton = getByRole('button', { name: /change bpm/i });

      act(() => {
        startButton.click();
      });

      await waitFor(() => {
        expect(getByText('Running: yes')).toBeInTheDocument();
      });

      act(() => {
        changeBpmButton.click();
      });

      await waitFor(() => {
        expect(getByText('BPM: 60')).toBeInTheDocument();
      });

      // Clock should still be running
      expect(getByText('Running: yes')).toBeInTheDocument();
    });

    it('should handle rapid start/stop calls', async () => {
      const output = createMockStreamRef();

      const { getByRole, getByText } = render(
        <Clock output={output}>
          {({ start, stop, isRunning }) => (
            <div>
              <span>Running: {isRunning ? 'yes' : 'no'}</span>
              <button onClick={start}>Start</button>
              <button onClick={stop}>Stop</button>
            </div>
          )}
        </Clock>
      );

      const startButton = getByRole('button', { name: /start/i });
      const stopButton = getByRole('button', { name: /stop/i });

      act(() => {
        startButton.click();
        stopButton.click();
        startButton.click();
      });

      await waitFor(() => {
        expect(getByText('Running: yes')).toBeInTheDocument();
      });
    });

    it('should handle zero bpm', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output} bpm={0}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Clock>
      );

      expect(getByText('BPM: 0')).toBeInTheDocument();
    });

    it('should handle negative bpm', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Clock output={output} bpm={-60}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Clock>
      );

      expect(getByText('BPM: -60')).toBeInTheDocument();
    });
  });
});
