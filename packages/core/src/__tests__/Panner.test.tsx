import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Panner, PannerHandle } from '../components/processors/Panner';

describe('Panner', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output}>
          {({ pan }) => (
            <div>
              <span>Pan: {pan}</span>
            </div>
          )}
        </Panner>
      );

      expect(getByText('Pan: 0')).toBeInTheDocument();
    });

    it('should allow changing pan position through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Panner input={input} output={output}>
          {({ pan, setPan }) => (
            <div>
              <span>Pan: {pan}</span>
              <button onClick={() => setPan(0.5)}>Pan Right</button>
            </div>
          )}
        </Panner>
      );

      const button = getByRole('button', { name: /pan right/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Pan: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing pan to left through render props', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Panner input={input} output={output}>
          {({ pan, setPan }) => (
            <div>
              <span>Pan: {pan}</span>
              <button onClick={() => setPan(-0.5)}>Pan Left</button>
            </div>
          )}
        </Panner>
      );

      const button = getByRole('button', { name: /pan left/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Pan: -0.5')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { container } = render(
        <Panner input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Panner>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled pan prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={0.75}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: 0.75')).toBeInTheDocument();
    });

    it('should call onPanChange when pan changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onPanChange = jest.fn();

      const { getByRole } = render(
        <Panner
          input={input}
          output={output}
          pan={0}
          onPanChange={onPanChange}
        >
          {({ setPan }) => (
            <button onClick={() => setPan(0.8)}>Change</button>
          )}
        </Panner>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onPanChange).toHaveBeenCalledWith(0.8);
      });
    });

    it('should accept controlled negative pan prop', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={-0.25}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: -0.25')).toBeInTheDocument();
    });

    it('should call onPanChange with negative values', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onPanChange = jest.fn();

      const { getByRole } = render(
        <Panner
          input={input}
          output={output}
          pan={0}
          onPanChange={onPanChange}
        >
          {({ setPan }) => (
            <button onClick={() => setPan(-0.6)}>Change</button>
          )}
        </Panner>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onPanChange).toHaveBeenCalledWith(-0.6);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<PannerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.pan).toBe(0);
        };

        return (
          <>
            <Panner ref={ref} input={input} output={output} />
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
        const ref = useRef<PannerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.pan).toBe(0.5);
        };

        return (
          <>
            <Panner
              ref={ref}
              input={input}
              output={output}
              pan={0.5}
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

    it('should return current state with negative pan value', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<PannerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.pan).toBe(-0.75);
        };

        return (
          <>
            <Panner
              ref={ref}
              input={input}
              output={output}
              pan={-0.75}
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

      render(<Panner input={input} output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'panner',
        sourceType: 'processor',
      });
    });

    it('should use custom label in metadata', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      render(<Panner input={input} output={output} label="my-panner" />);

      expect(output.current?.metadata?.label).toBe('my-panner');
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { unmount } = render(<Panner input={input} output={output} />);

      const pannerNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(pannerNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(pannerNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle full left pan (-1)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={-1}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: -1')).toBeInTheDocument();
    });

    it('should handle full right pan (1)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={1}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: 1')).toBeInTheDocument();
    });

    it('should handle center pan (0)', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={0}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: 0')).toBeInTheDocument();
    });

    it('should handle slight left pan', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={-0.1}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: -0.1')).toBeInTheDocument();
    });

    it('should handle slight right pan', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={0.1}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: 0.1')).toBeInTheDocument();
    });

    it('should handle changing pan multiple times', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Panner input={input} output={output}>
          {({ pan, setPan }) => (
            <div>
              <span>Pan: {pan}</span>
              <button onClick={() => setPan(-1)}>Left</button>
              <button onClick={() => setPan(0)}>Center</button>
              <button onClick={() => setPan(1)}>Right</button>
            </div>
          )}
        </Panner>
      );

      // Pan left
      act(() => {
        getByRole('button', { name: /left/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Pan: -1')).toBeInTheDocument();
      });

      // Pan center
      act(() => {
        getByRole('button', { name: /center/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Pan: 0')).toBeInTheDocument();
      });

      // Pan right
      act(() => {
        getByRole('button', { name: /right/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Pan: 1')).toBeInTheDocument();
      });
    });

    it('should handle decimal pan values', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText } = render(
        <Panner input={input} output={output} pan={0.333}>
          {({ pan }) => <span>Pan: {pan}</span>}
        </Panner>
      );

      expect(getByText('Pan: 0.333')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const { container } = render(<Panner input={input} output={output} />);

      // Should render without errors and have empty content
      expect(container.firstChild).toBeNull();
    });

    it('should update pan value when controlled prop changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();

      const TestComponent = () => {
        const [panValue, setPanValue] = React.useState(0);

        return (
          <>
            <Panner input={input} output={output} pan={panValue}>
              {({ pan }) => <span>Pan: {pan}</span>}
            </Panner>
            <button onClick={() => setPanValue(0.9)}>Update</button>
          </>
        );
      };

      const { getByText, getByRole } = render(<TestComponent />);

      expect(getByText('Pan: 0')).toBeInTheDocument();

      act(() => {
        getByRole('button', { name: /update/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Pan: 0.9')).toBeInTheDocument();
      });
    });

    it('should handle rapid pan changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Panner input={input} output={output}>
          {({ pan, setPan }) => (
            <div>
              <span>Pan: {pan}</span>
              <button onClick={() => {
                setPan(-0.5);
                setPan(0.5);
                setPan(0);
              }}>Rapid Change</button>
            </div>
          )}
        </Panner>
      );

      const button = getByRole('button', { name: /rapid change/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Pan: 0')).toBeInTheDocument();
      });
    });
  });
});
