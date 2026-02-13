import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Sequencer, SequencerHandle, Step } from '../components/cv/Sequencer';

describe('Sequencer', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', async () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output}>
          {({ steps, currentStep, division, length, swing }) => (
            <div>
              <span>Steps: {steps.length}</span>
              <span>Current Step: {currentStep}</span>
              <span>Division: {division}</span>
              <span>Length: {length}</span>
              <span>Swing: {swing}</span>
            </div>
          )}
        </Sequencer>
      );

      await waitFor(() => {
        expect(getByText('Steps: 8')).toBeInTheDocument();
        expect(getByText('Current Step: 0')).toBeInTheDocument();
        expect(getByText('Division: 4')).toBeInTheDocument();
        expect(getByText('Length: 8')).toBeInTheDocument();
        expect(getByText('Swing: 0')).toBeInTheDocument();
      });
    });

    it('should allow changing steps through render props', async () => {
      const output = createMockStreamRef();
      const newSteps: Step[] = [
        { active: true, value: 0.8, lengthPct: 80, slide: false, accent: false },
        { active: false, value: 0.6, lengthPct: 80, slide: false, accent: false },
        { active: true, value: 0.4, lengthPct: 80, slide: true, accent: false },
        { active: false, value: 0.2, lengthPct: 80, slide: false, accent: true },
        { active: false, value: 0, lengthPct: 80, slide: false, accent: false },
        { active: false, value: 0, lengthPct: 80, slide: false, accent: false },
        { active: false, value: 0, lengthPct: 80, slide: false, accent: false },
        { active: false, value: 0, lengthPct: 80, slide: false, accent: false },
      ];

      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ steps, setSteps }) => (
            <div>
              <span>First Active: {steps[0]?.active ? 'yes' : 'no'}</span>
              <span>First Value: {steps[0]?.value}</span>
              <button onClick={() => setSteps(newSteps)}>Change Steps</button>
            </div>
          )}
        </Sequencer>
      );

      expect(getByText('First Active: no')).toBeInTheDocument();

      const button = getByRole('button', { name: /change steps/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('First Active: yes')).toBeInTheDocument();
        expect(getByText('First Value: 0.8')).toBeInTheDocument();
      });
    });

    it('should allow changing division through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ division, setDivision }) => (
            <div>
              <span>Division: {division}</span>
              <button onClick={() => setDivision(8)}>Change Division</button>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button', { name: /change division/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Division: 8')).toBeInTheDocument();
      });
    });

    it('should allow changing length through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ length, setLength }) => (
            <div>
              <span>Length: {length}</span>
              <button onClick={() => setLength(16)}>Change Length</button>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button', { name: /change length/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Length: 16')).toBeInTheDocument();
      });
    });

    it('should allow changing swing through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ swing, setSwing }) => (
            <div>
              <span>Swing: {swing}</span>
              <button onClick={() => setSwing(25)}>Change Swing</button>
            </div>
          )}
        </Sequencer>
      );

      const button = getByRole('button', { name: /change swing/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Swing: 25')).toBeInTheDocument();
      });
    });

    it('should allow resetting through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
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

      const resetButton = getByRole('button', { name: /reset/i });

      act(() => {
        resetButton.click();
      });

      await waitFor(() => {
        expect(getByText('Current Step: 0')).toBeInTheDocument();
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
      const customSteps: Step[] = [
        { active: true, value: 0.5, lengthPct: 80, slide: false, accent: false },
        { active: false, value: 0.3, lengthPct: 80, slide: false, accent: false },
        { active: true, value: 0.7, lengthPct: 80, slide: true, accent: false },
        { active: false, value: 0.1, lengthPct: 80, slide: false, accent: true },
      ];
      const { getByText } = render(
        <Sequencer output={output} steps={customSteps} numSteps={4}>
          {({ steps }) => <span>First Active: {steps[0]?.active ? 'yes' : 'no'}</span>}
        </Sequencer>
      );

      expect(getByText('First Active: yes')).toBeInTheDocument();
    });

    it('should call onStepsChange when steps change', async () => {
      const output = createMockStreamRef();
      const onStepsChange = jest.fn();
      const initialSteps: Step[] = Array(8).fill(null).map(() => ({
        active: false,
        value: 0,
        lengthPct: 80,
        slide: false,
        accent: false,
      }));
      const newSteps: Step[] = Array(8).fill(null).map(() => ({
        active: true,
        value: 0.5,
        lengthPct: 90,
        slide: false,
        accent: false,
      }));

      const { getByRole } = render(
        <Sequencer
          output={output}
          steps={initialSteps}
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
        expect(onStepsChange).toHaveBeenCalled();
      });
    });

    it('should accept controlled division prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} division={8}>
          {({ division }) => <span>Division: {division}</span>}
        </Sequencer>
      );

      expect(getByText('Division: 8')).toBeInTheDocument();
    });

    it('should call onDivisionChange when division changes', async () => {
      const output = createMockStreamRef();
      const onDivisionChange = jest.fn();

      const { getByRole } = render(
        <Sequencer
          output={output}
          division={4}
          onDivisionChange={onDivisionChange}
        >
          {({ setDivision }) => (
            <button onClick={() => setDivision(16)}>Change</button>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onDivisionChange).toHaveBeenCalledWith(16);
      });
    });

    it('should accept controlled length prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} length={16}>
          {({ length }) => <span>Length: {length}</span>}
        </Sequencer>
      );

      expect(getByText('Length: 16')).toBeInTheDocument();
    });

    it('should call onLengthChange when length changes', async () => {
      const output = createMockStreamRef();
      const onLengthChange = jest.fn();

      const { getByRole } = render(
        <Sequencer
          output={output}
          length={8}
          onLengthChange={onLengthChange}
        >
          {({ setLength }) => (
            <button onClick={() => setLength(32)}>Change</button>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onLengthChange).toHaveBeenCalledWith(32);
      });
    });

    it('should accept controlled swing prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} swing={30}>
          {({ swing }) => <span>Swing: {swing}</span>}
        </Sequencer>
      );

      expect(getByText('Swing: 30')).toBeInTheDocument();
    });

    it('should call onSwingChange when swing changes', async () => {
      const output = createMockStreamRef();
      const onSwingChange = jest.fn();

      const { getByRole } = render(
        <Sequencer
          output={output}
          swing={0}
          onSwingChange={onSwingChange}
        >
          {({ setSwing }) => (
            <button onClick={() => setSwing(50)}>Change</button>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSwingChange).toHaveBeenCalledWith(50);
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
          expect(state?.division).toBe(4);
          expect(state?.length).toBe(8);
          expect(state?.swing).toBe(0);
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
        const customSteps: Step[] = [
          { active: true, value: 0.5, lengthPct: 80, slide: false, accent: false },
          { active: false, value: 0.3, lengthPct: 80, slide: false, accent: false },
          { active: true, value: 0.7, lengthPct: 80, slide: true, accent: false },
          { active: false, value: 0.1, lengthPct: 80, slide: false, accent: true },
        ];

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.steps).toHaveLength(4);
          expect(state?.division).toBe(8);
          expect(state?.swing).toBe(25);
        };

        return (
          <>
            <Sequencer
              ref={ref}
              output={output}
              steps={customSteps}
              division={8}
              swing={25}
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

    it('should set gate output ref when provided', () => {
      const output = createMockStreamRef();
      const gateOutput = createMockStreamRef();

      render(<Sequencer output={output} gateOutput={gateOutput} />);

      expect(gateOutput.current).toBeDefined();
      expect(gateOutput.current?.audioNode).toBeDefined();
      expect(gateOutput.current?.metadata?.label).toBe('sequencer-gate');
    });

    it('should set accent output ref when provided', () => {
      const output = createMockStreamRef();
      const accentOutput = createMockStreamRef();

      render(<Sequencer output={output} accentOutput={accentOutput} />);

      expect(accentOutput.current).toBeDefined();
      expect(accentOutput.current?.audioNode).toBeDefined();
      expect(accentOutput.current?.metadata?.label).toBe('sequencer-accent');
    });

    it('should expose initial step value to render props', () => {
      const output = createMockStreamRef();
      const customSteps: Step[] = [
        { active: true, value: 0.75, lengthPct: 80, slide: false, accent: false },
        { active: false, value: 0.25, lengthPct: 80, slide: false, accent: false },
      ];

      const { getByText } = render(
        <Sequencer output={output} steps={customSteps} numSteps={2}>
          {({ steps }) => (
            <span>Value: {steps[0]?.value}</span>
          )}
        </Sequencer>
      );

      expect(getByText('Value: 0.75')).toBeInTheDocument();
    });
  });

  describe('Step Model', () => {
    it('should initialize steps with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output}>
          {({ steps }) => {
            const firstStep = steps[0];
            return (
              <div>
                <span>Active: {firstStep?.active ? 'yes' : 'no'}</span>
                <span>Value: {firstStep?.value}</span>
                <span>LengthPct: {firstStep?.lengthPct}</span>
                <span>Slide: {firstStep?.slide ? 'yes' : 'no'}</span>
                <span>Accent: {firstStep?.accent ? 'yes' : 'no'}</span>
              </div>
            );
          }}
        </Sequencer>
      );

      expect(getByText('Active: no')).toBeInTheDocument();
      expect(getByText('Value: 0')).toBeInTheDocument();
      expect(getByText('LengthPct: 80')).toBeInTheDocument();
      expect(getByText('Slide: no')).toBeInTheDocument();
      expect(getByText('Accent: no')).toBeInTheDocument();
    });

    it('should support step with slide enabled', () => {
      const output = createMockStreamRef();
      const customSteps: Step[] = [
        { active: true, value: 0.5, lengthPct: 80, slide: true, accent: false },
      ];
      const { getByText } = render(
        <Sequencer output={output} steps={customSteps} numSteps={1}>
          {({ steps }) => <span>Slide: {steps[0]?.slide ? 'yes' : 'no'}</span>}
        </Sequencer>
      );

      expect(getByText('Slide: yes')).toBeInTheDocument();
    });

    it('should support step with accent enabled', () => {
      const output = createMockStreamRef();
      const customSteps: Step[] = [
        { active: true, value: 0.5, lengthPct: 80, slide: false, accent: true },
      ];
      const { getByText } = render(
        <Sequencer output={output} steps={customSteps} numSteps={1}>
          {({ steps }) => <span>Accent: {steps[0]?.accent ? 'yes' : 'no'}</span>}
        </Sequencer>
      );

      expect(getByText('Accent: yes')).toBeInTheDocument();
    });

    it('should support custom lengthPct', () => {
      const output = createMockStreamRef();
      const customSteps: Step[] = [
        { active: true, value: 0.5, lengthPct: 50, slide: false, accent: false },
      ];
      const { getByText } = render(
        <Sequencer output={output} steps={customSteps} numSteps={1}>
          {({ steps }) => <span>LengthPct: {steps[0]?.lengthPct}</span>}
        </Sequencer>
      );

      expect(getByText('LengthPct: 50')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
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
        <Sequencer output={output} numSteps={32}>
          {({ steps }) => <span>Steps: {steps.length}</span>}
        </Sequencer>
      );

      expect(getByText('Steps: 32')).toBeInTheDocument();
    });

    it('should clamp steps to max 32 when length exceeds limit', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ steps, length, setLength }) => (
            <div>
              <span>Length: {length}</span>
              <span>Steps Count: {steps.length}</span>
              <button onClick={() => setLength(100)}>Set Length</button>
            </div>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      // Length value is set to 100, but steps array is clamped to 32
      await waitFor(() => {
        expect(getByText('Steps Count: 32')).toBeInTheDocument();
      });
    });

    it('should clamp steps to min 1 when length is 0', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sequencer output={output}>
          {({ steps, length, setLength }) => (
            <div>
              <span>Length: {length}</span>
              <span>Steps Count: {steps.length}</span>
              <button onClick={() => setLength(0)}>Set Length</button>
            </div>
          )}
        </Sequencer>
      );

      act(() => {
        getByRole('button').click();
      });

      // Length value is set to 0, but steps array is clamped to 1
      await waitFor(() => {
        expect(getByText('Steps Count: 1')).toBeInTheDocument();
      });
    });

    it('should handle negative swing', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sequencer output={output} swing={-30}>
          {({ swing }) => <span>Swing: {swing}</span>}
        </Sequencer>
      );

      expect(getByText('Swing: -30')).toBeInTheDocument();
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

      expect(getByText('Current Step: 0')).toBeInTheDocument();
    });
  });
});
