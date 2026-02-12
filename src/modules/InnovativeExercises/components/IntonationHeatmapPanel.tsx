import { useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { useIntonationHeatmap } from '../hooks/useIntonationHeatmap';
import { initAudio } from '../../../core/audio/globalAudio';
import type { IntonationClassification } from '../types';

const classificationColor: Record<IntonationClassification, string> = {
  et: 'bg-green-500/80',
  just: 'bg-blue-500/80',
  out: 'bg-red-500/80',
};

const classificationLabel: Record<IntonationClassification, string> = {
  et: 'ET',
  just: 'Just',
  out: 'Out',
};

export function IntonationHeatmapPanel() {
  const { scaleNotes, root, scaleName, results, droneActive, startDrone, stopDrone, reset } = useIntonationHeatmap('C', 'major');
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
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Intonation Heatmap (Tonal Gravity)</h2>
      <p className="text-sm text-[var(--text-secondary)]">
        Play a drone (e.g. C); play each note of the scale. Green = Equal Temperament, Blue = Just, Red = out of tune.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={droneActive ? handleStopDrone : handleStartDrone}
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--text-on-accent)]"
        >
          {droneActive ? 'Stop Drone' : 'Start Drone'}
        </button>
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)]">
          Reset
        </button>
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        Scale: {root} {scaleName} — {scaleNotes.join(', ')}
      </p>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7].map(degree => {
          const r = results.get(degree);
          const note = scaleNotes[degree - 1];
          const cls = r?.classification ?? null;
          return (
            <div
              key={degree}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border border-[var(--border-subtle)] ${cls ? classificationColor[cls] : 'bg-[var(--bg-hover)]'}`}
              title={r != null ? `${note}: ${r.cents}¢ (${classificationLabel[r.classification]})` : note}
            >
              <span className="text-xs font-medium text-[var(--text-primary)]">{note}</span>
              {r != null && <span className="text-xs text-[var(--text-muted)]">{r.cents}¢</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[var(--text-muted)]">Legend: Green = ET (±10¢), Red = Out (&gt;25¢). Play each scale degree; heatmap updates as you play.</p>
    </div>
  );
}
