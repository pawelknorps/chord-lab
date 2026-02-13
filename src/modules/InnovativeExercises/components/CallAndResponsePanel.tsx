import { RotateCcw } from 'lucide-react';
import { useCallAndResponse } from '../hooks/useCallAndResponse';
import type { InnovativeExerciseInitialParams } from '../types';
import { innovativePanelContainerClass, innovativeSectionLabelClass } from '../InnovativeExercisesModule';

export interface CallAndResponsePanelProps {
  initialParams?: InnovativeExerciseInitialParams;
}

export function CallAndResponsePanel({ initialParams }: CallAndResponsePanelProps) {
  const {
    isPlayingRef,
    isRecording,
    studentOnsets,
    pairs,
    playReference,
    startRecording,
    stopRecording,
    reset,
  } = useCallAndResponse();

  return (
    <div className={`${innovativePanelContainerClass} flex flex-col gap-6`}>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Call and Response</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Listen to the pro 2-bar break (drum phrase + fill from our theory engine), then play the rhythm back.
          We show where each attack was early or late.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={playReference}
          disabled={isPlayingRef || isRecording}
          className="px-4 py-2 rounded-xl border border-amber-500 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Play reference
        </button>
        {!isRecording ? (
          <button type="button" onClick={startRecording} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all">
            Record my response
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition-all">
            Stop
          </button>
        )}
        <button type="button" onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {isRecording && (
        <p className="text-[10px] text-neutral-500">Recording… Play the rhythm back. Onsets: {studentOnsets.length}</p>
      )}

      {pairs.length > 0 && (
        <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-2">
          <p className={innovativeSectionLabelClass}>Early / late per attack</p>
          <ul className="text-sm text-neutral-300 space-y-0.5">
            {pairs.map((p, i) => (
              <li key={i} className="flex items-center gap-2 flex-wrap">
                <span className="text-neutral-500 shrink-0">
                  {p.refBeatLabel ?? `Attack ${i + 1}`}:
                </span>
                {p.deltaMs > 0 ? (
                  <span className="text-red-400">{p.deltaMs.toFixed(0)} ms late</span>
                ) : p.deltaMs < 0 ? (
                  <span className="text-amber-400">{(-p.deltaMs).toFixed(0)} ms early</span>
                ) : (
                  <span className="text-emerald-400">on time</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-neutral-500">
        Play reference (drum break), then Record and play the same rhythm back. Onsets are aligned by your first attack.
      </p>
    </div>
  );
}
