import { ChordInfo } from '../../../core/theory';
import { ChordSlot } from './ChordSlot';

interface ProgressionBuilderProps {
  progression: (ChordInfo | null)[];
  playingIndex: number | null;
  onRemoveChord: (index: number) => void;
  onChordClick: (index: number) => void;
  onClear: () => void;
  onSave?: () => void;
}

export function ProgressionBuilder({
  progression,
  playingIndex,
  onRemoveChord,
  onChordClick,
  onClear,
  onSave
}: ProgressionBuilderProps) {
  const hasChords = progression.some(c => c !== null);

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6 relative overflow-hidden min-h-[300px] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            Progression Builder
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            Build your chord progression pattern
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChords && onSave && (
            <button
              onClick={onSave}
              className="
                h-8 px-3 rounded-md text-xs font-medium
                bg-[var(--bg-surface)] border border-[var(--border-subtle)]
                text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <span>Save</span>
            </button>
          )}
          {hasChords && (
            <button
              onClick={onClear}
              className="
                h-8 px-3 rounded-md text-xs font-medium
                bg-[var(--bg-surface)] border border-[var(--border-subtle)]
                text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/50
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative z-10 flex-1">
        {hasChords ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {progression.map((chord, index) => (
              <div key={index} className="relative group/slot">
                {(index % 4 === 0) && (
                  <div className="absolute -top-5 left-0 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                    Bar {Math.floor(index / 4) + 1}
                  </div>
                )}

                <ChordSlot
                  chord={chord}
                  index={index}
                  isPlaying={playingIndex === index}
                  onRemove={() => onRemoveChord(index)}
                  onClick={() => onChordClick(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]/30 p-12 text-center">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-1">Start Building</h3>
            <p className="text-[var(--text-muted)] text-xs max-w-xs mx-auto">
              Click chords on the piano above or select a key to begin creating your progression.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

