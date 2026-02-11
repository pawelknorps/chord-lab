import { useMemo, useCallback } from 'react';
import * as Tone from 'tone';
import { UnifiedPianoProps, PianoKey } from './types';
import styles from './UnifiedPiano.module.css';
import { getChordToneLabel, CHORD_TONE_LABELS } from '../../core/theory';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INTERVALS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];
const CHORD_TONE_COLORS = {
    0: '#3b82f6',   // Root - Blue
    3: '#10b981',   // Minor 3rd - Green
    4: '#10b981',   // Major 3rd - Green
    7: '#eab308',   // Perfect 5th - Yellow
    10: '#ef4444',  // Minor 7th - Red
    11: '#ef4444',  // Major 7th - Red
    2: '#a855f7',   // 9th - Purple
    5: '#a855f7',   // 11th - Purple
    9: '#a855f7',   // 13th - Purple
};

export function UnifiedPiano({
    mode,
    highlightedNotes = [],
    activeNotes = [],
    onNoteClick,
    onNotePress,
    showLabels = 'none',
    rootNote,
    octaveRange = [3, 5],
    disabled = false,
    className = '',
}: UnifiedPianoProps) {

    const keys = useMemo(() => {
        const result: PianoKey[] = [];
        const [startOctave, endOctave] = octaveRange;

        for (let octave = startOctave; octave <= endOctave; octave++) {
            for (let note = 0; note < 12; note++) {
                const midiNote = (octave + 1) * 12 + note;
                const isBlack = [1, 3, 6, 8, 10].includes(note);
                result.push({
                    note: midiNote,
                    isBlack,
                    position: result.length,
                    noteName: NOTE_NAMES[note] + octave,
                });
            }
        }
        return result;
    }, [octaveRange]);

    const getChordToneColor = useCallback((note: number): string | null => {
        if (rootNote === undefined) return null;
        const interval = (note - rootNote + 12) % 12;
        return CHORD_TONE_COLORS[interval as keyof typeof CHORD_TONE_COLORS] || null;
    }, [rootNote]);

    const getLabel = useCallback((note: number): string => {
        if (showLabels === 'none') return '';

        const noteIndex = note % 12;

        if (showLabels === 'note-name') {
            return NOTE_NAMES[noteIndex];
        }

        if (showLabels === 'interval' && rootNote !== undefined) {
            const interval = (note - rootNote + 12) % 12;
            return INTERVALS[interval];
        }

        if (showLabels === 'scale-degree' && rootNote !== undefined) {
            const degree = ((note - rootNote + 12) % 12) + 1;
            return degree.toString();
        }

        if (showLabels === 'chord-tone' && rootNote !== undefined) {
            return getChordToneLabel(rootNote, note);
        }

        return '';
    }, [showLabels, rootNote]);

    const handleKeyClick = useCallback((note: number) => {
        if (disabled || mode === 'display' || mode === 'playback') return;
        // Resume AudioContext in same user gesture so playback is allowed
        Tone.start();
        onNoteClick?.(note);
        onNotePress?.(note);
    }, [disabled, mode, onNoteClick, onNotePress]);

    const isInteractive = mode === 'input' || mode === 'highlight';
    const whiteKeys = keys.filter(k => !k.isBlack);
    const blackKeys = keys.filter(k => k.isBlack);

    return (
        <div className={`${styles.piano} ${className}`}>
            <div className={styles.keysContainer}>
                {/* White keys */}
                {whiteKeys.map((key) => {
                    const isHighlighted = highlightedNotes.includes(key.note);
                    const isActive = activeNotes.includes(key.note);
                    const isRoot = rootNote !== undefined && (key.note % 12 === rootNote % 12) && (isHighlighted || isActive);
                    const chordToneColor = getChordToneColor(key.note);
                    const shouldShowLabel = isHighlighted || isActive;

                    return (
                        <div
                            key={key.note}
                            className={`${styles.key} ${styles.whiteKey} ${isHighlighted ? styles.highlighted : ''
                                } ${isActive ? styles.active : ''} ${isRoot ? styles.root : ''
                                } ${isInteractive ? styles.interactive : ''}`}
                            onClick={() => handleKeyClick(key.note)}
                            data-note={key.note}
                            style={{
                                ...(shouldShowLabel && chordToneColor && !isRoot ? {
                                    background: `linear-gradient(to bottom, ${chordToneColor} 0%, ${chordToneColor}dd 100%)`,
                                    boxShadow: `0 0 15px ${chordToneColor}`
                                } : {})
                            }}
                        >
                            {shouldShowLabel && (
                                <span className={styles.label}>{getLabel(key.note)}</span>
                            )}
                        </div>
                    );
                })}

                {/* Black keys */}
                {blackKeys.map((key) => {
                    const isHighlighted = highlightedNotes.includes(key.note);
                    const isActive = activeNotes.includes(key.note);
                    const isRoot = rootNote !== undefined && (key.note % 12 === rootNote % 12) && (isHighlighted || isActive);
                    const chordToneColor = getChordToneColor(key.note);
                    const shouldShowLabel = isHighlighted || isActive;
                    const whiteKeyIndex = whiteKeys.findIndex(k => k.note > key.note) - 1;

                    return (
                        <div
                            key={key.note}
                            className={`${styles.key} ${styles.blackKey} ${isHighlighted ? styles.highlighted : ''
                                } ${isActive ? styles.active : ''} ${isRoot ? styles.root : ''
                                } ${isInteractive ? styles.interactive : ''}`}
                            style={{
                                left: `${(whiteKeyIndex + 0.7) * (100 / whiteKeys.length)}%`,
                                ...(shouldShowLabel && chordToneColor && !isRoot ? {
                                    background: `linear-gradient(to bottom, ${chordToneColor} 0%, ${chordToneColor}cc 100%)`,
                                    boxShadow: `0 0 15px ${chordToneColor}`
                                } : {})
                            }}
                            onClick={() => handleKeyClick(key.note)}
                            data-note={key.note}
                        >
                            {shouldShowLabel && (
                                <span className={styles.label}>{getLabel(key.note)}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
