import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Phaser, PhaserHandle } from '../components/processors/Phaser';

describe('Phaser', () => {
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
        <Phaser input={input} output={output}>
          {({ rate, depth, feedback, baseFreq }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Feedback: {feedback}</span>
              <span>Base Frequency: {baseFreq}</span>
            </div>
          )}
        </Phaser>
      );

      expect(getByText('Rate: 0.5')).toBeInTheDocument();
      expect(getByText('Depth: 500')).toBeInTheDocument();
      expect(getByText('Feedback: 0.5')).toBeInTheDocument();
      expect(getByText('Base Frequency: 800')).toBeInTheDocument();
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
        <Phaser input={input} output={output}>
          {({ rate, setRate }) => (
            <div>
              <span>Rate: {rate}</span>
              <button onClick={() => setRate(1.5)}>Change Rate</button>
            </div>
          )}
        </Phaser>
      );

      const button = getByRole('button', { name: /change rate/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 1.5')).toBeInTheDocument();
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
        <Phaser input={input} output={output}>
          {({ depth, setDepth }) => (
            <div>
              <span>Depth: {depth}</span>
              <button onClick={() => setDepth(1000)}>Change Depth</button>
            </div>
          )}
        </Phaser>
      );

      const button = getByRole('button', { name: /change depth/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Depth: 1000')).toBeInTheDocument();
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
        <Phaser input={input} output={output}>
          {({ feedback, setFeedback }) => (
            <div>
              <span>Feedback: {feedback}</span>
              <button onClick={() => setFeedback(0.8)}>Change Feedback</button>
            </div>
          )}
        </Phaser>
      );

      const button = getByRole('button', { name: /change feedback/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Feedback: 0.8')).toBeInTheDocument();
      });
    });

    it('should allow changing baseFreq through render props', async () => {
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
        <Phaser input={input} output={output}>
          {({ baseFreq, setBaseFreq }) => (
            <div>
              <span>Base Frequency: {baseFreq}</span>
              <button onClick={() => setBaseFreq(1200)}>Change Base Frequency</button>
            </div>
          )}
        </Phaser>
      );

      const button = getByRole('button', { name: /change base frequency/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Base Frequency: 1200')).toBeInTheDocument();
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
        <Phaser input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Phaser>
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
        <Phaser input={input} output={output} rate={2.0}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Phaser>
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
        <Phaser
          input={input}
          output={output}
          rate={0.5}
          onRateChange={onRateChange}
        >
          {({ setRate }) => (
            <button onClick={() => setRate(1.0)}>Change</button>
          )}
        </Phaser>
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
        <Phaser input={input} output={output} depth={750}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Phaser>
      );

      expect(getByText('Depth: 750')).toBeInTheDocument();
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
        <Phaser
          input={input}
          output={output}
          depth={500}
          onDepthChange={onDepthChange}
        >
          {({ setDepth }) => (
            <button onClick={() => setDepth(1000)}>Change</button>
          )}
        </Phaser>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDepthChange).toHaveBeenCalledWith(1000);
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
        <Phaser input={input} output={output} feedback={0.75}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Phaser>
      );

      expect(getByText('Feedback: 0.75')).toBeInTheDocument();
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
        <Phaser
          input={input}
          output={output}
          feedback={0.5}
          onFeedbackChange={onFeedbackChange}
        >
          {({ setFeedback }) => (
            <button onClick={() => setFeedback(0.9)}>Change</button>
          )}
        </Phaser>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFeedbackChange).toHaveBeenCalledWith(0.9);
      });
    });

    it('should accept controlled baseFreq prop', () => {
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
        <Phaser input={input} output={output} baseFreq={1000}>
          {({ baseFreq }) => <span>Base Frequency: {baseFreq}</span>}
        </Phaser>
      );

      expect(getByText('Base Frequency: 1000')).toBeInTheDocument();
    });

    it('should call onBaseFreqChange when baseFreq changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onBaseFreqChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Phaser
          input={input}
          output={output}
          baseFreq={800}
          onBaseFreqChange={onBaseFreqChange}
        >
          {({ setBaseFreq }) => (
            <button onClick={() => setBaseFreq(1200)}>Change</button>
          )}
        </Phaser>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onBaseFreqChange).toHaveBeenCalledWith(1200);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<PhaserHandle>(null);

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
          expect(state?.rate).toBe(0.5);
          expect(state?.depth).toBe(500);
          expect(state?.feedback).toBe(0.5);
          expect(state?.baseFreq).toBe(800);
        };

        return (
          <>
            <Phaser ref={ref} input={input} output={output} />
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
        const ref = useRef<PhaserHandle>(null);

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
          expect(state?.rate).toBe(2.0);
          expect(state?.depth).toBe(1000);
          expect(state?.feedback).toBe(0.8);
          expect(state?.baseFreq).toBe(1200);
        };

        return (
          <>
            <Phaser
              ref={ref}
              input={input}
              output={output}
              rate={2.0}
              depth={1000}
              feedback={0.8}
              baseFreq={1200}
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

      render(<Phaser input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'phaser',
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

      render(<Phaser input={input} output={output} label="my-phaser" />);

      expect(output.current?.metadata?.label).toBe('my-phaser');
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

      const { unmount } = render(<Phaser input={input} output={output} />);

      const phaserNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(phaserNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(phaserNode?.disconnect).toHaveBeenCalled();
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
        <Phaser input={input} output={output} rate={0.1}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Phaser>
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
        <Phaser input={input} output={output} rate={10}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Phaser>
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
        <Phaser input={input} output={output} depth={10}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Phaser>
      );

      expect(getByText('Depth: 10')).toBeInTheDocument();
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
        <Phaser input={input} output={output} depth={2000}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Phaser>
      );

      expect(getByText('Depth: 2000')).toBeInTheDocument();
    });

    it('should handle very low base frequency values', () => {
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
        <Phaser input={input} output={output} baseFreq={100}>
          {({ baseFreq }) => <span>Base Frequency: {baseFreq}</span>}
        </Phaser>
      );

      expect(getByText('Base Frequency: 100')).toBeInTheDocument();
    });

    it('should handle large base frequency values', () => {
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
        <Phaser input={input} output={output} baseFreq={5000}>
          {({ baseFreq }) => <span>Base Frequency: {baseFreq}</span>}
        </Phaser>
      );

      expect(getByText('Base Frequency: 5000')).toBeInTheDocument();
    });

    it('should handle zero feedback (no feedback)', () => {
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
        <Phaser input={input} output={output} feedback={0}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Phaser>
      );

      expect(getByText('Feedback: 0')).toBeInTheDocument();
    });

    it('should handle full feedback (feedback = 1)', () => {
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
        <Phaser input={input} output={output} feedback={1}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Phaser>
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
        <Phaser input={input} output={output}>
          {({
            rate,
            depth,
            feedback,
            baseFreq,
            setRate,
            setDepth,
            setFeedback,
            setBaseFreq,
          }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Feedback: {feedback}</span>
              <span>Base Frequency: {baseFreq}</span>
              <button
                onClick={() => {
                  setRate(2.0);
                  setDepth(1000);
                  setFeedback(0.9);
                  setBaseFreq(1500);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Phaser>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 2')).toBeInTheDocument();
        expect(getByText('Depth: 1000')).toBeInTheDocument();
        expect(getByText('Feedback: 0.9')).toBeInTheDocument();
        expect(getByText('Base Frequency: 1500')).toBeInTheDocument();
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

      const { container } = render(<Phaser input={input} output={output} />);

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
        <Phaser input={input} output={output} feedback={1.5}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Phaser>
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
        <Phaser input={input} output={output} feedback={-0.5}>
          {({ feedback }) => <span>Feedback: {feedback}</span>}
        </Phaser>
      );

      expect(getByText('Feedback: -0.5')).toBeInTheDocument();
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
        <Phaser input={input} output={output} rate={0}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Phaser>
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
        <Phaser input={input} output={output} depth={0}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Phaser>
      );

      expect(getByText('Depth: 0')).toBeInTheDocument();
    });

    it('should handle baseFreq of 0', () => {
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
        <Phaser input={input} output={output} baseFreq={0}>
          {({ baseFreq }) => <span>Base Frequency: {baseFreq}</span>}
        </Phaser>
      );

      expect(getByText('Base Frequency: 0')).toBeInTheDocument();
    });

    it('should handle negative depth values', () => {
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
        <Phaser input={input} output={output} depth={-100}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Phaser>
      );

      expect(getByText('Depth: -100')).toBeInTheDocument();
    });

    it('should handle negative rate values', () => {
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
        <Phaser input={input} output={output} rate={-0.5}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Phaser>
      );

      expect(getByText('Rate: -0.5')).toBeInTheDocument();
    });
  });
});
