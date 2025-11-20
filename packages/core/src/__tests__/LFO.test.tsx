import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { LFO, LFOHandle, LFOWaveform } from '../components/cv/LFO';

describe('LFO', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output}>
          {({ frequency, amplitude, waveform }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <span>Amplitude: {amplitude}</span>
              <span>Waveform: {waveform}</span>
            </div>
          )}
        </LFO>
      );

      expect(getByText('Frequency: 1')).toBeInTheDocument();
      expect(getByText('Amplitude: 1')).toBeInTheDocument();
      expect(getByText('Waveform: sine')).toBeInTheDocument();
    });

    it('should allow changing frequency through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <LFO output={output}>
          {({ frequency, setFrequency }) => (
            <div>
              <span>Frequency: {frequency}</span>
              <button onClick={() => setFrequency(5)}>Change Frequency</button>
            </div>
          )}
        </LFO>
      );

      const button = getByRole('button', { name: /change frequency/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Frequency: 5')).toBeInTheDocument();
      });
    });

    it('should allow changing amplitude through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <LFO output={output}>
          {({ amplitude, setAmplitude }) => (
            <div>
              <span>Amplitude: {amplitude}</span>
              <button onClick={() => setAmplitude(0.5)}>Change Amplitude</button>
            </div>
          )}
        </LFO>
      );

      const button = getByRole('button', { name: /change amplitude/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Amplitude: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing waveform through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <LFO output={output}>
          {({ waveform, setWaveform }) => (
            <div>
              <span>Waveform: {waveform}</span>
              <button onClick={() => setWaveform('square')}>Change Waveform</button>
            </div>
          )}
        </LFO>
      );

      const button = getByRole('button', { name: /change waveform/i });

      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(getByText('Waveform: square')).toBeInTheDocument();
      });
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <LFO output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </LFO>
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
        <LFO output={output} frequency={2}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </LFO>
      );

      expect(getByText('Frequency: 2')).toBeInTheDocument();
    });

    it('should call onFrequencyChange when frequency changes', async () => {
      const output = createMockStreamRef();
      const onFrequencyChange = jest.fn();

      const { getByRole } = render(
        <LFO
          output={output}
          frequency={1}
          onFrequencyChange={onFrequencyChange}
        >
          {({ setFrequency }) => (
            <button onClick={() => setFrequency(10)}>Change</button>
          )}
        </LFO>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onFrequencyChange).toHaveBeenCalledWith(10);
      });
    });

    it('should accept controlled amplitude prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} amplitude={0.75}>
          {({ amplitude }) => <span>Amplitude: {amplitude}</span>}
        </LFO>
      );

      expect(getByText('Amplitude: 0.75')).toBeInTheDocument();
    });

    it('should call onAmplitudeChange when amplitude changes', async () => {
      const output = createMockStreamRef();
      const onAmplitudeChange = jest.fn();

      const { getByRole } = render(
        <LFO
          output={output}
          amplitude={1}
          onAmplitudeChange={onAmplitudeChange}
        >
          {({ setAmplitude }) => (
            <button onClick={() => setAmplitude(0.25)}>Change</button>
          )}
        </LFO>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onAmplitudeChange).toHaveBeenCalledWith(0.25);
      });
    });

    it('should accept controlled waveform prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} waveform="triangle">
          {({ waveform }) => <span>Waveform: {waveform}</span>}
        </LFO>
      );

      expect(getByText('Waveform: triangle')).toBeInTheDocument();
    });

    it('should call onWaveformChange when waveform changes', async () => {
      const output = createMockStreamRef();
      const onWaveformChange = jest.fn();

      const { getByRole } = render(
        <LFO
          output={output}
          waveform="sine"
          onWaveformChange={onWaveformChange}
        >
          {({ setWaveform }) => (
            <button onClick={() => setWaveform('sawtooth')}>Change</button>
          )}
        </LFO>
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
        const ref = useRef<LFOHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.frequency).toBe(1);
          expect(state?.amplitude).toBe(1);
          expect(state?.waveform).toBe('sine');
        };

        return (
          <>
            <LFO ref={ref} output={output} />
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
        const ref = useRef<LFOHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state?.frequency).toBe(3);
          expect(state?.amplitude).toBe(0.8);
          expect(state?.waveform).toBe('square');
        };

        return (
          <>
            <LFO
              ref={ref}
              output={output}
              frequency={3}
              amplitude={0.8}
              waveform="square"
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

      render(<LFO output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'lfo',
        sourceType: 'cv',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<LFO output={output} label="my-lfo" />);

      expect(output.current?.metadata?.label).toBe('my-lfo');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<LFO output={output} />);

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
    const waveforms: LFOWaveform[] = [
      'sine',
      'square',
      'sawtooth',
      'triangle',
    ];

    waveforms.forEach((waveformType) => {
      it(`should support ${waveformType} waveform`, () => {
        const output = createMockStreamRef();
        const { getByText } = render(
          <LFO output={output} waveform={waveformType}>
            {({ waveform }) => <span>Waveform: {waveform}</span>}
          </LFO>
        );

        expect(getByText(`Waveform: ${waveformType}`)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low frequencies', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} frequency={0.01}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </LFO>
      );

      expect(getByText('Frequency: 0.01')).toBeInTheDocument();
    });

    it('should handle very high frequencies', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} frequency={100}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </LFO>
      );

      expect(getByText('Frequency: 100')).toBeInTheDocument();
    });

    it('should handle zero amplitude', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} amplitude={0}>
          {({ amplitude }) => <span>Amplitude: {amplitude}</span>}
        </LFO>
      );

      expect(getByText('Amplitude: 0')).toBeInTheDocument();
    });

    it('should handle amplitude above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} amplitude={2.5}>
          {({ amplitude }) => <span>Amplitude: {amplitude}</span>}
        </LFO>
      );

      expect(getByText('Amplitude: 2.5')).toBeInTheDocument();
    });

    it('should handle negative amplitude', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} amplitude={-0.5}>
          {({ amplitude }) => <span>Amplitude: {amplitude}</span>}
        </LFO>
      );

      expect(getByText('Amplitude: -0.5')).toBeInTheDocument();
    });

    it('should handle fractional frequencies', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <LFO output={output} frequency={0.5}>
          {({ frequency }) => <span>Frequency: {frequency}</span>}
        </LFO>
      );

      expect(getByText('Frequency: 0.5')).toBeInTheDocument();
    });
  });
});
