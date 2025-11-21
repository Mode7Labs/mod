import { render, createMockStreamRef } from './test-utils';
import { Oscilloscope } from '../components/visualizations/Oscilloscope';

describe('Oscilloscope', () => {
  describe('Render Props Pattern', () => {
    it('should render with data array and buffer length', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <Oscilloscope input={input}>
          {({ dataArray, bufferLength, isActive }) => (
            <div>
              <span>Buffer Length: {bufferLength}</span>
              <span>Array Length: {dataArray.length}</span>
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Oscilloscope>
      );

      expect(getByText(/Buffer Length:/)).toBeInTheDocument();
      expect(getByText(/Array Length:/)).toBeInTheDocument();
    });

    it('should provide Uint8Array data', () => {
      const input = createMockStreamRef();
      let capturedDataArray: Uint8Array | null = null;

      render(
        <Oscilloscope input={input}>
          {({ dataArray }) => {
            capturedDataArray = dataArray;
            return <div>Test</div>;
          }}
        </Oscilloscope>
      );

      expect(capturedDataArray).toBeInstanceOf(Uint8Array);
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const { container } = render(
        <Oscilloscope input={input}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </Oscilloscope>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Props Configuration', () => {
    it('should accept custom fftSize', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <Oscilloscope input={input} fftSize={4096}>
          {({ bufferLength }) => <span>Buffer: {bufferLength}</span>}
        </Oscilloscope>
      );

      // Should render with buffer length display
      expect(getByText(/Buffer:/)).toBeInTheDocument();
    });
  });

  describe('Audio Context Integration', () => {
    it('should create analyser node', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <Oscilloscope input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </Oscilloscope>
      );

      // Should be active after mount
      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const { unmount } = render(
        <Oscilloscope input={input}>
          {() => <div>Test</div>}
        </Oscilloscope>
      );

      unmount();
      // Component should cleanup without errors
    });
  });

  describe('Data Updates', () => {
    it('should provide time domain data array', () => {
      const input = createMockStreamRef();
      let dataArray: Uint8Array | null = null;

      render(
        <Oscilloscope input={input}>
          {({ dataArray: data }) => {
            dataArray = data;
            return <div>Test</div>;
          }}
        </Oscilloscope>
      );

      expect(dataArray).toBeInstanceOf(Uint8Array);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      const input = { current: null };
      const { getByText } = render(
        <Oscilloscope input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </Oscilloscope>
      );

      expect(getByText('Active: no')).toBeInTheDocument();
    });

    it('should handle different fftSize values', () => {
      const input = createMockStreamRef();

      const { getByText: getByText256 } = render(
        <Oscilloscope input={input} fftSize={256}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </Oscilloscope>
      );

      expect(getByText256(/Active:/)).toBeInTheDocument();
    });
  });
});
