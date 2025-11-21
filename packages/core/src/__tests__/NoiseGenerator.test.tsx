import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { NoiseGenerator, NoiseGeneratorHandle } from '../components/sources/NoiseGenerator';

describe('NoiseGenerator', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <NoiseGenerator output={output}>
          {({ gain, type }) => (
            <div>
              <span>Gain: {gain}</span>
              <span>Type: {type}</span>
            </div>
          )}
        </NoiseGenerator>
      );

      expect(getByText('Gain: 0.3')).toBeInTheDocument();
      expect(getByText('Type: white')).toBeInTheDocument();
    });

    it('should allow changing gain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <NoiseGenerator output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </NoiseGenerator>
      );

      const button = getByRole('button', { name: /change gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing type through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <NoiseGenerator output={output}>
          {({ type, setType }) => (
            <div>
              <span>Type: {type}</span>
              <button onClick={() => setType('pink')}>Change Type</button>
            </div>
          )}
        </NoiseGenerator>
      );

      const button = getByRole('button', { name: /change type/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Type: pink')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <NoiseGenerator output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </NoiseGenerator>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled gain prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <NoiseGenerator output={output} gain={0.8}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </NoiseGenerator>
      );

      expect(getByText('Gain: 0.8')).toBeInTheDocument();
    });

    it('should call onGainChange when gain changes', async () => {
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <NoiseGenerator
          output={output}
          gain={0.3}
          onGainChange={onGainChange}
        >
          {({ setGain }) => (
            <button onClick={() => setGain(0.7)}>Change</button>
          )}
        </NoiseGenerator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(0.7);
      });
    });

    it('should accept controlled type prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <NoiseGenerator output={output} type="pink">
          {({ type }) => <span>Type: {type}</span>}
        </NoiseGenerator>
      );

      expect(getByText('Type: pink')).toBeInTheDocument();
    });

    it('should call onTypeChange when type changes', async () => {
      const output = createMockStreamRef();
      const onTypeChange = jest.fn();

      const { getByRole } = render(
        <NoiseGenerator
          output={output}
          type="white"
          onTypeChange={onTypeChange}
        >
          {({ setType }) => (
            <button onClick={() => setType('pink')}>Change</button>
          )}
        </NoiseGenerator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onTypeChange).toHaveBeenCalledWith('pink');
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<NoiseGeneratorHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.gain).toBe(0.3);
          expect(state?.type).toBe('white');
        };

        return (
          <>
            <NoiseGenerator ref={ref} output={output} />
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
        const output = createMockStreamRef();
        const ref = useRef<NoiseGeneratorHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.gain).toBe(0.5);
          expect(state?.type).toBe('pink');
        };

        return (
          <>
            <NoiseGenerator
              ref={ref}
              output={output}
              gain={0.5}
              type="pink"
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
      const output = createMockStreamRef();

      render(<NoiseGenerator output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'noise-generator',
        sourceType: 'tone',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<NoiseGenerator output={output} label="my-noise" />);

      expect(output.current?.metadata?.label).toBe('my-noise');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<NoiseGenerator output={output} />);

      const bufferSource = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(bufferSource).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      expect(bufferSource?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Noise Types', () => {
    const noiseTypes: Array<'white' | 'pink'> = ['white', 'pink'];

    noiseTypes.forEach((noiseType) => {
      it(`should support ${noiseType} noise`, () => {
        const output = createMockStreamRef();
        const { getByText } = render(
          <NoiseGenerator output={output} type={noiseType}>
            {({ type }) => <span>Type: {type}</span>}
          </NoiseGenerator>
        );

        expect(getByText(`Type: ${noiseType}`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero gain', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <NoiseGenerator output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </NoiseGenerator>
      );

      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should handle gain above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <NoiseGenerator output={output} gain={1.5}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </NoiseGenerator>
      );

      expect(getByText('Gain: 1.5')).toBeInTheDocument();
    });
  });
});
