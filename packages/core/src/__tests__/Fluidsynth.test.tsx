import { act, waitFor } from '@testing-library/react';
import { render, createMockStreamRef } from './test-utils';
import { Fluidsynth } from '../components/sources/Fluidsynth';

describe('Fluidsynth', () => {
  it('renders default render props', () => {
    const output = createMockStreamRef();
    const { getByText } = render(
      <Fluidsynth output={output}>
        {({ wasmBaseUrl, soundFontUrl, gain }) => (
          <div>
            <span>WASM: {wasmBaseUrl}</span>
            <span>SoundFont: {soundFontUrl}</span>
            <span>Gain: {gain}</span>
          </div>
        )}
      </Fluidsynth>
    );

    expect(getByText(/^WASM:/)).toBeInTheDocument();
    expect(getByText(/^SoundFont:/).textContent).toContain('.sf2');
    expect(getByText('Gain: 1')).toBeInTheDocument();
  });

  it('allows updating gain and soundfont url through the render props', async () => {
    const output = createMockStreamRef();
    const { getByText, getByRole } = render(
      <Fluidsynth output={output}>
        {({ gain, setGain, soundFontUrl, setSoundFontUrl }) => (
          <div>
            <span>Gain: {gain}</span>
            <span>SoundFont: {soundFontUrl}</span>
            <button onClick={() => setGain(0.7)}>Gain Up</button>
            <button onClick={() => setSoundFontUrl('custom.sf2')}>Change URL</button>
          </div>
        )}
      </Fluidsynth>
    );

    act(() => {
      getByRole('button', { name: /Gain Up/i }).click();
    });
    act(() => {
      getByRole('button', { name: /Change URL/i }).click();
    });

    await waitFor(() => {
      expect(getByText('Gain: 0.7')).toBeInTheDocument();
      expect(getByText('SoundFont: custom.sf2')).toBeInTheDocument();
    });
  });
});
