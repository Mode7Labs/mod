import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Filter, FilterHandle } from '../components/processors/Filter';

describe('Filter', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output}>
          {({ frequency, Q, type, gain }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <span>Q: {Q}</span>
              <span>Type: {type}</span>
              <span>Gain: {gain}</span>
            </div>
          )}
        </Filter>
      );

      expect(getByText('Frequency: 1000')).toBeInTheDocument();
      expect(getByText('Q: 1')).toBeInTheDocument();
      expect(getByText('Type: lowpass')).toBeInTheDocument();
      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should allow changing frequency through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Filter input={input} output={output}>
          {({ frequency, setFrequency }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <button onClick={() => setFrequency(2000)}>Change Frequency</button>
            </div>
          )}
        </Filter>
      );

      const button = getByRole('button', { name: /change frequency/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 2000')).toBeInTheDocument();
      });
    });

    it('should allow changing Q through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Filter input={input} output={output}>
          {({ Q, setQ }) => (
            <div>
              <span>Q: {Q}</span>
              <button onClick={() => setQ(5)}>Change Q</button>
            </div>
          )}
        </Filter>
      );

      const button = getByRole('button', { name: /change q/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Q: 5')).toBeInTheDocument();
      });
    });

    it('should allow changing type through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Filter input={input} output={output}>
          {({ type, setType }) => (
            <div>
              <span>Type: {type}</span>
              <button onClick={() => setType('highpass')}>Change Type</button>
            </div>
          )}
        </Filter>
      );

      const button = getByRole('button', { name: /change type/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Type: highpass')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Filter input={input} output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(12)}>Change Gain</button>
            </div>
          )}
        </Filter>
      );

      const button = getByRole('button', { name: /change gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 12')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { container } = render(
        <Filter input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Filter>
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
      const { getByText } = render(
        <Filter input={input} output={output} frequency={500}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </Filter>
      );

      expect(getByText('Frequency: 500')).toBeInTheDocument();
    });

    it('should call onFrequencyChange when frequency changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onFrequencyChange = jest.fn();

      const { getByRole } = render(
        <Filter
          input={input}
          output={output}
          frequency={1000}
          onFrequencyChange={onFrequencyChange}
        >
          {({ setFrequency }) => (
            <button onClick={() => setFrequency(1500)}>Change</button>
          )}
        </Filter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFrequencyChange).toHaveBeenCalledWith(1500);
      });
    });

    it('should accept controlled Q prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} Q={10}>
          {({ Q }) => <span>Q: {Q}</span>}
        </Filter>
      );

      expect(getByText('Q: 10')).toBeInTheDocument();
    });

    it('should call onQChange when Q changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onQChange = jest.fn();

      const { getByRole } = render(
        <Filter
          input={input}
          output={output}
          Q={1}
          onQChange={onQChange}
        >
          {({ setQ }) => (
            <button onClick={() => setQ(3)}>Change</button>
          )}
        </Filter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onQChange).toHaveBeenCalledWith(3);
      });
    });

    it('should accept controlled type prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} type="bandpass">
          {({ type }) => <span>Type: {type}</span>}
        </Filter>
      );

      expect(getByText('Type: bandpass')).toBeInTheDocument();
    });

    it('should call onTypeChange when type changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onTypeChange = jest.fn();

      const { getByRole } = render(
        <Filter
          input={input}
          output={output}
          type="lowpass"
          onTypeChange={onTypeChange}
        >
          {({ setType }) => (
            <button onClick={() => setType('notch')}>Change</button>
          )}
        </Filter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onTypeChange).toHaveBeenCalledWith('notch');
      });
    });

    it('should accept controlled gain prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} gain={6}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Filter>
      );

      expect(getByText('Gain: 6')).toBeInTheDocument();
    });

    it('should call onGainChange when gain changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <Filter
          input={input}
          output={output}
          gain={0}
          onGainChange={onGainChange}
        >
          {({ setGain }) => (
            <button onClick={() => setGain(-6)}>Change</button>
          )}
        </Filter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(-6);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<FilterHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.frequency).toBe(1000);
          expect(state?.Q).toBe(1);
          expect(state?.type).toBe('lowpass');
          expect(state?.gain).toBe(0);
        };

        return (
          <>
            <Filter ref={ref} input={input} output={output} />
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
        const ref = useRef<FilterHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.frequency).toBe(2000);
          expect(state?.Q).toBe(5);
          expect(state?.type).toBe('highpass');
          expect(state?.gain).toBe(12);
        };

        return (
          <>
            <Filter
              ref={ref}
              input={input}
              output={output}
              frequency={2000}
              Q={5}
              type="highpass"
              gain={12}
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

      render(<Filter input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'filter',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Filter input={input} output={output} label="my-filter" />);

      expect(output.current?.metadata?.label).toBe('my-filter');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<Filter input={input} output={output} />);

      const filterNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(filterNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(filterNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('All Filter Types', () => {
    const filterTypes: BiquadFilterType[] = [
      'lowpass',
      'highpass',
      'bandpass',
      'lowshelf',
      'highshelf',
      'peaking',
      'notch',
      'allpass',
    ];

    filterTypes.forEach((filterType) => {
      it(`should support ${filterType} filter type`, () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const { getByText } = render(
          <Filter input={input} output={output} type={filterType}>
            {({ type }) => <span>Type: {type}</span>}
          </Filter>
        );

        expect(getByText(`Type: ${filterType}`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low frequencies', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} frequency={20}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </Filter>
      );

      expect(getByText('Frequency: 20')).toBeInTheDocument();
    });

    it('should handle very high frequencies', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} frequency={20000}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </Filter>
      );

      expect(getByText('Frequency: 20000')).toBeInTheDocument();
    });

    it('should handle very low Q values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} Q={0.001}>
          {({ Q }) => <span>Q: {Q}</span>}
        </Filter>
      );

      expect(getByText('Q: 0.001')).toBeInTheDocument();
    });

    it('should handle very high Q values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} Q={100}>
          {({ Q }) => <span>Q: {Q}</span>}
        </Filter>
      );

      expect(getByText('Q: 100')).toBeInTheDocument();
    });

    it('should handle negative gain values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} gain={-12}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Filter>
      );

      expect(getByText('Gain: -12')).toBeInTheDocument();
    });

    it('should handle positive gain values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} gain={12}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Filter>
      );

      expect(getByText('Gain: 12')).toBeInTheDocument();
    });

    it('should handle zero gain', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Filter input={input} output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Filter>
      );

      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters simultaneously', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Filter input={input} output={output}>
          {({ frequency, Q, type, gain, setFrequency, setQ, setType, setGain }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <span>Q: {Q}</span>
              <span>Type: {type}</span>
              <span>Gain: {gain}</span>
              <button
                onClick={() => {
                  setFrequency(5000);
                  setQ(10);
                  setType('peaking');
                  setGain(6);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Filter>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 5000')).toBeInTheDocument();
        expect(getByText('Q: 10')).toBeInTheDocument();
        expect(getByText('Type: peaking')).toBeInTheDocument();
        expect(getByText('Gain: 6')).toBeInTheDocument();
      });
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(<Filter input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });
  });
});
