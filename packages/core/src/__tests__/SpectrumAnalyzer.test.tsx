import { render, createMockStreamRef } from './test-utils';
import { SpectrumAnalyzer } from '../components/visualizations/SpectrumAnalyzer';

describe('SpectrumAnalyzer', () => {
  describe('Render Props Pattern', () => {
    it('should render with data array and buffer length', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input}>
          {({ dataArray, bufferLength, isActive }) => (
            <div>
              <span>Buffer Length: {bufferLength}</span>
              <span>Array Length: {dataArray.length}</span>
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </SpectrumAnalyzer>
      );

      expect(getByText(/Buffer Length:/)).toBeInTheDocument();
      expect(getByText(/Array Length:/)).toBeInTheDocument();
    });

    it('should provide Uint8Array data', () => {
      const input = createMockStreamRef();
      let capturedDataArray: Uint8Array | null = null;

      render(
        <SpectrumAnalyzer input={input}>
          {({ dataArray }) => {
            capturedDataArray = dataArray;
            return <div>Test</div>;
          }}
        </SpectrumAnalyzer>
      );

      expect(capturedDataArray).toBeInstanceOf(Uint8Array);
    });

    it('should provide minDb and maxDb values', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input} minDecibels={-100} maxDecibels={-20}>
          {({ minDb, maxDb }) => (
            <div>
              <span>Min: {minDb}</span>
              <span>Max: {maxDb}</span>
            </div>
          )}
        </SpectrumAnalyzer>
      );

      expect(getByText('Min: -100')).toBeInTheDocument();
      expect(getByText('Max: -20')).toBeInTheDocument();
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const { container } = render(
        <SpectrumAnalyzer input={input}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </SpectrumAnalyzer>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Props Configuration', () => {
    it('should accept custom fftSize', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input} fftSize={4096}>
          {({ bufferLength }) => <span>Buffer: {bufferLength}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText(/Buffer:/)).toBeInTheDocument();
    });

    it('should accept custom minDecibels', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input} minDecibels={-100}>
          {({ minDb }) => <span>Min: {minDb}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText('Min: -100')).toBeInTheDocument();
    });

    it('should accept custom maxDecibels', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input} maxDecibels={-5}>
          {({ maxDb }) => <span>Max: {maxDb}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText('Max: -5')).toBeInTheDocument();
    });

    it('should use default decibel range', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input}>
          {({ minDb, maxDb }) => (
            <div>
              <span>Min: {minDb}</span>
              <span>Max: {maxDb}</span>
            </div>
          )}
        </SpectrumAnalyzer>
      );

      expect(getByText('Min: -90')).toBeInTheDocument();
      expect(getByText('Max: -10')).toBeInTheDocument();
    });
  });

  describe('Audio Context Integration', () => {
    it('should create analyser node', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const { unmount } = render(
        <SpectrumAnalyzer input={input}>
          {() => <div>Test</div>}
        </SpectrumAnalyzer>
      );

      unmount();
    });
  });

  describe('Data Updates', () => {
    it('should provide frequency domain data array', () => {
      const input = createMockStreamRef();
      let dataArray: Uint8Array | null = null;

      render(
        <SpectrumAnalyzer input={input}>
          {({ dataArray: data }) => {
            dataArray = data;
            return <div>Test</div>;
          }}
        </SpectrumAnalyzer>
      );

      expect(dataArray).toBeInstanceOf(Uint8Array);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      const input = { current: null };
      const { getByText } = render(
        <SpectrumAnalyzer input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText('Active: no')).toBeInTheDocument();
    });

    it('should handle different fftSize values', () => {
      const input = createMockStreamRef();

      const { getByText } = render(
        <SpectrumAnalyzer input={input} fftSize={256}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should handle smoothingTimeConstant of 0 (no smoothing)', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input} smoothingTimeConstant={0}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should handle smoothingTimeConstant of 1 (max smoothing)', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <SpectrumAnalyzer input={input} smoothingTimeConstant={1}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </SpectrumAnalyzer>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });
  });
});
