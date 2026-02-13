/**
 * Standards-Based Exercise Engine (Phase 13).
 * Derives target sets (scale notes, guide tones, or chord tones) from the current chord
 * and scores student input against them. Used by the JazzKiller Exercises panel.
 */
import * as Chord from '@tonaljs/chord';
import * as Note from '@tonaljs/note';
import { ChordScaleEngine } from '../../../core/theory/ChordScaleEngine';
import { GuideToneCalculator } from '../../../core/theory/GuideToneCalculator';
import { toTonalChordSymbol } from '../../../core/theory/chordSymbolForTonal';

const REFERENCE_OCTAVE = 4;

export type ExerciseType = 'scale' | 'guideTones' | 'arpeggio';

export interface TargetSetResult {
    /** Pitch classes (0–11) that count as correct. */
    pitchClasses: number[];
    /** Human-readable label for UI (e.g. "D Dorian", "3rd: F, 7th: C"). */
    label: string;
}

export interface ScoreResult {
    hit: boolean;
    targetLabel?: string;
}

/**
 * Returns pitch class (0–11) for a MIDI note.
 */
function midiToPitchClass(midi: number): number {
    return ((midi % 12) + 12) % 12;
}

/**
 * Converts note name(s) to pitch classes. Handles "C", "C4", "F#", etc.
 */
function noteNamesToPitchClasses(notes: string[]): number[] {
    const pcs = new Set<number>();
    for (const n of notes) {
        const withOctave = /[0-9]/.test(n) ? n : `${n}${REFERENCE_OCTAVE}`;
        const midi = Note.midi(withOctave);
        if (midi !== null) {
            pcs.add(midiToPitchClass(midi));
        } else {
            const chroma = Note.chroma(n);
            if (chroma !== undefined) pcs.add(chroma);
        }
    }
    return Array.from(pcs);
}

/**
 * Get the target set (pitch classes) and display label for the current chord and exercise type.
 */
export function getTargetSet(chordSymbol: string, exerciseType: ExerciseType): TargetSetResult | null {
    const cleanChord = (chordSymbol || '').replace(/\s+/g, '').trim();
    if (!cleanChord) return null;

    try {
        if (exerciseType === 'scale') {
            const mapping = ChordScaleEngine.getScales(cleanChord);
            if (!mapping?.primary?.notes?.length) return null;
            const pitchClasses = noteNamesToPitchClasses(mapping.primary.notes);
            return {
                pitchClasses,
                label: mapping.primary.name
            };
        }

        if (exerciseType === 'guideTones') {
            const gt = GuideToneCalculator.calculate(cleanChord);
            if (!gt) return null;
            const notes = [gt.third, gt.seventh];
            const pitchClasses = noteNamesToPitchClasses(notes);
            return {
                pitchClasses,
                label: `3rd: ${gt.third}, 7th: ${gt.seventh}`
            };
        }

        if (exerciseType === 'arpeggio') {
            const chord = Chord.get(toTonalChordSymbol(cleanChord));
            if (chord.empty || !chord.notes?.length) return null;
            const pitchClasses = noteNamesToPitchClasses(chord.notes);
            return {
                pitchClasses,
                label: chord.notes.join(', ')
            };
        }
    } catch {
        return null;
    }
    return null;
}

/**
 * Score a student note against the target set. Uses pitch class only (any octave counts).
 */
export function scoreNote(
    studentNoteMidi: number,
    targetSet: TargetSetResult | null,
    _measureIndex?: number,
    _beat?: number
): ScoreResult {
    if (!targetSet?.pitchClasses.length) return { hit: false };
    const pc = midiToPitchClass(studentNoteMidi);
    const hit = targetSet.pitchClasses.includes(pc);
    return { hit, targetLabel: targetSet.label };
}
