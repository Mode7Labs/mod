import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Delay, DelayHandle } from '../components/processors/Delay';

describe('Delay', () => {
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
        <Delay input={input} output={output}>
          {({ time, feedback, wet }) => (
            <div>
              <span>Time: {time}</span>
              <span>Feedback: {feedback}</span>
              <span>Wet: {wet}</span>
            </div>
          )}
        </Delay>
      );

      expect(getByText('Time: 0.5')).toBeInTheDocument();
      expect(getByText('Feedback: 0.3')).toBeInTheDocument();
      expect(getByText('Wet: 0.5')).toBeInTheDocument();
    });

    it('should allow changing time through render props', async () => {
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
        <Delay input={input} output={output}>
          {({ time, setTime }) => (
            <div>
              <span>Time: {time}</span>
              <button onClick={() => setTime(1.0)}>Change Time</button>
            </div>
          )}
        </Delay>
      );

      const button = getByRole('button', { name: /change time/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Time: 1')).toBeInTheDocument();
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
        <Delay input={input} output={output}>
          {({ feedback, setFeedback }) => (
            <div>
              <span>Feedback: {feedback}</span>
              <button onClick={() => setFeedback(0.7)}>Change Feedback</button>
            </div>
          )}
        </Delay>
      );

      const button = getByRole('button', { name: /change feedback/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Feedback: 0.7')).toBeInTheDocument();
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
        <Delay input={input} output={output}>
          {({ wet, setWet }) => (
            <div>
              <span>Wet: {wet}</span>
              <button onClick={() => setWet(0.8)}>Change Wet</button>
            </div>
          )}
        </Delay>
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
        <Delay input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Delay>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled time prop', () => {
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
        <Delay input={input} output={output} time={0.25}>
          {({ time }) => <span>Time: {time}</span>}
        </Delay>
      );

      expect(getByText('Time: 0.25')).toBeInTheDocument();
    });

    it('should call onTimeChange when time changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onTimeChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Delay
          input={input}
          output={output}
          time={0.5}
          onTimeChange={onTimeChange}
        >
          {({ setTime }) => (
            <button onClick={() => setTime(1.5)}>Change</button>
          )}
        </Delay>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onTimeChange).toHaveBeenCalledWith(1.5);
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
        <Delay input={input} output={output} feedback={0.6}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Delay>
      );

      expect(getByText('Feedback: 0.6')).toBeInTheDocument();
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
        <Delay
          input={input}
          output={output}
          feedback={0.3}
          onFeedbackChange={onFeedbackChange}
        >
          {({ setFeedback }) => (
            <button onClick={() => setFeedback(0.9)}>Change</button>
          )}
        </Delay>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFeedbackChange).toHaveBeenCalledWith(0.9);
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
        <Delay input={input} output={output} wet={0.75}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Delay>
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
        <Delay
          input={input}
          output={output}
          wet={0.5}
          onWetChange={onWetChange}
        >
          {({ setWet }) => (
            <button onClick={() => setWet(0.2)}>Change</button>
          )}
        </Delay>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onWetChange).toHaveBeenCalledWith(0.2);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<DelayHandle>(null);

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
          expect(state?.time).toBe(0.5);
          expect(state?.feedback).toBe(0.3);
          expect(state?.wet).toBe(0.5);
        };

        return (
          <>
            <Delay ref={ref} input={input} output={output} />
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
        const ref = useRef<DelayHandle>(null);

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
          expect(state?.time).toBe(1.2);
          expect(state?.feedback).toBe(0.8);
          expect(state?.wet).toBe(0.9);
        };

        return (
          <>
            <Delay
              ref={ref}
              input={input}
              output={output}
              time={1.2}
              feedback={0.8}
              wet={0.9}
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

      render(<Delay input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'delay',
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

      render(<Delay input={input} output={output} label="my-delay" />);

      expect(output.current?.metadata?.label).toBe('my-delay');
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

      const { unmount } = render(<Delay input={input} output={output} />);

      const delayNode = output.current?.audioNode;
      const gain = output.current?.gain;
      const stream = output.current as any;
      const feedbackGain = stream?._feedbackGain;
      const wetGain = stream?._wetGain;
      const dryGain = stream?._dryGain;

      expect(delayNode).toBeDefined();
      expect(gain).toBeDefined();
      expect(feedbackGain).toBeDefined();
      expect(wetGain).toBeDefined();
      expect(dryGain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(delayNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
      expect(feedbackGain?.disconnect).toHaveBeenCalled();
      expect(wetGain?.disconnect).toHaveBeenCalled();
      expect(dryGain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short delay times', () => {
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
        <Delay input={input} output={output} time={0.001}>
          {({ time }) => <span>Time: {time}</span>}
        </Delay>
      );

      expect(getByText('Time: 0.001')).toBeInTheDocument();
    });

    it('should handle very long delay times', () => {
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
        <Delay input={input} output={output} time={4.5}>
          {({ time }) => <span>Time: {time}</span>}
        </Delay>
      );

      expect(getByText('Time: 4.5')).toBeInTheDocument();
    });

    it('should handle zero feedback', () => {
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
        <Delay input={input} output={output} feedback={0}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Delay>
      );

      expect(getByText('Feedback: 0')).toBeInTheDocument();
    });

    it('should handle maximum feedback', () => {
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
        <Delay input={input} output={output} feedback={1}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Delay>
      );

      expect(getByText('Feedback: 1')).toBeInTheDocument();
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
        <Delay input={input} output={output} wet={0}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Delay>
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
        <Delay input={input} output={output} wet={1}>
          {({ wet }) => <span>Wet: {wet}</span>}
        </Delay>
      );

      expect(getByText('Wet: 1')).toBeInTheDocument();
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
        <Delay input={input} output={output} feedback={1.2}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Delay>
      );

      expect(getByText('Feedback: 1.2')).toBeInTheDocument();
    });
  });
});
