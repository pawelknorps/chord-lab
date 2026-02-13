import { useEffect, useRef } from 'react';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useInteractionStore } from '../../../core/state/useInteractionStore';

export function useClapValidation(onClap: (timestamp: number) => void) {
    const { stream } = useMicrophone();
    const { mode, isListening } = useInteractionStore();
    const { onset } = useHighPerformancePitch(stream, 'general');

    const lastOnsetRef = useRef<number>(0);

    useEffect(() => {
        if (mode !== 'Mic' || !isListening || onset <= 0) return;

        const now = performance.now();
        // Debounce onsets to avoid double triggers on a single clap
        if (now - lastOnsetRef.current > 100) {
            lastOnsetRef.current = now;
            onClap(now);
        }
    }, [onset, mode, isListening, onClap]);
}
