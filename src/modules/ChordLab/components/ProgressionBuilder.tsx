import type { ChordInfo } from '../../../core/theory';
import { ChordSlot } from './ChordSlot';

interface ProgressionBuilderProps {
  progression: (ChordInfo | null)[];
  playingIndex: number | null;
  onRemoveChord: (index: number) => void;
  onChordClick: (index: number) => void;
  onClear: () => void;
}

export function ProgressionBuilder({
  progression,
  playingIndex,
  onRemoveChord,
  onChordClick,
  onClear,
}: ProgressionBuilderProps) {
  const hasChords = progression.some(c => c !== null);

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-purple-400">▸</span>
          Your Progression
        </h2>
        {hasChords && (
          <button
            onClick={onClear}
            className="px-3 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {progression.map((chord, index) => (
          <ChordSlot
            key={index}
            chord={chord}
            index={index}
            isPlaying={playingIndex === index}
            onRemove={() => onRemoveChord(index)}
            onClick={() => onChordClick(index)}
          />
        ))}
      </div>
      
      {!hasChords && (
        <p className="text-white/40 text-sm mt-4">
          Click chords on the keyboard above to build your progression
        </p>
      )}
    </div>
  );
}
