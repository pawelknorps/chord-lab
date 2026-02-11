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
    isPlayingSignal,
    bpmSignal
} from '../state/jazzSignals';
import { useExerciseInputAdapter, type ExerciseInputSource } from '../core/ExerciseInputAdapter';
import * as Tone from 'tone';
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
    /** Chord at transport time t (for latency-adjusted scoring). If provided with latencyMs, scoring uses chord at (now - latency). */
    getChordAtTransportTime?: (t: number) => string;
    /** Latency in ms from user play to detected pitch; scoring uses chord that was active at (now - latencyMs). */
    latencyMs?: number;
    /** Called when running calibration to play a short tone; calibration measures time from this to first detection. */
    onRequestCalibrationTone?: () => void;
}

export interface UseStandardsExerciseResult {
    /** Current chord from chart. */
    currentChord: string;
    /** Target set for display (scale name, guide tones, or chord tones). */
    targetSet: TargetSetResult | null;
    /** Last score result (hit/miss). */
    lastResult: { hit: boolean; targetLabel?: string } | null;
    /** Running accuracy this session (overall): hits / (hits + misses). */
    accuracy: number;
    /** Hit count this session. */
    hits: number;
    /** Miss count this session. */
    misses: number;
    /** Accuracy in the last 4 measures only; null if no notes in that window. */
    accuracyLast4: number | null;
    /** Hits in the last 4 measures. */
    hitsLast4: number;
    /** Misses in the last 4 measures. */
    missesLast4: number;
    /** Per-measure hits/misses for error heatmap (Phase 15, REQ-SBE-06). */
    statsByMeasure: Record<number, { hits: number; misses: number }>;
    /** Current exercise type (for heatmap label/tooltip). */
    exerciseType: ExerciseType;
    /** Whether the input adapter is ready. */
    isReady: boolean;
    /** Reset session stats. */
    resetSession: () => void;
    /** Run calibration: play tone, measure time to first detection, return suggested latency ms. */
    runCalibration: () => Promise<number>;
}

export function useStandardsExercise(options: UseStandardsExerciseOptions): UseStandardsExerciseResult {
    const { exerciseType, inputSource, active, getChordAtTransportTime, latencyMs = 80, onRequestCalibrationTone } = options;
    useSignals();

    const currentChord = currentChordSymbolSignal.value ?? '';
    const measureIndex = currentMeasureIndexSignal.value ?? -1;
    const beat = currentBeatSignal.value ?? -1;
    const isPlaying = isPlayingSignal.value;

    // Start mic when panel is open and Mic selected (so it's ready when user hits play)
    const { getCurrentNote, isReady } = useExerciseInputAdapter(inputSource, active);

    const [lastResult, setLastResult] = useState<{ hit: boolean; targetLabel?: string } | null>(null);
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    /** Per-measure hits/misses for "last 4 bars" accuracy. */
    const [statsByMeasure, setStatsByMeasure] = useState<Record<number, { hits: number; misses: number }>>({});
    const lastProcessedNoteRef = useRef<number | null>(null);
    /** Transport time when playback started; first 4 beats after this are count-in (not scored). */
    const playbackStartSecondsRef = useRef<number>(0);

    // For display use current chord; target set for scoring is computed in the loop with latency offset
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

    // When playback starts, record transport time so we can skip scoring during 4-beat count-in
    const prevPlayingRef = useRef(isPlaying);
    useEffect(() => {
        if (isPlaying && !prevPlayingRef.current) {
            playbackStartSecondsRef.current = Tone.Transport.seconds;
        }
        prevPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Score incoming notes: use latency-adjusted chord when available so feedback matches when user played.
    // First 4 beats after playback start are count-in (not scored).
    useEffect(() => {
        if (!active || !isPlaying) return;

        const bpm = bpmSignal.value;
        const countInSeconds = (4 * 60) / Math.max(1, bpm);

        let rafId: number;
        const loop = () => {
            const now = Tone.Transport.seconds;
            const elapsed = now - playbackStartSecondsRef.current;
            const pastCountIn = elapsed >= countInSeconds;

            const note = getCurrentNote();
            if (note !== null && note !== lastProcessedNoteRef.current && pastCountIn) {
                lastProcessedNoteRef.current = note;
                const chordForScoring =
                    getChordAtTransportTime && latencyMs > 0
                        ? getChordAtTransportTime(Tone.Transport.seconds - latencyMs / 1000)
                        : currentChordSymbolSignal.value ?? "";
                const scoringTargetSet = chordForScoring
                    ? getTargetSet(chordForScoring, exerciseType)
                    : null;
                const mIndex = currentMeasureIndexSignal.value ?? -1;
                const result = scoreNote(note, scoringTargetSet ?? null, mIndex, beat);
                setLastResult({ hit: result.hit, targetLabel: result.targetLabel });
                if (result.hit) {
                    setHits((h) => h + 1);
                } else {
                    setMisses((m) => m + 1);
                }
                setStatsByMeasure((prev) => {
                    if (mIndex < 0) return prev;
                    const cur = prev[mIndex] ?? { hits: 0, misses: 0 };
                    return {
                        ...prev,
                        [mIndex]: result.hit
                            ? { ...cur, hits: cur.hits + 1 }
                            : { ...cur, misses: cur.misses + 1 }
                    };
                });
            }
            if (note === null) {
                lastProcessedNoteRef.current = null;
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [active, isPlaying, getCurrentNote, getChordAtTransportTime, latencyMs, exerciseType, measureIndex, beat]);

    const resetSession = useCallback(() => {
        setLastResult(null);
        setHits(0);
        setMisses(0);
        setStatsByMeasure({});
        lastProcessedNoteRef.current = null;
    }, []);

    const total = hits + misses;
    const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

    // Last 4 measures: current measure and the 3 before it (by chart measure index)
    const currentMeasure = currentMeasureIndexSignal.value ?? -1;
    let hitsLast4 = 0;
    let missesLast4 = 0;
    for (let i = Math.max(0, currentMeasure - 3); i <= currentMeasure; i++) {
        const s = statsByMeasure[i];
        if (s) {
            hitsLast4 += s.hits;
            missesLast4 += s.misses;
        }
    }
    const totalLast4 = hitsLast4 + missesLast4;
    const accuracyLast4 = totalLast4 > 0 ? Math.round((hitsLast4 / totalLast4) * 100) : null;

    const runCalibration = useCallback(async (): Promise<number> => {
        if (!onRequestCalibrationTone || typeof Tone === 'undefined') return latencyMs;
        const T0 = Tone.Transport.seconds;
        onRequestCalibrationTone();
        const timeout = 2000;
        const start = Date.now();
        return new Promise<number>((resolve) => {
            const check = () => {
                const note = getCurrentNote();
                if (note !== null) {
                    const T1 = Tone.Transport.seconds;
                    resolve(Math.round(Math.max(0, (T1 - T0) * 1000)));
                    return;
                }
                if (Date.now() - start > timeout) {
                    resolve(latencyMs);
                    return;
                }
                requestAnimationFrame(check);
            };
            requestAnimationFrame(check);
        });
    }, [onRequestCalibrationTone, getCurrentNote, latencyMs]);

    return {
        currentChord,
        targetSet,
        lastResult,
        accuracy,
        hits,
        misses,
        accuracyLast4,
        hitsLast4,
        missesLast4,
        statsByMeasure,
        exerciseType,
        isReady,
        resetSession,
        runCalibration
    };
}
