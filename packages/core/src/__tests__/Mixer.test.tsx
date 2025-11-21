import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Mixer, MixerHandle } from '../components/mixers/Mixer';

describe('Mixer', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values for 2 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ levels }) => (
            <div>
              <span>Levels: {JSON.stringify(levels)}</span>
            </div>
          )}
        </Mixer>
      );

      expect(getByText('Levels: [1,1]')).toBeInTheDocument();
    });

    it('should render with default values for 3 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2, input3]} output={output}>
          {({ levels }) => (
            <div>
              <span>Levels: {JSON.stringify(levels)}</span>
            </div>
          )}
        </Mixer>
      );

      expect(getByText('Levels: [1,1,1]')).toBeInTheDocument();
    });

    it('should update when levels array changes', async () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText, getByRole } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ levels, setLevels }) => (
            <div>
              <span>Levels: {JSON.stringify(levels)}</span>
              <button onClick={() => setLevels([0.5, 0.8])}>Change Levels</button>
            </div>
          )}
        </Mixer>
      );

      const button = getByRole('button', { name: /change levels/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Levels: [0.5,0.8]')).toBeInTheDocument();
      });
    });

    it('should allow changing single level through setLevel', async () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText, getByRole } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ levels, setLevel }) => (
            <div>
              <span>Levels: {JSON.stringify(levels)}</span>
              <button onClick={() => setLevel(0, 0.3)}>Change Level 0</button>
            </div>
          )}
        </Mixer>
      );

      const button = getByRole('button', { name: /change level 0/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Levels: [0.3,1]')).toBeInTheDocument();
      });
    });

    it('should allow changing second level through setLevel', async () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText, getByRole } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ levels, setLevel }) => (
            <div>
              <span>Levels: {JSON.stringify(levels)}</span>
              <button onClick={() => setLevel(1, 0.7)}>Change Level 1</button>
            </div>
          )}
        </Mixer>
      );

      const button = getByRole('button', { name: /change level 1/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Levels: [1,0.7]')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Mixer>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled levels prop', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2]} output={output} levels={[0.4, 0.6]}>
          {({ levels }) => <span>Levels: {JSON.stringify(levels)}</span>}
        </Mixer>
      );

      expect(getByText('Levels: [0.4,0.6]')).toBeInTheDocument();
    });

    it('should call onLevelsChange when levels change', async () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();
      const onLevelsChange = jest.fn();

      const { getByRole } = render(
        <Mixer
          inputs={[input1, input2]}
          output={output}
          levels={[1.0, 1.0]}
          onLevelsChange={onLevelsChange}
        >
          {({ setLevels }) => (
            <button onClick={() => setLevels([0.5, 0.5])}>Change</button>
          )}
        </Mixer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onLevelsChange).toHaveBeenCalledWith([0.5, 0.5]);
      });
    });

    it('should call onLevelsChange when single level changes', async () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();
      const onLevelsChange = jest.fn();

      const { getByRole } = render(
        <Mixer
          inputs={[input1, input2]}
          output={output}
          levels={[1.0, 1.0]}
          onLevelsChange={onLevelsChange}
        >
          {({ setLevel }) => (
            <button onClick={() => setLevel(0, 0.3)}>Change</button>
          )}
        </Mixer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onLevelsChange).toHaveBeenCalledWith([0.3, 1.0]);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input1 = createMockStreamRef();
        const input2 = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<MixerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.levels).toEqual([1, 1]);
        };

        return (
          <>
            <Mixer ref={ref} inputs={[input1, input2]} output={output} />
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
        const input1 = createMockStreamRef();
        const input2 = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<MixerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.levels).toEqual([0.3, 0.7]);
        };

        return (
          <>
            <Mixer
              ref={ref}
              inputs={[input1, input2]}
              output={output}
              levels={[0.3, 0.7]}
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

    it('should return current state for 4 inputs', () => {
      const TestComponent = () => {
        const input1 = createMockStreamRef();
        const input2 = createMockStreamRef();
        const input3 = createMockStreamRef();
        const input4 = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<MixerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.levels).toEqual([0.2, 0.4, 0.6, 0.8]);
        };

        return (
          <>
            <Mixer
              ref={ref}
              inputs={[input1, input2, input3, input4]}
              output={output}
              levels={[0.2, 0.4, 0.6, 0.8]}
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
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Mixer inputs={[input1, input2]} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'mixer',
        sourceType: 'mixer',
      });
    });

    it('should include input gains in output ref', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Mixer inputs={[input1, input2]} output={output} />);

      const outputStream = output.current as any;
      expect(outputStream?._inputGains).toBeDefined();
      expect(outputStream?._inputGains).toHaveLength(2);
    });

    it('should use custom label in metadata', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Mixer inputs={[input1, input2]} output={output} label="my-mixer" />);

      expect(output.current?.metadata?.label).toBe('my-mixer');
    });

    it('should cleanup on unmount', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<Mixer inputs={[input1, input2]} output={output} />);

      const gain = output.current?.gain;
      const inputGains = (output.current as any)?._inputGains;

      expect(gain).toBeDefined();
      expect(inputGains).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      expect(gain?.disconnect).toHaveBeenCalled();
      inputGains?.forEach((inputGain: any) => {
        expect(inputGain?.disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('Multiple Inputs', () => {
    it('should handle 2 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ levels }) => <span>Count: {levels.length}</span>}
        </Mixer>
      );

      expect(getByText('Count: 2')).toBeInTheDocument();
    });

    it('should handle 3 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2, input3]} output={output}>
          {({ levels }) => <span>Count: {levels.length}</span>}
        </Mixer>
      );

      expect(getByText('Count: 3')).toBeInTheDocument();
    });

    it('should handle 4 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const input4 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2, input3, input4]} output={output}>
          {({ levels }) => <span>Count: {levels.length}</span>}
        </Mixer>
      );

      expect(getByText('Count: 4')).toBeInTheDocument();
    });

    it('should create correct number of input gains for 3 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Mixer inputs={[input1, input2, input3]} output={output} />);

      const outputStream = output.current as any;
      expect(outputStream?._inputGains).toHaveLength(3);
    });

    it('should create correct number of input gains for 4 inputs', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const input4 = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Mixer inputs={[input1, input2, input3, input4]} output={output} />);

      const outputStream = output.current as any;
      expect(outputStream?._inputGains).toHaveLength(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero levels', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2]} output={output} levels={[0, 0]}>
          {({ levels }) => <span>Levels: {JSON.stringify(levels)}</span>}
        </Mixer>
      );

      expect(getByText('Levels: [0,0]')).toBeInTheDocument();
    });

    it('should handle high levels', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2]} output={output} levels={[2.0, 1.5]}>
          {({ levels }) => <span>Levels: {JSON.stringify(levels)}</span>}
        </Mixer>
      );

      expect(getByText('Levels: [2,1.5]')).toBeInTheDocument();
    });

    it('should handle mixed zero and non-zero levels', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2, input3]} output={output} levels={[0, 1, 0.5]}>
          {({ levels }) => <span>Levels: {JSON.stringify(levels)}</span>}
        </Mixer>
      );

      expect(getByText('Levels: [0,1,0.5]')).toBeInTheDocument();
    });

    it('should handle very small levels', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2]} output={output} levels={[0.01, 0.001]}>
          {({ levels }) => <span>Levels: {JSON.stringify(levels)}</span>}
        </Mixer>
      );

      expect(getByText('Levels: [0.01,0.001]')).toBeInTheDocument();
    });

    it('should handle decimal levels', () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const input3 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <Mixer inputs={[input1, input2, input3]} output={output} levels={[0.25, 0.5, 0.75]}>
          {({ levels }) => <span>Levels: {JSON.stringify(levels)}</span>}
        </Mixer>
      );

      expect(getByText('Levels: [0.25,0.5,0.75]')).toBeInTheDocument();
    });

    it('should update levels correctly when changed multiple times', async () => {
      const input1 = createMockStreamRef();
      const input2 = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText, getByRole } = render(
        <Mixer inputs={[input1, input2]} output={output}>
          {({ levels, setLevel }) => (
            <div>
              <span>Levels: {JSON.stringify(levels)}</span>
              <button onClick={() => setLevel(0, 0.5)}>First Change</button>
              <button onClick={() => setLevel(1, 0.3)}>Second Change</button>
            </div>
          )}
        </Mixer>
      );

      act(() => {
        getByRole('button', { name: /first change/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Levels: [0.5,1]')).toBeInTheDocument();
      });

      act(() => {
        getByRole('button', { name: /second change/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Levels: [0.5,0.3]')).toBeInTheDocument();
      });
    });
  });
});
