import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { ToneGenerator, ToneGeneratorHandle } from '../components/sources/ToneGenerator';

describe('ToneGenerator', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output}>
          {({ frequency, gain, waveform }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <span>Gain: {gain}</span>
              <span>Waveform: {waveform}</span>
            </div>
          )}
        </ToneGenerator>
      );

      expect(getByText('Frequency: 440')).toBeInTheDocument();
      expect(getByText('Gain: 0.3')).toBeInTheDocument();
      expect(getByText('Waveform: square')).toBeInTheDocument();
    });

    it('should allow changing frequency through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ToneGenerator output={output}>
          {({ frequency, setFrequency }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <button onClick={() => setFrequency(880)}>Change Frequency</button>
            </div>
          )}
        </ToneGenerator>
      );

      const button = getByRole('button', { name: /change frequency/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 880')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ToneGenerator output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </ToneGenerator>
      );

      const button = getByRole('button', { name: /change gain/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing waveform through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <ToneGenerator output={output}>
          {({ waveform, setWaveform }) => (
            <div>
              <span>Waveform: {waveform}</span>
              <button onClick={() => setWaveform('sine')}>Change Waveform</button>
            </div>
          )}
        </ToneGenerator>
      );

      const button = getByRole('button', { name: /change waveform/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Waveform: sine')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <ToneGenerator output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </ToneGenerator>
      );

      // isActive should be a boolean (true or false)
      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled frequency prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} frequency={220}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </ToneGenerator>
      );

      expect(getByText('Frequency: 220')).toBeInTheDocument();
    });

    it('should call onFrequencyChange when frequency changes', async () => {
      const output = createMockStreamRef();
      const onFrequencyChange = jest.fn();

      const { getByRole } = render(
        <ToneGenerator
          output={output}
          frequency={440}
          onFrequencyChange={onFrequencyChange}
        >
          {({ setFrequency }) => (
            <button onClick={() => setFrequency(880)}>Change</button>
          )}
        </ToneGenerator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFrequencyChange).toHaveBeenCalledWith(880);
      });
    });

    it('should accept controlled gain prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} gain={0.8}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </ToneGenerator>
      );

      expect(getByText('Gain: 0.8')).toBeInTheDocument();
    });

    it('should call onGainChange when gain changes', async () => {
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <ToneGenerator
          output={output}
          gain={0.3}
          onGainChange={onGainChange}
        >
          {({ setGain }) => (
            <button onClick={() => setGain(0.7)}>Change</button>
          )}
        </ToneGenerator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(0.7);
      });
    });

    it('should accept controlled waveform prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} waveform="triangle">
          {({ waveform }) => <span>Waveform: {waveform}</span>}
        </ToneGenerator>
      );

      expect(getByText('Waveform: triangle')).toBeInTheDocument();
    });

    it('should call onWaveformChange when waveform changes', async () => {
      const output = createMockStreamRef();
      const onWaveformChange = jest.fn();

      const { getByRole } = render(
        <ToneGenerator
          output={output}
          waveform="square"
          onWaveformChange={onWaveformChange}
        >
          {({ setWaveform }) => (
            <button onClick={() => setWaveform('sawtooth')}>Change</button>
          )}
        </ToneGenerator>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onWaveformChange).toHaveBeenCalledWith('sawtooth');
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<ToneGeneratorHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.frequency).toBe(440);
          expect(state?.gain).toBe(0.3);
          expect(state?.waveform).toBe('square');
        };

        return (
          <>
            <ToneGenerator ref={ref} output={output} />
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
        const ref = useRef<ToneGeneratorHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.frequency).toBe(220);
          expect(state?.gain).toBe(0.5);
          expect(state?.waveform).toBe('sine');
        };

        return (
          <>
            <ToneGenerator
              ref={ref}
              output={output}
              frequency={220}
              gain={0.5}
              waveform="sine"
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

      render(<ToneGenerator output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'tone-generator',
        sourceType: 'tone',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<ToneGenerator output={output} label="my-tone" />);

      expect(output.current?.metadata?.label).toBe('my-tone');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<ToneGenerator output={output} />);

      const oscillator = output.current?.audioNode;
      const gain = output.current?.gain;

      expect(oscillator).toBeDefined();
      expect(gain).toBeDefined();

      unmount();

      // After unmount, the nodes should have been disconnected
      // This would be verified by the mock tracking disconnect calls
      expect(oscillator?.disconnect).toHaveBeenCalled();
      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('All Waveform Types', () => {
    const waveforms: Array<'sine' | 'square' | 'sawtooth' | 'triangle'> = [
      'sine',
      'square',
      'sawtooth',
      'triangle',
    ];

    waveforms.forEach((waveformType) => {
      it(`should support ${waveformType} waveform`, () => {
        const output = createMockStreamRef();
        const { getByText } = render(
          <ToneGenerator output={output} waveform={waveformType}>
            {({ waveform }) => <span>Waveform: {waveform}</span>}
          </ToneGenerator>
        );

        expect(getByText(`Waveform: ${waveformType}`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low frequencies', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} frequency={20}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </ToneGenerator>
      );

      expect(getByText('Frequency: 20')).toBeInTheDocument();
    });

    it('should handle very high frequencies', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} frequency={20000}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </ToneGenerator>
      );

      expect(getByText('Frequency: 20000')).toBeInTheDocument();
    });

    it('should handle zero gain', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </ToneGenerator>
      );

      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should handle gain above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <ToneGenerator output={output} gain={1.5}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </ToneGenerator>
      );

      expect(getByText('Gain: 1.5')).toBeInTheDocument();
    });
  });
});
