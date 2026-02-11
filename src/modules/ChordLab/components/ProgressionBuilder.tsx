import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { ChordInfo } from '../../../core/theory';
import { ChordSlot } from './ChordSlot';
import { GripVertical } from 'lucide-react';

interface ProgressionBuilderProps {
  progression: (ChordInfo | null)[];
  playingIndex: number | null;
  onRemoveChord: (index: number) => void;
  onMoveChord: (fromIndex: number, toIndex: number) => void;
  onChordClick: (index: number) => void;
  onClear: () => void;
  onSave?: () => void;
}

function DroppableSlot({
  index,
  chord,
  playingIndex,
  onRemoveChord,
  onChordClick
}: {
  index: number;
  chord: ChordInfo | null;
  playingIndex: number | null;
  onRemoveChord: (index: number) => void;
  onChordClick: (index: number) => void;
}) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: String(index) });
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: String(index),
    data: { index, chord },
    disabled: !chord
  });

  return (
    <div
      ref={setDroppableRef}
      className={`relative group/slot min-h-[132px] rounded-sm transition-colors ${
        isOver ? 'ring-1 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-panel)] rounded' : ''
      }`}
    >
      {chord ? (
        <div ref={setDraggableRef} className={isDragging ? 'opacity-40' : ''}>
          <ChordSlot
            chord={chord}
            index={index}
            isPlaying={playingIndex === index}
            onRemove={() => onRemoveChord(index)}
            onClick={() => onChordClick(index)}
            dragHandle={
              <div {...attributes} {...listeners} className="p-1 -m-1 rounded hover:bg-[var(--bg-surface)]">
                <GripVertical size={14} className="text-[var(--text-muted)]" />
              </div>
            }
          />
        </div>
      ) : (
        <ChordSlot chord={null} index={index} onClick={() => onChordClick(index)} />
      )}
    </div>
  );
}

export function ProgressionBuilder({
  progression,
  playingIndex,
  onRemoveChord,
  onMoveChord,
  onChordClick,
  onClear,
  onSave
}: ProgressionBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const hasChords = progression.some(c => c !== null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIndex = Number(active.id);
      const toIndex = Number(over.id);
      if (!Number.isNaN(fromIndex) && !Number.isNaN(toIndex)) {
        onMoveChord(fromIndex, toIndex);
      }
    },
    [onMoveChord]
  );

  const activeChord = activeId != null ? progression[Number(activeId)] : null;

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6 relative overflow-hidden min-h-[300px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            Progression Builder
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            Drag chords to reorder · Click to play
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
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {progression.map((chord, index) => (
                <div key={index} className="relative">
                  {(index % 4 === 0) && (
                    <div className="absolute -top-5 left-0 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                      Bar {Math.floor(index / 4) + 1}
                    </div>
                  )}
                  <DroppableSlot
                    index={index}
                    chord={chord}
                    playingIndex={playingIndex}
                    onRemoveChord={onRemoveChord}
                    onChordClick={onChordClick}
                  />
                </div>
              ))}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeChord && activeId != null ? (
                <div className="rotate-2 scale-105 shadow-xl cursor-grabbing">
                  <ChordSlot
                    chord={activeChord}
                    index={Number(activeId)}
                    isOverlay
                    isPlaying={false}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
