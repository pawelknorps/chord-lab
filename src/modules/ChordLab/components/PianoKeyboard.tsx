import { useMemo } from 'react';
import type { ChordInfo } from '../../../core/theory';

interface PianoKeyboardProps {
  startOctave?: number;
  endOctave?: number;
  highlightedNotes?: number[];
  chords?: ChordInfo[];
  onChordClick?: (chord: ChordInfo) => void;
  activeChordDegree?: number | null;
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
  chords = [],
  onChordClick,
  activeChordDegree,
}: PianoKeyboardProps) {
  const octaves = useMemo(() => {
    const result = [];
    for (let o = startOctave; o <= endOctave; o++) {
      result.push(o);
    }
    return result;
  }, [startOctave, endOctave]);

  const highlightedSet = useMemo(() => new Set(highlightedNotes), [highlightedNotes]);

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

  const getChordForKey = (midi: number): ChordInfo | undefined => {
    return chordPositions.get(midi);
  };

  return (
    <div className="relative select-none">
      <div className="flex">
        {octaves.map((octave) => (
          <div key={octave} className="relative">
            {/* White keys */}
            <div className="flex">
              {WHITE_KEY_INDICES.map((noteIndex) => {
                const midi = getMidiNote(octave, noteIndex);
                const highlighted = isHighlighted(midi);
                const chord = getChordForKey(midi);
                const isActiveChord = chord && chord.degree === activeChordDegree;

                return (
                  <div
                    key={`${octave}-${noteIndex}`}
                    className={`
                      piano-key white relative
                      w-12 h-40 
                      border border-gray-300 rounded-b-lg
                      flex flex-col items-center justify-end pb-2
                      cursor-pointer
                      ${highlighted ? 'bg-gradient-to-b from-purple-200 to-purple-300' : 'bg-gradient-to-b from-white to-gray-100'}
                      ${isActiveChord ? 'active' : ''}
                    `}
                    onClick={() => chord && onChordClick?.(chord)}
                  >
                    {chord && (
                      <div className={`
                        absolute bottom-2 
                        text-xs font-bold 
                        px-1.5 py-0.5 
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
                const offset = BLACK_KEY_OFFSETS[noteIndex];
                const chord = getChordForKey(midi);
                const isActiveChord = chord && chord.degree === activeChordDegree;

                return (
                  <div
                    key={`${octave}-${noteIndex}`}
                    className={`
                      piano-key black absolute
                      w-8 h-24
                      rounded-b-lg
                      flex items-end justify-center pb-1
                      cursor-pointer
                      ${highlighted ? 'bg-gradient-to-b from-purple-600 to-purple-800' : 'bg-gradient-to-b from-gray-800 to-black'}
                      ${isActiveChord ? 'active' : ''}
                    `}
                    style={{ left: `${offset * 48 + 4}px` }}
                    onClick={() => chord && onChordClick?.(chord)}
                  >
                    {chord && (
                      <div className={`
                        text-[10px] font-bold 
                        px-1 py-0.5 
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
