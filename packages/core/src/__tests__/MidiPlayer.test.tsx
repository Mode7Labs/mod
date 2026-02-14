import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { MidiPlayer } from '../components/sources/MidiPlayer';

describe('MidiPlayer', () => {
  it('renders default render props', () => {
    const output = createMockStreamRef();
    const { getByText } = render(
      <MidiPlayer output={output}>
        {({ midiUrl, midiFileName, bpm, isLoaded }) => (
          <div>
            <span>MIDI URL: {midiUrl || 'none'}</span>
            <span>File: {midiFileName || 'empty'}</span>
            <span>BPM: {bpm}</span>
            <span>Loaded: {isLoaded ? 'yes' : 'no'}</span>
          </div>
        )}
      </MidiPlayer>
    );

    expect(getByText('MIDI URL: none')).toBeInTheDocument();
    expect(getByText('File: empty')).toBeInTheDocument();
    expect(getByText('BPM: 120')).toBeInTheDocument();
    expect(getByText('Loaded: no')).toBeInTheDocument();
  });

  it('allows updating midi url and bpm via render props', async () => {
    const output = createMockStreamRef();
    const { getByText, getByRole } = render(
      <MidiPlayer output={output}>
        {({ midiUrl, bpm, setMidiUrl, setBpm }) => (
          <div>
            <span>MIDI URL: {midiUrl || 'none'}</span>
            <span>BPM: {bpm}</span>
            <button onClick={() => setMidiUrl('song.mid')}>Set URL</button>
            <button onClick={() => setBpm(90)}>Set BPM</button>
          </div>
        )}
      </MidiPlayer>
    );

    act(() => {
      getByRole('button', { name: /Set URL/i }).click();
    });
    act(() => {
      getByRole('button', { name: /Set BPM/i }).click();
    });

    await waitFor(() => {
      expect(getByText('MIDI URL: song.mid')).toBeInTheDocument();
      expect(getByText('BPM: 90')).toBeInTheDocument();
    });
  });
});
