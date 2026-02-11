/**
 * Hook for Standards-Based Exercises (Phase 13).
 * Composes ExerciseInputAdapter and StandardsExerciseEngine; returns target set,
 * last hit/miss, running accuracy, and reset. Subscribes to chart signals.
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import {
    currentChordSymbolSignal,
    currentMeasureIndexSignal,
    currentBeatSignal,
    isPlayingSignal
} from '../state/jazzSignals';
import { useExerciseInputAdapter, type ExerciseInputSource } from '../core/ExerciseInputAdapter';
import {
    getTargetSet,
    scoreNote,
    type ExerciseType,
    type TargetSetResult
} from '../core/StandardsExerciseEngine';

export interface UseStandardsExerciseOptions {
    exerciseType: ExerciseType;
    inputSource: ExerciseInputSource;
    /** When true, adapter is active and scoring runs. */
    active: boolean;
}

export interface UseStandardsExerciseResult {
    /** Current chord from chart. */
    currentChord: string;
    /** Target set for display (scale name, guide tones, or chord tones). */
    targetSet: TargetSetResult | null;
    /** Last score result (hit/miss). */
    lastResult: { hit: boolean; targetLabel?: string } | null;
    /** Running accuracy this session: hits / (hits + misses). */
    accuracy: number;
    /** Hit count this session. */
    hits: number;
    /** Miss count this session. */
    misses: number;
    /** Whether the input adapter is ready. */
    isReady: boolean;
    /** Reset session stats. */
    resetSession: () => void;
}

export function useStandardsExercise(options: UseStandardsExerciseOptions): UseStandardsExerciseResult {
    const { exerciseType, inputSource, active } = options;
    useSignals();

    const currentChord = currentChordSymbolSignal.value ?? '';
    const measureIndex = currentMeasureIndexSignal.value ?? -1;
    const beat = currentBeatSignal.value ?? -1;
    const isPlaying = isPlayingSignal.value;

    const { getCurrentNote, isReady } = useExerciseInputAdapter(inputSource, active && isPlaying);

    const [lastResult, setLastResult] = useState<{ hit: boolean; targetLabel?: string } | null>(null);
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const lastProcessedNoteRef = useRef<number | null>(null);

    const targetSet = currentChord
        ? getTargetSet(currentChord, exerciseType)
        : null;

    // Reset processed note when chord changes so a held note is re-scored against new chord
    const prevChordRef = useRef(currentChord);
    useEffect(() => {
        if (currentChord !== prevChordRef.current) {
            prevChordRef.current = currentChord;
            lastProcessedNoteRef.current = null;
        }
    }, [currentChord]);

    // Score incoming notes in sync with chart
    useEffect(() => {
        if (!active || !isPlaying || !currentChord) return;

        let rafId: number;
        const loop = () => {
            const note = getCurrentNote();
            if (note !== null && note !== lastProcessedNoteRef.current) {
                lastProcessedNoteRef.current = note;
                const result = scoreNote(note, targetSet ?? null, measureIndex, beat);
                setLastResult({ hit: result.hit, targetLabel: result.targetLabel });
                if (result.hit) {
                    setHits((h) => h + 1);
                } else {
                    setMisses((m) => m + 1);
                }
            }
            if (note === null) {
                lastProcessedNoteRef.current = null;
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [active, isPlaying, currentChord, getCurrentNote, targetSet, measureIndex, beat]);

    const resetSession = useCallback(() => {
        setLastResult(null);
        setHits(0);
        setMisses(0);
        lastProcessedNoteRef.current = null;
    }, []);

    const total = hits + misses;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

    return {
        currentChord,
        targetSet,
        lastResult,
        accuracy,
        hits,
        misses,
        isReady,
        resetSession
    };
}
