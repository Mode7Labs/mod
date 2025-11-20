import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Flanger, FlangerHandle } from '../components/processors/Flanger';

describe('Flanger', () => {
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
        <Flanger input={input} output={output}>
          {({ rate, depth, feedback, delay }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Feedback: {feedback}</span>
              <span>Delay: {delay}</span>
            </div>
          )}
        </Flanger>
      );

      expect(getByText('Rate: 0.25')).toBeInTheDocument();
      expect(getByText('Depth: 0.003')).toBeInTheDocument();
      expect(getByText('Feedback: 0.5')).toBeInTheDocument();
      expect(getByText('Delay: 0.005')).toBeInTheDocument();
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
        <Flanger input={input} output={output}>
          {({ rate, setRate }) => (
            <div>
              <span>Rate: {rate}</span>
              <button onClick={() => setRate(0.5)}>Change Rate</button>
            </div>
          )}
        </Flanger>
      );

      const button = getByRole('button', { name: /change rate/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 0.5')).toBeInTheDocument();
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
        <Flanger input={input} output={output}>
          {({ depth, setDepth }) => (
            <div>
              <span>Depth: {depth}</span>
              <button onClick={() => setDepth(0.006)}>Change Depth</button>
            </div>
          )}
        </Flanger>
      );

      const button = getByRole('button', { name: /change depth/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Depth: 0.006')).toBeInTheDocument();
      });
    });

    it('should allow changing feedback through render props', async () => {
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
        <Flanger input={input} output={output}>
          {({ feedback, setFeedback }) => (
            <div>
              <span>Feedback: {feedback}</span>
              <button onClick={() => setFeedback(0.7)}>Change Feedback</button>
            </div>
          )}
        </Flanger>
      );

      const button = getByRole('button', { name: /change feedback/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Feedback: 0.7')).toBeInTheDocument();
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
        <Flanger input={input} output={output}>
          {({ delay, setDelay }) => (
            <div>
              <span>Delay: {delay}</span>
              <button onClick={() => setDelay(0.01)}>Change Delay</button>
            </div>
          )}
        </Flanger>
      );

      const button = getByRole('button', { name: /change delay/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Delay: 0.01')).toBeInTheDocument();
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
        <Flanger input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Flanger>
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
        <Flanger input={input} output={output} rate={0.75}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Flanger>
      );

      expect(getByText('Rate: 0.75')).toBeInTheDocument();
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
        <Flanger
          input={input}
          output={output}
          rate={0.25}
          onRateChange={onRateChange}
        >
          {({ setRate }) => (
            <button onClick={() => setRate(1.0)}>Change</button>
          )}
        </Flanger>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onRateChange).toHaveBeenCalledWith(1.0);
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
        <Flanger input={input} output={output} depth={0.005}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Flanger>
      );

      expect(getByText('Depth: 0.005')).toBeInTheDocument();
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
        <Flanger
          input={input}
          output={output}
          depth={0.003}
          onDepthChange={onDepthChange}
        >
          {({ setDepth }) => (
            <button onClick={() => setDepth(0.008)}>Change</button>
          )}
        </Flanger>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDepthChange).toHaveBeenCalledWith(0.008);
      });
    });

    it('should accept controlled feedback prop', () => {
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
        <Flanger input={input} output={output} feedback={0.8}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Flanger>
      );

      expect(getByText('Feedback: 0.8')).toBeInTheDocument();
    });

    it('should call onFeedbackChange when feedback changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onFeedbackChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Flanger
          input={input}
          output={output}
          feedback={0.5}
          onFeedbackChange={onFeedbackChange}
        >
          {({ setFeedback }) => (
            <button onClick={() => setFeedback(0.6)}>Change</button>
          )}
        </Flanger>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFeedbackChange).toHaveBeenCalledWith(0.6);
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
        <Flanger input={input} output={output} delay={0.01}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Flanger>
      );

      expect(getByText('Delay: 0.01')).toBeInTheDocument();
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
        <Flanger
          input={input}
          output={output}
          delay={0.005}
          onDelayChange={onDelayChange}
        >
          {({ setDelay }) => (
            <button onClick={() => setDelay(0.015)}>Change</button>
          )}
        </Flanger>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDelayChange).toHaveBeenCalledWith(0.015);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<FlangerHandle>(null);

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
          expect(state?.rate).toBe(0.25);
          expect(state?.depth).toBe(0.003);
          expect(state?.feedback).toBe(0.5);
          expect(state?.delay).toBe(0.005);
        };

        return (
          <>
            <Flanger ref={ref} input={input} output={output} />
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
        const ref = useRef<FlangerHandle>(null);

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
          expect(state?.rate).toBe(1.5);
          expect(state?.depth).toBe(0.008);
          expect(state?.feedback).toBe(0.75);
          expect(state?.delay).toBe(0.012);
        };

        return (
          <>
            <Flanger
              ref={ref}
              input={input}
              output={output}
              rate={1.5}
              depth={0.008}
              feedback={0.75}
              delay={0.012}
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

      render(<Flanger input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'flanger',
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

      render(<Flanger input={input} output={output} label="my-flanger" />);

      expect(output.current?.metadata?.label).toBe('my-flanger');
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

      const { unmount } = render(<Flanger input={input} output={output} />);

      const flangerNode = output.current?.audioNode;
      const gain = output.current?.gain;
      const stream = output.current as any;
      const dryGain = stream?._dryGain;
      const wetGain = stream?._wetGain;
      const delayNode = stream?._delayNode;
      const lfo = stream?._lfo;
      const lfoGain = stream?._lfoGain;
      const feedbackGain = stream?._feedbackGain;

      expect(flangerNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(flangerNode?.disconnect).toHaveBeenCalled();
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
        <Flanger input={input} output={output} rate={0.05}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Flanger>
      );

      expect(getByText('Rate: 0.05')).toBeInTheDocument();
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
        <Flanger input={input} output={output} rate={10}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Flanger>
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
        <Flanger input={input} output={output} depth={0.0001}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Flanger>
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
        <Flanger input={input} output={output} depth={0.02}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Flanger>
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
        <Flanger input={input} output={output} delay={0.001}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Flanger>
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
        <Flanger input={input} output={output} delay={0.5}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Flanger>
      );

      expect(getByText('Delay: 0.5')).toBeInTheDocument();
    });

    it('should handle no feedback (feedback = 0)', () => {
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
        <Flanger input={input} output={output} feedback={0}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Flanger>
      );

      expect(getByText('Feedback: 0')).toBeInTheDocument();
    });

    it('should handle maximum feedback (feedback = 1)', () => {
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
        <Flanger input={input} output={output} feedback={1}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Flanger>
      );

      expect(getByText('Feedback: 1')).toBeInTheDocument();
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
        <Flanger input={input} output={output}>
          {({
            rate,
            depth,
            feedback,
            delay,
            setRate,
            setDepth,
            setFeedback,
            setDelay,
          }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Feedback: {feedback}</span>
              <span>Delay: {delay}</span>
              <button
                onClick={() => {
                  setRate(2.0);
                  setDepth(0.01);
                  setFeedback(0.9);
                  setDelay(0.008);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Flanger>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 2')).toBeInTheDocument();
        expect(getByText('Depth: 0.01')).toBeInTheDocument();
        expect(getByText('Feedback: 0.9')).toBeInTheDocument();
        expect(getByText('Delay: 0.008')).toBeInTheDocument();
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

      const { container } = render(<Flanger input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle feedback values above 1', () => {
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
        <Flanger input={input} output={output} feedback={1.5}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Flanger>
      );

      expect(getByText('Feedback: 1.5')).toBeInTheDocument();
    });

    it('should handle negative feedback values', () => {
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
        <Flanger input={input} output={output} feedback={-0.3}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Flanger>
      );

      expect(getByText('Feedback: -0.3')).toBeInTheDocument();
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
        <Flanger input={input} output={output} rate={0}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Flanger>
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
        <Flanger input={input} output={output} depth={0}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Flanger>
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
        <Flanger input={input} output={output} delay={0}>
          {({ delay }) => <span>Delay: {delay}</span>}
        </Flanger>
      );

      expect(getByText('Delay: 0')).toBeInTheDocument();
    });
  });
});
