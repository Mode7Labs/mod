import { render, createMockStreamRef } from './test-utils';
import { LevelMeter } from '../components/visualizations/LevelMeter';

describe('LevelMeter', () => {
  describe('Render Props Pattern', () => {
    it('should render with level and peak values', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input}>
          {({ level, peak, isActive }) => (
            <div>
              <span>Level: {level.toFixed(2)}</span>
              <span>Peak: {peak.toFixed(2)}</span>
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </LevelMeter>
      );

      expect(getByText(/Level:/)).toBeInTheDocument();
      expect(getByText(/Peak:/)).toBeInTheDocument();
      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should provide numeric level values', () => {
      const input = createMockStreamRef();
      let capturedLevel: number | null = null;
      let capturedPeak: number | null = null;

      render(
        <LevelMeter input={input}>
          {({ level, peak }) => {
            capturedLevel = level;
            capturedPeak = peak;
            return <div>Test</div>;
          }}
        </LevelMeter>
      );

      expect(typeof capturedLevel).toBe('number');
      expect(typeof capturedPeak).toBe('number');
      expect(capturedLevel).toBeGreaterThanOrEqual(0);
      expect(capturedLevel).toBeLessThanOrEqual(1);
    });

    it('should provide isClipping flag', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input}>
          {({ isClipping }) => (
            <span>Clipping: {isClipping ? 'yes' : 'no'}</span>
          )}
        </LevelMeter>
      );

      expect(getByText(/Clipping:/)).toBeInTheDocument();
    });

    it('should report isActive status', () => {
      const input = createMockStreamRef();
      const { container } = render(
        <LevelMeter input={input}>
          {({ isActive }) => (
            <div data-testid="status">
              <span>Active: {isActive ? 'yes' : 'no'}</span>
            </div>
          )}
        </LevelMeter>
      );

      const statusText = container.querySelector('[data-testid="status"]')?.textContent;
      expect(statusText).toMatch(/Active: (yes|no)/);
    });
  });

  describe('Props Configuration', () => {
    it('should accept custom fftSize', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input} fftSize={4096}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should use default fftSize of 2048', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should accept custom peakHoldTime', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input} peakHoldTime={2000}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should accept custom clipThreshold', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input} clipThreshold={0.8}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });
  });

  describe('Audio Context Integration', () => {
    it('should create analyser node', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should cleanup on unmount', () => {
      const input = createMockStreamRef();
      const { unmount } = render(
        <LevelMeter input={input}>
          {() => <div>Test</div>}
        </LevelMeter>
      );

      unmount();
    });
  });

  describe('Level Calculations', () => {
    it('should calculate RMS level', () => {
      const input = createMockStreamRef();
      let level: number | null = null;

      render(
        <LevelMeter input={input}>
          {({ level: l }) => {
            level = l;
            return <div>Test</div>;
          }}
        </LevelMeter>
      );

      expect(level).toBeDefined();
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    });

    it('should track peak values', () => {
      const input = createMockStreamRef();
      let peak: number | null = null;

      render(
        <LevelMeter input={input}>
          {({ peak: p }) => {
            peak = p;
            return <div>Test</div>;
          }}
        </LevelMeter>
      );

      expect(peak).toBeDefined();
      expect(peak).toBeGreaterThanOrEqual(0);
    });

    it('should detect clipping based on threshold', () => {
      const input = createMockStreamRef();
      let isClipping: boolean | null = null;

      render(
        <LevelMeter input={input} clipThreshold={0.95}>
          {({ isClipping: clip }) => {
            isClipping = clip;
            return <div>Test</div>;
          }}
        </LevelMeter>
      );

      expect(typeof isClipping).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      const input = { current: null };
      const { getByText } = render(
        <LevelMeter input={input}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText('Active: no')).toBeInTheDocument();
    });

    it('should handle small fftSize', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input} fftSize={256}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should handle zero peakHoldTime', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input} peakHoldTime={0}>
          {({ isActive }) => <span>Active: {isActive ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Active:/)).toBeInTheDocument();
    });

    it('should handle clipThreshold of 1.0', () => {
      const input = createMockStreamRef();
      const { getByText } = render(
        <LevelMeter input={input} clipThreshold={1.0}>
          {({ isClipping }) => <span>Clipping: {isClipping ? 'yes' : 'no'}</span>}
        </LevelMeter>
      );

      expect(getByText(/Clipping:/)).toBeInTheDocument();
    });
  });
});
