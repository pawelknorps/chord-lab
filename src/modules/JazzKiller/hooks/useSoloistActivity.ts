/**
 * Phase 19: Soloist-Responsive Playback.
 * Polls useITMPitchStore and updates soloistActivitySignal (0–1) from pitch/onset.
 * When no mic or store not ready, activity stays 0 (band fills).
 * Call from JazzKiller (or parent that has mic context) so when user turns toggle on, activity is available.
 */
import { useEffect, useRef } from 'react';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { soloistActivitySignal } from '../state/jazzSignals';
import { createSoloistActivitySampler } from '../utils/soloistActivityFromPitch';

const POLL_MS = 100;

export function useSoloistActivity() {
    const samplerRef = useRef<ReturnType<typeof createSoloistActivitySampler> | null>(null);

    useEffect(() => {
        if (samplerRef.current == null) {
            samplerRef.current = createSoloistActivitySampler({
                windowMs: 1600,
                sampleIntervalMs: POLL_MS,
            });
        }
        const sampler = samplerRef.current;

        const intervalId = setInterval(() => {
            const store = useITMPitchStore.getState();
            const reading = store.getLatestPitch();
            sampler.push(reading);
            const activity = sampler.get();
            soloistActivitySignal.value = activity;
        }, POLL_MS);

        return () => {
            clearInterval(intervalId);
            soloistActivitySignal.value = 0;
        };
    }, []);
}
