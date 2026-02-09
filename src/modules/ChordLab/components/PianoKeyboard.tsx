import { useMemo } from 'react';
import type { ChordInfo } from '../../../core/theory';

interface PianoKeyboardProps {
  startOctave?: number;
  endOctave?: number;
  highlightedNotes?: number[];
  activeNotes?: number[];
  chords?: ChordInfo[];
  onChordClick?: (chord: ChordInfo) => void;
  activeChordDegree?: number | null;
  keySignature?: string;
}

const WHITE_KEY_INDICES = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const BLACK_KEY_INDICES = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
const BLACK_KEY_OFFSETS: Record<number, number> = {
  1: 0.7, // C#
  3: 1.7, // D#
  6: 3.7, // F#
  8: 4.7, // G#
  10: 5.7, // A#
};

export function PianoKeyboard({
  startOctave = 3,
  endOctave = 5,
  highlightedNotes = [],
  activeNotes = [],
  chords = [],
  onChordClick,
  activeChordDegree,
  // keySignature
}: PianoKeyboardProps) {
  const octaves = useMemo(() => {
    const result = [];
    for (let o = startOctave; o <= endOctave; o++) {
      result.push(o);
    }
    return result;
  }, [startOctave, endOctave]);

  const highlightedSet = useMemo(() => new Set(highlightedNotes), [highlightedNotes]);
  const activeSet = useMemo(() => new Set(activeNotes), [activeNotes]);

  // Map chord roots to their position
  const chordPositions = useMemo(() => {
    const positions: Map<number, ChordInfo> = new Map();
    chords.forEach((chord) => {
      // Get the base MIDI note for the chord root
      const rootMidi = chord.midiNotes[0];
      positions.set(rootMidi, chord);
    });
    return positions;
  }, [chords]);

  const getMidiNote = (octave: number, noteIndex: number) => {
    return (octave + 1) * 12 + noteIndex;
  };

  const isHighlighted = (midi: number) => {
    return highlightedSet.has(midi);
  };

  const isActive = (midi: number) => {
    return activeSet.has(midi);
  };

  const getChordForKey = (midi: number): ChordInfo | undefined => {
    return chordPositions.get(midi);
  };

  return (
    <div className="relative select-none [--k-w:32px] md:[--k-w:40px] lg:[--k-w:48px]">
      <div className="flex">
        {octaves.map((octave) => (
          <div key={octave} className="relative">
            {/* White keys */}
            <div className="flex">
              {WHITE_KEY_INDICES.map((noteIndex) => {
                const midi = getMidiNote(octave, noteIndex);
                const highlighted = isHighlighted(midi);
                const active = isActive(midi);
                const chord = getChordForKey(midi);
                const isActiveChord = chord && chord.degree === activeChordDegree;

                return (
                  <div
                    key={`${octave}-${noteIndex}`}
                    className={`
                      piano-key white relative
                      h-28 md:h-32 lg:h-40
                      border border-gray-300 rounded-b-lg
                      flex flex-col items-center justify-end pb-2
                      cursor-pointer transition-colors duration-100
                      ${active
                        ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] z-10'
                        : highlighted
                          ? 'bg-gradient-to-b from-purple-200 to-purple-300'
                          : 'bg-gradient-to-b from-white to-gray-100'}
                      ${isActiveChord ? 'ring-2 ring-purple-500' : ''}
                    `}
                    style={{ width: 'var(--k-w)' }}
                    onClick={() => chord && onChordClick?.(chord)}
                  >
                    {chord && (
                      <div className={`
                        absolute bottom-2 
                        text-[0.6rem] md:text-xs font-bold 
                        px-1 md:px-1.5 py-0.5 
                        rounded
                        ${isActiveChord
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-100 text-purple-700'}
                      `}>
                        {chord.roman}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Black keys */}
            <div className="absolute top-0 left-0 flex">
              {BLACK_KEY_INDICES.map((noteIndex) => {
                const midi = getMidiNote(octave, noteIndex);
                const highlighted = isHighlighted(midi);
                const active = isActive(midi);
                const offset = BLACK_KEY_OFFSETS[noteIndex];
                const chord = getChordForKey(midi);
                const isActiveChord = chord && chord.degree === activeChordDegree;

                return (
                  <div
                    key={`${octave}-${noteIndex}`}
                    className={`
                      piano-key black absolute
                      h-16 md:h-20 lg:h-24
                      rounded-b-lg
                      flex items-end justify-center pb-1
                      cursor-pointer transition-colors duration-100
                      ${active
                        ? 'bg-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.6)] z-20'
                        : highlighted
                          ? 'bg-gradient-to-b from-purple-600 to-purple-800'
                          : 'bg-gradient-to-b from-gray-800 to-black'}
                      ${isActiveChord ? 'ring-2 ring-purple-500' : ''}
                    `}
                    style={{
                      left: `calc(var(--k-w) * ${offset} + var(--k-w) * 0.1)`,
                      width: 'calc(var(--k-w) * 0.6)'
                    }}
                    onClick={() => chord && onChordClick?.(chord)}
                  >
                    {chord && (
                      <div className={`
                        text-[8px] md:text-[10px] font-bold 
                        px-0.5 md:px-1 py-0.5 
                        rounded
                        ${isActiveChord
                          ? 'bg-purple-400 text-white'
                          : 'bg-purple-900 text-purple-200'}
                      `}>
                        {chord.roman}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
