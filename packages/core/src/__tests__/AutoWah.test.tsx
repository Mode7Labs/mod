import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { AutoWah, AutoWahHandle } from '../components/processors/AutoWah';

describe('AutoWah', () => {
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
        <AutoWah input={input} output={output}>
          {({ sensitivity, baseFreq, maxFreq, Q }) => (
            <div>
              <span>Sensitivity: {sensitivity}</span>
              <span>Base Frequency: {baseFreq}</span>
              <span>Max Frequency: {maxFreq}</span>
              <span>Q: {Q}</span>
            </div>
          )}
        </AutoWah>
      );

      expect(getByText('Sensitivity: 1000')).toBeInTheDocument();
      expect(getByText('Base Frequency: 200')).toBeInTheDocument();
      expect(getByText('Max Frequency: 2000')).toBeInTheDocument();
      expect(getByText('Q: 5')).toBeInTheDocument();
    });

    it('should allow changing sensitivity through render props', async () => {
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
        <AutoWah input={input} output={output}>
          {({ sensitivity, setSensitivity }) => (
            <div>
              <span>Sensitivity: {sensitivity}</span>
              <button onClick={() => setSensitivity(1500)}>Change Sensitivity</button>
            </div>
          )}
        </AutoWah>
      );

      const button = getByRole('button', { name: /change sensitivity/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Sensitivity: 1500')).toBeInTheDocument();
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
        <AutoWah input={input} output={output}>
          {({ baseFreq, setBaseFreq }) => (
            <div>
              <span>Base Frequency: {baseFreq}</span>
              <button onClick={() => setBaseFreq(300)}>Change Base Freq</button>
            </div>
          )}
        </AutoWah>
      );

      const button = getByRole('button', { name: /change base freq/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Base Frequency: 300')).toBeInTheDocument();
      });
    });

    it('should allow changing maxFreq through render props', async () => {
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
        <AutoWah input={input} output={output}>
          {({ maxFreq, setMaxFreq }) => (
            <div>
              <span>Max Frequency: {maxFreq}</span>
              <button onClick={() => setMaxFreq(3000)}>Change Max Freq</button>
            </div>
          )}
        </AutoWah>
      );

      const button = getByRole('button', { name: /change max freq/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Max Frequency: 3000')).toBeInTheDocument();
      });
    });

    it('should allow changing Q through render props', async () => {
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
        <AutoWah input={input} output={output}>
          {({ Q, setQ }) => (
            <div>
              <span>Q: {Q}</span>
              <button onClick={() => setQ(10)}>Change Q</button>
            </div>
          )}
        </AutoWah>
      );

      const button = getByRole('button', { name: /change q/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Q: 10')).toBeInTheDocument();
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
        <AutoWah input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </AutoWah>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled sensitivity prop', () => {
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
        <AutoWah input={input} output={output} sensitivity={2000}>
          {({ sensitivity }) => <span>Sensitivity: {sensitivity}</span>}
        </AutoWah>
      );

      expect(getByText('Sensitivity: 2000')).toBeInTheDocument();
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
        <AutoWah input={input} output={output} baseFreq={400}>
          {({ baseFreq }) => <span>Base Frequency: {baseFreq}</span>}
        </AutoWah>
      );

      expect(getByText('Base Frequency: 400')).toBeInTheDocument();
    });

    it('should accept controlled maxFreq prop', () => {
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
        <AutoWah input={input} output={output} maxFreq={5000}>
          {({ maxFreq }) => <span>Max Frequency: {maxFreq}</span>}
        </AutoWah>
      );

      expect(getByText('Max Frequency: 5000')).toBeInTheDocument();
    });

    it('should accept controlled Q prop', () => {
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
        <AutoWah input={input} output={output} Q={8}>
          {({ Q }) => <span>Q: {Q}</span>}
        </AutoWah>
      );

      expect(getByText('Q: 8')).toBeInTheDocument();
    });

    it('should call onSensitivityChange when sensitivity changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onSensitivityChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <AutoWah
          input={input}
          output={output}
          sensitivity={1000}
          onSensitivityChange={onSensitivityChange}
        >
          {({ setSensitivity }) => (
            <button onClick={() => setSensitivity(1800)}>Change</button>
          )}
        </AutoWah>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSensitivityChange).toHaveBeenCalledWith(1800);
      });
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
        <AutoWah
          input={input}
          output={output}
          baseFreq={200}
          onBaseFreqChange={onBaseFreqChange}
        >
          {({ setBaseFreq }) => (
            <button onClick={() => setBaseFreq(350)}>Change</button>
          )}
        </AutoWah>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onBaseFreqChange).toHaveBeenCalledWith(350);
      });
    });

    it('should call onMaxFreqChange when maxFreq changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onMaxFreqChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <AutoWah
          input={input}
          output={output}
          maxFreq={2000}
          onMaxFreqChange={onMaxFreqChange}
        >
          {({ setMaxFreq }) => (
            <button onClick={() => setMaxFreq(4000)}>Change</button>
          )}
        </AutoWah>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onMaxFreqChange).toHaveBeenCalledWith(4000);
      });
    });

    it('should call onQChange when Q changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onQChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <AutoWah
          input={input}
          output={output}
          Q={5}
          onQChange={onQChange}
        >
          {({ setQ }) => (
            <button onClick={() => setQ(12)}>Change</button>
          )}
        </AutoWah>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onQChange).toHaveBeenCalledWith(12);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<AutoWahHandle>(null);

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
          expect(state?.sensitivity).toBe(1000);
          expect(state?.baseFreq).toBe(200);
          expect(state?.maxFreq).toBe(2000);
          expect(state?.Q).toBe(5);
        };

        return (
          <>
            <AutoWah ref={ref} input={input} output={output} />
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
        const ref = useRef<AutoWahHandle>(null);

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
          expect(state?.sensitivity).toBe(1500);
          expect(state?.baseFreq).toBe(300);
          expect(state?.maxFreq).toBe(3000);
          expect(state?.Q).toBe(8);
        };

        return (
          <>
            <AutoWah
              ref={ref}
              input={input}
              output={output}
              sensitivity={1500}
              baseFreq={300}
              maxFreq={3000}
              Q={8}
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

      render(<AutoWah input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'autowah',
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

      render(<AutoWah input={input} output={output} label="my-autowah" />);

      expect(output.current?.metadata?.label).toBe('my-autowah');
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

      const { unmount } = render(<AutoWah input={input} output={output} />);

      const scriptNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(scriptNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(scriptNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low sensitivity', () => {
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
        <AutoWah input={input} output={output} sensitivity={0}>
          {({ sensitivity }) => <span>Sensitivity: {sensitivity}</span>}
        </AutoWah>
      );

      expect(getByText('Sensitivity: 0')).toBeInTheDocument();
    });

    it('should handle very high sensitivity', () => {
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
        <AutoWah input={input} output={output} sensitivity={5000}>
          {({ sensitivity }) => <span>Sensitivity: {sensitivity}</span>}
        </AutoWah>
      );

      expect(getByText('Sensitivity: 5000')).toBeInTheDocument();
    });

    it('should handle very low baseFreq', () => {
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
        <AutoWah input={input} output={output} baseFreq={20}>
          {({ baseFreq }) => <span>Base Frequency: {baseFreq}</span>}
        </AutoWah>
      );

      expect(getByText('Base Frequency: 20')).toBeInTheDocument();
    });

    it('should handle very high maxFreq', () => {
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
        <AutoWah input={input} output={output} maxFreq={10000}>
          {({ maxFreq }) => <span>Max Frequency: {maxFreq}</span>}
        </AutoWah>
      );

      expect(getByText('Max Frequency: 10000')).toBeInTheDocument();
    });

    it('should handle very low Q', () => {
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
        <AutoWah input={input} output={output} Q={0.1}>
          {({ Q }) => <span>Q: {Q}</span>}
        </AutoWah>
      );

      expect(getByText('Q: 0.1')).toBeInTheDocument();
    });

    it('should handle very high Q', () => {
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
        <AutoWah input={input} output={output} Q={20}>
          {({ Q }) => <span>Q: {Q}</span>}
        </AutoWah>
      );

      expect(getByText('Q: 20')).toBeInTheDocument();
    });

    it('should handle changing all parameters multiple times', async () => {
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
        <AutoWah input={input} output={output}>
          {({ sensitivity, baseFreq, maxFreq, Q, setSensitivity, setBaseFreq, setMaxFreq, setQ }) => (
            <div>
              <span>Sensitivity: {sensitivity}</span>
              <span>Base Frequency: {baseFreq}</span>
              <span>Max Frequency: {maxFreq}</span>
              <span>Q: {Q}</span>
              <button onClick={() => {
                setSensitivity(800);
                setBaseFreq(150);
                setMaxFreq(1500);
                setQ(3);
              }}>Preset 1</button>
              <button onClick={() => {
                setSensitivity(1200);
                setBaseFreq(250);
                setMaxFreq(2500);
                setQ(7);
              }}>Preset 2</button>
            </div>
          )}
        </AutoWah>
      );

      const preset1Button = getByRole('button', { name: /preset 1/i });
      const preset2Button = getByRole('button', { name: /preset 2/i });

      act(() => {
        preset1Button.click();
      });

      await waitFor(() => {
        expect(getByText('Sensitivity: 800')).toBeInTheDocument();
        expect(getByText('Base Frequency: 150')).toBeInTheDocument();
        expect(getByText('Max Frequency: 1500')).toBeInTheDocument();
        expect(getByText('Q: 3')).toBeInTheDocument();
      });

      act(() => {
        preset2Button.click();
      });

      await waitFor(() => {
        expect(getByText('Sensitivity: 1200')).toBeInTheDocument();
        expect(getByText('Base Frequency: 250')).toBeInTheDocument();
        expect(getByText('Max Frequency: 2500')).toBeInTheDocument();
        expect(getByText('Q: 7')).toBeInTheDocument();
      });
    });

    it('should handle fractional values', () => {
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
        <AutoWah
          input={input}
          output={output}
          sensitivity={1234.56}
          baseFreq={234.78}
          maxFreq={2345.67}
          Q={5.5}
        >
          {({ sensitivity, baseFreq, maxFreq, Q }) => (
            <div>
              <span>Sensitivity: {sensitivity}</span>
              <span>Base Frequency: {baseFreq}</span>
              <span>Max Frequency: {maxFreq}</span>
              <span>Q: {Q}</span>
            </div>
          )}
        </AutoWah>
      );

      expect(getByText('Sensitivity: 1234.56')).toBeInTheDocument();
      expect(getByText('Base Frequency: 234.78')).toBeInTheDocument();
      expect(getByText('Max Frequency: 2345.67')).toBeInTheDocument();
      expect(getByText('Q: 5.5')).toBeInTheDocument();
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

      const { container } = render(<AutoWah input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle baseFreq higher than maxFreq', () => {
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
        <AutoWah input={input} output={output} baseFreq={3000} maxFreq={1000}>
          {({ baseFreq, maxFreq }) => (
            <div>
              <span>Base Frequency: {baseFreq}</span>
              <span>Max Frequency: {maxFreq}</span>
            </div>
          )}
        </AutoWah>
      );

      // Component should still render with inverted values
      expect(getByText('Base Frequency: 3000')).toBeInTheDocument();
      expect(getByText('Max Frequency: 1000')).toBeInTheDocument();
    });
  });
});
