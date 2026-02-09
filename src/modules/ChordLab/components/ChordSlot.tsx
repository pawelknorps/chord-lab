import { ChordInfo } from '../../../core/theory';
import { useSignals } from "@preact/signals-react/runtime";
import { currentBeatSignal, currentMeasureIndexSignal } from '../../../core/audio/audioSignals';

interface ChordSlotProps {
  chord: ChordInfo | null;
  index: number;
  isPlaying?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function ChordSlot({ chord, index, isPlaying, onRemove, onClick }: ChordSlotProps) {
  useSignals();

  // Determine if this specific slot is currently active in the playback
  // We need to compare with the global measure index signal
  // NOTE: index passed here is 0-based index in the progression array.
  // currentMeasureIndexSignal seems to track the index of the chord being played.
  const isCurrentMeasure = currentMeasureIndexSignal.value === index;
  const isActuallyPlaying = isPlaying && isCurrentMeasure;
  const currentBeat = currentBeatSignal.value;

  const getNotesDisplay = (notes: string[]) => {
    return notes.map(n => n.replace(/\d+/, '')).join(' • ');
  };

  if (!chord) {
    return (
      <button
        onClick={onClick}
        className="
          group relative w-32 h-40 
          rounded-2xl border-2 border-dashed border-white/10 
          hover:border-cyan-400/50 hover:bg-cyan-400/5 
          transition-all duration-300
          flex flex-col items-center justify-center gap-2
        "
      >
        <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-cyan-400/20 flex items-center justify-center transition-colors">
          <span className="text-xl text-white/30 group-hover:text-cyan-400">+</span>
        </div>
        <span className="text-xs font-medium text-white/30 group-hover:text-cyan-200">Add Chord</span>
        <div className="absolute bottom-3 right-3 text-[10px] font-bold text-white/10 group-hover:text-cyan-400/40">
          {index + 1}
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        group relative w-32 h-40
        rounded-2xl backdrop-blur-md transition-all duration-300 cursor-pointer
        border border-white/10 hover:-translate-y-1 hover:shadow-xl
        flex flex-col overflow-hidden
        ${isActuallyPlaying
          ? 'bg-gradient-to-br from-indigo-600/80 to-purple-600/80 ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
          : 'bg-gradient-to-br from-white/10 to-white/5 hover:bg-white/15 hover:border-white/20'
        }
      `}
    >
      {/* Playhead Progress Bar - Only visible when playing this slot */}
      {isActuallyPlaying && (
        <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
          <div
            className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
            style={{ width: `${((currentBeat + 1) / 4) * 100}%`, transition: 'width 0.1s linear' }}
          />
        </div>
      )}

      {/* Remove Button - Visible on Group Hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        className="
          absolute top-2 right-2 w-6 h-6 
          rounded-full bg-black/40 hover:bg-red-500/80 
          text-white/70 hover:text-white 
          flex items-center justify-center 
          opacity-0 group-hover:opacity-100 
          transition-all duration-200 z-20
          scale-75 hover:scale-100
        "
      >
        <span className="text-xs font-bold leading-none mb-[1px]">×</span>
      </button>

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-4 relative z-10">

        {/* Roman Numeral (Primary) */}
        <div className="flex-1 flex items-center justify-center">
          <span className={`
            font-serif text-3xl font-bold tracking-tight
            ${isActuallyPlaying ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-br from-cyan-100 to-blue-200 group-hover:from-white group-hover:to-white'}
          `}>
            {chord.roman}
          </span>
        </div>

        {/* Chord Symbol (Secondary) */}
        <div className="text-center mb-3">
          <div className="inline-flex items-baseline gap-[1px]">
            <span className="text-lg font-bold text-white">{chord.root}</span>
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              {chord.quality === 'maj' ? '' : chord.quality}
            </span>
          </div>
        </div>

        {/* Notes (Tertiary) */}
        <div className="border-t border-white/10 pt-2 mt-auto">
          <div className="text-[10px] text-center text-white/40 font-mono tracking-tight truncate">
            {getNotesDisplay(chord.notes)}
          </div>
        </div>
      </div>

      {/* Index Badge */}
      <div className="absolute bottom-2 left-3 text-[9px] font-bold text-white/20">
        {index + 1}
      </div>

      {/* Hover Overlay "Play" Hint */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
    </div>
  );
}

