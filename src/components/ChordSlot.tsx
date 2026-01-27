import type { ChordInfo } from '../utils/musicTheory';

interface ChordSlotProps {
  chord: ChordInfo | null;
  index: number;
  isPlaying?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function ChordSlot({ chord, index, isPlaying, onRemove, onClick }: ChordSlotProps) {
  return (
    <div
      className={`
        chord-slot
        relative
        w-24 h-32
        rounded-xl
        flex flex-col items-center justify-center
        cursor-pointer
        transition-all duration-200
        ${chord 
          ? 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50' 
          : 'bg-white/5 border-2 border-dashed border-white/20'}
        ${isPlaying ? 'playing scale-105' : ''}
      `}
      onClick={onClick}
    >
      {chord ? (
        <>
          {/* Remove button */}
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-sm font-bold flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
          >
            ×
          </button>
          
          {/* Chord display */}
          <div className="text-2xl font-bold text-white mb-1">
            {chord.roman}
          </div>
          <div className="text-sm text-purple-300">
            {chord.root}
            <span className="text-purple-400 text-xs">
              {chord.quality === 'maj' ? '' : chord.quality}
            </span>
          </div>
          <div className="text-xs text-white/40 mt-2">
            {chord.notes.map(n => n.replace(/\d+/, '')).join(' ')}
          </div>
          
          {/* Slot number */}
          <div className="absolute bottom-1 left-1 text-xs text-white/30">
            {index + 1}
          </div>
        </>
      ) : (
        <>
          <div className="text-3xl text-white/20 mb-1">+</div>
          <div className="text-xs text-white/30">Click chord</div>
          <div className="absolute bottom-1 left-1 text-xs text-white/30">
            {index + 1}
          </div>
        </>
      )}
    </div>
  );
}
