import { useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { RotateCcw } from 'lucide-react';
import { useIntonationHeatmap } from '../hooks/useIntonationHeatmap';
import { initAudio } from '../../../core/audio/globalAudio';
import type { IntonationClassification, InnovativeExerciseInitialParams } from '../types';
import { innovativePanelContainerClass, innovativeSectionLabelClass } from '../InnovativeExercisesModule';

const classificationColor: Record<IntonationClassification, string> = {
  et: 'bg-emerald-500/80',
  just: 'bg-blue-500/80',
  out: 'bg-red-500/80',
};

const classificationLabel: Record<IntonationClassification, string> = {
  et: 'ET',
  just: 'Just',
  out: 'Out',
};

export interface IntonationHeatmapPanelProps {
  initialParams?: InnovativeExerciseInitialParams;
}

export function IntonationHeatmapPanel({ initialParams }: IntonationHeatmapPanelProps) {
  const { scaleNotes, root, scaleName, results, droneActive, startDrone, stopDrone, reset } = useIntonationHeatmap(
    initialParams?.key ?? 'C',
    'major'
  );
  const synthRef = useRef<Tone.Synth | null>(null);

  const handleStartDrone = async () => {
    await initAudio();
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({ oscillator: { type: 'sine' }, volume: -8 }).toDestination();
    }
    synthRef.current.triggerAttack(`${root}4`, Tone.now());
    startDrone();
  };

  const handleStopDrone = () => {
    if (synthRef.current) synthRef.current.triggerRelease(Tone.now());
    stopDrone();
  };

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.triggerRelease(Tone.now());
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`${innovativePanelContainerClass} flex flex-col gap-6`}>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white">Intonation Heatmap</h3>
        <p className="text-[10px] text-neutral-500 mt-0.5">
          Play a drone; play each note of the scale. Green = ET, Blue = Just, Red = out of tune.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={droneActive ? handleStopDrone : handleStartDrone}
          className="px-4 py-2 rounded-xl border border-amber-500 bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-all"
        >
          {droneActive ? 'Stop Drone' : 'Start Drone'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="p-3 bg-black/30 rounded-xl border border-white/5">
        <p className={innovativeSectionLabelClass}>Scale</p>
        <p className="text-sm font-bold text-white">{root} {scaleName} — {scaleNotes.join(', ')}</p>
      </div>

      <div>
        <p className={innovativeSectionLabelClass}>Heatmap (play each degree)</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7].map(degree => {
            const r = results.get(degree);
            const note = scaleNotes[degree - 1];
            const cls = r?.classification ?? null;
            return (
              <div
                key={degree}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${cls ? classificationColor[cls] + ' border-white/20' : 'bg-black/20 border-white/5'}`}
                title={r != null ? `${note}: ${r.cents}¢ (${classificationLabel[r.classification]})` : note}
              >
                <span className="text-xs font-bold text-white">{note}</span>
                {r != null && <span className="text-[10px] text-neutral-400">{r.cents}¢</span>}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-neutral-500">Green = ET (±10¢), Red = Out (&gt;25¢). Use mic to play each scale degree.</p>
    </div>
  );
}
