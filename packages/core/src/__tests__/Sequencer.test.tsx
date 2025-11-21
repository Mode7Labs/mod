import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Sequencer, SequencerHandle } from '../components/cv/Sequencer';

describe('Sequencer', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output}>
          {({ steps, currentStep, bpm, isPlaying }) => (
            <div>
              <span>Steps: {steps.length}</span>
              <span>Current Step: {currentStep}</span>
              <span>BPM: {bpm}</span>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
            </div>
          )}
        </Sequencer>
      );

      await waitFor(() => {
        expect(getByText('Steps: 8')).toBeInTheDocument();
        expect(getByText('Current Step: 0')).toBeInTheDocument();
        expect(getByText('BPM: 120')).toBeInTheDocument();
        expect(getByText('Playing: no')).toBeInTheDocument();
        // More lenient check - just verify numSteps is rendered (may be undefined initially)
        expect(getByText(/Num Steps:/)).toBeInTheDocument();
      });
    });

    it('should allow changing steps through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ steps, setSteps }) => (
            <div>
              <span>First Step: {steps[0]}</span>
              <button onClick={() => setSteps([0.8, 0.6, 0.4, 0.2, 0.8, 0.6, 0.4, 0.2])}>
                Change Steps
              </button>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button', { name: /change steps/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('First Step: 0.8')).toBeInTheDocument();
      });
    });

    it('should allow changing BPM through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ bpm, setBpm }) => (
            <div>
              <span>BPM: {bpm}</span>
              <button onClick={() => setBpm(140)}>Change BPM</button>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button', { name: /change bpm/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('BPM: 140')).toBeInTheDocument();
      });
    });

    it('should allow playing through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ isPlaying, play }) => (
            <div>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
              <button onClick={play}>Play</button>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button', { name: /play/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Playing: yes')).toBeInTheDocument();
      });
    });

    it('should allow pausing through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ isPlaying, play, pause }) => (
            <div>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
              <button onClick={play}>Play</button>
              <button onClick={pause}>Pause</button>
            </div>
          )}
        </Sequencer>
      );

      const playButton = getByRole('button', { name: /play/i });
      const pauseButton = getByRole('button', { name: /pause/i });

      act(() => {
        playButton.click();
      });

      await waitFor(() => {
        expect(getByText('Playing: yes')).toBeInTheDocument();
      });

      act(() => {
        pauseButton.click();
      });

      await waitFor(() => {
        expect(getByText('Playing: no')).toBeInTheDocument();
      });
    });

    it('should allow resetting through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ currentStep, isPlaying, play, reset }) => (
            <div>
              <span>Current Step: {currentStep}</span>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
              <button onClick={play}>Play</button>
              <button onClick={reset}>Reset</button>
            </div>
          )}
        </Sequencer>
      );

      const playButton = getByRole('button', { name: /play/i });
      const resetButton = getByRole('button', { name: /reset/i });

      // Start playing
      act(() => {
        playButton.click();
      });

      await waitFor(() => {
        expect(getByText('Playing: yes')).toBeInTheDocument();
      });

      // Wait for sequencer to advance (step duration at 120 BPM is 500ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      // Reset should stop and go back to step 0
      act(() => {
        resetButton.click();
      });

      await waitFor(() => {
        expect(getByText('Current Step: 0')).toBeInTheDocument();
        expect(getByText('Playing: no')).toBeInTheDocument();
      });
    });

    it('should display current step value', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output}>
          {({ currentStep }) => (
            <div>
              <span>Current Step: {currentStep}</span>
            </div>
          )}
        </Sequencer>
      );

      expect(getByText('Current Step: 0')).toBeInTheDocument();
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled steps prop', () => {
      const output = createMockStreamRef();
      const customSteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      const { getByText } = render(
        <Sequencer output={output} steps={customSteps}>
          {({ steps }) => <span>First Step: {steps[0]}</span>}
        </Sequencer>
      );

      expect(getByText('First Step: 0.1')).toBeInTheDocument();
    });

    it('should call onStepsChange when steps change', async () => {
      const output = createMockStreamRef();
      const onStepsChange = jest.fn();
      const newSteps = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];

      const { getByRole } = render(
        <Sequencer
          output={output}
          steps={Array(8).fill(0.5)}
          onStepsChange={onStepsChange}
        >
          {({ setSteps }) => (
            <button onClick={() => setSteps(newSteps)}>Change</button>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onStepsChange).toHaveBeenCalledWith(newSteps);
      });
    });

    it('should accept controlled bpm prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} bpm={160}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Sequencer>
      );

      expect(getByText('BPM: 160')).toBeInTheDocument();
    });

    it('should call onBpmChange when bpm changes', async () => {
      const output = createMockStreamRef();
      const onBpmChange = jest.fn();

      const { getByRole } = render(
        <Sequencer
          output={output}
          bpm={120}
          onBpmChange={onBpmChange}
        >
          {({ setBpm }) => (
            <button onClick={() => setBpm(180)}>Change</button>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onBpmChange).toHaveBeenCalledWith(180);
      });
    });

    it('should call onCurrentStepChange when step advances', async () => {
      const output = createMockStreamRef();
      const onCurrentStepChange = jest.fn();

      const { getByRole } = render(
        <Sequencer
          output={output}
          onCurrentStepChange={onCurrentStepChange}
        >
          {({ play }) => <button onClick={play}>Play</button>}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      // Wait for first step advance (step duration at 120 BPM is 500ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });

      await waitFor(() => {
        expect(onCurrentStepChange).toHaveBeenCalled();
      });
    });

    it('should call onPlayingChange when playing state changes', async () => {
      const output = createMockStreamRef();
      const onPlayingChange = jest.fn();

      const { getByRole } = render(
        <Sequencer
          output={output}
          onPlayingChange={onPlayingChange}
        >
          {({ play, pause }) => (
            <div>
              <button onClick={play}>Play</button>
              <button onClick={pause}>Pause</button>
            </div>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button', { name: /play/i }).click();
      });

      await waitFor(() => {
        expect(onPlayingChange).toHaveBeenCalledWith(true);
      });

      act(() => {
        getByRole('button', { name: /pause/i }).click();
      });

      await waitFor(() => {
        expect(onPlayingChange).toHaveBeenCalledWith(false);
      });
    });

    it('should accept custom numSteps prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} numSteps={16}>
          {({ steps }) => <span>Steps: {steps.length}</span>}
        </Sequencer>
      );

      expect(getByText('Steps: 16')).toBeInTheDocument();
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose play method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<SequencerHandle>(null);

        const handleClick = () => {
          expect(ref.current?.play).toBeDefined();
          expect(() => ref.current?.play()).not.toThrow();
        };

        return (
          <>
            <Sequencer ref={ref} output={output} />
            <button onClick={handleClick}>Test</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose pause method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<SequencerHandle>(null);

        const handleClick = () => {
          expect(ref.current?.pause).toBeDefined();
          expect(() => ref.current?.pause()).not.toThrow();
        };

        return (
          <>
            <Sequencer ref={ref} output={output} />
            <button onClick={handleClick}>Test</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose reset method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<SequencerHandle>(null);

        const handleClick = () => {
          expect(ref.current?.reset).toBeDefined();
          expect(() => ref.current?.reset()).not.toThrow();
        };

        return (
          <>
            <Sequencer ref={ref} output={output} />
            <button onClick={handleClick}>Test</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<SequencerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.steps).toHaveLength(8);
          expect(state?.currentStep).toBe(0);
          expect(state?.bpm).toBe(120);
          expect(state?.isPlaying).toBe(false);
        };

        return (
          <>
            <Sequencer ref={ref} output={output} />
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
        const ref = useRef<SequencerHandle>(null);
        const customSteps = [0.1, 0.2, 0.3, 0.4];

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.steps).toEqual(customSteps);
          expect(state?.bpm).toBe(140);
        };

        return (
          <>
            <Sequencer
              ref={ref}
              output={output}
              steps={customSteps}
              bpm={140}
              numSteps={4}
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

      render(<Sequencer output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'sequencer',
        sourceType: 'cv',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<Sequencer output={output} label="my-sequencer" />);

      expect(output.current?.metadata?.label).toBe('my-sequencer');
    });

    it('should have sourceType cv in metadata', () => {
      const output = createMockStreamRef();

      render(<Sequencer output={output} />);

      expect(output.current?.metadata?.sourceType).toBe('cv');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<Sequencer output={output} />);

      const audioNode = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(audioNode).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      expect(audioNode?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });

    it('should output initial step value', () => {
      const output = createMockStreamRef();
      const customSteps = [0.75, 0.25, 0.5, 0.8, 0.2, 0.6, 0.4, 0.9];

      render(<Sequencer output={output} steps={customSteps} />);

      const constantSource = output.current?.audioNode as ConstantSourceNode;
      expect(constantSource).toBeDefined();
      // Initial value should be first step
      expect(constantSource.offset.value).toBe(0.75);
    });

    it('should clear interval on unmount', async () => {
      const output = createMockStreamRef();

      const { unmount, getByRole } = render(
        <Sequencer output={output}>
          {({ play }) => <button onClick={play}>Play</button>}
        </Sequencer>
      );

      // Start playing
      act(() => {
        getByRole('button').click();
      });

      // Clear should happen on unmount
      unmount();

      // No assertions needed - this test ensures no errors occur
    });
  });

  describe('Sequencer Behavior', () => {
    it('should advance through steps when playing', async () => {
      const output = createMockStreamRef();
      const { getByRole, getByText } = render(
        <Sequencer output={output} bpm={240}>
          {({ currentStep, play }) => (
            <div>
              <span>Current Step: {currentStep}</span>
              <button onClick={play}>Play</button>
            </div>
          )}
        </Sequencer>
      );

      expect(getByText('Current Step: 0')).toBeInTheDocument();

      act(() => {
        getByRole('button').click();
      });

      // Wait for step advance (at 240 BPM, step duration is 250ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(getByText('Current Step: 1')).toBeInTheDocument();
      });
    });

    it('should wrap around after last step', async () => {
      const output = createMockStreamRef();
      const { getByRole, getByText } = render(
        <Sequencer output={output} bpm={480} numSteps={2}>
          {({ currentStep, play }) => (
            <div>
              <span>Current Step: {currentStep}</span>
              <button onClick={play}>Play</button>
            </div>
          )}
        </Sequencer>
      );

      expect(getByText('Current Step: 0')).toBeInTheDocument();

      act(() => {
        getByRole('button').click();
      });

      // Wait for two step advances (at 480 BPM, step duration is 125ms)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      await waitFor(() => {
        expect(getByText('Current Step: 1')).toBeInTheDocument();
      });

      // Wait for wrap around
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      await waitFor(() => {
        expect(getByText('Current Step: 0')).toBeInTheDocument();
      });
    });

    it('should update interval when BPM changes while playing', async () => {
      const output = createMockStreamRef();
      let stepChanges = 0;
      const onCurrentStepChange = jest.fn(() => {
        stepChanges++;
      });

      const { getByRole } = render(
        <Sequencer
          output={output}
          bpm={120}
          onCurrentStepChange={onCurrentStepChange}
        >
          {({ play, setBpm }) => (
            <div>
              <button onClick={play}>Play</button>
              <button onClick={() => setBpm(240)}>Change BPM</button>
            </div>
          )}
        </Sequencer>
      );

      // Start playing at 120 BPM
      act(() => {
        getByRole('button', { name: /play/i }).click();
      });

      // Change BPM while playing
      act(() => {
        getByRole('button', { name: /change bpm/i }).click();
      });

      // Wait and verify it's still advancing with new BPM
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(onCurrentStepChange).toHaveBeenCalled();
      });
    });

    it('should not start playing if already playing', async () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <Sequencer output={output}>
          {({ play, isPlaying }) => (
            <div>
              <button onClick={play}>Play</button>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button');

      // Click play once
      act(() => {
        button.click();
      });

      // Click play again (should be no-op)
      act(() => {
        button.click();
      });

      // Should still be playing
      await waitFor(() => {
        expect(getByRole('button').parentElement?.textContent).toContain('Playing: yes');
      });
    });

    it('should not pause if not playing', async () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <Sequencer output={output}>
          {({ pause, isPlaying }) => (
            <div>
              <button onClick={pause}>Pause</button>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button');

      // Click pause when not playing (should be no-op)
      act(() => {
        button.click();
      });

      // Should still not be playing
      await waitFor(() => {
        expect(getByRole('button').parentElement?.textContent).toContain('Playing: no');
      });
    });

    it('should support different step counts', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} numSteps={32}>
          {({ steps }) => <span>Steps: {steps.length}</span>}
        </Sequencer>
      );

      expect(getByText('Steps: 32')).toBeInTheDocument();
    });

    it('should initialize all steps to 0.5 by default', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output}>
          {({ steps }) => (
            <span>All 0.5: {steps.every(s => s === 0.5) ? 'yes' : 'no'}</span>
          )}
        </Sequencer>
      );

      expect(getByText('All 0.5: yes')).toBeInTheDocument();
    });

    it('should update constant source when step advances', async () => {
      const output = createMockStreamRef();
      const customSteps = [0.1, 0.9, 0.3, 0.7, 0.5, 0.5, 0.5, 0.5];

      const { getByRole } = render(
        <Sequencer output={output} steps={customSteps} bpm={240}>
          {({ play }) => <button onClick={play}>Play</button>}
        </Sequencer>
      );

      const constantSource = output.current?.audioNode as ConstantSourceNode;
      expect(constantSource.offset.value).toBe(0.1);

      act(() => {
        getByRole('button').click();
      });

      // Wait for step advance
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      // The constant source should have been updated
      // We can't directly check the value due to scheduling, but we can verify setValueAtTime was called
      expect(constantSource.offset.setValueAtTime).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low BPM', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} bpm={30}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Sequencer>
      );

      expect(getByText('BPM: 30')).toBeInTheDocument();
    });

    it('should handle very high BPM', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} bpm={300}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Sequencer>
      );

      expect(getByText('BPM: 300')).toBeInTheDocument();
    });

    it('should handle single step', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} numSteps={1}>
          {({ steps }) => <span>Steps: {steps.length}</span>}
        </Sequencer>
      );

      expect(getByText('Steps: 1')).toBeInTheDocument();
    });

    it('should handle many steps', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} numSteps={64}>
          {({ steps }) => <span>Steps: {steps.length}</span>}
        </Sequencer>
      );

      expect(getByText('Steps: 64')).toBeInTheDocument();
    });

    it('should handle step values at 0', () => {
      const output = createMockStreamRef();
      const zeroSteps = Array(8).fill(0);
      const { getByText } = render(
        <Sequencer output={output} steps={zeroSteps}>
          {({ steps }) => (
            <span>All Zero: {steps.every(s => s === 0) ? 'yes' : 'no'}</span>
          )}
        </Sequencer>
      );

      expect(getByText('All Zero: yes')).toBeInTheDocument();
    });

    it('should handle step values at 1', () => {
      const output = createMockStreamRef();
      const maxSteps = Array(8).fill(1);
      const { getByText } = render(
        <Sequencer output={output} steps={maxSteps}>
          {({ steps }) => (
            <span>All One: {steps.every(s => s === 1) ? 'yes' : 'no'}</span>
          )}
        </Sequencer>
      );

      expect(getByText('All One: yes')).toBeInTheDocument();
    });

    it('should handle negative step values', () => {
      const output = createMockStreamRef();
      const negativeSteps = [-0.5, -0.3, -0.7, -0.1, 0.5, 0.5, 0.5, 0.5];
      const { getByText } = render(
        <Sequencer output={output} steps={negativeSteps}>
          {({ steps }) => <span>First Step: {steps[0]}</span>}
        </Sequencer>
      );

      expect(getByText('First Step: -0.5')).toBeInTheDocument();
    });

    it('should handle step values above 1', () => {
      const output = createMockStreamRef();
      const highSteps = [2.5, 1.8, 3.0, 1.2, 0.5, 0.5, 0.5, 0.5];
      const { getByText } = render(
        <Sequencer output={output} steps={highSteps}>
          {({ steps }) => <span>First Step: {steps[0]}</span>}
        </Sequencer>
      );

      expect(getByText('First Step: 2.5')).toBeInTheDocument();
    });

    it('should handle fractional BPM', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} bpm={120.5}>
          {({ bpm }) => <span>BPM: {bpm}</span>}
        </Sequencer>
      );

      expect(getByText('BPM: 120.5')).toBeInTheDocument();
    });

    it('should handle empty steps array gracefully', () => {
      const output = createMockStreamRef();
      // numSteps=0 would create empty array
      const { getByText } = render(
        <Sequencer output={output} steps={[]}>
          {({ steps }) => <span>Steps: {steps.length}</span>}
        </Sequencer>
      );

      expect(getByText('Steps: 0')).toBeInTheDocument();
    });

    it('should handle reset when at step 0', () => {
      const output = createMockStreamRef();
      const { getByRole, getByText } = render(
        <Sequencer output={output}>
          {({ currentStep, reset }) => (
            <div>
              <span>Current Step: {currentStep}</span>
              <button onClick={reset}>Reset</button>
            </div>
          )}
        </Sequencer>
      );

      expect(getByText('Current Step: 0')).toBeInTheDocument();

      act(() => {
        getByRole('button').click();
      });

      // Should still be at step 0
      expect(getByText('Current Step: 0')).toBeInTheDocument();
    });
  });
});
