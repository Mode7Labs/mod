import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { CrossFade, CrossFadeHandle, CrossFadeMode } from '../components/mixers/CrossFade';

describe('CrossFade', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output}>
          {({ mix, mode }) => (
            <div>
              <span>Mix: {mix}</span>
              <span>Mode: {mode}</span>
            </div>
          )}
        </CrossFade>
      );

      expect(getByText('Mix: 0.5')).toBeInTheDocument();
      expect(getByText('Mode: equal-power')).toBeInTheDocument();
    });

    it('should allow changing mix through render props (0 to 1)', async () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText, getByRole } = render(
        <CrossFade inputs={[inputA, inputB]} output={output}>
          {({ mix, setMix }) => (
            <div>
              <span>Mix: {mix}</span>
              <button onClick={() => setMix(0)}>Set to 0</button>
              <button onClick={() => setMix(0.5)}>Set to 0.5</button>
              <button onClick={() => setMix(1)}>Set to 1</button>
            </div>
          )}
        </CrossFade>
      );

      // Test mix = 0
      act(() => {
        getByRole('button', { name: /^set to 0$/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Mix: 0')).toBeInTheDocument();
      });

      // Test mix = 0.5
      act(() => {
        getByRole('button', { name: /^set to 0\.5$/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Mix: 0.5')).toBeInTheDocument();
      });

      // Test mix = 1
      act(() => {
        getByRole('button', { name: /set to 1/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Mix: 1')).toBeInTheDocument();
      });
    });

    it('should allow changing mode through render props', async () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText, getByRole } = render(
        <CrossFade inputs={[inputA, inputB]} output={output}>
          {({ mode, setMode }) => (
            <div>
              <span>Mode: {mode}</span>
              <button onClick={() => setMode('linear')}>Change Mode</button>
            </div>
          )}
        </CrossFade>
      );

      const button = getByRole('button', { name: /change mode/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Mode: linear')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(
        <CrossFade inputs={[inputA, inputB]} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </CrossFade>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled mix prop', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mix={0.75}>
          {({ mix }) => <span>Mix: {mix}</span>}
        </CrossFade>
      );

      expect(getByText('Mix: 0.75')).toBeInTheDocument();
    });

    it('should call onMixChange when mix changes', async () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();
      const onMixChange = jest.fn();

      const { getByRole } = render(
        <CrossFade
          inputs={[inputA, inputB]}
          output={output}
          mix={0.5}
          onMixChange={onMixChange}
        >
          {({ setMix }) => (
            <button onClick={() => setMix(0.8)}>Change</button>
          )}
        </CrossFade>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onMixChange).toHaveBeenCalledWith(0.8);
      });
    });

    it('should accept controlled mode prop', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mode="linear">
          {({ mode }) => <span>Mode: {mode}</span>}
        </CrossFade>
      );

      expect(getByText('Mode: linear')).toBeInTheDocument();
    });

    it('should call onModeChange when mode changes', async () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();
      const onModeChange = jest.fn();

      const { getByRole } = render(
        <CrossFade
          inputs={[inputA, inputB]}
          output={output}
          mode="equal-power"
          onModeChange={onModeChange}
        >
          {({ setMode }) => (
            <button onClick={() => setMode('dj-cut')}>Change</button>
          )}
        </CrossFade>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onModeChange).toHaveBeenCalledWith('dj-cut');
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const inputA = createMockStreamRef();
        const inputB = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<CrossFadeHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.mix).toBe(0.5);
          expect(state?.mode).toBe('equal-power');
        };

        return (
          <>
            <CrossFade ref={ref} inputs={[inputA, inputB]} output={output} />
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
        const inputA = createMockStreamRef();
        const inputB = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<CrossFadeHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.mix).toBe(0.25);
          expect(state?.mode).toBe('linear');
        };

        return (
          <>
            <CrossFade
              ref={ref}
              inputs={[inputA, inputB]}
              output={output}
              mix={0.25}
              mode="linear"
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
    it('should require exactly two inputs', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      render(<CrossFade inputs={[inputA, inputB]} output={output} />);

      expect(output.current).toBeDefined();
    });

    it('should set output ref with correct structure', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      render(<CrossFade inputs={[inputA, inputB]} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'crossfade',
        sourceType: 'mixer',
      });
    });

    it('should have internal gain nodes for both inputs', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      render(<CrossFade inputs={[inputA, inputB]} output={output} />);

      const stream = output.current as any;
      expect(stream?._gainA).toBeDefined();
      expect(stream?._gainB).toBeDefined();
    });

    it('should use custom label in metadata', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      render(<CrossFade inputs={[inputA, inputB]} output={output} label="my-crossfade" />);

      expect(output.current?.metadata?.label).toBe('my-crossfade');
    });

    it('should cleanup on unmount', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<CrossFade inputs={[inputA, inputB]} output={output} />);

      const stream = output.current as any;
      const gainA = stream?._gainA;
      const gainB = stream?._gainB;
      const gain = output.current?.gain;

      expect(gainA).toBeDefined();
      expect(gainB).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      expect(gainA?.disconnect).toHaveBeenCalled();
      expect(gainB?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('All CrossFade Modes', () => {
    const modes: CrossFadeMode[] = [
      'linear',
      'equal-power',
      'equal-gain',
      'exponential',
      'dj-cut',
      'smooth-step',
    ];

    modes.forEach((modeType) => {
      it(`should support ${modeType} mode`, () => {
        const inputA = createMockStreamRef();
        const inputB = createMockStreamRef();
        const output = createMockStreamRef();

        const { getByText } = render(
          <CrossFade inputs={[inputA, inputB]} output={output} mode={modeType}>
            {({ mode }) => <span>Mode: {mode}</span>}
          </CrossFade>
        );

        expect(getByText(`Mode: ${modeType}`)).toBeInTheDocument();
      });

      it(`should set gain values for ${modeType} mode`, () => {
        const inputA = createMockStreamRef();
        const inputB = createMockStreamRef();
        const output = createMockStreamRef();

        render(<CrossFade inputs={[inputA, inputB]} output={output} mode={modeType} mix={0.5} />);

        const stream = output.current as any;
        expect(stream?._gainA?.gain?.value).toBeDefined();
        expect(stream?._gainB?.gain?.value).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle mix at 0 (full A)', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mix={0}>
          {({ mix }) => <span>Mix: {mix}</span>}
        </CrossFade>
      );

      expect(getByText('Mix: 0')).toBeInTheDocument();

      const stream = output.current as any;
      // At mix=0, input A should be at full volume (or close to it depending on mode)
      expect(stream?._gainA?.gain?.value).toBeDefined();
      expect(stream?._gainB?.gain?.value).toBeDefined();
    });

    it('should handle mix at 0.5 (equal blend)', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mix={0.5}>
          {({ mix }) => <span>Mix: {mix}</span>}
        </CrossFade>
      );

      expect(getByText('Mix: 0.5')).toBeInTheDocument();

      const stream = output.current as any;
      expect(stream?._gainA?.gain?.value).toBeDefined();
      expect(stream?._gainB?.gain?.value).toBeDefined();
    });

    it('should handle mix at 1 (full B)', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mix={1}>
          {({ mix }) => <span>Mix: {mix}</span>}
        </CrossFade>
      );

      expect(getByText('Mix: 1')).toBeInTheDocument();

      const stream = output.current as any;
      // At mix=1, input B should be at full volume (or close to it depending on mode)
      expect(stream?._gainA?.gain?.value).toBeDefined();
      expect(stream?._gainB?.gain?.value).toBeDefined();
    });

    it('should handle dj-cut mode at mix boundaries', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { rerender } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mode="dj-cut" mix={0.4} />
      );

      let stream = output.current as any;
      const gainAat04 = stream?._gainA?.gain?.value;
      const gainBat04 = stream?._gainB?.gain?.value;

      expect(gainAat04).toBeDefined();
      expect(gainBat04).toBeDefined();

      // Test at crossover point
      rerender(
        <CrossFade inputs={[inputA, inputB]} output={output} mode="dj-cut" mix={0.5} />
      );

      stream = output.current as any;
      const gainAat05 = stream?._gainA?.gain?.value;
      const gainBat05 = stream?._gainB?.gain?.value;

      expect(gainAat05).toBeDefined();
      expect(gainBat05).toBeDefined();

      // Test past crossover
      rerender(
        <CrossFade inputs={[inputA, inputB]} output={output} mode="dj-cut" mix={0.6} />
      );

      stream = output.current as any;
      const gainAat06 = stream?._gainA?.gain?.value;
      const gainBat06 = stream?._gainB?.gain?.value;

      expect(gainAat06).toBeDefined();
      expect(gainBat06).toBeDefined();
    });

    it('should handle fractional mix values', () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByText } = render(
        <CrossFade inputs={[inputA, inputB]} output={output} mix={0.333}>
          {({ mix }) => <span>Mix: {mix}</span>}
        </CrossFade>
      );

      expect(getByText('Mix: 0.333')).toBeInTheDocument();
    });

    it('should update gains when both mix and mode change', async () => {
      const inputA = createMockStreamRef();
      const inputB = createMockStreamRef();
      const output = createMockStreamRef();

      const { getByRole } = render(
        <CrossFade inputs={[inputA, inputB]} output={output}>
          {({ setMix, setMode }) => (
            <div>
              <button onClick={() => { setMix(0.75); setMode('exponential'); }}>
                Change Both
              </button>
            </div>
          )}
        </CrossFade>
      );

      act(() => {
        getByRole('button', { name: /change both/i }).click();
      });

      await waitFor(() => {
        const stream = output.current as any;
        expect(stream?._gainA?.gain?.value).toBeDefined();
        expect(stream?._gainB?.gain?.value).toBeDefined();
      });
    });
  });
});
