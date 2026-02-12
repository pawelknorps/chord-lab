import { useState } from 'react';
import { GhostNoteMatchPanel } from './components/GhostNoteMatchPanel';
import { IntonationHeatmapPanel } from './components/IntonationHeatmapPanel';
import { VoiceLeadingMazePanel } from './components/VoiceLeadingMazePanel';
import { SwingPocketPanel } from './components/SwingPocketPanel';
import { CallAndResponsePanel } from './components/CallAndResponsePanel';
import { GhostRhythmPanel } from './components/GhostRhythmPanel';

type ExerciseId = 'ghost-note' | 'intonation-heatmap' | 'voice-leading' | 'swing-pocket' | 'call-response' | 'ghost-rhythm';

const EXERCISES: { id: ExerciseId; label: string }[] = [
  { id: 'ghost-note', label: 'Ghost Note Match' },
  { id: 'intonation-heatmap', label: 'Intonation Heatmap' },
  { id: 'voice-leading', label: 'Voice-Leading Maze' },
  { id: 'swing-pocket', label: 'Swing Pocket Validator' },
  { id: 'call-response', label: 'Call and Response' },
  { id: 'ghost-rhythm', label: 'Ghost Rhythm Poly-Meter' },
];

export default function InnovativeExercisesModule() {
  const [selected, setSelected] = useState<ExerciseId>('ghost-note');

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">
      <aside className="w-48 shrink-0 flex flex-col gap-1 border-r border-[var(--border-subtle)] pr-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Innovative Exercises</h2>
        {EXERCISES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelected(id)}
            className={`text-left px-3 py-2 rounded-md text-sm ${selected === id ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          >
            {label}
          </button>
        ))}
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        {selected === 'ghost-note' && <GhostNoteMatchPanel />}
        {selected === 'intonation-heatmap' && <IntonationHeatmapPanel />}
        {selected === 'voice-leading' && <VoiceLeadingMazePanel />}
        {selected === 'swing-pocket' && <SwingPocketPanel />}
        {selected === 'call-response' && <CallAndResponsePanel />}
        {selected === 'ghost-rhythm' && <GhostRhythmPanel />}
      </main>
    </div>
  );
}
