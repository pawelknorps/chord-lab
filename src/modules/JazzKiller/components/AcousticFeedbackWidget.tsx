import React from 'react';
import { useMicSpectrum } from '../hooks/useMicSpectrum';
import { Mic, ThermometerSun, Sparkles } from 'lucide-react';

export const AcousticFeedbackWidget: React.FC = () => {
  const { warmth, brightness, isActive } = useMicSpectrum();
  const warmthPct = Math.round(Math.min(1, warmth) * 100);
  const brightnessPct = Math.round(Math.min(1, brightness) * 100);

  if (!isActive) {
    return (
      <div className="rounded-xl bg-black/40 border border-white/10 p-4 text-neutral-500 text-sm flex items-center gap-2">
        <Mic size={16} />
        <span>Enable mic for tone feedback</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Acoustic Feedback</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-neutral-400">
            <ThermometerSun size={14} className="text-amber-500" />
            <span className="text-xs font-bold">Warmth</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500/80 rounded-full transition-all duration-150"
              style={{ width: `${warmthPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-amber-500/90">{warmthPct}%</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-neutral-400">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-xs font-bold">Brightness</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400/80 rounded-full transition-all duration-150"
              style={{ width: `${brightnessPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-cyan-400/90">{brightnessPct}%</span>
        </div>
      </div>
    </div>
  );
};
