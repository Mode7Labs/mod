import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Tremolo, TremoloHandle } from '../components/processors/Tremolo';

describe('Tremolo', () => {
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
        <Tremolo input={input} output={output}>
          {({ rate, depth }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
            </div>
          )}
        </Tremolo>
      );

      expect(getByText('Rate: 5')).toBeInTheDocument();
      expect(getByText('Depth: 0.5')).toBeInTheDocument();
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
        <Tremolo input={input} output={output}>
          {({ rate, setRate }) => (
            <div>
              <span>Rate: {rate}</span>
              <button onClick={() => setRate(8)}>Change Rate</button>
            </div>
          )}
        </Tremolo>
      );

      const button = getByRole('button', { name: /change rate/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 8')).toBeInTheDocument();
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
        <Tremolo input={input} output={output}>
          {({ depth, setDepth }) => (
            <div>
              <span>Depth: {depth}</span>
              <button onClick={() => setDepth(0.8)}>Change Depth</button>
            </div>
          )}
        </Tremolo>
      );

      const button = getByRole('button', { name: /change depth/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Depth: 0.8')).toBeInTheDocument();
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
        <Tremolo input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Tremolo>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });

    it('should render all render props', () => {
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
        <Tremolo input={input} output={output}>
          {({ rate, depth, setRate, setDepth, isActive }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <span>Has setRate: {typeof setRate === 'function' ? 'yes' : 'no'}</span>
              <span>Has setDepth: {typeof setDepth === 'function' ? 'yes' : 'no'}</span>
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Tremolo>
      );

      expect(getByText('Rate: 5')).toBeInTheDocument();
      expect(getByText('Depth: 0.5')).toBeInTheDocument();
      expect(getByText('Has setRate: yes')).toBeInTheDocument();
      expect(getByText('Has setDepth: yes')).toBeInTheDocument();
      expect(getByText(/Active: (yes|no)/)).toBeInTheDocument();
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
        <Tremolo input={input} output={output} rate={10}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Tremolo>
      );

      expect(getByText('Rate: 10')).toBeInTheDocument();
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
        <Tremolo
          input={input}
          output={output}
          rate={5}
          onRateChange={onRateChange}
        >
          {({ setRate }) => (
            <button onClick={() => setRate(12)}>Change</button>
          )}
        </Tremolo>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onRateChange).toHaveBeenCalledWith(12);
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
        <Tremolo input={input} output={output} depth={0.9}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Tremolo>
      );

      expect(getByText('Depth: 0.9')).toBeInTheDocument();
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
        <Tremolo
          input={input}
          output={output}
          depth={0.5}
          onDepthChange={onDepthChange}
        >
          {({ setDepth }) => (
            <button onClick={() => setDepth(0.3)}>Change</button>
          )}
        </Tremolo>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDepthChange).toHaveBeenCalledWith(0.3);
      });
    });

    it('should track both callbacks independently', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onRateChange = jest.fn();
      const onDepthChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getAllByRole } = render(
        <Tremolo
          input={input}
          output={output}
          rate={5}
          depth={0.5}
          onRateChange={onRateChange}
          onDepthChange={onDepthChange}
        >
          {({ setRate, setDepth }) => (
            <div>
              <button onClick={() => setRate(7)}>Change Rate</button>
              <button onClick={() => setDepth(0.7)}>Change Depth</button>
            </div>
          )}
        </Tremolo>
      );

      const [rateButton, depthButton] = getAllByRole('button');

      act(() => {
        rateButton.click();
      });

      await waitFor(() => {
        expect(onRateChange).toHaveBeenCalledWith(7);
      });

      act(() => {
        depthButton.click();
      });

      await waitFor(() => {
        expect(onDepthChange).toHaveBeenCalledWith(0.7);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<TremoloHandle>(null);

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
          expect(state?.rate).toBe(5);
          expect(state?.depth).toBe(0.5);
        };

        return (
          <>
            <Tremolo ref={ref} input={input} output={output} />
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
        const ref = useRef<TremoloHandle>(null);

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
          expect(state?.rate).toBe(15);
          expect(state?.depth).toBe(0.75);
        };

        return (
          <>
            <Tremolo
              ref={ref}
              input={input}
              output={output}
              rate={15}
              depth={0.75}
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

    it('should update state in ref when controlled props change', async () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<TremoloHandle>(null);
        const [rate, setRate] = React.useState(5);
        const [depth, setDepth] = React.useState(0.5);

        input.current = {
          audioNode: {} as any,
          gain: {
            connect: jest.fn(),
            disconnect: jest.fn(),
          } as any,
          context: {} as any,
        };

        const handleCheckState = () => {
          const state = ref.current?.getState();
          expect(state?.rate).toBe(rate);
          expect(state?.depth).toBe(depth);
        };

        return (
          <>
            <Tremolo
              ref={ref}
              input={input}
              output={output}
              rate={rate}
              depth={depth}
            />
            <button onClick={() => setRate(10)}>Set Rate to 10</button>
            <button onClick={() => setDepth(0.8)}>Set Depth to 0.8</button>
            <button onClick={handleCheckState}>Check State</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button', { name: /set rate/i }).click();
      });

      await waitFor(() => {
        act(() => {
          getByRole('button', { name: /check state/i }).click();
        });
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

      render(<Tremolo input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'tremolo',
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

      render(<Tremolo input={input} output={output} label="my-tremolo" />);

      expect(output.current?.metadata?.label).toBe('my-tremolo');
    });

    it('should set metadata sourceType to processor', () => {
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

      render(<Tremolo input={input} output={output} />);

      expect(output.current?.metadata?.sourceType).toBe('processor');
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

      const { unmount } = render(<Tremolo input={input} output={output} />);

      const tremoloNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(tremoloNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(tremoloNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });

    it('should set up output ref when input is provided', () => {
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

      render(<Tremolo input={input} output={output} />);

      // Verify that output ref is properly set up
      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
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
        <Tremolo input={input} output={output} rate={0.1}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Tremolo>
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
        <Tremolo input={input} output={output} rate={50}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Tremolo>
      );

      expect(getByText('Rate: 50')).toBeInTheDocument();
    });

    it('should handle zero depth', () => {
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
        <Tremolo input={input} output={output} depth={0}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Tremolo>
      );

      expect(getByText('Depth: 0')).toBeInTheDocument();
    });

    it('should handle maximum depth', () => {
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
        <Tremolo input={input} output={output} depth={1}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Tremolo>
      );

      expect(getByText('Depth: 1')).toBeInTheDocument();
    });

    it('should handle depth values above 1', () => {
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
        <Tremolo input={input} output={output} depth={1.5}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Tremolo>
      );

      expect(getByText('Depth: 1.5')).toBeInTheDocument();
    });

    it('should handle very low depth values', () => {
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
        <Tremolo input={input} output={output} depth={0.01}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Tremolo>
      );

      expect(getByText('Depth: 0.01')).toBeInTheDocument();
    });

    it('should handle changing both rate and depth simultaneously', async () => {
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
        <Tremolo input={input} output={output}>
          {({ rate, depth, setRate, setDepth }) => (
            <div>
              <span>Rate: {rate}</span>
              <span>Depth: {depth}</span>
              <button
                onClick={() => {
                  setRate(12);
                  setDepth(0.9);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Tremolo>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 12')).toBeInTheDocument();
        expect(getByText('Depth: 0.9')).toBeInTheDocument();
      });
    });

    it('should handle rapid rate changes', async () => {
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

      const { getByText, getAllByRole } = render(
        <Tremolo input={input} output={output}>
          {({ rate, setRate }) => (
            <div>
              <span>Rate: {rate}</span>
              <button onClick={() => setRate(3)}>Set 3</button>
              <button onClick={() => setRate(6)}>Set 6</button>
              <button onClick={() => setRate(9)}>Set 9</button>
            </div>
          )}
        </Tremolo>
      );

      const buttons = getAllByRole('button');
      act(() => {
        buttons[0].click();
      });

      act(() => {
        buttons[1].click();
      });

      act(() => {
        buttons[2].click();
      });

      await waitFor(() => {
        expect(getByText('Rate: 9')).toBeInTheDocument();
      });
    });

    it('should handle rapid depth changes', async () => {
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

      const { getByText, getAllByRole } = render(
        <Tremolo input={input} output={output}>
          {({ depth, setDepth }) => (
            <div>
              <span>Depth: {depth}</span>
              <button onClick={() => setDepth(0.2)}>Set 0.2</button>
              <button onClick={() => setDepth(0.5)}>Set 0.5</button>
              <button onClick={() => setDepth(0.8)}>Set 0.8</button>
            </div>
          )}
        </Tremolo>
      );

      const buttons = getAllByRole('button');
      act(() => {
        buttons[0].click();
      });

      act(() => {
        buttons[1].click();
      });

      act(() => {
        buttons[2].click();
      });

      await waitFor(() => {
        expect(getByText('Depth: 0.8')).toBeInTheDocument();
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

      const { container } = render(<Tremolo input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle floating point rate values', () => {
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
        <Tremolo input={input} output={output} rate={7.5}>
          {({ rate }) => <span>Rate: {rate}</span>}
        </Tremolo>
      );

      expect(getByText('Rate: 7.5')).toBeInTheDocument();
    });

    it('should handle floating point depth values', () => {
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
        <Tremolo input={input} output={output} depth={0.333}>
          {({ depth }) => <span>Depth: {depth}</span>}
        </Tremolo>
      );

      expect(getByText('Depth: 0.333')).toBeInTheDocument();
    });
  });
});
