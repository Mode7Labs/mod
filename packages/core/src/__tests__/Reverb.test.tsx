import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Reverb, ReverbHandle } from '../components/processors/Reverb';

describe('Reverb', () => {
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
        <Reverb input={input} output={output}>
          {({ wet, duration, decay }) => (
            <div>
              <span>Wet: {wet}</span>
              <span>Duration: {duration}</span>
              <span>Decay: {decay}</span>
            </div>
          )}
        </Reverb>
      );

      expect(getByText('Wet: 0.3')).toBeInTheDocument();
      expect(getByText('Duration: 2')).toBeInTheDocument();
      expect(getByText('Decay: 2')).toBeInTheDocument();
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
        <Reverb input={input} output={output}>
          {({ wet, setWet }) => (
            <div>
              <span>Wet: {wet}</span>
              <button onClick={() => setWet(0.7)}>Change Wet</button>
            </div>
          )}
        </Reverb>
      );

      const button = getByRole('button', { name: /change wet/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Wet: 0.7')).toBeInTheDocument();
      });
    });

    it('should allow changing duration through render props', async () => {
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
        <Reverb input={input} output={output}>
          {({ duration, setDuration }) => (
            <div>
              <span>Duration: {duration}</span>
              <button onClick={() => setDuration(3.5)}>Change Duration</button>
            </div>
          )}
        </Reverb>
      );

      const button = getByRole('button', { name: /change duration/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Duration: 3.5')).toBeInTheDocument();
      });
    });

    it('should allow changing decay through render props', async () => {
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
        <Reverb input={input} output={output}>
          {({ decay, setDecay }) => (
            <div>
              <span>Decay: {decay}</span>
              <button onClick={() => setDecay(4.0)}>Change Decay</button>
            </div>
          )}
        </Reverb>
      );

      const button = getByRole('button', { name: /change decay/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Decay: 4')).toBeInTheDocument();
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
        <Reverb input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Reverb>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
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
        <Reverb input={input} output={output} wet={0.5}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Reverb>
      );

      expect(getByText('Wet: 0.5')).toBeInTheDocument();
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
        <Reverb
          input={input}
          output={output}
          wet={0.3}
          onWetChange={onWetChange}
        >
          {({ setWet }) => (
            <button onClick={() => setWet(0.8)}>Change</button>
          )}
        </Reverb>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onWetChange).toHaveBeenCalledWith(0.8);
      });
    });

    it('should accept controlled duration prop', () => {
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
        <Reverb input={input} output={output} duration={1.5}>
          {({ duration }) => <span>Duration: {duration}</span>}
        </Reverb>
      );

      expect(getByText('Duration: 1.5')).toBeInTheDocument();
    });

    it('should call onDurationChange when duration changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onDurationChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Reverb
          input={input}
          output={output}
          duration={2.0}
          onDurationChange={onDurationChange}
        >
          {({ setDuration }) => (
            <button onClick={() => setDuration(4.0)}>Change</button>
          )}
        </Reverb>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDurationChange).toHaveBeenCalledWith(4.0);
      });
    });

    it('should accept controlled decay prop', () => {
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
        <Reverb input={input} output={output} decay={3.0}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </Reverb>
      );

      expect(getByText('Decay: 3')).toBeInTheDocument();
    });

    it('should call onDecayChange when decay changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onDecayChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Reverb
          input={input}
          output={output}
          decay={2.0}
          onDecayChange={onDecayChange}
        >
          {({ setDecay }) => (
            <button onClick={() => setDecay(5.0)}>Change</button>
          )}
        </Reverb>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDecayChange).toHaveBeenCalledWith(5.0);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<ReverbHandle>(null);

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
          expect(state?.wet).toBe(0.3);
          expect(state?.duration).toBe(2.0);
          expect(state?.decay).toBe(2.0);
        };

        return (
          <>
            <Reverb ref={ref} input={input} output={output} />
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
        const ref = useRef<ReverbHandle>(null);

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
          expect(state?.wet).toBe(0.6);
          expect(state?.duration).toBe(3.5);
          expect(state?.decay).toBe(4.0);
        };

        return (
          <>
            <Reverb
              ref={ref}
              input={input}
              output={output}
              wet={0.6}
              duration={3.5}
              decay={4.0}
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

      render(<Reverb input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'reverb',
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

      render(<Reverb input={input} output={output} label="my-reverb" />);

      expect(output.current?.metadata?.label).toBe('my-reverb');
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

      const { unmount } = render(<Reverb input={input} output={output} />);

      const convolverNode = output.current?.audioNode;
      const gain = output.current?.gain;
      const stream = output.current as any;
      const wetGain = stream?._wetGain;
      const dryGain = stream?._dryGain;

      expect(convolverNode).toBeDefined();
      expect(gain).toBeDefined();
      expect(wetGain).toBeDefined();
      expect(dryGain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(convolverNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
      expect(wetGain?.disconnect).toHaveBeenCalled();
      expect(dryGain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short duration', () => {
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
        <Reverb input={input} output={output} duration={0.1}>
          {({ duration }) => <span>Duration: {duration}</span>}
        </Reverb>
      );

      expect(getByText('Duration: 0.1')).toBeInTheDocument();
    });

    it('should handle very long duration', () => {
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
        <Reverb input={input} output={output} duration={10.0}>
          {({ duration }) => <span>Duration: {duration}</span>}
        </Reverb>
      );

      expect(getByText('Duration: 10')).toBeInTheDocument();
    });

    it('should handle very low decay', () => {
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
        <Reverb input={input} output={output} decay={0.5}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </Reverb>
      );

      expect(getByText('Decay: 0.5')).toBeInTheDocument();
    });

    it('should handle very high decay', () => {
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
        <Reverb input={input} output={output} decay={10.0}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </Reverb>
      );

      expect(getByText('Decay: 10')).toBeInTheDocument();
    });

    it('should handle fully dry mix (wet = 0)', () => {
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
        <Reverb input={input} output={output} wet={0}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Reverb>
      );

      expect(getByText('Wet: 0')).toBeInTheDocument();
    });

    it('should handle fully wet mix (wet = 1)', () => {
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
        <Reverb input={input} output={output} wet={1}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Reverb>
      );

      expect(getByText('Wet: 1')).toBeInTheDocument();
    });

    it('should handle mid-range wet values', () => {
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
        <Reverb input={input} output={output} wet={0.45}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Reverb>
      );

      expect(getByText('Wet: 0.45')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters simultaneously', async () => {
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
        <Reverb input={input} output={output}>
          {({ wet, duration, decay, setWet, setDuration, setDecay }) => (
            <div>
              <span>Wet: {wet}</span>
              <span>Duration: {duration}</span>
              <span>Decay: {decay}</span>
              <button
                onClick={() => {
                  setWet(0.8);
                  setDuration(5.0);
                  setDecay(6.0);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Reverb>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Wet: 0.8')).toBeInTheDocument();
        expect(getByText('Duration: 5')).toBeInTheDocument();
        expect(getByText('Decay: 6')).toBeInTheDocument();
      });
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

      const { container } = render(<Reverb input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle zero duration', () => {
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
        <Reverb input={input} output={output} duration={0}>
          {({ duration }) => <span>Duration: {duration}</span>}
        </Reverb>
      );

      expect(getByText('Duration: 0')).toBeInTheDocument();
    });

    it('should handle zero decay', () => {
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
        <Reverb input={input} output={output} decay={0}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </Reverb>
      );

      expect(getByText('Decay: 0')).toBeInTheDocument();
    });
  });
});
