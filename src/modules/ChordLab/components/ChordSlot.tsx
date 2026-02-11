import { ChordInfo } from '../../../core/theory';
import { useSignals } from "@preact/signals-react/runtime";
import { currentBeatSignal, currentMeasureIndexSignal } from '../../../core/audio/audioSignals';
import { X } from 'lucide-react';

interface ChordSlotProps {
  chord: ChordInfo | null;
  index: number;
  isPlaying?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  /** Optional drag handle element (e.g. grip icon) for reordering - only shown when chord exists */
  dragHandle?: React.ReactNode;
  /** When true, slot is used as overlay (no playhead, simplified) */
  isOverlay?: boolean;
}

export function ChordSlot({ chord, index, isPlaying, onRemove, onClick, dragHandle, isOverlay }: ChordSlotProps) {
  useSignals();

  // Determine if this specific slot is currently active in the playback
  const isCurrentMeasure = currentMeasureIndexSignal.value === index;
  const isActuallyPlaying = !isOverlay && isPlaying && isCurrentMeasure;
  const currentBeat = currentBeatSignal.value;

  const getNotesDisplay = (notes: string[]) => {
    return notes.map(n => n.replace(/\d+/, '')).join(' ');
  };

  if (!chord) {
    return (
      <button
        onClick={onClick}
        className="
          group relative w-full h-32
          rounded-sm border border-dashed border-[var(--border-subtle)]
          hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface)]
          transition-all duration-200
          flex flex-col items-center justify-center gap-2
          bg-[var(--bg-panel)]
        "
      >
        <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center transition-colors group-hover:border-[var(--text-muted)]">
          <span className="text-lg text-[var(--text-muted)] group-hover:text-[var(--text-primary)] font-light">+</span>
        </div>
        <span className="text-cap text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">Add Chord</span>
        <div className="absolute top-2 left-2 text-[10px] font-mono text-[var(--text-muted)] opacity-50">
          {index + 1}
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        group relative w-full h-32
        rounded-sm transition-all duration-200 cursor-pointer
        border flex flex-col overflow-hidden
        ${isActuallyPlaying
          ? 'bg-[var(--bg-surface)] border-[var(--accent)] ring-1 ring-[var(--accent)]'
          : 'bg-[var(--bg-panel)] border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
        }
      `}
    >
      {/* Playhead Progress Bar - Only visible when playing this slot */}
      {isActuallyPlaying && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[var(--bg-app)]">
          <div
            className="h-full bg-[var(--accent)]"
            style={{ width: `${((currentBeat + 1) / 4) * 100}%`, transition: 'width 0.1s linear' }}
          />
        </div>
      )}

      {/* Drag Handle - for reordering */}
      {dragHandle && (
        <div className="absolute top-1 left-1 z-20 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
          {dragHandle}
        </div>
      )}

      {/* Remove Button - Visible on Group Hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        className="
          absolute top-1 right-1 w-5 h-5
          rounded-sm bg-[var(--bg-app)] border border-[var(--border-subtle)]
          text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/50
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-all duration-200 z-20
        "
      >
        <X size={12} />
      </button>

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-3 relative z-10">

        {/* Index Badge */}
        <div className={`absolute top-2 text-[10px] font-mono text-[var(--text-muted)] ${dragHandle ? 'left-6' : 'left-2'}`}>
          {index + 1}
        </div>

        {/* Roman Numeral (Primary) */}
        <div className="flex-1 flex items-center justify-center mt-2">
          <span className={`
            font-serif text-2xl font-bold tracking-tight text-center
            ${isActuallyPlaying ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] opacity-90'}
          `}>
            {chord.roman}
          </span>
        </div>

        {/* Chord Symbol Details */}
        <div className="mt-auto pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex justify-between items-baseline">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-[var(--text-primary)]">{chord.root}</span>
              <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide">
                {chord.quality === 'maj' ? '' : chord.quality === 'min' ? 'm' : chord.quality}{chord.bass ? `/${chord.bass}` : ''}
              </span>
            </div>
            <div className="text-[9px] font-mono text-[var(--text-muted)] tracking-tighter opacity-70">
              {getNotesDisplay(chord.notes)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

