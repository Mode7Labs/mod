import React, { useEffect, useRef } from 'react';

interface SpectrumCanvasProps {
  dataArray: Uint8Array;
  bufferLength: number;
  color?: string;
  backgroundColor?: string;
  barGap?: number;
}

export const SpectrumCanvas: React.FC<SpectrumCanvasProps> = ({
  dataArray,
  bufferLength,
  color = '#00ff88',
  backgroundColor = '#0a0a0a',
  barGap = 2,
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
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) - barGap;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, height);

        // Calculate color based on height (frequency)
        const hue = (i / bufferLength) * 120; // 0 (red) to 120 (green)
        gradient.addColorStop(0, `hsl(${hue + 120}, 100%, 60%)`);
        gradient.addColorStop(1, `hsl(${hue + 120}, 100%, 30%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${hue + 120}, 100%, 50%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.shadowBlur = 0;
      }
    };

    draw();
  }, [dataArray, bufferLength, color, backgroundColor, barGap]);

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
