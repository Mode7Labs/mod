import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { RingModulator, RingModulatorHandle } from '../components/processors/RingModulator';

describe('RingModulator', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      // Set up input with required audio context structure
      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output}>
          {({ frequency, wet }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <span>Wet: {wet}</span>
            </div>
          )}
        </RingModulator>
      );

      expect(getByText('Frequency: 440')).toBeInTheDocument();
      expect(getByText('Wet: 0.5')).toBeInTheDocument();
    });

    it('should allow changing frequency through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText, getByRole } = render(
        <RingModulator input={input} output={output}>
          {({ frequency, setFrequency }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <button onClick={() => setFrequency(880)}>Change Frequency</button>
            </div>
          )}
        </RingModulator>
      );

      const button = getByRole('button', { name: /change frequency/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 880')).toBeInTheDocument();
      });
    });

    it('should allow changing wet through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText, getByRole } = render(
        <RingModulator input={input} output={output}>
          {({ wet, setWet }) => (
            <div>
              <span>Wet: {wet}</span>
              <button onClick={() => setWet(0.8)}>Change Wet</button>
            </div>
          )}
        </RingModulator>
      );

      const button = getByRole('button', { name: /change wet/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Wet: 0.8')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { container } = render(
        <RingModulator input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </RingModulator>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled frequency prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} frequency={220}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </RingModulator>
      );

      expect(getByText('Frequency: 220')).toBeInTheDocument();
    });

    it('should accept controlled wet prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} wet={0.75}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </RingModulator>
      );

      expect(getByText('Wet: 0.75')).toBeInTheDocument();
    });

    it('should call onFrequencyChange when frequency changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onFrequencyChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <RingModulator
          input={input}
          output={output}
          frequency={440}
          onFrequencyChange={onFrequencyChange}
        >
          {({ setFrequency }) => (
            <button onClick={() => setFrequency(1000)}>Change</button>
          )}
        </RingModulator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFrequencyChange).toHaveBeenCalledWith(1000);
      });
    });

    it('should call onWetChange when wet changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onWetChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <RingModulator
          input={input}
          output={output}
          wet={0.5}
          onWetChange={onWetChange}
        >
          {({ setWet }) => (
            <button onClick={() => setWet(0.9)}>Change</button>
          )}
        </RingModulator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onWetChange).toHaveBeenCalledWith(0.9);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<RingModulatorHandle>(null);

        input.current = {
          audioNode: {} as any,
          gain: {
            connect: jest.fn(),
            disconnect: jest.fn(),
          } as any,
          context: {} as any,
        };

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.frequency).toBe(440);
          expect(state?.wet).toBe(0.5);
        };

        return (
          <>
            <RingModulator ref={ref} input={input} output={output} />
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
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<RingModulatorHandle>(null);

        input.current = {
          audioNode: {} as any,
          gain: {
            connect: jest.fn(),
            disconnect: jest.fn(),
          } as any,
          context: {} as any,
        };

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.frequency).toBe(880);
          expect(state?.wet).toBe(0.75);
        };

        return (
          <>
            <RingModulator
              ref={ref}
              input={input}
              output={output}
              frequency={880}
              wet={0.75}
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
  });

  describe('Audio Context Integration', () => {
    it('should set output ref with correct structure', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      render(<RingModulator input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'ringmod',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      render(<RingModulator input={input} output={output} label="my-ringmod" />);

      expect(output.current?.metadata?.label).toBe('my-ringmod');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { unmount } = render(<RingModulator input={input} output={output} />);

      const dryGain = output.current?.audioNode;
      const outputGain = output.current?.gain;

      expect(dryGain).toBeDefined();
      expect(outputGain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(dryGain?.disconnect).toHaveBeenCalled();
      expect(outputGain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low frequency', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} frequency={20}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </RingModulator>
      );

      expect(getByText('Frequency: 20')).toBeInTheDocument();
    });

    it('should handle very high frequency', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} frequency={20000}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </RingModulator>
      );

      expect(getByText('Frequency: 20000')).toBeInTheDocument();
    });

    it('should handle zero wet (fully dry)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} wet={0}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </RingModulator>
      );

      expect(getByText('Wet: 0')).toBeInTheDocument();
    });

    it('should handle full wet (no dry)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} wet={1}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </RingModulator>
      );

      expect(getByText('Wet: 1')).toBeInTheDocument();
    });

    it('should handle changing frequency multiple times', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText, getByRole } = render(
        <RingModulator input={input} output={output}>
          {({ frequency, setFrequency }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <button onClick={() => setFrequency(100)}>Low</button>
              <button onClick={() => setFrequency(440)}>Medium</button>
              <button onClick={() => setFrequency(2000)}>High</button>
            </div>
          )}
        </RingModulator>
      );

      const lowButton = getByRole('button', { name: /low/i });
      const mediumButton = getByRole('button', { name: /medium/i });
      const highButton = getByRole('button', { name: /high/i });

      act(() => {
        lowButton.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 100')).toBeInTheDocument();
      });

      act(() => {
        highButton.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 2000')).toBeInTheDocument();
      });

      act(() => {
        mediumButton.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 440')).toBeInTheDocument();
      });
    });

    it('should handle changing wet multiple times', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText, getByRole } = render(
        <RingModulator input={input} output={output}>
          {({ wet, setWet }) => (
            <div>
              <span>Wet: {wet}</span>
              <button onClick={() => setWet(0.2)}>Low</button>
              <button onClick={() => setWet(0.5)}>Medium</button>
              <button onClick={() => setWet(0.9)}>High</button>
            </div>
          )}
        </RingModulator>
      );

      const lowButton = getByRole('button', { name: /low/i });
      const mediumButton = getByRole('button', { name: /medium/i });
      const highButton = getByRole('button', { name: /high/i });

      act(() => {
        lowButton.click();
      });

      await waitFor(() => {
        expect(getByText('Wet: 0.2')).toBeInTheDocument();
      });

      act(() => {
        highButton.click();
      });

      await waitFor(() => {
        expect(getByText('Wet: 0.9')).toBeInTheDocument();
      });

      act(() => {
        mediumButton.click();
      });

      await waitFor(() => {
        expect(getByText('Wet: 0.5')).toBeInTheDocument();
      });
    });

    it('should handle fractional frequency values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} frequency={440.5}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </RingModulator>
      );

      expect(getByText('Frequency: 440.5')).toBeInTheDocument();
    });

    it('should handle fractional wet values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} wet={0.333}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </RingModulator>
      );

      expect(getByText('Wet: 0.333')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { container } = render(<RingModulator input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle extreme frequency values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} frequency={0.1}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </RingModulator>
      );

      expect(getByText('Frequency: 0.1')).toBeInTheDocument();
    });

    it('should handle wet values above 1', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} wet={1.5}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </RingModulator>
      );

      expect(getByText('Wet: 1.5')).toBeInTheDocument();
    });

    it('should handle negative wet values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByText } = render(
        <RingModulator input={input} output={output} wet={-0.1}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </RingModulator>
      );

      expect(getByText('Wet: -0.1')).toBeInTheDocument();
    });
  });
});
