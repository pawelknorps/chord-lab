import React, { useRef, useEffect } from 'react';
import { useMicSpectrum } from '../hooks/useMicSpectrum';
import { Mic } from 'lucide-react';

export const ToneSpectrumAnalyzer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { frequencyDataRef, isActive } = useMicSpectrum();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const draw = () => {
      const data = frequencyDataRef.current;
      if (!data) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      const w = canvas.width;
      const h = canvas.height;
      const barCount = Math.min(64, data.length);
      const barWidth = w / barCount;
      const slice = Math.floor(data.length / barCount);

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < slice; j++) sum += data[i * slice + j];
        const value = (sum / slice / 255) * h * 0.8;
        const x = i * barWidth;
        ctx.fillStyle = `hsla(${200 + (i / barCount) * 120}, 70%, 55%, 0.85)`;
        ctx.fillRect(x + 1, h - value, barWidth - 2, value);
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [isActive, frequencyDataRef]);

  if (!isActive) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-black/40 border border-white/10 p-4 text-neutral-500 text-sm">
        <Mic size={18} />
        <span>Enable mic to see spectrum</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[60px] rounded-xl overflow-hidden bg-black/40 border border-white/10">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ height: '80px' }}
      />
    </div>
  );
};
