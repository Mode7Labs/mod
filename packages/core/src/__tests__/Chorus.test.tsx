import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Chorus, ChorusHandle } from '../components/processors/Chorus';

describe('Chorus', () => {
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
        <Chorus input={input} output={output}>
          {({ rate, depth, delay, wet }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Delay: {delay}</span>
              <span>Wet: {wet}</span>
            </div>
          )}
        </Chorus>
      );

      expect(getByText('Rate: 1.5')).toBeInTheDocument();
      expect(getByText('Depth: 0.002')).toBeInTheDocument();
      expect(getByText('Delay: 0.02')).toBeInTheDocument();
      expect(getByText('Wet: 0.5')).toBeInTheDocument();
    });

    it('should allow changing rate through render props', async () => {
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
        <Chorus input={input} output={output}>
          {({ rate, setRate }) => (
            <div>
              <span>Rate: {rate}</span>
              <button onClick={() => setRate(2.5)}>Change Rate</button>
            </div>
          )}
        </Chorus>
      );

      const button = getByRole('button', { name: /change rate/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 2.5')).toBeInTheDocument();
      });
    });

    it('should allow changing depth through render props', async () => {
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
        <Chorus input={input} output={output}>
          {({ depth, setDepth }) => (
            <div>
              <span>Depth: {depth}</span>
              <button onClick={() => setDepth(0.005)}>Change Depth</button>
            </div>
          )}
        </Chorus>
      );

      const button = getByRole('button', { name: /change depth/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Depth: 0.005')).toBeInTheDocument();
      });
    });

    it('should allow changing delay through render props', async () => {
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
        <Chorus input={input} output={output}>
          {({ delay, setDelay }) => (
            <div>
              <span>Delay: {delay}</span>
              <button onClick={() => setDelay(0.04)}>Change Delay</button>
            </div>
          )}
        </Chorus>
      );

      const button = getByRole('button', { name: /change delay/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Delay: 0.04')).toBeInTheDocument();
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
        <Chorus input={input} output={output}>
          {({ wet, setWet }) => (
            <div>
              <span>Wet: {wet}</span>
              <button onClick={() => setWet(0.8)}>Change Wet</button>
            </div>
          )}
        </Chorus>
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
        <Chorus input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Chorus>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled rate prop', () => {
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
        <Chorus input={input} output={output} rate={2.0}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Chorus>
      );

      expect(getByText('Rate: 2')).toBeInTheDocument();
    });

    it('should call onRateChange when rate changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onRateChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Chorus
          input={input}
          output={output}
          rate={1.5}
          onRateChange={onRateChange}
        >
          {({ setRate }) => (
            <button onClick={() => setRate(3.0)}>Change</button>
          )}
        </Chorus>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onRateChange).toHaveBeenCalledWith(3.0);
      });
    });

    it('should accept controlled depth prop', () => {
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
        <Chorus input={input} output={output} depth={0.003}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Chorus>
      );

      expect(getByText('Depth: 0.003')).toBeInTheDocument();
    });

    it('should call onDepthChange when depth changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onDepthChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Chorus
          input={input}
          output={output}
          depth={0.002}
          onDepthChange={onDepthChange}
        >
          {({ setDepth }) => (
            <button onClick={() => setDepth(0.01)}>Change</button>
          )}
        </Chorus>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDepthChange).toHaveBeenCalledWith(0.01);
      });
    });

    it('should accept controlled delay prop', () => {
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
        <Chorus input={input} output={output} delay={0.03}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Chorus>
      );

      expect(getByText('Delay: 0.03')).toBeInTheDocument();
    });

    it('should call onDelayChange when delay changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onDelayChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Chorus
          input={input}
          output={output}
          delay={0.02}
          onDelayChange={onDelayChange}
        >
          {({ setDelay }) => (
            <button onClick={() => setDelay(0.05)}>Change</button>
          )}
        </Chorus>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDelayChange).toHaveBeenCalledWith(0.05);
      });
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
        <Chorus input={input} output={output} wet={0.75}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Chorus>
      );

      expect(getByText('Wet: 0.75')).toBeInTheDocument();
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
        <Chorus
          input={input}
          output={output}
          wet={0.5}
          onWetChange={onWetChange}
        >
          {({ setWet }) => (
            <button onClick={() => setWet(0.3)}>Change</button>
          )}
        </Chorus>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onWetChange).toHaveBeenCalledWith(0.3);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<ChorusHandle>(null);

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
          expect(state?.rate).toBe(1.5);
          expect(state?.depth).toBe(0.002);
          expect(state?.delay).toBe(0.02);
          expect(state?.wet).toBe(0.5);
        };

        return (
          <>
            <Chorus ref={ref} input={input} output={output} />
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
        const ref = useRef<ChorusHandle>(null);

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
          expect(state?.rate).toBe(2.5);
          expect(state?.depth).toBe(0.004);
          expect(state?.delay).toBe(0.035);
          expect(state?.wet).toBe(0.7);
        };

        return (
          <>
            <Chorus
              ref={ref}
              input={input}
              output={output}
              rate={2.5}
              depth={0.004}
              delay={0.035}
              wet={0.7}
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

      render(<Chorus input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'chorus',
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

      render(<Chorus input={input} output={output} label="my-chorus" />);

      expect(output.current?.metadata?.label).toBe('my-chorus');
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

      const { unmount } = render(<Chorus input={input} output={output} />);

      const chorusNode = output.current?.audioNode;
      const gain = output.current?.gain;
      const stream = output.current as any;
      const dryGain = stream?._dryGain;
      const wetGain = stream?._wetGain;
      const delayNode = stream?._delayNode;
      const lfo = stream?._lfo;
      const lfoGain = stream?._lfoGain;

      expect(chorusNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(chorusNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low rate values', () => {
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
        <Chorus input={input} output={output} rate={0.1}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Chorus>
      );

      expect(getByText('Rate: 0.1')).toBeInTheDocument();
    });

    it('should handle very high rate values', () => {
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
        <Chorus input={input} output={output} rate={10}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Chorus>
      );

      expect(getByText('Rate: 10')).toBeInTheDocument();
    });

    it('should handle very small depth values', () => {
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
        <Chorus input={input} output={output} depth={0.0001}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Chorus>
      );

      expect(getByText('Depth: 0.0001')).toBeInTheDocument();
    });

    it('should handle large depth values', () => {
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
        <Chorus input={input} output={output} depth={0.02}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Chorus>
      );

      expect(getByText('Depth: 0.02')).toBeInTheDocument();
    });

    it('should handle very small delay values', () => {
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
        <Chorus input={input} output={output} delay={0.001}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Chorus>
      );

      expect(getByText('Delay: 0.001')).toBeInTheDocument();
    });

    it('should handle large delay values', () => {
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
        <Chorus input={input} output={output} delay={0.5}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Chorus>
      );

      expect(getByText('Delay: 0.5')).toBeInTheDocument();
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
        <Chorus input={input} output={output} wet={0}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Chorus>
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
        <Chorus input={input} output={output} wet={1}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Chorus>
      );

      expect(getByText('Wet: 1')).toBeInTheDocument();
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
        <Chorus input={input} output={output}>
          {({
            rate,
            depth,
            delay,
            wet,
            setRate,
            setDepth,
            setDelay,
            setWet,
          }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Delay: {delay}</span>
              <span>Wet: {wet}</span>
              <button
                onClick={() => {
                  setRate(3.0);
                  setDepth(0.005);
                  setDelay(0.04);
                  setWet(0.9);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Chorus>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 3')).toBeInTheDocument();
        expect(getByText('Depth: 0.005')).toBeInTheDocument();
        expect(getByText('Delay: 0.04')).toBeInTheDocument();
        expect(getByText('Wet: 0.9')).toBeInTheDocument();
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

      const { container } = render(<Chorus input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
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
        <Chorus input={input} output={output} wet={1.2}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Chorus>
      );

      expect(getByText('Wet: 1.2')).toBeInTheDocument();
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
        <Chorus input={input} output={output} wet={-0.5}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Chorus>
      );

      expect(getByText('Wet: -0.5')).toBeInTheDocument();
    });

    it('should handle rate of 0', () => {
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
        <Chorus input={input} output={output} rate={0}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Chorus>
      );

      expect(getByText('Rate: 0')).toBeInTheDocument();
    });

    it('should handle depth of 0', () => {
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
        <Chorus input={input} output={output} depth={0}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Chorus>
      );

      expect(getByText('Depth: 0')).toBeInTheDocument();
    });

    it('should handle delay of 0', () => {
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
        <Chorus input={input} output={output} delay={0}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Chorus>
      );

      expect(getByText('Delay: 0')).toBeInTheDocument();
    });
  });
});
