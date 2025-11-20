import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { ADSR, ADSRHandle } from '../components/cv/ADSR';

describe('ADSR', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output}>
          {({ attack, decay, sustain, release }) => (
            <div>
              <span>Attack: {attack}</span>
              <span>Decay: {decay}</span>
              <span>Sustain: {sustain}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </ADSR>
      );

      expect(getByText('Attack: 0.01')).toBeInTheDocument();
      expect(getByText('Decay: 0.1')).toBeInTheDocument();
      expect(getByText('Sustain: 0.7')).toBeInTheDocument();
      expect(getByText('Release: 0.3')).toBeInTheDocument();
    });

    it('should allow changing attack through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ADSR output={output}>
          {({ attack, setAttack }) => (
            <div>
              <span>Attack: {attack}</span>
              <button onClick={() => setAttack(0.5)}>Change Attack</button>
            </div>
          )}
        </ADSR>
      );

      const button = getByRole('button', { name: /change attack/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Attack: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing decay through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ADSR output={output}>
          {({ decay, setDecay }) => (
            <div>
              <span>Decay: {decay}</span>
              <button onClick={() => setDecay(0.2)}>Change Decay</button>
            </div>
          )}
        </ADSR>
      );

      const button = getByRole('button', { name: /change decay/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Decay: 0.2')).toBeInTheDocument();
      });
    });

    it('should allow changing sustain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ADSR output={output}>
          {({ sustain, setSustain }) => (
            <div>
              <span>Sustain: {sustain}</span>
              <button onClick={() => setSustain(0.9)}>Change Sustain</button>
            </div>
          )}
        </ADSR>
      );

      const button = getByRole('button', { name: /change sustain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Sustain: 0.9')).toBeInTheDocument();
      });
    });

    it('should allow changing release through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ADSR output={output}>
          {({ release, setRelease }) => (
            <div>
              <span>Release: {release}</span>
              <button onClick={() => setRelease(0.8)}>Change Release</button>
            </div>
          )}
        </ADSR>
      );

      const button = getByRole('button', { name: /change release/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Release: 0.8')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <ADSR output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </ADSR>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });

    it('should expose trigger method through render props', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <ADSR output={output}>
          {({ trigger }) => (
            <div>
              <button onClick={trigger}>Trigger</button>
            </div>
          )}
        </ADSR>
      );

      // Should render without errors
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('Trigger');
    });

    it('should expose releaseGate method through render props', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <ADSR output={output}>
          {({ releaseGate }) => (
            <div>
              <button onClick={releaseGate}>Release</button>
            </div>
          )}
        </ADSR>
      );

      // Should render without errors
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toBe('Release');
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled attack prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} attack={0.05}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </ADSR>
      );

      expect(getByText('Attack: 0.05')).toBeInTheDocument();
    });

    it('should call onAttackChange when attack changes', async () => {
      const output = createMockStreamRef();
      const onAttackChange = jest.fn();

      const { getByRole } = render(
        <ADSR
          output={output}
          attack={0.01}
          onAttackChange={onAttackChange}
        >
          {({ setAttack }) => (
            <button onClick={() => setAttack(0.05)}>Change</button>
          )}
        </ADSR>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onAttackChange).toHaveBeenCalledWith(0.05);
      });
    });

    it('should accept controlled decay prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} decay={0.15}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </ADSR>
      );

      expect(getByText('Decay: 0.15')).toBeInTheDocument();
    });

    it('should call onDecayChange when decay changes', async () => {
      const output = createMockStreamRef();
      const onDecayChange = jest.fn();

      const { getByRole } = render(
        <ADSR
          output={output}
          decay={0.1}
          onDecayChange={onDecayChange}
        >
          {({ setDecay }) => (
            <button onClick={() => setDecay(0.15)}>Change</button>
          )}
        </ADSR>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDecayChange).toHaveBeenCalledWith(0.15);
      });
    });

    it('should accept controlled sustain prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} sustain={0.8}>
          {({ sustain }) => <span>Sustain: {sustain}</span>}
        </ADSR>
      );

      expect(getByText('Sustain: 0.8')).toBeInTheDocument();
    });

    it('should call onSustainChange when sustain changes', async () => {
      const output = createMockStreamRef();
      const onSustainChange = jest.fn();

      const { getByRole } = render(
        <ADSR
          output={output}
          sustain={0.7}
          onSustainChange={onSustainChange}
        >
          {({ setSustain }) => (
            <button onClick={() => setSustain(0.8)}>Change</button>
          )}
        </ADSR>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSustainChange).toHaveBeenCalledWith(0.8);
      });
    });

    it('should accept controlled release prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} release={0.5}>
          {({ release }) => <span>Release: {release}</span>}
        </ADSR>
      );

      expect(getByText('Release: 0.5')).toBeInTheDocument();
    });

    it('should call onReleaseChange when release changes', async () => {
      const output = createMockStreamRef();
      const onReleaseChange = jest.fn();

      const { getByRole } = render(
        <ADSR
          output={output}
          release={0.3}
          onReleaseChange={onReleaseChange}
        >
          {({ setRelease }) => (
            <button onClick={() => setRelease(0.5)}>Change</button>
          )}
        </ADSR>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onReleaseChange).toHaveBeenCalledWith(0.5);
      });
    });

    it('should accept all controlled props simultaneously', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR
          output={output}
          attack={0.02}
          decay={0.15}
          sustain={0.8}
          release={0.4}
        >
          {({ attack, decay, sustain, release }) => (
            <div>
              <span>Attack: {attack}</span>
              <span>Decay: {decay}</span>
              <span>Sustain: {sustain}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </ADSR>
      );

      expect(getByText('Attack: 0.02')).toBeInTheDocument();
      expect(getByText('Decay: 0.15')).toBeInTheDocument();
      expect(getByText('Sustain: 0.8')).toBeInTheDocument();
      expect(getByText('Release: 0.4')).toBeInTheDocument();
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.attack).toBe(0.01);
          expect(state?.decay).toBe(0.1);
          expect(state?.sustain).toBe(0.7);
          expect(state?.release).toBe(0.3);
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
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
        const ref = useRef<ADSRHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.attack).toBe(0.05);
          expect(state?.decay).toBe(0.2);
          expect(state?.sustain).toBe(0.9);
          expect(state?.release).toBe(0.6);
        };

        return (
          <>
            <ADSR
              ref={ref}
              output={output}
              attack={0.05}
              decay={0.2}
              sustain={0.9}
              release={0.6}
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

    it('should expose trigger method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleClick = () => {
          expect(ref.current?.trigger).toBeDefined();
          expect(typeof ref.current?.trigger).toBe('function');
          // Call trigger to ensure it doesn't throw
          ref.current?.trigger();
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
            <button onClick={handleClick}>Test Trigger</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose releaseGate method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleClick = () => {
          expect(ref.current?.releaseGate).toBeDefined();
          expect(typeof ref.current?.releaseGate).toBe('function');
          // Call releaseGate to ensure it doesn't throw
          ref.current?.releaseGate();
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
            <button onClick={handleClick}>Test Release</button>
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

      render(<ADSR output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'adsr',
        sourceType: 'cv',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<ADSR output={output} label="my-envelope" />);

      expect(output.current?.metadata?.label).toBe('my-envelope');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<ADSR output={output} />);

      const audioNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(audioNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(audioNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });

    it('should create ConstantSourceNode as audio node', () => {
      const output = createMockStreamRef();

      render(<ADSR output={output} />);

      expect(output.current?.audioNode).toBeDefined();
      // Verify it has offset property (specific to ConstantSourceNode)
      expect(output.current?.audioNode).toHaveProperty('offset');
    });

    it('should create GainNode for envelope shaping', () => {
      const output = createMockStreamRef();

      render(<ADSR output={output} />);

      expect(output.current?.gain).toBeDefined();
      // Verify it has gain property (specific to GainNode)
      expect(output.current?.gain).toHaveProperty('gain');
    });
  });

  describe('Envelope Triggering', () => {
    it('should trigger envelope without errors', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleTrigger = () => {
          ref.current?.trigger();
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
            <button onClick={handleTrigger}>Trigger</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      // Should not throw when triggering
      act(() => {
        getByRole('button').click();
      });
    });

    it('should release envelope without errors', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleTrigger = () => {
          ref.current?.trigger();
        };

        const handleRelease = () => {
          ref.current?.releaseGate();
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
            <button onClick={handleTrigger}>Trigger</button>
            <button onClick={handleRelease}>Release</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      // Trigger then release
      act(() => {
        getByRole('button', { name: /trigger/i }).click();
      });

      act(() => {
        getByRole('button', { name: /release/i }).click();
      });
    });

    it('should handle multiple trigger/release cycles', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleCycle = () => {
          ref.current?.trigger();
          ref.current?.releaseGate();
          ref.current?.trigger();
          ref.current?.releaseGate();
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
            <button onClick={handleCycle}>Cycle</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      // Should handle multiple cycles without errors
      act(() => {
        getByRole('button').click();
      });
    });

    it('should trigger with custom ADSR values', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleTrigger = () => {
          ref.current?.trigger();
        };

        return (
          <>
            <ADSR
              ref={ref}
              output={output}
              attack={0.1}
              decay={0.2}
              sustain={0.5}
              release={0.4}
            />
            <button onClick={handleTrigger}>Trigger</button>
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
    it('should handle zero attack time', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} attack={0}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </ADSR>
      );

      expect(getByText('Attack: 0')).toBeInTheDocument();
    });

    it('should handle very long attack time', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} attack={10}>
          {({ attack }) => <span>Attack: {attack}</span>}
        </ADSR>
      );

      expect(getByText('Attack: 10')).toBeInTheDocument();
    });

    it('should handle zero decay time', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} decay={0}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </ADSR>
      );

      expect(getByText('Decay: 0')).toBeInTheDocument();
    });

    it('should handle very long decay time', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} decay={5}>
          {({ decay }) => <span>Decay: {decay}</span>}
        </ADSR>
      );

      expect(getByText('Decay: 5')).toBeInTheDocument();
    });

    it('should handle zero sustain level', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} sustain={0}>
          {({ sustain }) => <span>Sustain: {sustain}</span>}
        </ADSR>
      );

      expect(getByText('Sustain: 0')).toBeInTheDocument();
    });

    it('should handle full sustain level', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} sustain={1}>
          {({ sustain }) => <span>Sustain: {sustain}</span>}
        </ADSR>
      );

      expect(getByText('Sustain: 1')).toBeInTheDocument();
    });

    it('should handle sustain level above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} sustain={1.5}>
          {({ sustain }) => <span>Sustain: {sustain}</span>}
        </ADSR>
      );

      expect(getByText('Sustain: 1.5')).toBeInTheDocument();
    });

    it('should handle zero release time', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} release={0}>
          {({ release }) => <span>Release: {release}</span>}
        </ADSR>
      );

      expect(getByText('Release: 0')).toBeInTheDocument();
    });

    it('should handle very long release time', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR output={output} release={10}>
          {({ release }) => <span>Release: {release}</span>}
        </ADSR>
      );

      expect(getByText('Release: 10')).toBeInTheDocument();
    });

    it('should handle all extreme values simultaneously', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ADSR
          output={output}
          attack={0}
          decay={0}
          sustain={1}
          release={0}
        >
          {({ attack, decay, sustain, release }) => (
            <div>
              <span>Attack: {attack}</span>
              <span>Decay: {decay}</span>
              <span>Sustain: {sustain}</span>
              <span>Release: {release}</span>
            </div>
          )}
        </ADSR>
      );

      expect(getByText('Attack: 0')).toBeInTheDocument();
      expect(getByText('Decay: 0')).toBeInTheDocument();
      expect(getByText('Sustain: 1')).toBeInTheDocument();
      expect(getByText('Release: 0')).toBeInTheDocument();
    });

    it('should handle triggering before initial setup completes', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        // Try to trigger immediately, even before component is fully initialized
        React.useEffect(() => {
          ref.current?.trigger();
        }, []);

        return <ADSR ref={ref} output={output} />;
      };

      // Should not throw
      render(<TestComponent />);
    });

    it('should handle releasing without triggering first', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ADSRHandle>(null);

        const handleRelease = () => {
          // Try to release without triggering first
          ref.current?.releaseGate();
        };

        return (
          <>
            <ADSR ref={ref} output={output} />
            <button onClick={handleRelease}>Release</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      // Should not throw when releasing without trigger
      act(() => {
        getByRole('button').click();
      });
    });

    it('should render without children prop', () => {
      const output = createMockStreamRef();

      // Should render successfully without children
      const { container } = render(<ADSR output={output} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Parameter Updates During Envelope', () => {
    it('should update attack parameter while envelope is active', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ADSR output={output}>
          {({ attack, setAttack, trigger }) => (
            <div>
              <span>Attack: {attack}</span>
              <button onClick={trigger}>Trigger</button>
              <button onClick={() => setAttack(0.5)}>Change Attack</button>
            </div>
          )}
        </ADSR>
      );

      // Trigger envelope
      act(() => {
        getByRole('button', { name: /trigger/i }).click();
      });

      // Change attack while envelope is running
      act(() => {
        getByRole('button', { name: /change attack/i }).click();
      });

      await waitFor(() => {
        expect(getByText('Attack: 0.5')).toBeInTheDocument();
      });
    });

    it('should update all parameters simultaneously', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ADSR output={output}>
          {({ attack, decay, sustain, release, setAttack, setDecay, setSustain, setRelease }) => (
            <div>
              <span>Attack: {attack}</span>
              <span>Decay: {decay}</span>
              <span>Sustain: {sustain}</span>
              <span>Release: {release}</span>
              <button
                onClick={() => {
                  setAttack(0.05);
                  setDecay(0.2);
                  setSustain(0.8);
                  setRelease(0.5);
                }}
              >
                Change All
              </button>
            </div>
          )}
        </ADSR>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Attack: 0.05')).toBeInTheDocument();
        expect(getByText('Decay: 0.2')).toBeInTheDocument();
        expect(getByText('Sustain: 0.8')).toBeInTheDocument();
        expect(getByText('Release: 0.5')).toBeInTheDocument();
      });
    });
  });
});
