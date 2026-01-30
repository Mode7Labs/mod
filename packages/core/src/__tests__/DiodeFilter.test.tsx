import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { DiodeFilter, DiodeFilterHandle } from '../components/processors/DiodeFilter';

describe('DiodeFilter', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', async () => {
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
        <DiodeFilter input={input} output={output}>
          {({ cutoff, resonance, drive }) => (
            <div>
              <span>Cutoff: {cutoff}</span>
              <span>Resonance: {resonance}</span>
              <span>Drive: {drive}</span>
            </div>
          )}
        </DiodeFilter>
      );

      expect(getByText('Cutoff: 1000')).toBeInTheDocument();
      expect(getByText('Resonance: 0.1')).toBeInTheDocument();
      expect(getByText('Drive: 0')).toBeInTheDocument();
    });

    it('should allow changing cutoff through render props', async () => {
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
        <DiodeFilter input={input} output={output}>
          {({ cutoff, setCutoff }) => (
            <div>
              <span>Cutoff: {cutoff}</span>
              <button onClick={() => setCutoff(2000)}>Change Cutoff</button>
            </div>
          )}
        </DiodeFilter>
      );

      const button = getByRole('button', { name: /change cutoff/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Cutoff: 2000')).toBeInTheDocument();
      });
    });

    it('should allow changing resonance through render props', async () => {
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
        <DiodeFilter input={input} output={output}>
          {({ resonance, setResonance }) => (
            <div>
              <span>Resonance: {resonance}</span>
              <button onClick={() => setResonance(0.5)}>Change Resonance</button>
            </div>
          )}
        </DiodeFilter>
      );

      const button = getByRole('button', { name: /change resonance/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Resonance: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing drive through render props', async () => {
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
        <DiodeFilter input={input} output={output}>
          {({ drive, setDrive }) => (
            <div>
              <span>Drive: {drive}</span>
              <button onClick={() => setDrive(5)}>Change Drive</button>
            </div>
          )}
        </DiodeFilter>
      );

      const button = getByRole('button', { name: /change drive/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Drive: 5')).toBeInTheDocument();
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
        <DiodeFilter input={input} output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </DiodeFilter>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });

    it('should allow toggling enabled state', async () => {
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
        <DiodeFilter input={input} output={output}>
          {({ enabled, setEnabled }) => (
            <div>
              <span>Enabled: {enabled ? 'yes' : 'no'}</span>
              <button onClick={() => setEnabled(!enabled)}>Toggle</button>
            </div>
          )}
        </DiodeFilter>
      );

      expect(getByText('Enabled: yes')).toBeInTheDocument();

      const button = getByRole('button', { name: /toggle/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Enabled: no')).toBeInTheDocument();
      });
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled cutoff prop', () => {
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
        <DiodeFilter input={input} output={output} cutoff={500}>
          {({ cutoff }) => <span>Cutoff: {cutoff}</span>}
        </DiodeFilter>
      );

      expect(getByText('Cutoff: 500')).toBeInTheDocument();
    });

    it('should accept controlled resonance prop', () => {
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
        <DiodeFilter input={input} output={output} resonance={0.8}>
          {({ resonance }) => <span>Resonance: {resonance}</span>}
        </DiodeFilter>
      );

      expect(getByText('Resonance: 0.8')).toBeInTheDocument();
    });

    it('should accept controlled drive prop', () => {
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
        <DiodeFilter input={input} output={output} drive={3}>
          {({ drive }) => <span>Drive: {drive}</span>}
        </DiodeFilter>
      );

      expect(getByText('Drive: 3')).toBeInTheDocument();
    });

    it('should call onCutoffChange when cutoff changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onCutoffChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <DiodeFilter
          input={input}
          output={output}
          cutoff={1000}
          onCutoffChange={onCutoffChange}
        >
          {({ setCutoff }) => (
            <button onClick={() => setCutoff(3000)}>Change</button>
          )}
        </DiodeFilter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onCutoffChange).toHaveBeenCalledWith(3000);
      });
    });

    it('should call onEnabledChange when enabled changes', async () => {
      const input = createMockStreamRef();
      const output = createMockStreamRef();
      const onEnabledChange = jest.fn();

      input.current = {
        audioNode: {} as any,
        gain: {
          connect: jest.fn(),
          disconnect: jest.fn(),
        } as any,
        context: {} as any,
      };

      const { getByRole } = render(
        <DiodeFilter
          input={input}
          output={output}
          enabled={true}
          onEnabledChange={onEnabledChange}
        >
          {({ setEnabled }) => (
            <button onClick={() => setEnabled(false)}>Disable</button>
          )}
        </DiodeFilter>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onEnabledChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const input = createMockStreamRef();
        const output = createMockStreamRef();
        const ref = useRef<DiodeFilterHandle>(null);

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
          expect(state?.cutoff).toBe(1000);
          expect(state?.resonance).toBe(0.1);
          expect(state?.drive).toBe(0);
          expect(state?.enabled).toBe(true);
        };

        return (
          <>
            <DiodeFilter ref={ref} input={input} output={output} />
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
        const ref = useRef<DiodeFilterHandle>(null);

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
          expect(state?.cutoff).toBe(2000);
          expect(state?.resonance).toBe(0.5);
          expect(state?.drive).toBe(2);
        };

        return (
          <>
            <DiodeFilter
              ref={ref}
              input={input}
              output={output}
              cutoff={2000}
              resonance={0.5}
              drive={2}
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

  describe('Edge Cases', () => {
    it('should handle very low cutoff frequency', () => {
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
        <DiodeFilter input={input} output={output} cutoff={20}>
          {({ cutoff }) => <span>Cutoff: {cutoff}</span>}
        </DiodeFilter>
      );

      expect(getByText('Cutoff: 20')).toBeInTheDocument();
    });

    it('should handle very high cutoff frequency', () => {
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
        <DiodeFilter input={input} output={output} cutoff={20000}>
          {({ cutoff }) => <span>Cutoff: {cutoff}</span>}
        </DiodeFilter>
      );

      expect(getByText('Cutoff: 20000')).toBeInTheDocument();
    });

    it('should handle high resonance values', () => {
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
        <DiodeFilter input={input} output={output} resonance={4}>
          {({ resonance }) => <span>Resonance: {resonance}</span>}
        </DiodeFilter>
      );

      expect(getByText('Resonance: 4')).toBeInTheDocument();
    });

    it('should handle high drive values', () => {
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
        <DiodeFilter input={input} output={output} drive={10}>
          {({ drive }) => <span>Drive: {drive}</span>}
        </DiodeFilter>
      );

      expect(getByText('Drive: 10')).toBeInTheDocument();
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

      const { container } = render(<DiodeFilter input={input} output={output} />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle cvAmount prop', () => {
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
        <DiodeFilter input={input} output={output} cvAmount={2000}>
          {({ cvAmount }) => <span>CV Amount: {cvAmount}</span>}
        </DiodeFilter>
      );

      expect(getByText('CV Amount: 2000')).toBeInTheDocument();
    });

    it('should handle changing multiple parameters', async () => {
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
        <DiodeFilter input={input} output={output}>
          {({ cutoff, resonance, drive, setCutoff, setResonance, setDrive }) => (
            <div>
              <span>Cutoff: {cutoff}</span>
              <span>Resonance: {resonance}</span>
              <span>Drive: {drive}</span>
              <button onClick={() => {
                setCutoff(5000);
                setResonance(1.5);
                setDrive(3);
              }}>Change All</button>
            </div>
          )}
        </DiodeFilter>
      );

      const button = getByRole('button', { name: /change all/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Cutoff: 5000')).toBeInTheDocument();
        expect(getByText('Resonance: 1.5')).toBeInTheDocument();
        expect(getByText('Drive: 3')).toBeInTheDocument();
      });
    });
  });
});
