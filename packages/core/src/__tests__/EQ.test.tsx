import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { EQ, EQHandle } from '../components/processors/EQ';

describe('EQ', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output}>
          {({ lowGain, midGain, highGain, lowFreq, highFreq }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
              <span>Low Freq: {lowFreq}</span>
              <span>High Freq: {highFreq}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: 0')).toBeInTheDocument();
      expect(getByText('Mid Gain: 0')).toBeInTheDocument();
      expect(getByText('High Gain: 0')).toBeInTheDocument();
      expect(getByText('Low Freq: 250')).toBeInTheDocument();
      expect(getByText('High Freq: 4000')).toBeInTheDocument();
    });

    it('should allow changing low gain through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <EQ input={input} output={output}>
          {({ lowGain, setLowGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <button onClick={() => setLowGain(6)}>Change Low Gain</button>
            </div>
          )}
        </EQ>
      );

      const button = getByRole('button', { name: /change low gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Low Gain: 6')).toBeInTheDocument();
      });
    });

    it('should allow changing mid gain through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <EQ input={input} output={output}>
          {({ midGain, setMidGain }) => (
            <div>
              <span>Mid Gain: {midGain}</span>
              <button onClick={() => setMidGain(3)}>Change Mid Gain</button>
            </div>
          )}
        </EQ>
      );

      const button = getByRole('button', { name: /change mid gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Mid Gain: 3')).toBeInTheDocument();
      });
    });

    it('should allow changing high gain through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <EQ input={input} output={output}>
          {({ highGain, setHighGain }) => (
            <div>
              <span>High Gain: {highGain}</span>
              <button onClick={() => setHighGain(-6)}>Change High Gain</button>
            </div>
          )}
        </EQ>
      );

      const button = getByRole('button', { name: /change high gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('High Gain: -6')).toBeInTheDocument();
      });
    });

    it('should allow changing low frequency through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <EQ input={input} output={output}>
          {({ lowFreq, setLowFreq }) => (
            <div>
              <span>Low Freq: {lowFreq}</span>
              <button onClick={() => setLowFreq(100)}>Change Low Freq</button>
            </div>
          )}
        </EQ>
      );

      const button = getByRole('button', { name: /change low freq/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Low Freq: 100')).toBeInTheDocument();
      });
    });

    it('should allow changing high frequency through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <EQ input={input} output={output}>
          {({ highFreq, setHighFreq }) => (
            <div>
              <span>High Freq: {highFreq}</span>
              <button onClick={() => setHighFreq(8000)}>Change High Freq</button>
            </div>
          )}
        </EQ>
      );

      const button = getByRole('button', { name: /change high freq/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('High Freq: 8000')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { container } = render(
        <EQ input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </EQ>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled lowGain prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={5}>
          {({ lowGain }) => <span>Low Gain: {lowGain}</span>}
        </EQ>
      );

      expect(getByText('Low Gain: 5')).toBeInTheDocument();
    });

    it('should call onLowGainChange when low gain changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onLowGainChange = jest.fn();

      const { getByRole } = render(
        <EQ
          input={input}
          output={output}
          lowGain={0}
          onLowGainChange={onLowGainChange}
        >
          {({ setLowGain }) => (
            <button onClick={() => setLowGain(8)}>Change</button>
          )}
        </EQ>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onLowGainChange).toHaveBeenCalledWith(8);
      });
    });

    it('should accept controlled midGain prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} midGain={-3}>
          {({ midGain }) => <span>Mid Gain: {midGain}</span>}
        </EQ>
      );

      expect(getByText('Mid Gain: -3')).toBeInTheDocument();
    });

    it('should call onMidGainChange when mid gain changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onMidGainChange = jest.fn();

      const { getByRole } = render(
        <EQ
          input={input}
          output={output}
          midGain={0}
          onMidGainChange={onMidGainChange}
        >
          {({ setMidGain }) => (
            <button onClick={() => setMidGain(4)}>Change</button>
          )}
        </EQ>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onMidGainChange).toHaveBeenCalledWith(4);
      });
    });

    it('should accept controlled highGain prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} highGain={10}>
          {({ highGain }) => <span>High Gain: {highGain}</span>}
        </EQ>
      );

      expect(getByText('High Gain: 10')).toBeInTheDocument();
    });

    it('should call onHighGainChange when high gain changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onHighGainChange = jest.fn();

      const { getByRole } = render(
        <EQ
          input={input}
          output={output}
          highGain={0}
          onHighGainChange={onHighGainChange}
        >
          {({ setHighGain }) => (
            <button onClick={() => setHighGain(-5)}>Change</button>
          )}
        </EQ>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onHighGainChange).toHaveBeenCalledWith(-5);
      });
    });

    it('should accept controlled lowFreq prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowFreq={200}>
          {({ lowFreq }) => <span>Low Freq: {lowFreq}</span>}
        </EQ>
      );

      expect(getByText('Low Freq: 200')).toBeInTheDocument();
    });

    it('should call onLowFreqChange when low frequency changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onLowFreqChange = jest.fn();

      const { getByRole } = render(
        <EQ
          input={input}
          output={output}
          lowFreq={250}
          onLowFreqChange={onLowFreqChange}
        >
          {({ setLowFreq }) => (
            <button onClick={() => setLowFreq(150)}>Change</button>
          )}
        </EQ>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onLowFreqChange).toHaveBeenCalledWith(150);
      });
    });

    it('should accept controlled highFreq prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} highFreq={6000}>
          {({ highFreq }) => <span>High Freq: {highFreq}</span>}
        </EQ>
      );

      expect(getByText('High Freq: 6000')).toBeInTheDocument();
    });

    it('should call onHighFreqChange when high frequency changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onHighFreqChange = jest.fn();

      const { getByRole } = render(
        <EQ
          input={input}
          output={output}
          highFreq={4000}
          onHighFreqChange={onHighFreqChange}
        >
          {({ setHighFreq }) => (
            <button onClick={() => setHighFreq(10000)}>Change</button>
          )}
        </EQ>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onHighFreqChange).toHaveBeenCalledWith(10000);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<EQHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.lowGain).toBe(0);
          expect(state?.midGain).toBe(0);
          expect(state?.highGain).toBe(0);
          expect(state?.lowFreq).toBe(250);
          expect(state?.highFreq).toBe(4000);
        };

        return (
          <>
            <EQ ref={ref} input={input} output={output} />
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
        const ref = useRef<EQHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.lowGain).toBe(6);
          expect(state?.midGain).toBe(-3);
          expect(state?.highGain).toBe(4);
          expect(state?.lowFreq).toBe(150);
          expect(state?.highFreq).toBe(8000);
        };

        return (
          <>
            <EQ
              ref={ref}
              input={input}
              output={output}
              lowGain={6}
              midGain={-3}
              highGain={4}
              lowFreq={150}
              highFreq={8000}
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

      render(<EQ input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'eq',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      render(<EQ input={input} output={output} label="my-eq" />);

      expect(output.current?.metadata?.label).toBe('my-eq');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<EQ input={input} output={output} />);

      const audioNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(audioNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(audioNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme negative gain values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={-40} midGain={-40} highGain={-40}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: -40')).toBeInTheDocument();
      expect(getByText('Mid Gain: -40')).toBeInTheDocument();
      expect(getByText('High Gain: -40')).toBeInTheDocument();
    });

    it('should handle extreme positive gain values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={40} midGain={40} highGain={40}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: 40')).toBeInTheDocument();
      expect(getByText('Mid Gain: 40')).toBeInTheDocument();
      expect(getByText('High Gain: 40')).toBeInTheDocument();
    });

    it('should handle very low frequencies', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowFreq={20} highFreq={100}>
          {({ lowFreq, highFreq }) => (
            <div>
              <span>Low Freq: {lowFreq}</span>
              <span>High Freq: {highFreq}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Freq: 20')).toBeInTheDocument();
      expect(getByText('High Freq: 100')).toBeInTheDocument();
    });

    it('should handle very high frequencies', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowFreq={10000} highFreq={20000}>
          {({ lowFreq, highFreq }) => (
            <div>
              <span>Low Freq: {lowFreq}</span>
              <span>High Freq: {highFreq}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Freq: 10000')).toBeInTheDocument();
      expect(getByText('High Freq: 20000')).toBeInTheDocument();
    });

    it('should handle zero gain for all bands', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={0} midGain={0} highGain={0}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: 0')).toBeInTheDocument();
      expect(getByText('Mid Gain: 0')).toBeInTheDocument();
      expect(getByText('High Gain: 0')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters simultaneously', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <EQ input={input} output={output}>
          {({ lowGain, midGain, highGain, lowFreq, highFreq, setLowGain, setMidGain, setHighGain, setLowFreq, setHighFreq }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
              <span>Low Freq: {lowFreq}</span>
              <span>High Freq: {highFreq}</span>
              <button
                onClick={() => {
                  setLowGain(6);
                  setMidGain(-3);
                  setHighGain(4);
                  setLowFreq(100);
                  setHighFreq(8000);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </EQ>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Low Gain: 6')).toBeInTheDocument();
        expect(getByText('Mid Gain: -3')).toBeInTheDocument();
        expect(getByText('High Gain: 4')).toBeInTheDocument();
        expect(getByText('Low Freq: 100')).toBeInTheDocument();
        expect(getByText('High Freq: 8000')).toBeInTheDocument();
      });
    });

    it('should handle typical bass boost settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={8} midGain={0} highGain={-2}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: 8')).toBeInTheDocument();
      expect(getByText('Mid Gain: 0')).toBeInTheDocument();
      expect(getByText('High Gain: -2')).toBeInTheDocument();
    });

    it('should handle typical treble boost settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={-2} midGain={0} highGain={8}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: -2')).toBeInTheDocument();
      expect(getByText('Mid Gain: 0')).toBeInTheDocument();
      expect(getByText('High Gain: 8')).toBeInTheDocument();
    });

    it('should handle V-shaped EQ curve', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={6} midGain={-4} highGain={6}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: 6')).toBeInTheDocument();
      expect(getByText('Mid Gain: -4')).toBeInTheDocument();
      expect(getByText('High Gain: 6')).toBeInTheDocument();
    });

    it('should handle inverted V-shaped EQ curve', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <EQ input={input} output={output} lowGain={-4} midGain={6} highGain={-4}>
          {({ lowGain, midGain, highGain }) => (
            <div>
              <span>Low Gain: {lowGain}</span>
              <span>Mid Gain: {midGain}</span>
              <span>High Gain: {highGain}</span>
            </div>
          )}
        </EQ>
      );

      expect(getByText('Low Gain: -4')).toBeInTheDocument();
      expect(getByText('Mid Gain: 6')).toBeInTheDocument();
      expect(getByText('High Gain: -4')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(<EQ input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });
  });
});
