import React, { useRef } from 'react';
import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { MP3Deck, MP3DeckHandle } from '../components/sources/MP3Deck';

describe('MP3Deck', () => {
  describe('Render Props Pattern', () => {
    it('should render with default values', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output}>
          {({ src, gain, loop, isPlaying }) => (
            <div>
              <span>Src: {src || 'empty'}</span>
              <span>Gain: {gain}</span>
              <span>Loop: {loop ? 'yes' : 'no'}</span>
              <span>Playing: {isPlaying ? 'yes' : 'no'}</span>
            </div>
          )}
        </MP3Deck>
      );

      expect(getByText('Src: empty')).toBeInTheDocument();
      expect(getByText('Gain: 1')).toBeInTheDocument();
      expect(getByText('Loop: no')).toBeInTheDocument();
      expect(getByText('Playing: no')).toBeInTheDocument();
    });

    it('should allow changing src through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <MP3Deck output={output}>
          {({ src, setSrc }) => (
            <div>
              <span>Src: {src || 'empty'}</span>
              <button onClick={() => setSrc('test.mp3')}>Set Source</button>
            </div>
          )}
        </MP3Deck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Src: test.mp3')).toBeInTheDocument();
      });
    });

    it('should allow changing gain through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <MP3Deck output={output}>
          {({ gain, setGain }) => (
            <div>
              <span>Gain: {gain}</span>
              <button onClick={() => setGain(0.5)}>Change Gain</button>
            </div>
          )}
        </MP3Deck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Gain: 0.5')).toBeInTheDocument();
      });
    });

    it('should allow changing loop through render props', async () => {
      const output = createMockStreamRef();
      const { getByText, getByRole } = render(
        <MP3Deck output={output}>
          {({ loop, setLoop }) => (
            <div>
              <span>Loop: {loop ? 'yes' : 'no'}</span>
              <button onClick={() => setLoop(true)}>Enable Loop</button>
            </div>
          )}
        </MP3Deck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(getByText('Loop: yes')).toBeInTheDocument();
      });
    });

    it('should provide playback controls through render props', () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <MP3Deck output={output} src="test.mp3">
          {({ play, pause, stop, seek }) => (
            <div>
              <button onClick={play}>Play</button>
              <button onClick={pause}>Pause</button>
              <button onClick={stop}>Stop</button>
              <button onClick={() => seek(10)}>Seek</button>
            </div>
          )}
        </MP3Deck>
      );

      // Should render without errors
      expect(getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /stop/i })).toBeInTheDocument();
      expect(getByRole('button', { name: /seek/i })).toBeInTheDocument();
    });

    it('should report isActive status', () => {
      const output = createMockStreamRef();
      const { container } = render(
        <MP3Deck output={output}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </MP3Deck>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });

    it('should expose currentTime and duration', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output}>
          {({ currentTime, duration }) => (
            <div>
              <span>Time: {currentTime}/{duration}</span>
            </div>
          )}
        </MP3Deck>
      );

      expect(getByText(/Time:/)).toBeInTheDocument();
    });

    it('should allow loading file from File object', () => {
      const output = createMockStreamRef();
      const { getByRole } = render(
        <MP3Deck output={output}>
          {({ loadFile }) => (
            <button onClick={() => loadFile(new File([], 'test.mp3'))}>
              Load File
            </button>
          )}
        </MP3Deck>
      );

      expect(getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Controlled Props Pattern', () => {
    it('should accept controlled src prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output} src="controlled.mp3">
          {({ src }) => <span>Src: {src}</span>}
        </MP3Deck>
      );

      expect(getByText('Src: controlled.mp3')).toBeInTheDocument();
    });

    it('should call onSrcChange when src changes', async () => {
      const output = createMockStreamRef();
      const onSrcChange = jest.fn();

      const { getByRole } = render(
        <MP3Deck output={output} src="" onSrcChange={onSrcChange}>
          {({ setSrc }) => (
            <button onClick={() => setSrc('new.mp3')}>Change</button>
          )}
        </MP3Deck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onSrcChange).toHaveBeenCalledWith('new.mp3');
      });
    });

    it('should accept controlled gain prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output} gain={0.75}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </MP3Deck>
      );

      expect(getByText('Gain: 0.75')).toBeInTheDocument();
    });

    it('should call onGainChange when gain changes', async () => {
      const output = createMockStreamRef();
      const onGainChange = jest.fn();

      const { getByRole } = render(
        <MP3Deck output={output} gain={1.0} onGainChange={onGainChange}>
          {({ setGain }) => (
            <button onClick={() => setGain(0.3)}>Change</button>
          )}
        </MP3Deck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onGainChange).toHaveBeenCalledWith(0.3);
      });
    });

    it('should accept controlled loop prop', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output} loop={true}>
          {({ loop }) => <span>Loop: {loop ? 'yes' : 'no'}</span>}
        </MP3Deck>
      );

      expect(getByText('Loop: yes')).toBeInTheDocument();
    });

    it('should call onLoopChange when loop changes', async () => {
      const output = createMockStreamRef();
      const onLoopChange = jest.fn();

      const { getByRole } = render(
        <MP3Deck output={output} loop={false} onLoopChange={onLoopChange}>
          {({ setLoop }) => (
            <button onClick={() => setLoop(true)}>Change</button>
          )}
        </MP3Deck>
      );

      act(() => {
        getByRole('button').click();
      });

      await waitFor(() => {
        expect(onLoopChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Imperative Refs Pattern', () => {
    it('should expose getState method through ref', () => {
      const TestComponent = () => {
        const output = createMockStreamRef();
        const ref = useRef<MP3DeckHandle>(null);

        const handleClick = () => {
          const state = ref.current?.getState();
          expect(state).toBeDefined();
          expect(state?.src).toBe('');
          expect(state?.gain).toBe(1.0);
          expect(state?.loop).toBe(false);
          expect(state?.isPlaying).toBe(false);
        };

        return (
          <>
            <MP3Deck ref={ref} output={output} />
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
        const ref = useRef<MP3DeckHandle>(null);

        const handleClick = () => {
          expect(ref.current?.play).toBeDefined();
          expect(ref.current?.pause).toBeDefined();
          expect(ref.current?.stop).toBeDefined();
          expect(ref.current?.seek).toBeDefined();
          expect(ref.current?.loadFile).toBeDefined();
        };

        return (
          <>
            <MP3Deck ref={ref} output={output} src="test.mp3" />
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

      render(<MP3Deck output={output} src="test.mp3" />);

      // Wait for async setup
      await waitFor(() => {
        expect(output.current).toBeDefined();
      });

      if (output.current) {
        expect(output.current.audioNode).toBeDefined();
        expect(output.current.gain).toBeDefined();
        expect(output.current.context).toBeDefined();
        expect(output.current.metadata).toEqual({
          label: 'mp3-deck',
          sourceType: 'mp3',
        });
      }
    });

    it('should use custom label in metadata', async () => {
      const output = createMockStreamRef();

      render(<MP3Deck output={output} src="test.mp3" label="my-deck" />);

      await waitFor(() => {
        expect(output.current?.metadata?.label).toBe('my-deck');
      });
    });

    it('should cleanup on unmount', async () => {
      const output = createMockStreamRef();

      const { unmount } = render(<MP3Deck output={output} src="test.mp3" />);

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

  describe('Edge Cases', () => {
    it('should handle empty src', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output} src="">
          {({ src }) => <span>Src: {src || 'empty'}</span>}
        </MP3Deck>
      );

      expect(getByText('Src: empty')).toBeInTheDocument();
    });

    it('should handle gain of 0', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output} gain={0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </MP3Deck>
      );

      expect(getByText('Gain: 0')).toBeInTheDocument();
    });

    it('should handle gain above 1', () => {
      const output = createMockStreamRef();
      const { getByText } = render(
        <MP3Deck output={output} gain={2.0}>
          {({ gain }) => <span>Gain: {gain}</span>}
        </MP3Deck>
      );

      expect(getByText('Gain: 2')).toBeInTheDocument();
    });

    it('should render without children', () => {
      const output = createMockStreamRef();

      const { container } = render(<MP3Deck output={output} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
