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
    <div className="glass-panel rounded-2xl p-8 relative overflow-hidden min-h-[300px] flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 text-lg">🎹</span>
            Progression Builder
          </h2>
          <p className="text-white/40 text-sm mt-1 ml-11">
            Build your chord progression pattern
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChords && onSave && (
            <button
              onClick={onSave}
              className="
                px-4 py-2 rounded-xl
                bg-amber-500/10 hover:bg-amber-500/20 
                border border-amber-500/20 hover:border-amber-500/40
                text-amber-300 text-sm font-semibold
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <span>💾</span> Save
            </button>
          )}
          {hasChords && (
            <button
              onClick={onClear}
              className="
                px-4 py-2 rounded-xl
                bg-red-500/10 hover:bg-red-500/20 
                border border-red-500/20 hover:border-red-500/40
                text-red-300 text-sm font-semibold
                transition-all duration-200
                flex items-center gap-2
              "
            >
              <span>🗑️</span> Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative z-10 flex-1">
        {hasChords ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
            {progression.map((chord, index) => (
              <div key={index} className="relative group/slot">
                {/* Bar Number Indicator (Simple heuristic: every 4th slot starts a new "row" visually, 
                    but here just showing index helps. Maybe specific bar markers later) 
                */}
                {(index % 4 === 0) && (
                  <div className="absolute -top-6 left-0 text-[10px] font-bold text-white/10 uppercase tracking-widest pl-1">
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
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] p-12 text-center group">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
              🎹
            </div>
            <h3 className="text-white/80 font-semibold text-lg mb-2">Start Building</h3>
            <p className="text-white/40 max-w-xs mx-auto">
              Click chords on the piano above or select a key to begin creating your progression.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

