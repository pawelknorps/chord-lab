import { useEffect } from 'react';
import { useAuralMirror } from '../../../hooks/useAuralMirror';
import { useScoringStore } from '../../../core/store/useScoringStore';
import { currentChordSymbolSignal, currentMeasureIndexSignal, isPlayingSignal } from '../state/jazzSignals';
import { useSignals } from '@preact/signals-react/runtime';

/**
 * Bridge between Microphone/Pitch detection and the ITM Scoring Engine.
 * Automatically processes notes if both Microphone and Playback are active.
 * Handles microphone lifecycle based on scoring and playback state.
 */
export function usePerformanceScoring() {
    useSignals();
    const { midi, isActive: isMicActive, start: startMic, stop: stopMic } = useAuralMirror();
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

    // 2. Process incoming MIDI notes if scoring and playback are active
    useEffect(() => {
        // Only process notes if scoring is active, mic is on, and music is playing
        if (isScoringActive && isMicActive && isPlaying && midi !== null) {
            const measureIndex = currentMeasureIndexSignal.value;
            const currentChord = currentChordSymbolSignal.value;

            // Only process if we have valid context
            if (measureIndex >= 0 && currentChord) {
                processNote(midi, currentChord, measureIndex);
            }
        }
    }, [midi, isMicActive, isPlaying, isScoringActive, processNote]);

    return {
        isMicActive
    };
}
