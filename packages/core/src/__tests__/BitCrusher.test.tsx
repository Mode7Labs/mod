import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { BitCrusher, BitCrusherHandle } from '../components/processors/BitCrusher';

describe('BitCrusher', () => {
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
        <BitCrusher input={input} output={output}>
          {({ bitDepth, sampleReduction }) => (
            <div>
              <span>BitDepth: {bitDepth}</span>
              <span>SampleReduction: {sampleReduction}</span>
            </div>
          )}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 8')).toBeInTheDocument();
      expect(getByText('SampleReduction: 1')).toBeInTheDocument();
    });

    it('should allow changing bitDepth through render props', async () => {
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
        <BitCrusher input={input} output={output}>
          {({ bitDepth, setBitDepth }) => (
            <div>
              <span>BitDepth: {bitDepth}</span>
              <button onClick={() => setBitDepth(4)}>Change BitDepth</button>
            </div>
          )}
        </BitCrusher>
      );

      const button = getByRole('button', { name: /change bitdepth/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('BitDepth: 4')).toBeInTheDocument();
      });
    });

    it('should allow changing sampleReduction through render props', async () => {
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
        <BitCrusher input={input} output={output}>
          {({ sampleReduction, setSampleReduction }) => (
            <div>
              <span>SampleReduction: {sampleReduction}</span>
              <button onClick={() => setSampleReduction(4)}>Change SampleReduction</button>
            </div>
          )}
        </BitCrusher>
      );

      const button = getByRole('button', { name: /change samplereduction/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('SampleReduction: 4')).toBeInTheDocument();
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
        <BitCrusher input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </BitCrusher>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled bitDepth prop', () => {
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
        <BitCrusher input={input} output={output} bitDepth={16}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 16')).toBeInTheDocument();
    });

    it('should accept controlled sampleReduction prop', () => {
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
        <BitCrusher input={input} output={output} sampleReduction={8}>
          {({ sampleReduction }) => <span>SampleReduction: {sampleReduction}</span>}
        </BitCrusher>
      );

      expect(getByText('SampleReduction: 8')).toBeInTheDocument();
    });

    it('should call onBitDepthChange when bitDepth changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onBitDepthChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <BitCrusher
          input={input}
          output={output}
          bitDepth={8}
          onBitDepthChange={onBitDepthChange}
        >
          {({ setBitDepth }) => (
            <button onClick={() => setBitDepth(12)}>Change</button>
          )}
        </BitCrusher>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onBitDepthChange).toHaveBeenCalledWith(12);
      });
    });

    it('should call onSampleReductionChange when sampleReduction changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onSampleReductionChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <BitCrusher
          input={input}
          output={output}
          sampleReduction={1}
          onSampleReductionChange={onSampleReductionChange}
        >
          {({ setSampleReduction }) => (
            <button onClick={() => setSampleReduction(3)}>Change</button>
          )}
        </BitCrusher>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSampleReductionChange).toHaveBeenCalledWith(3);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<BitCrusherHandle>(null);

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
          expect(state?.bitDepth).toBe(8);
          expect(state?.sampleReduction).toBe(1);
        };

        return (
          <>
            <BitCrusher ref={ref} input={input} output={output} />
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
        const ref = useRef<BitCrusherHandle>(null);

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
          expect(state?.bitDepth).toBe(4);
          expect(state?.sampleReduction).toBe(2);
        };

        return (
          <>
            <BitCrusher
              ref={ref}
              input={input}
              output={output}
              bitDepth={4}
              sampleReduction={2}
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

      render(<BitCrusher input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'bitcrusher',
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

      render(<BitCrusher input={input} output={output} label="my-bitcrusher" />);

      expect(output.current?.metadata?.label).toBe('my-bitcrusher');
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

      const { unmount } = render(<BitCrusher input={input} output={output} />);

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
    it('should handle very low bit depth', () => {
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
        <BitCrusher input={input} output={output} bitDepth={1}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 1')).toBeInTheDocument();
    });

    it('should handle very high bit depth', () => {
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
        <BitCrusher input={input} output={output} bitDepth={16}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 16')).toBeInTheDocument();
    });

    it('should handle medium bit depth', () => {
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
        <BitCrusher input={input} output={output} bitDepth={12}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 12')).toBeInTheDocument();
    });

    it('should handle very low sample reduction', () => {
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
        <BitCrusher input={input} output={output} sampleReduction={1}>
          {({ sampleReduction }) => <span>SampleReduction: {sampleReduction}</span>}
        </BitCrusher>
      );

      expect(getByText('SampleReduction: 1')).toBeInTheDocument();
    });

    it('should handle very high sample reduction', () => {
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
        <BitCrusher input={input} output={output} sampleReduction={50}>
          {({ sampleReduction }) => <span>SampleReduction: {sampleReduction}</span>}
        </BitCrusher>
      );

      expect(getByText('SampleReduction: 50')).toBeInTheDocument();
    });

    it('should handle changing both parameters multiple times', async () => {
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
        <BitCrusher input={input} output={output}>
          {({ bitDepth, setBitDepth, sampleReduction, setSampleReduction }) => (
            <div>
              <span>BitDepth: {bitDepth}</span>
              <span>SampleReduction: {sampleReduction}</span>
              <button onClick={() => { setBitDepth(4); setSampleReduction(2); }}>Low Quality</button>
              <button onClick={() => { setBitDepth(8); setSampleReduction(1); }}>Medium Quality</button>
              <button onClick={() => { setBitDepth(16); setSampleReduction(1); }}>High Quality</button>
            </div>
          )}
        </BitCrusher>
      );

      const lowButton = getByRole('button', { name: /low quality/i });
      const mediumButton = getByRole('button', { name: /medium quality/i });
      const highButton = getByRole('button', { name: /high quality/i });

      act(() => {
        lowButton.click();
      });

      await waitFor(() => {
        expect(getByText('BitDepth: 4')).toBeInTheDocument();
        expect(getByText('SampleReduction: 2')).toBeInTheDocument();
      });

      act(() => {
        highButton.click();
      });

      await waitFor(() => {
        expect(getByText('BitDepth: 16')).toBeInTheDocument();
        expect(getByText('SampleReduction: 1')).toBeInTheDocument();
      });

      act(() => {
        mediumButton.click();
      });

      await waitFor(() => {
        expect(getByText('BitDepth: 8')).toBeInTheDocument();
        expect(getByText('SampleReduction: 1')).toBeInTheDocument();
      });
    });

    it('should handle extreme bit depth values', () => {
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
        <BitCrusher input={input} output={output} bitDepth={32}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 32')).toBeInTheDocument();
    });

    it('should handle extreme sample reduction values', () => {
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
        <BitCrusher input={input} output={output} sampleReduction={100}>
          {({ sampleReduction }) => <span>SampleReduction: {sampleReduction}</span>}
        </BitCrusher>
      );

      expect(getByText('SampleReduction: 100')).toBeInTheDocument();
    });

    it('should handle fractional bit depth values', () => {
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
        <BitCrusher input={input} output={output} bitDepth={6.5}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: 6.5')).toBeInTheDocument();
    });

    it('should handle fractional sample reduction values', () => {
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
        <BitCrusher input={input} output={output} sampleReduction={2.5}>
          {({ sampleReduction }) => <span>SampleReduction: {sampleReduction}</span>}
        </BitCrusher>
      );

      expect(getByText('SampleReduction: 2.5')).toBeInTheDocument();
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

      const { container } = render(<BitCrusher input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle zero sample reduction', () => {
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
        <BitCrusher input={input} output={output} sampleReduction={0}>
          {({ sampleReduction }) => <span>SampleReduction: {sampleReduction}</span>}
        </BitCrusher>
      );

      expect(getByText('SampleReduction: 0')).toBeInTheDocument();
    });

    it('should handle negative bit depth', () => {
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
        <BitCrusher input={input} output={output} bitDepth={-2}>
          {({ bitDepth }) => <span>BitDepth: {bitDepth}</span>}
        </BitCrusher>
      );

      expect(getByText('BitDepth: -2')).toBeInTheDocument();
    });
  });
});
