import { RotateCcw } from 'lucide-react';
import { useGhostRhythm } from '../hooks/useGhostRhythm';
import type { InnovativeExerciseInitialParams } from '../types';
import { innovativePanelContainerClass, innovativeSectionLabelClass } from '../InnovativeExercisesModule';

export interface GhostRhythmPanelProps {
  initialParams?: InnovativeExerciseInitialParams;
}

export function GhostRhythmPanel({ initialParams }: GhostRhythmPanelProps) {
  const {
    isRecording,
    onsets,
    rhythmScore,
    pitchStable,
    win,
    startRecording,
    stopRecording,
    reset,
  } = useGhostRhythm();

  return (
    <div className={`${innovativePanelContainerClass} flex flex-col gap-6`}>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Ghost Rhythm Poly-Meter</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          No backing. 4/4 grid; play 3-over-4 on one note (e.g. G). Win = pitch within 5¢ of G + correct 3-against-4 rhythm.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <button type="button" onClick={startRecording} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all">
            Start 4 bars (play 3-over-4 on G)
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition-all">
            Stop recording
          </button>
        )}
        <button type="button" onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {isRecording && (
        <p className="text-[10px] text-neutral-500">Recording… Play 3 notes per bar on G. Auto-stops after 4 bars. Attacks: {onsets.length}</p>
      )}

      {(rhythmScore !== null || pitchStable !== null) && (
        <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-2">
          <p className={innovativeSectionLabelClass}>Result</p>
          <p className="text-sm font-bold text-white">Rhythm accuracy: <span className="text-amber-400 font-mono">{rhythmScore !== null ? `${Math.round(rhythmScore * 100)}%` : '—'}</span></p>
          <p className="text-sm font-bold text-white">Pitch stable (G ±5¢): {pitchStable === true ? <span className="text-emerald-400">Yes</span> : pitchStable === false ? <span className="text-red-400">No</span> : '—'}</p>
          {win && <p className="text-sm font-bold text-emerald-400">You win! Rhythm and pitch both in the pocket.</p>}
        </div>
      )}

      <p className="text-[10px] text-neutral-500">Uses our audio-theory system only (no backing). Play exactly 3 attacks per bar on a single G (any octave), in tune within 5 cents.</p>
    </div>
  );
}
