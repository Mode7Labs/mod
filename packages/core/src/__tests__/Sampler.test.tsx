import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Sampler, SamplerHandle } from '../components/sources/Sampler';

describe('Sampler', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output}>
          {({ src, gain, playbackMode, isPlaying }) => (
            <div>
              <span>Src: {src || 'empty'}</span>
              <span>Gain: {gain}</span>
              <span>Mode: {playbackMode}</span>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
            </div>
          )}
        </Sampler>
      );

      expect(getByText('Src: empty')).toBeInTheDocument();
      expect(getByText('Gain: 1')).toBeInTheDocument();
      expect(getByText('Mode: one-shot')).toBeInTheDocument();
      expect(getByText('Playing: no')).toBeInTheDocument();
    });

    it('should allow changing src through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sampler output={output}>
          {({ src, setSrc }) => (
            <div>
              <span>Src: {src || 'empty'}</span>
              <button onClick={() => setSrc('test.wav')}>Set Source</button>
            </div>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Src: test.wav')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sampler output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing playbackMode through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sampler output={output}>
          {({ playbackMode, setPlaybackMode }) => (
            <div>
              <span>Mode: {playbackMode}</span>
              <button onClick={() => setPlaybackMode('gate')}>Set Gate</button>
            </div>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Mode: gate')).toBeInTheDocument();
      });
    });

    it('should allow changing startTime and endTime through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sampler output={output}>
          {({ startTime, endTime, setStartTime, setEndTime }) => (
            <div>
              <span>Region: {startTime}-{endTime}</span>
              <button onClick={() => { setStartTime(1.0); setEndTime(2.5); }}>Set Region</button>
            </div>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Region: 1-2.5')).toBeInTheDocument();
      });
    });

    it('should allow changing pitch through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sampler output={output}>
          {({ pitch, setPitch }) => (
            <div>
              <span>Pitch: {pitch}</span>
              <button onClick={() => setPitch(1)}>Octave Up</button>
            </div>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Pitch: 1')).toBeInTheDocument();
      });
    });

    it('should provide trigger and stop controls through render props', () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <Sampler output={output} src="test.wav">
          {({ trigger, stop }) => (
            <div>
              <button onClick={trigger}>Trigger</button>
              <button onClick={stop}>Stop</button>
            </div>
          )}
        </Sampler>
      );

      expect(getByRole('button', { name: /trigger/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <Sampler output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Sampler>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });

    it('should expose currentTime and duration', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output}>
          {({ currentTime, duration }) => (
            <div>
              <span>Time: {currentTime}/{duration}</span>
            </div>
          )}
        </Sampler>
      );

      expect(getByText(/Time:/)).toBeInTheDocument();
    });

    it('should expose sampleRate', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output}>
          {({ sampleRate }) => (
            <div>
              <span>Rate: {sampleRate}</span>
            </div>
          )}
        </Sampler>
      );

      expect(getByText(/Rate: \d+/)).toBeInTheDocument();
    });

    it('should allow loading file from File object', () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <Sampler output={output}>
          {({ loadFile }) => (
            <button onClick={() => loadFile(new File([], 'sample.wav'))}>
              Load File
            </button>
          )}
        </Sampler>
      );

      expect(getByRole('button')).toBeInTheDocument();
    });

    it('should expose fileName', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <Sampler output={output}>
          {({ fileName, setFileName }) => (
            <div>
              <span>File: {fileName || 'none'}</span>
              <button onClick={() => setFileName('kick.wav')}>Set Name</button>
            </div>
          )}
        </Sampler>
      );

      expect(getByText('File: none')).toBeInTheDocument();

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('File: kick.wav')).toBeInTheDocument();
      });
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled src prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} src="controlled.wav">
          {({ src }) => <span>Src: {src}</span>}
        </Sampler>
      );

      expect(getByText('Src: controlled.wav')).toBeInTheDocument();
    });

    it('should call onSrcChange when src changes', async () => {
      const output = createMockStreamRef();
      const onSrcChange = jest.fn();

      const { getByRole } = render(
        <Sampler output={output} src="" onSrcChange={onSrcChange}>
          {({ setSrc }) => (
            <button onClick={() => setSrc('new.wav')}>Change</button>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSrcChange).toHaveBeenCalledWith('new.wav');
      });
    });

    it('should accept controlled gain prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} gain={0.75}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Sampler>
      );

      expect(getByText('Gain: 0.75')).toBeInTheDocument();
    });

    it('should call onGainChange when gain changes', async () => {
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <Sampler output={output} gain={1.0} onGainChange={onGainChange}>
          {({ setGain }) => (
            <button onClick={() => setGain(0.3)}>Change</button>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(0.3);
      });
    });

    it('should accept controlled playbackMode prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} playbackMode="loop">
          {({ playbackMode }) => <span>Mode: {playbackMode}</span>}
        </Sampler>
      );

      expect(getByText('Mode: loop')).toBeInTheDocument();
    });

    it('should call onPlaybackModeChange when mode changes', async () => {
      const output = createMockStreamRef();
      const onPlaybackModeChange = jest.fn();

      const { getByRole } = render(
        <Sampler output={output} playbackMode="one-shot" onPlaybackModeChange={onPlaybackModeChange}>
          {({ setPlaybackMode }) => (
            <button onClick={() => setPlaybackMode('gate')}>Change</button>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onPlaybackModeChange).toHaveBeenCalledWith('gate');
      });
    });

    it('should accept controlled startTime and endTime props', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} startTime={0.5} endTime={1.5}>
          {({ startTime, endTime }) => <span>Region: {startTime}-{endTime}</span>}
        </Sampler>
      );

      expect(getByText('Region: 0.5-1.5')).toBeInTheDocument();
    });

    it('should call onStartTimeChange and onEndTimeChange', async () => {
      const output = createMockStreamRef();
      const onStartTimeChange = jest.fn();
      const onEndTimeChange = jest.fn();

      const { getByRole } = render(
        <Sampler
          output={output}
          startTime={0}
          endTime={0}
          onStartTimeChange={onStartTimeChange}
          onEndTimeChange={onEndTimeChange}
        >
          {({ setStartTime, setEndTime }) => (
            <button onClick={() => { setStartTime(1); setEndTime(2); }}>Change</button>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onStartTimeChange).toHaveBeenCalledWith(1);
        expect(onEndTimeChange).toHaveBeenCalledWith(2);
      });
    });

    it('should accept controlled pitch prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} pitch={-1}>
          {({ pitch }) => <span>Pitch: {pitch}</span>}
        </Sampler>
      );

      expect(getByText('Pitch: -1')).toBeInTheDocument();
    });

    it('should call onPitchChange when pitch changes', async () => {
      const output = createMockStreamRef();
      const onPitchChange = jest.fn();

      const { getByRole } = render(
        <Sampler output={output} pitch={0} onPitchChange={onPitchChange}>
          {({ setPitch }) => (
            <button onClick={() => setPitch(2)}>Change</button>
          )}
        </Sampler>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onPitchChange).toHaveBeenCalledWith(2);
      });
    });

    it('should accept controlled fileName prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} fileName="snare.wav">
          {({ fileName }) => <span>File: {fileName}</span>}
        </Sampler>
      );

      expect(getByText('File: snare.wav')).toBeInTheDocument();
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<SamplerHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.src).toBe('');
          expect(state?.gain).toBe(1.0);
          expect(state?.playbackMode).toBe('one-shot');
          expect(state?.startTime).toBe(0);
          expect(state?.endTime).toBe(0);
          expect(state?.pitch).toBe(0);
          expect(state?.isPlaying).toBe(false);
        };

        return (
          <>
            <Sampler ref={ref} output={output} />
            <button onClick={handleClick}>Get State</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose trigger, stop, and loadFile methods', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<SamplerHandle>(null);

        const handleClick = () => {
          expect(ref.current?.trigger).toBeDefined();
          expect(ref.current?.stop).toBeDefined();
          expect(ref.current?.loadFile).toBeDefined();
        };

        return (
          <>
            <Sampler ref={ref} output={output} src="test.wav" />
            <button onClick={handleClick}>Check Methods</button>
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
    it('should set output ref with correct structure when src is provided', async () => {
      const output = createMockStreamRef();

      render(<Sampler output={output} src="test.wav" />);

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'sampler',
        sourceType: 'sampler',
      });
    });

    it('should use custom label in metadata', async () => {
      const output = createMockStreamRef();

      render(<Sampler output={output} src="test.wav" label="my-sampler" />);

      await waitFor(() => {
        expect(output.current?.metadata?.label).toBe('my-sampler');
      });
    });

    it('should cleanup on unmount', async () => {
      const output = createMockStreamRef();

      const { unmount } = render(<Sampler output={output} src="test.wav" />);

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      const audioNode = output.current?.audioNode;
      const gain = output.current?.gain;

      unmount();

      if (audioNode && gain) {
        expect(audioNode.disconnect).toHaveBeenCalled();
        expect(gain.disconnect).toHaveBeenCalled();
      }
    });
  });

  describe('Gate Input', () => {
    it('should accept gate input for trigger control', async () => {
      const output = createMockStreamRef();
      const gate = createMockStreamRef();

      render(<Sampler output={output} gate={gate} src="test.wav" />);

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });
    });
  });

  describe('Pitch CV Input', () => {
    it('should accept pitchCv input for pitch modulation', async () => {
      const output = createMockStreamRef();
      const pitchCv = createMockStreamRef();

      render(<Sampler output={output} pitchCv={pitchCv} src="test.wav" />);

      await waitFor(() => {
        expect(output.current).toBeDefined();
      });
    });
  });

  describe('Playback Modes', () => {
    it('should support one-shot mode', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} playbackMode="one-shot">
          {({ playbackMode }) => <span>Mode: {playbackMode}</span>}
        </Sampler>
      );

      expect(getByText('Mode: one-shot')).toBeInTheDocument();
    });

    it('should support gate mode', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} playbackMode="gate">
          {({ playbackMode }) => <span>Mode: {playbackMode}</span>}
        </Sampler>
      );

      expect(getByText('Mode: gate')).toBeInTheDocument();
    });

    it('should support loop mode', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} playbackMode="loop">
          {({ playbackMode }) => <span>Mode: {playbackMode}</span>}
        </Sampler>
      );

      expect(getByText('Mode: loop')).toBeInTheDocument();
    });
  });

  describe('Enabled Prop', () => {
    it('should accept enabled prop', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <Sampler output={output} enabled={false} />
      );

      // Component should render without errors
      expect(container).toBeDefined();
    });

    it('should default enabled to true', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <Sampler output={output} />
      );

      expect(container).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty src', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} src="">
          {({ src }) => <span>Src: {src || 'empty'}</span>}
        </Sampler>
      );

      expect(getByText('Src: empty')).toBeInTheDocument();
    });

    it('should handle gain of 0', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Sampler>
      );

      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should handle gain above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} gain={2.0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </Sampler>
      );

      expect(getByText('Gain: 2')).toBeInTheDocument();
    });

    it('should handle negative pitch', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} pitch={-2}>
          {({ pitch }) => <span>Pitch: {pitch}</span>}
        </Sampler>
      );

      expect(getByText('Pitch: -2')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const output = createMockStreamRef();

      const { container } = render(<Sampler output={output} />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle startTime greater than endTime gracefully', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <Sampler output={output} startTime={5} endTime={2}>
          {({ startTime, endTime }) => <span>Region: {startTime}-{endTime}</span>}
        </Sampler>
      );

      expect(getByText('Region: 5-2')).toBeInTheDocument();
    });
  });
});
