import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Limiter, LimiterHandle } from '../components/processors/Limiter';

describe('Limiter', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter input={input} output={output}>
          {({ threshold, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Limiter>
      );

      expect(getByText('Threshold: -1')).toBeInTheDocument();
      expect(getByText('Release: 0.05')).toBeInTheDocument();
    });

    it('should allow changing threshold through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Limiter input={input} output={output}>
          {({ threshold, setThreshold }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <button onClick={() => setThreshold(-6)}>Change Threshold</button>
            </div>
          )}
        </Limiter>
      );

      const button = getByRole('button', { name: /change threshold/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -6')).toBeInTheDocument();
      });
    });

    it('should allow changing release through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Limiter input={input} output={output}>
          {({ release, setRelease }) => (
            <div>
              <span>Release: {release}</span>
              <button onClick={() => setRelease(0.1)}>Change Release</button>
            </div>
          )}
        </Limiter>
      );

      const button = getByRole('button', { name: /change release/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Release: 0.1')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { container } = render(
        <Limiter input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Limiter>
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
        <Limiter input={input} output={output} threshold={-12}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Limiter>
      );

      expect(getByText('Threshold: -12')).toBeInTheDocument();
    });

    it('should call onThresholdChange when threshold changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onThresholdChange = jest.fn();

      const { getByRole } = render(
        <Limiter
          input={input}
          output={output}
          threshold={-1}
          onThresholdChange={onThresholdChange}
        >
          {({ setThreshold }) => (
            <button onClick={() => setThreshold(-8)}>Change</button>
          )}
        </Limiter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onThresholdChange).toHaveBeenCalledWith(-8);
      });
    });

    it('should accept controlled release prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter input={input} output={output} release={0.2}>
          {({ release }) => <span>Release: {release}</span>}
        </Limiter>
      );

      expect(getByText('Release: 0.2')).toBeInTheDocument();
    });

    it('should call onReleaseChange when release changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onReleaseChange = jest.fn();

      const { getByRole } = render(
        <Limiter
          input={input}
          output={output}
          release={0.05}
          onReleaseChange={onReleaseChange}
        >
          {({ setRelease }) => (
            <button onClick={() => setRelease(0.15)}>Change</button>
          )}
        </Limiter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onReleaseChange).toHaveBeenCalledWith(0.15);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<LimiterHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.threshold).toBe(-1);
          expect(state?.release).toBe(0.05);
        };

        return (
          <>
            <Limiter ref={ref} input={input} output={output} />
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
        const ref = useRef<LimiterHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.threshold).toBe(-6);
          expect(state?.release).toBe(0.1);
        };

        return (
          <>
            <Limiter
              ref={ref}
              input={input}
              output={output}
              threshold={-6}
              release={0.1}
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

      render(<Limiter input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'limiter',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Limiter input={input} output={output} label="my-limiter" />);

      expect(output.current?.metadata?.label).toBe('my-limiter');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<Limiter input={input} output={output} />);

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
        <Limiter input={input} output={output} threshold={-80}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Limiter>
      );

      expect(getByText('Threshold: -80')).toBeInTheDocument();
    });

    it('should handle very high threshold values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter input={input} output={output} threshold={0}>
          {({ threshold }) => <span>Threshold: {threshold}</span>}
        </Limiter>
      );

      expect(getByText('Threshold: 0')).toBeInTheDocument();
    });

    it('should handle very fast release times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter input={input} output={output} release={0.001}>
          {({ release }) => <span>Release: {release}</span>}
        </Limiter>
      );

      expect(getByText('Release: 0.001')).toBeInTheDocument();
    });

    it('should handle slow release times', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter input={input} output={output} release={1}>
          {({ release }) => <span>Release: {release}</span>}
        </Limiter>
      );

      expect(getByText('Release: 1')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters simultaneously', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Limiter input={input} output={output}>
          {({ threshold, release, setThreshold, setRelease }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
              <button
                onClick={() => {
                  setThreshold(-10);
                  setRelease(0.08);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </Limiter>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -10')).toBeInTheDocument();
        expect(getByText('Release: 0.08')).toBeInTheDocument();
      });
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(<Limiter input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should handle typical peak limiting settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter
          input={input}
          output={output}
          threshold={-6}
          release={0.05}
        >
          {({ threshold, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Limiter>
      );

      expect(getByText('Threshold: -6')).toBeInTheDocument();
      expect(getByText('Release: 0.05')).toBeInTheDocument();
    });

    it('should handle aggressive limiting settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter
          input={input}
          output={output}
          threshold={-3}
          release={0.01}
        >
          {({ threshold, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Limiter>
      );

      expect(getByText('Threshold: -3')).toBeInTheDocument();
      expect(getByText('Release: 0.01')).toBeInTheDocument();
    });

    it('should handle gentle limiting settings', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter
          input={input}
          output={output}
          threshold={-18}
          release={0.3}
        >
          {({ threshold, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Limiter>
      );

      expect(getByText('Threshold: -18')).toBeInTheDocument();
      expect(getByText('Release: 0.3')).toBeInTheDocument();
    });

    it('should maintain threshold and release independence', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole, getAllByRole } = render(
        <Limiter input={input} output={output}>
          {({ threshold, release, setThreshold, setRelease }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
              <button onClick={() => setThreshold(-4)}>Change Threshold</button>
              <button onClick={() => setRelease(0.2)}>Change Release</button>
            </div>
          )}
        </Limiter>
      );

      const buttons = getAllByRole('button');

      act(() => {
        buttons[0].click(); // Change threshold
      });

      await waitFor(() => {
        expect(getByText('Threshold: -4')).toBeInTheDocument();
        expect(getByText('Release: 0.05')).toBeInTheDocument(); // Should remain unchanged
      });

      act(() => {
        buttons[1].click(); // Change release
      });

      await waitFor(() => {
        expect(getByText('Threshold: -4')).toBeInTheDocument(); // Should remain unchanged
        expect(getByText('Release: 0.2')).toBeInTheDocument();
      });
    });

    it('should handle rapid threshold changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter input={input} output={output}>
          {({ threshold, setThreshold }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <button onClick={() => setThreshold(-5)}>Change to -5</button>
              <button onClick={() => setThreshold(-10)}>Change to -10</button>
              <button onClick={() => setThreshold(-15)}>Change to -15</button>
            </div>
          )}
        </Limiter>
      );

      const buttons = Array.from(document.querySelectorAll('button'));

      act(() => {
        buttons[0].click();
        buttons[1].click();
        buttons[2].click();
      });

      await waitFor(() => {
        expect(getByText('Threshold: -15')).toBeInTheDocument();
      });
    });

    it('should work with both threshold and release controlled externally', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Limiter
          input={input}
          output={output}
          threshold={-9}
          release={0.12}
        >
          {({ threshold, release }) => (
            <div>
              <span>Threshold: {threshold}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </Limiter>
      );

      expect(getByText('Threshold: -9')).toBeInTheDocument();
      expect(getByText('Release: 0.12')).toBeInTheDocument();
    });
  });
});
