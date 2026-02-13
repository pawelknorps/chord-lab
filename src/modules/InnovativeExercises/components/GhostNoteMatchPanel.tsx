import { useState, useEffect } from 'react';
import { Mic, Keyboard, RotateCcw, Check, SkipForward } from 'lucide-react';
import { useGhostNoteMatch } from '../hooks/useGhostNoteMatch';
import { SAMPLE_GHOST_LICK } from '../data/ghostNoteLicks';
import type { GhostNoteMatchStatus } from '../hooks/useGhostNoteMatch';
import type { ExerciseInputSource } from '../../JazzKiller/core/ExerciseInputAdapter';
import type { InnovativeExerciseInitialParams } from '../types';
import type { GhostNoteLick } from '../types';
import { innovativePanelContainerClass, innovativeSectionLabelClass } from '../InnovativeExercisesModule';

const statusMessages: Record<GhostNoteMatchStatus, string> = {
  idle: 'Play the lick, then fill in the missing note.',
  playing: 'Lick playing…',
  ghost_listening: 'Play the missing note now!',
  matched: 'Perfect!',
  done: 'Done. Try again?',
};

const AUTO_NEXT_MS = 1500;

function nextChallenge(reset: () => void, startLick: () => void) {
  reset();
  setTimeout(() => startLick(), 80);
}

export interface GhostNoteMatchPanelProps {
  initialParams?: InnovativeExerciseInitialParams;
}

export function GhostNoteMatchPanel({ initialParams }: GhostNoteMatchPanelProps) {
  const [inputSource, setInputSource] = useState<ExerciseInputSource>('mic');
  const lick: GhostNoteLick = initialParams?.tempo != null
    ? { ...SAMPLE_GHOST_LICK, bpm: initialParams.tempo }
    : SAMPLE_GHOST_LICK;
  const { status, startLick, reset, targetNoteName, matched, isReady } = useGhostNoteMatch(lick, inputSource);

  useEffect(() => {
    if (status !== 'matched') return;
    const t = setTimeout(() => nextChallenge(reset, startLick), AUTO_NEXT_MS);
    return () => clearTimeout(t);
  }, [status, reset, startLick]);

  return (
    <div className={`${innovativePanelContainerClass} flex flex-col gap-6`}>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Ghost Note Match</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          One note in the lick is a &quot;ghost.&quot; Play the missing note (within 15¢). When you hit it, the ghost becomes a pro sample and a new challenge starts.
        </p>
      </div>

      <div>
        <p className={innovativeSectionLabelClass}>Input</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputSource('mic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'mic' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'border-white/10 text-neutral-400 hover:border-emerald-500/30'}`}
          >
            <Mic size={14} /> Mic
          </button>
          <button
            type="button"
            onClick={() => setInputSource('midi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${inputSource === 'midi' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'border-white/10 text-neutral-400 hover:border-blue-500/30'}`}
          >
            <Keyboard size={14} /> MIDI
          </button>
        </div>
      </div>

      {targetNoteName && (
        <div className="p-3 bg-black/30 rounded-xl border border-white/5">
          <p className={innovativeSectionLabelClass}>Target note</p>
          <p className="text-lg font-black text-white font-mono">{targetNoteName}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={status === 'idle' || status === 'done' ? startLick : undefined}
          disabled={status !== 'idle' && status !== 'done'}
          className="px-4 py-2 rounded-xl border border-amber-500 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Play Lick
        </button>
        {status === 'matched' && (
          <button
            type="button"
            onClick={() => nextChallenge(reset, startLick)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
          >
            <SkipForward size={12} /> Next challenge
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="p-3 bg-black/30 rounded-xl border border-white/5">
        <p className={`text-sm font-bold ${matched ? 'text-emerald-400 flex items-center gap-1.5' : 'text-neutral-400'}`}>
          {matched && <Check size={16} />}
          {statusMessages[status]}
        </p>
      </div>

      {inputSource === 'mic' && !isReady && (
        <p className="text-[10px] text-neutral-500">Mic initializing… Allow microphone access when prompted.</p>
      )}
    </div>
  );
}
