import { useEffect, useRef } from 'react';
import { useHighPerformancePitch } from '../hooks/useHighPerformancePitch';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useScoringStore } from '../../../core/store/useScoringStore';
import { currentChordSymbolSignal, currentMeasureIndexSignal, isPlayingSignal } from '../../JazzKiller/state/jazzSignals';
import * as Note from '@tonaljs/note';

/**
 * Bridge component that connects the High-Performance Audio Worklet to the ITM Zustand Store.
 * This runs at 120Hz (via requestAnimationFrame) but the heavy lifting is done in the Worklet thread.
 */
export const HighPerformanceScoringBridge = () => {
    const { start: startMic, stop: stopMic, stream, isActive: isMicActive } = useMicrophone();
    const { isReady, getLatestPitch } = useHighPerformancePitch(stream);
    const processNote = useScoringStore(state => state.processNote);
    const isScoringActive = useScoringStore(state => state.isActive);
    const isPlaying = isPlayingSignal.value;

    // 1. Sync Microphone with Playback + Scoring State
    useEffect(() => {
        const shouldBeActive = isPlaying && isScoringActive;

        if (shouldBeActive && !isMicActive) {
            void startMic();
        } else if (!shouldBeActive && isMicActive) {
            stopMic();
        }
    }, [isPlaying, isScoringActive, isMicActive, startMic, stopMic]);

    const lastResultRef = useRef<number | null>(null);

    // 2. Process incoming pitch results
    useEffect(() => {
        if (!isReady || !isScoringActive || !isPlaying) return;

        let rafId: number;

        const loop = () => {
            const result = getLatestPitch();

            if (result && result.clarity > 0.9) {
                const midi = Note.midi(Note.fromFreq(result.frequency));

                if (midi !== null && midi !== lastResultRef.current) {
                    const measureIndex = currentMeasureIndexSignal.value;
                    const currentChord = currentChordSymbolSignal.value;

                    if (measureIndex >= 0 && currentChord) {
                        processNote(midi, currentChord, measureIndex);
                        lastResultRef.current = midi;
                    }
                }

                if (midi === null) {
                    lastResultRef.current = null;
                }
            }

            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [isReady, isScoringActive, isPlaying, getLatestPitch, processNote]);

    return null; // This is a logic-only bridge component
};
