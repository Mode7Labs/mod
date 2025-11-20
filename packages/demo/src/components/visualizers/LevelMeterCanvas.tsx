import React, { useEffect, useRef } from 'react';

interface LevelMeterCanvasProps {
  level: number;
  peak: number;
  isClipping: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const LevelMeterCanvas: React.FC<LevelMeterCanvasProps> = ({
  level,
  peak,
  isClipping,
  orientation = 'horizontal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      if (orientation === 'horizontal') {
        // Draw level bar (RMS)
        const levelWidth = level * width;

        // Create gradient based on level
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.7, '#ffff00');
        gradient.addColorStop(0.9, '#ff8800');
        gradient.addColorStop(1, '#ff0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, levelWidth, height);

        // Draw peak indicator
        if (peak > 0) {
          const peakX = peak * width;
          ctx.fillStyle = isClipping ? '#ff0000' : '#ffffff';
          ctx.fillRect(peakX - 2, 0, 4, height);

          // Add glow to peak
          if (isClipping) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
            ctx.fillRect(peakX - 2, 0, 4, height);
            ctx.shadowBlur = 0;
          }
        }

        // Draw scale marks
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        const marks = [0, 0.25, 0.5, 0.75, 1.0];
        marks.forEach(mark => {
          const x = mark * width;
          ctx.fillRect(x, height - 8, 1, 8);
          const db = mark === 0 ? '-∞' : `${Math.round(20 * Math.log10(mark))}`;
          ctx.fillText(db, x, height - 10);
        });

      } else {
        // Vertical orientation
        const levelHeight = level * height;
        const y = height - levelHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.7, '#ffff00');
        gradient.addColorStop(0.9, '#ff8800');
        gradient.addColorStop(1, '#ff0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, y, width, levelHeight);

        // Draw peak indicator
        if (peak > 0) {
          const peakY = height - (peak * height);
          ctx.fillStyle = isClipping ? '#ff0000' : '#ffffff';
          ctx.fillRect(0, peakY - 2, width, 4);

          if (isClipping) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
            ctx.fillRect(0, peakY - 2, width, 4);
            ctx.shadowBlur = 0;
          }
        }
      }
    };

    draw();
  }, [level, peak, isClipping, orientation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};
