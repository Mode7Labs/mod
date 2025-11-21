import { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { StreamingAudioDeck, StreamingAudioDeckHandle } from '../components/sources/StreamingAudioDeck';

describe('StreamingAudioDeck', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <StreamingAudioDeck output={output}>
          {({ url, gain, isPlaying }) => (
            <div>
              <span>URL: {url || 'empty'}</span>
              <span>Gain: {gain}</span>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
            </div>
          )}
        </StreamingAudioDeck>
      );

      expect(getByText('URL: empty')).toBeInTheDocument();
      expect(getByText('Gain: 1')).toBeInTheDocument();
      expect(getByText('Playing: no')).toBeInTheDocument();
    });

    it('should allow changing url through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <StreamingAudioDeck output={output}>
          {({ url, setUrl }) => (
            <div>
              <span>URL: {url || 'empty'}</span>
              <button onClick={() => setUrl('http://stream.com/audio')}>Set URL</button>
            </div>
          )}
        </StreamingAudioDeck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('URL: http://stream.com/audio')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <StreamingAudioDeck output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </StreamingAudioDeck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should provide playback controls through render props', () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <StreamingAudioDeck output={output} url="http://stream.com/audio">
          {({ play, pause }) => (
            <div>
              <button onClick={play}>Play</button>
              <button onClick={pause}>Pause</button>
            </div>
          )}
        </StreamingAudioDeck>
      );

      expect(getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <StreamingAudioDeck output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </StreamingAudioDeck>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled url prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <StreamingAudioDeck output={output} url="http://controlled.com/stream">
          {({ url }) => <span>URL: {url}</span>}
        </StreamingAudioDeck>
      );

      expect(getByText('URL: http://controlled.com/stream')).toBeInTheDocument();
    });

    it('should call onUrlChange when url changes', async () => {
      const output = createMockStreamRef();
      const onUrlChange = jest.fn();

      const { getByRole } = render(
        <StreamingAudioDeck output={output} url="" onUrlChange={onUrlChange}>
          {({ setUrl }) => (
            <button onClick={() => setUrl('http://new.com/stream')}>Change</button>
          )}
        </StreamingAudioDeck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onUrlChange).toHaveBeenCalledWith('http://new.com/stream');
      });
    });

    it('should accept controlled gain prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <StreamingAudioDeck output={output} gain={0.75}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </StreamingAudioDeck>
      );

      expect(getByText('Gain: 0.75')).toBeInTheDocument();
    });

    it('should call onGainChange when gain changes', async () => {
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <StreamingAudioDeck output={output} gain={1.0} onGainChange={onGainChange}>
          {({ setGain }) => (
            <button onClick={() => setGain(0.3)}>Change</button>
          )}
        </StreamingAudioDeck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(0.3);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<StreamingAudioDeckHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.url).toBe('');
          expect(state?.gain).toBe(1.0);
          expect(state?.isPlaying).toBe(false);
        };

        return (
          <>
            <StreamingAudioDeck ref={ref} output={output} />
            <button onClick={handleClick}>Get State</button>
          </>
        );
      };

      const { getByRole } = render(<TestComponent />);

      act(() => {
        getByRole('button').click();
      });
    });

    it('should expose playback control methods', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<StreamingAudioDeckHandle>(null);

        const handleClick = () => {
          expect(ref.current?.play).toBeDefined();
          expect(ref.current?.pause).toBeDefined();
        };

        return (
          <>
            <StreamingAudioDeck ref={ref} output={output} url="http://test.com/stream" />
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
    it('should set output ref with correct structure', () => {
      const output = createMockStreamRef();

      render(<StreamingAudioDeck output={output} />);

      expect(output.current).toBeDefined();
      expect(output.current?.audioNode).toBeDefined();
      expect(output.current?.gain).toBeDefined();
      expect(output.current?.context).toBeDefined();
      expect(output.current?.metadata).toEqual({
        label: 'streaming-audio-deck',
        sourceType: 'stream',
      });
    });

    it('should use custom label in metadata', () => {
      const output = createMockStreamRef();

      render(<StreamingAudioDeck output={output} label="my-stream" />);

      expect(output.current?.metadata?.label).toBe('my-stream');
    });

    it('should cleanup on unmount', () => {
      const output = createMockStreamRef();

      const { unmount } = render(<StreamingAudioDeck output={output} />);

      const gain = output.current?.gain;

      expect(gain).toBeDefined();

      unmount();

      expect(gain?.disconnect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty url', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <StreamingAudioDeck output={output} url="">
          {({ url }) => <span>URL: {url || 'empty'}</span>}
        </StreamingAudioDeck>
      );

      expect(getByText('URL: empty')).toBeInTheDocument();
    });

    it('should handle gain of 0', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <StreamingAudioDeck output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </StreamingAudioDeck>
      );

      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should handle gain above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <StreamingAudioDeck output={output} gain={2.0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </StreamingAudioDeck>
      );

      expect(getByText('Gain: 2')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const output = createMockStreamRef();

      const { container } = render(<StreamingAudioDeck output={output} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
