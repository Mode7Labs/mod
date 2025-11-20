import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Distortion, DistortionHandle } from '../components/processors/Distortion';

describe('Distortion', () => {
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
        <Distortion input={input} output={output}>
          {({ amount }) => (
            <div>
              <span>Amount: {amount}</span>
            </div>
          )}
        </Distortion>
      );

      expect(getByText('Amount: 50')).toBeInTheDocument();
    });

    it('should allow changing amount through render props', async () => {
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
        <Distortion input={input} output={output}>
          {({ amount, setAmount }) => (
            <div>
              <span>Amount: {amount}</span>
              <button onClick={() => setAmount(75)}>Change Amount</button>
            </div>
          )}
        </Distortion>
      );

      const button = getByRole('button', { name: /change amount/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Amount: 75')).toBeInTheDocument();
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
        <Distortion input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Distortion>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled amount prop', () => {
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
        <Distortion input={input} output={output} amount={25}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: 25')).toBeInTheDocument();
    });

    it('should call onAmountChange when amount changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onAmountChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <Distortion
          input={input}
          output={output}
          amount={50}
          onAmountChange={onAmountChange}
        >
          {({ setAmount }) => (
            <button onClick={() => setAmount(90)}>Change</button>
          )}
        </Distortion>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onAmountChange).toHaveBeenCalledWith(90);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<DistortionHandle>(null);

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
          expect(state?.amount).toBe(50);
        };

        return (
          <>
            <Distortion ref={ref} input={input} output={output} />
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
        const ref = useRef<DistortionHandle>(null);

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
          expect(state?.amount).toBe(80);
        };

        return (
          <>
            <Distortion
              ref={ref}
              input={input}
              output={output}
              amount={80}
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

      render(<Distortion input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'distortion',
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

      render(<Distortion input={input} output={output} label="my-distortion" />);

      expect(output.current?.metadata?.label).toBe('my-distortion');
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

      const { unmount } = render(<Distortion input={input} output={output} />);

      const waveShaperNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(waveShaperNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(waveShaperNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low distortion amount', () => {
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
        <Distortion input={input} output={output} amount={0}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: 0')).toBeInTheDocument();
    });

    it('should handle very high distortion amount', () => {
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
        <Distortion input={input} output={output} amount={100}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: 100')).toBeInTheDocument();
    });

    it('should handle medium distortion amount', () => {
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
        <Distortion input={input} output={output} amount={60}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: 60')).toBeInTheDocument();
    });

    it('should handle changing distortion amount multiple times', async () => {
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
        <Distortion input={input} output={output}>
          {({ amount, setAmount }) => (
            <div>
              <span>Amount: {amount}</span>
              <button onClick={() => setAmount(10)}>Low</button>
              <button onClick={() => setAmount(50)}>Medium</button>
              <button onClick={() => setAmount(90)}>High</button>
            </div>
          )}
        </Distortion>
      );

      const lowButton = getByRole('button', { name: /low/i });
      const mediumButton = getByRole('button', { name: /medium/i });
      const highButton = getByRole('button', { name: /high/i });

      act(() => {
        lowButton.click();
      });

      await waitFor(() => {
        expect(getByText('Amount: 10')).toBeInTheDocument();
      });

      act(() => {
        highButton.click();
      });

      await waitFor(() => {
        expect(getByText('Amount: 90')).toBeInTheDocument();
      });

      act(() => {
        mediumButton.click();
      });

      await waitFor(() => {
        expect(getByText('Amount: 50')).toBeInTheDocument();
      });
    });

    it('should handle extreme distortion amounts', () => {
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
        <Distortion input={input} output={output} amount={200}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: 200')).toBeInTheDocument();
    });

    it('should handle negative distortion amounts', () => {
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
        <Distortion input={input} output={output} amount={-10}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: -10')).toBeInTheDocument();
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

      const { container } = render(<Distortion input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle fractional distortion amounts', () => {
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
        <Distortion input={input} output={output} amount={37.5}>
          {({ amount }) => <span>Amount: {amount}</span>}
        </Distortion>
      );

      expect(getByText('Amount: 37.5')).toBeInTheDocument();
    });
  });
});
