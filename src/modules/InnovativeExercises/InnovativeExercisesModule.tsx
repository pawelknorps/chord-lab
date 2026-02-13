import { useState, useCallback } from 'react';
import { Music2, Mic, MicOff } from 'lucide-react';
import { useMicrophone } from '../../hooks/useMicrophone';
import { GhostNoteMatchPanel } from './components/GhostNoteMatchPanel';
import { IntonationHeatmapPanel } from './components/IntonationHeatmapPanel';
import { VoiceLeadingMazePanel } from './components/VoiceLeadingMazePanel';
import { SwingPocketPanel } from './components/SwingPocketPanel';
import { CallAndResponsePanel } from './components/CallAndResponsePanel';
import { GhostRhythmPanel } from './components/GhostRhythmPanel';
import { ForYouSection } from './components/ForYouSection';
import { MicPianoVisualizer } from '../JazzKiller/components/MicPianoVisualizer';
import type { InnovativeExerciseInitialParams } from './types';

type ExerciseId = 'ghost-note' | 'intonation-heatmap' | 'voice-leading' | 'swing-pocket' | 'call-response' | 'ghost-rhythm';

const EXERCISES: { id: ExerciseId; label: string }[] = [
  { id: 'ghost-note', label: 'Ghost Note Match' },
  { id: 'intonation-heatmap', label: 'Intonation Heatmap' },
  { id: 'voice-leading', label: 'Voice-Leading Maze' },
  { id: 'swing-pocket', label: 'Swing Pocket Validator' },
  { id: 'call-response', label: 'Call and Response' },
  { id: 'ghost-rhythm', label: 'Ghost Rhythm Poly-Meter' },
];

/** Shared panel container to match Standards Exercises / app exercise UX */
export const innovativePanelContainerClass =
  'bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden';

export const innovativeSectionLabelClass = 'text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2';

export default function InnovativeExercisesModule() {
  const [selected, setSelected] = useState<ExerciseId>('ghost-note');
  const [initialParams, setInitialParams] = useState<InnovativeExerciseInitialParams | undefined>(undefined);
  const { isActive, start, stop } = useMicrophone();

  const handleForYouSelect = useCallback((exerciseId: ExerciseId, params: InnovativeExerciseInitialParams) => {
    setSelected(exerciseId);
    setInitialParams(params);
  }, []);

  const handleSidebarSelect = useCallback((id: ExerciseId) => {
    setSelected(id);
    setInitialParams(undefined);
  }, []);

  const toggleMic = useCallback(async () => {
    if (isActive) {
      stop();
    } else {
      await start();
    }
  }, [isActive, start, stop]);

  return (
    <div className="flex h-full flex-col gap-4 p-4 overflow-hidden bg-neutral-950/80">
      <div className="flex h-full min-h-0 gap-4">
        <aside className="w-52 shrink-0 flex flex-col gap-1 border-r border-white/10 pr-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Music2 size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Innovative Exercises</h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase">Ear &amp; rhythm</p>
            </div>
          </div>

          {/* Mic toggle: same bottom keyboard visualiser + note detector as JazzKiller */}
          <ForYouSection onSelect={handleForYouSelect} />
          <div className="mb-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`
                flex items-center gap-2 w-full px-3 py-2 rounded-xl border text-xs font-bold transition-all
                ${isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'border-white/10 text-neutral-400 hover:border-emerald-500/30 hover:text-emerald-400'
                }
              `}
              title={isActive ? 'Turn off microphone and hide note detector' : 'Turn on microphone and show live note detector'}
            >
              {isActive ? <Mic size={14} className="shrink-0 text-red-400" /> : <MicOff size={14} className="shrink-0" />}
              <span className="uppercase tracking-wider">{isActive ? 'Mic On' : 'Mic Off'}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" aria-hidden />
              )}
            </button>
            <p className="text-[10px] text-neutral-500 mt-1.5 px-0.5">
              Toggles the bottom keyboard and live note detector.
            </p>
          </div>

          {EXERCISES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleSidebarSelect(id)}
              className={`text-left px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selected === id ? 'bg-amber-500 text-black border-amber-500' : 'border-white/10 text-neutral-400 hover:border-amber-500/30 hover:text-amber-400'}`}
            >
              {label}
            </button>
          ))}
        </aside>
        <main className={`flex-1 min-w-0 overflow-auto ${isActive ? 'pb-24' : ''}`}>
          {selected === 'ghost-note' && <GhostNoteMatchPanel initialParams={initialParams} />}
          {selected === 'intonation-heatmap' && <IntonationHeatmapPanel initialParams={initialParams} />}
          {selected === 'voice-leading' && <VoiceLeadingMazePanel initialParams={initialParams} />}
          {selected === 'swing-pocket' && <SwingPocketPanel initialParams={initialParams} />}
          {selected === 'call-response' && <CallAndResponsePanel initialParams={initialParams} />}
          {selected === 'ghost-rhythm' && <GhostRhythmPanel initialParams={initialParams} />}
        </main>
      </div>

      {/* Same bottom keyboard visualiser + note detector as JazzKiller (Guide Tone Spotlight) */}
      {isActive && <MicPianoVisualizer />}
    </div>
  );
}
