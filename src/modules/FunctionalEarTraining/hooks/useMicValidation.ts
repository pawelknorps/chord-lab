import { useEffect, useRef } from 'react';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useFunctionalEarTrainingStore } from '../state/useFunctionalEarTrainingStore';
import { useInteractionStore } from '../../../core/state/useInteractionStore';

export function useMicValidation(onCorrect: () => void) {
    const { stream } = useMicrophone();
    const { mode, isListening } = useInteractionStore();
    const { activeTarget, setActiveTarget } = useFunctionalEarTrainingStore();
    const { pitch } = useHighPerformancePitch(stream, 'voice');

    const lastTriggeredRef = useRef<number>(0);

    useEffect(() => {
        if (mode !== 'Mic' || !isListening || !activeTarget || !pitch || pitch.clarity < 0.95) return;

        if (activeTarget.type === 'pitch' && activeTarget.midi !== null) {
            const detectedMidi = 12 * Math.log2(pitch.frequency / 440) + 69;
            const detectedPc = Math.round(detectedMidi) % 12;
            const targetPc = activeTarget.midi % 12;

            if (detectedPc === targetPc) {
                const now = Date.now();
                if (now - lastTriggeredRef.current > 1000) { // 1s debounce
                    lastTriggeredRef.current = now;

                    if (activeTarget.sequence && activeTarget.sequenceIndex !== undefined) {
                        const nextIndex = activeTarget.sequenceIndex + 1;
                        if (nextIndex < activeTarget.sequence.length) {
                            // Advance sequence
                            setActiveTarget({
                                ...activeTarget,
                                midi: activeTarget.sequence[nextIndex],
                                sequenceIndex: nextIndex
                            });
                        } else {
                            // Finished sequence
                            onCorrect();
                        }
                    } else {
                        onCorrect();
                    }
                }
            }
        }
    }, [pitch, activeTarget, mode, isListening, onCorrect, setActiveTarget]);

    return {
        currentPitch: pitch,
        isActive: mode === 'Mic' && isListening
    };
}
