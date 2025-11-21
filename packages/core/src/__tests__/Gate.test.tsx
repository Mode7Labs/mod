import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Gate, GateHandle } from '../components/processors/Gate';

describe('Gate', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output}>
          {({ threshold, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Gate>
      );

      expect(getByText('Threshold: -40')).toBeInTheDocument();
      expect(getByText('Attack: 0.01')).toBeInTheDocument();
      expect(getByText('Release: 0.1')).toBeInTheDocument();
    });

    it('should allow changing threshold through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Gate input={input} output={output}>
          {({ threshold, setThreshold }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <button onClick={() => setThreshold(-20)}>Change Threshold</button>
            </div>
          )}
        </Gate>
      );

      const button = getByRole('button', { name: /change threshold/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -20')).toBeInTheDocument();
      });
    });

    it('should allow changing attack through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Gate input={input} output={output}>
          {({ attack, setAttack }) => (
            <div>
              <span>Attack: {attack}</span>
              <button onClick={() => setAttack(0.05)}>Change Attack</button>
            </div>
          )}
        </Gate>
      );

      const button = getByRole('button', { name: /change attack/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Attack: 0.05')).toBeInTheDocument();
      });
    });

    it('should allow changing release through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Gate input={input} output={output}>
          {({ release, setRelease }) => (
            <div>
              <span>Release: {release}</span>
              <button onClick={() => setRelease(0.5)}>Change Release</button>
            </div>
          )}
        </Gate>
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
        <Gate input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Gate>
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
        <Gate input={input} output={output} threshold={-30}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Gate>
      );

      expect(getByText('Threshold: -30')).toBeInTheDocument();
    });

    it('should call onThresholdChange when threshold changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onThresholdChange = jest.fn();

      const { getByRole } = render(
        <Gate
          input={input}
          output={output}
          threshold={-40}
          onThresholdChange={onThresholdChange}
        >
          {({ setThreshold }) => (
            <button onClick={() => setThreshold(-25)}>Change</button>
          )}
        </Gate>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onThresholdChange).toHaveBeenCalledWith(-25);
      });
    });

    it('should accept controlled attack prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} attack={0.02}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Gate>
      );

      expect(getByText('Attack: 0.02')).toBeInTheDocument();
    });

    it('should call onAttackChange when attack changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onAttackChange = jest.fn();

      const { getByRole } = render(
        <Gate
          input={input}
          output={output}
          attack={0.01}
          onAttackChange={onAttackChange}
        >
          {({ setAttack }) => (
            <button onClick={() => setAttack(0.015)}>Change</button>
          )}
        </Gate>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onAttackChange).toHaveBeenCalledWith(0.015);
      });
    });

    it('should accept controlled release prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} release={0.2}>
          {({ release }) => <span>Release: {release}</span>}
        </Gate>
      );

      expect(getByText('Release: 0.2')).toBeInTheDocument();
    });

    it('should call onReleaseChange when release changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onReleaseChange = jest.fn();

      const { getByRole } = render(
        <Gate
          input={input}
          output={output}
          release={0.1}
          onReleaseChange={onReleaseChange}
        >
          {({ setRelease }) => (
            <button onClick={() => setRelease(0.3)}>Change</button>
          )}
        </Gate>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onReleaseChange).toHaveBeenCalledWith(0.3);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<GateHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.threshold).toBe(-40);
          expect(state?.attack).toBe(0.01);
          expect(state?.release).toBe(0.1);
        };

        return (
          <>
            <Gate ref={ref} input={input} output={output} />
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
        const ref = useRef<GateHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.threshold).toBe(-35);
          expect(state?.attack).toBe(0.015);
          expect(state?.release).toBe(0.25);
        };

        return (
          <>
            <Gate
              ref={ref}
              input={input}
              output={output}
              threshold={-35}
              attack={0.015}
              release={0.25}
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

      render(<Gate input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'gate',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Gate input={input} output={output} label="my-gate" />);

      expect(output.current?.metadata?.label).toBe('my-gate');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<Gate input={input} output={output} />);

      const gateNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(gateNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(gateNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low threshold values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} threshold={-80}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Gate>
      );

      expect(getByText('Threshold: -80')).toBeInTheDocument();
    });

    it('should handle very high threshold values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} threshold={0}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Gate>
      );

      expect(getByText('Threshold: 0')).toBeInTheDocument();
    });

    it('should handle zero attack value', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} attack={0}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Gate>
      );

      expect(getByText('Attack: 0')).toBeInTheDocument();
    });

    it('should handle fast attack times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} attack={0.001}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Gate>
      );

      expect(getByText('Attack: 0.001')).toBeInTheDocument();
    });

    it('should handle slow attack times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} attack={0.5}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </Gate>
      );

      expect(getByText('Attack: 0.5')).toBeInTheDocument();
    });

    it('should handle zero release value', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} release={0}>
          {({ release }) => <span>Release: {release}</span>}
        </Gate>
      );

      expect(getByText('Release: 0')).toBeInTheDocument();
    });

    it('should handle fast release times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} release={0.05}>
          {({ release }) => <span>Release: {release}</span>}
        </Gate>
      );

      expect(getByText('Release: 0.05')).toBeInTheDocument();
    });

    it('should handle slow release times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate input={input} output={output} release={1}>
          {({ release }) => <span>Release: {release}</span>}
        </Gate>
      );

      expect(getByText('Release: 1')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters simultaneously', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Gate input={input} output={output}>
          {({ threshold, attack, release, setThreshold, setAttack, setRelease }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
              <button
                onClick={() => {
                  setThreshold(-25);
                  setAttack(0.02);
                  setRelease(0.3);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Gate>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -25')).toBeInTheDocument();
        expect(getByText('Attack: 0.02')).toBeInTheDocument();
        expect(getByText('Release: 0.3')).toBeInTheDocument();
      });
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(<Gate input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle sensitive gate settings (low threshold, fast attack)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate
          input={input}
          output={output}
          threshold={-50}
          attack={0.001}
          release={0.05}
        >
          {({ threshold, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Gate>
      );

      expect(getByText('Threshold: -50')).toBeInTheDocument();
      expect(getByText('Attack: 0.001')).toBeInTheDocument();
      expect(getByText('Release: 0.05')).toBeInTheDocument();
    });

    it('should handle gentle gate settings (high threshold, slow attack)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate
          input={input}
          output={output}
          threshold={-10}
          attack={0.1}
          release={0.5}
        >
          {({ threshold, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Gate>
      );

      expect(getByText('Threshold: -10')).toBeInTheDocument();
      expect(getByText('Attack: 0.1')).toBeInTheDocument();
      expect(getByText('Release: 0.5')).toBeInTheDocument();
    });

    it('should handle percussion gate settings (very fast attack)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate
          input={input}
          output={output}
          threshold={-35}
          attack={0.0005}
          release={0.2}
        >
          {({ threshold, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Gate>
      );

      expect(getByText('Threshold: -35')).toBeInTheDocument();
      expect(getByText('Attack: 0.0005')).toBeInTheDocument();
      expect(getByText('Release: 0.2')).toBeInTheDocument();
    });

    it('should handle synth gate settings (medium threshold and attack)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Gate
          input={input}
          output={output}
          threshold={-38}
          attack={0.005}
          release={0.15}
        >
          {({ threshold, attack, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Attack: {attack}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Gate>
      );

      expect(getByText('Threshold: -38')).toBeInTheDocument();
      expect(getByText('Attack: 0.005')).toBeInTheDocument();
      expect(getByText('Release: 0.15')).toBeInTheDocument();
    });
  });
});
