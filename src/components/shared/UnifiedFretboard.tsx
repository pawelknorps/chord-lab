import React, { useMemo, useCallback } from 'react';
import { UnifiedFretboardProps } from './types';
import styles from './UnifiedFretboard.module.css';
import * as Tone from 'tone';
import { audioManager } from '../../core/services';
import { midiToNoteName, getIntervalName, getScaleDegree, getChordToneLabel } from '../../core/theory';

const TUNINGS: Record<string, string[]> = {
    standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    'drop-d': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    'open-g': ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
};

const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const DOUBLE_MARKERS = [12, 24];

export const UnifiedFretboard: React.FC<UnifiedFretboardProps> = ({
    mode = 'notes',
    tuning = 'standard',
    highlightedNotes = [],
    activeNotes = [],
    highlightByPitchClass = false,
    onNoteClick,
    showFretNumbers = true,
    showStringNames = true,
    fretRange = [0, 15],
    rootNote,
    interactive = true,
    playSound = true,
    className = '',
}) => {
    const stringNotes = useMemo(() => {
        const baseNotes = Array.isArray(tuning) ? tuning : TUNINGS[tuning as string] || TUNINGS.standard;
        // Reverse so the highest string is at the top visually
        return [...baseNotes].reverse();
    }, [tuning]);

    const calculateNote = useCallback((baseNote: string, fret: number) => {
        return Tone.Frequency(baseNote).toMidi() + fret;
    }, []);

    const getLabel = useCallback((note: number) => {
        switch (mode) {
            case 'intervals':
                return rootNote !== undefined ? getIntervalName(rootNote, note) : '';
            case 'scale-degrees':
                return rootNote !== undefined ? getScaleDegree(rootNote, note) : '';
            case 'chord-tones':
                return rootNote !== undefined ? getChordToneLabel(rootNote, note) : '';
            case 'notes':
            default:
                return midiToNoteName(note, rootNote !== undefined ? midiToNoteName(rootNote).replace(/[0-9]/g, '') : 'C').replace(/[0-9]/g, '');
        }
    }, [mode, rootNote]);

    const handleFretClick = (stringIdx: number, fret: number, note: number) => {
        if (!interactive) return;

        Tone.start();

        if (playSound) {
            audioManager.playNote(note, '4n', 0.7);
        }

        if (onNoteClick) {
            onNoteClick(note, stringIdx, fret);
        }
    };

    const fretNumbers = useMemo(() => {
        const nums = [];
        for (let i = fretRange[0]; i <= fretRange[1]; i++) {
            nums.push(i);
        }
        return nums;
    }, [fretRange]);

    const highlightedPitchClasses = useMemo(() => {
        if (!highlightByPitchClass) return null;
        const combined = [...highlightedNotes, ...activeNotes];
        if (combined.length === 0) return new Set<number>();
        return new Set(combined.map((n) => n % 12));
    }, [highlightByPitchClass, highlightedNotes, activeNotes]);

    return (
        <div className={`${styles.container} ${className}`}>
            {/* Fret Numbers Header */}
            {showFretNumbers && (
                <div className={styles.fretNumbers}>
                    <div className={styles.spacer}></div>
                    {fretNumbers.map((num) => (
                        <div key={num} className={styles.fretNumber}>
                            {num}
                        </div>
                    ))}
                </div>
            )}

            {/* Fretboard Body */}
            <div className={styles.fretboard}>
                {stringNotes.map((baseNote, sIdx) => {
                    const stringIndex = stringNotes.length - 1 - sIdx;
                    return (
                        <div key={sIdx} className={styles.stringRow}>
                            {/* String Name */}
                            {showStringNames && (
                                <div className={styles.stringName}>
                                    {baseNote.replace(/[0-9]/g, '')}
                                </div>
                            )}

                            {/* Frets for this string */}
                            <div className={styles.stringFrets}>
                                {fretNumbers.map((fret) => {
                                    const note = calculateNote(baseNote, fret);
                                    const isHighlighted = highlightByPitchClass && highlightedPitchClasses !== null
                                        ? highlightedPitchClasses.has(note % 12)
                                        : highlightedNotes.includes(note);
                                    const isActive = highlightByPitchClass && highlightedPitchClasses !== null
                                        ? highlightedPitchClasses.has(note % 12)
                                        : activeNotes.includes(note);
                                    const isRoot = rootNote !== undefined && (note % 12 === rootNote % 12) && (isHighlighted || isActive);
                                    const isMarkerFret = FRET_MARKERS.includes(fret);
                                    const isDoubleMarker = DOUBLE_MARKERS.includes(fret);

                                    return (
                                        <div
                                            key={fret}
                                            className={`
                        ${styles.fret} 
                        ${fret === 0 ? styles.nut : ''} 
                        ${isMarkerFret ? styles.markerFret : ''}
                      `}
                                            onClick={() => handleFretClick(stringIndex, fret, note)}
                                        >
                                            {/* String Line */}
                                            <div className={styles.stringLine} style={{ height: `${1 + sIdx * 0.5}px` }}></div>

                                            {/* Fret Markers (Middle of neck) */}
                                            {sIdx === 2 && isMarkerFret && !isDoubleMarker && (
                                                <div className={styles.dot}></div>
                                            )}
                                            {sIdx === 2 && isDoubleMarker && (
                                                <>
                                                    <div className={`${styles.dot} ${styles.doubleDotTop}`}></div>
                                                    <div className={`${styles.dot} ${styles.doubleDotBottom}`}></div>
                                                </>
                                            )}

                                            {/* Note Circle */}
                                            {(isHighlighted || isActive) && (
                                                <div className={`
                          ${styles.noteCircle} 
                          ${isRoot ? styles.root : ''} 
                          ${isActive ? styles.active : ''}
                        `}>
                                                    <span className={styles.label}>{getLabel(note)}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
