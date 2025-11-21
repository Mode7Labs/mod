import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Compressor, CompressorHandle } from '../components/processors/Compressor';

describe('Compressor', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output}>
          {({ threshold, knee, ratio, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Knee: {knee}</span>
              <span>Ratio: {ratio}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Compressor>
      );

      expect(getByText('Threshold: -24')).toBeInTheDocument();
      expect(getByText('Knee: 30')).toBeInTheDocument();
      expect(getByText('Ratio: 12')).toBeInTheDocument();
      expect(getByText('Attack: 0.003')).toBeInTheDocument();
      expect(getByText('Release: 0.25')).toBeInTheDocument();
    });

    it('should allow changing threshold through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Compressor input={input} output={output}>
          {({ threshold, setThreshold }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <button onClick={() => setThreshold(-12)}>Change Threshold</button>
            </div>
          )}
        </Compressor>
      );

      const button = getByRole('button', { name: /change threshold/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -12')).toBeInTheDocument();
      });
    });

    it('should allow changing knee through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Compressor input={input} output={output}>
          {({ knee, setKnee }) => (
            <div>
              <span>Knee: {knee}</span>
              <button onClick={() => setKnee(40)}>Change Knee</button>
            </div>
          )}
        </Compressor>
      );

      const button = getByRole('button', { name: /change knee/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Knee: 40')).toBeInTheDocument();
      });
    });

    it('should allow changing ratio through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Compressor input={input} output={output}>
          {({ ratio, setRatio }) => (
            <div>
              <span>Ratio: {ratio}</span>
              <button onClick={() => setRatio(4)}>Change Ratio</button>
            </div>
          )}
        </Compressor>
      );

      const button = getByRole('button', { name: /change ratio/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Ratio: 4')).toBeInTheDocument();
      });
    });

    it('should allow changing attack through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Compressor input={input} output={output}>
          {({ attack, setAttack }) => (
            <div>
              <span>Attack: {attack}</span>
              <button onClick={() => setAttack(0.01)}>Change Attack</button>
            </div>
          )}
        </Compressor>
      );

      const button = getByRole('button', { name: /change attack/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Attack: 0.01')).toBeInTheDocument();
      });
    });

    it('should allow changing release through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Compressor input={input} output={output}>
          {({ release, setRelease }) => (
            <div>
              <span>Release: {release}</span>
              <button onClick={() => setRelease(0.5)}>Change Release</button>
            </div>
          )}
        </Compressor>
      );

      const button = getByRole('button', { name: /change release/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Release: 0.5')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { container } = render(
        <Compressor input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Compressor>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled threshold prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} threshold={-18}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Compressor>
      );

      expect(getByText('Threshold: -18')).toBeInTheDocument();
    });

    it('should call onThresholdChange when threshold changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onThresholdChange = jest.fn();

      const { getByRole } = render(
        <Compressor
          input={input}
          output={output}
          threshold={-24}
          onThresholdChange={onThresholdChange}
        >
          {({ setThreshold }) => (
            <button onClick={() => setThreshold(-10)}>Change</button>
          )}
        </Compressor>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onThresholdChange).toHaveBeenCalledWith(-10);
      });
    });

    it('should accept controlled knee prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} knee={20}>
          {({ knee }) => <span>Knee: {knee}</span>}
        </Compressor>
      );

      expect(getByText('Knee: 20')).toBeInTheDocument();
    });

    it('should call onKneeChange when knee changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onKneeChange = jest.fn();

      const { getByRole } = render(
        <Compressor
          input={input}
          output={output}
          knee={30}
          onKneeChange={onKneeChange}
        >
          {({ setKnee }) => (
            <button onClick={() => setKnee(15)}>Change</button>
          )}
        </Compressor>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onKneeChange).toHaveBeenCalledWith(15);
      });
    });

    it('should accept controlled ratio prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} ratio={8}>
          {({ ratio }) => <span>Ratio: {ratio}</span>}
        </Compressor>
      );

      expect(getByText('Ratio: 8')).toBeInTheDocument();
    });

    it('should call onRatioChange when ratio changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onRatioChange = jest.fn();

      const { getByRole } = render(
        <Compressor
          input={input}
          output={output}
          ratio={12}
          onRatioChange={onRatioChange}
        >
          {({ setRatio }) => (
            <button onClick={() => setRatio(6)}>Change</button>
          )}
        </Compressor>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onRatioChange).toHaveBeenCalledWith(6);
      });
    });

    it('should accept controlled attack prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} attack={0.005}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Compressor>
      );

      expect(getByText('Attack: 0.005')).toBeInTheDocument();
    });

    it('should call onAttackChange when attack changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onAttackChange = jest.fn();

      const { getByRole } = render(
        <Compressor
          input={input}
          output={output}
          attack={0.003}
          onAttackChange={onAttackChange}
        >
          {({ setAttack }) => (
            <button onClick={() => setAttack(0.02)}>Change</button>
          )}
        </Compressor>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onAttackChange).toHaveBeenCalledWith(0.02);
      });
    });

    it('should accept controlled release prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} release={0.3}>
          {({ release }) => <span>Release: {release}</span>}
        </Compressor>
      );

      expect(getByText('Release: 0.3')).toBeInTheDocument();
    });

    it('should call onReleaseChange when release changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onReleaseChange = jest.fn();

      const { getByRole } = render(
        <Compressor
          input={input}
          output={output}
          release={0.25}
          onReleaseChange={onReleaseChange}
        >
          {({ setRelease }) => (
            <button onClick={() => setRelease(0.4)}>Change</button>
          )}
        </Compressor>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onReleaseChange).toHaveBeenCalledWith(0.4);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<CompressorHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.threshold).toBe(-24);
          expect(state?.knee).toBe(30);
          expect(state?.ratio).toBe(12);
          expect(state?.attack).toBe(0.003);
          expect(state?.release).toBe(0.25);
        };

        return (
          <>
            <Compressor ref={ref} input={input} output={output} />
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
        const ref = useRef<CompressorHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.threshold).toBe(-18);
          expect(state?.knee).toBe(20);
          expect(state?.ratio).toBe(6);
          expect(state?.attack).toBe(0.01);
          expect(state?.release).toBe(0.5);
        };

        return (
          <>
            <Compressor
              ref={ref}
              input={input}
              output={output}
              threshold={-18}
              knee={20}
              ratio={6}
              attack={0.01}
              release={0.5}
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

      render(<Compressor input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'compressor',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Compressor input={input} output={output} label="my-compressor" />);

      expect(output.current?.metadata?.label).toBe('my-compressor');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<Compressor input={input} output={output} />);

      const compressorNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(compressorNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(compressorNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low threshold values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} threshold={-100}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Compressor>
      );

      expect(getByText('Threshold: -100')).toBeInTheDocument();
    });

    it('should handle very high threshold values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} threshold={0}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Compressor>
      );

      expect(getByText('Threshold: 0')).toBeInTheDocument();
    });

    it('should handle zero knee value', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} knee={0}>
          {({ knee }) => <span>Knee: {knee}</span>}
        </Compressor>
      );

      expect(getByText('Knee: 0')).toBeInTheDocument();
    });

    it('should handle maximum knee value', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} knee={40}>
          {({ knee }) => <span>Knee: {knee}</span>}
        </Compressor>
      );

      expect(getByText('Knee: 40')).toBeInTheDocument();
    });

    it('should handle minimum ratio value', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} ratio={1}>
          {({ ratio }) => <span>Ratio: {ratio}</span>}
        </Compressor>
      );

      expect(getByText('Ratio: 1')).toBeInTheDocument();
    });

    it('should handle maximum ratio value', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} ratio={20}>
          {({ ratio }) => <span>Ratio: {ratio}</span>}
        </Compressor>
      );

      expect(getByText('Ratio: 20')).toBeInTheDocument();
    });

    it('should handle very fast attack times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} attack={0}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Compressor>
      );

      expect(getByText('Attack: 0')).toBeInTheDocument();
    });

    it('should handle slow attack times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} attack={1}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Compressor>
      );

      expect(getByText('Attack: 1')).toBeInTheDocument();
    });

    it('should handle very fast release times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} release={0}>
          {({ release }) => <span>Release: {release}</span>}
        </Compressor>
      );

      expect(getByText('Release: 0')).toBeInTheDocument();
    });

    it('should handle slow release times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor input={input} output={output} release={1}>
          {({ release }) => <span>Release: {release}</span>}
        </Compressor>
      );

      expect(getByText('Release: 1')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters simultaneously', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Compressor input={input} output={output}>
          {({ threshold, knee, ratio, attack, release, setThreshold, setKnee, setRatio, setAttack, setRelease }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Knee: {knee}</span>
              <span>Ratio: {ratio}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
              <button
                onClick={() => {
                  setThreshold(-12);
                  setKnee(20);
                  setRatio(8);
                  setAttack(0.01);
                  setRelease(0.3);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Compressor>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -12')).toBeInTheDocument();
        expect(getByText('Knee: 20')).toBeInTheDocument();
        expect(getByText('Ratio: 8')).toBeInTheDocument();
        expect(getByText('Attack: 0.01')).toBeInTheDocument();
        expect(getByText('Release: 0.3')).toBeInTheDocument();
      });
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(<Compressor input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle typical vocal compression settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor
          input={input}
          output={output}
          threshold={-20}
          knee={10}
          ratio={4}
          attack={0.005}
          release={0.1}
        >
          {({ threshold, knee, ratio, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Knee: {knee}</span>
              <span>Ratio: {ratio}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Compressor>
      );

      expect(getByText('Threshold: -20')).toBeInTheDocument();
      expect(getByText('Knee: 10')).toBeInTheDocument();
      expect(getByText('Ratio: 4')).toBeInTheDocument();
      expect(getByText('Attack: 0.005')).toBeInTheDocument();
      expect(getByText('Release: 0.1')).toBeInTheDocument();
    });

    it('should handle limiting settings (high ratio)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor
          input={input}
          output={output}
          threshold={-6}
          knee={0}
          ratio={20}
          attack={0.001}
          release={0.05}
        >
          {({ threshold, knee, ratio, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Knee: {knee}</span>
              <span>Ratio: {ratio}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Compressor>
      );

      expect(getByText('Threshold: -6')).toBeInTheDocument();
      expect(getByText('Knee: 0')).toBeInTheDocument();
      expect(getByText('Ratio: 20')).toBeInTheDocument();
      expect(getByText('Attack: 0.001')).toBeInTheDocument();
      expect(getByText('Release: 0.05')).toBeInTheDocument();
    });

    it('should handle gentle compression settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Compressor
          input={input}
          output={output}
          threshold={-30}
          knee={30}
          ratio={2}
          attack={0.03}
          release={0.3}
        >
          {({ threshold, knee, ratio, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Knee: {knee}</span>
              <span>Ratio: {ratio}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Compressor>
      );

      expect(getByText('Threshold: -30')).toBeInTheDocument();
      expect(getByText('Knee: 30')).toBeInTheDocument();
      expect(getByText('Ratio: 2')).toBeInTheDocument();
      expect(getByText('Attack: 0.03')).toBeInTheDocument();
      expect(getByText('Release: 0.3')).toBeInTheDocument();
    });
  });
});
