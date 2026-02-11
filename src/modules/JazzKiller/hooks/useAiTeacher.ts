import { useEffect, useRef } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import {
    currentMeasureIndexSignal,
    isPlayingSignal,
    proactiveAdviceSignal,
    isAiThinkingSignal,
    lastPivotIndexSignal
} from '../state/jazzSignals';
import { AiContextService } from '../../../core/services/AiContextService';
import { generateJazzLesson } from '../ai/jazzTeacherLogic';
import { usePracticeStore } from '../../../core/store/usePracticeStore';

const STAY_THRESHOLD_MS = 20000; // 20 seconds on a hotspot/pivot

/**
 * useAiTeacher: Periodically analyzes the student's progress and 
 * triggers proactive advice when a "harmonic gravity" shift occurs.
 */
export function useAiTeacher() {
    useSignals();
    const { currentSong } = usePracticeStore();
    const stayTimerRef = useRef<any>(null);
    const lastActiveMeasureRef = useRef(-1);

    useEffect(() => {
        if (!isPlayingSignal.value || !currentSong) {
            if (stayTimerRef.current) clearTimeout(stayTimerRef.current);
            return;
        }

        const currentIndex = currentMeasureIndexSignal.value;
        if (currentIndex === -1) return;

        // If measure changed, restart the "Struggle Timer"
        if (currentIndex !== lastActiveMeasureRef.current) {
            if (stayTimerRef.current) clearTimeout(stayTimerRef.current);
            lastActiveMeasureRef.current = currentIndex;

            // 1. Pivot Detection Logic
            // We only trigger once per pivot index to avoid spamming
            const bundle = AiContextService.generateBundle(currentSong);
            if (bundle.pivotPoints.includes(currentIndex) && currentIndex !== lastPivotIndexSignal.value) {
                lastPivotIndexSignal.value = currentIndex;
                triggerProactiveAnalysis(currentSong, currentIndex, 'Pivot Point Detected');
            }

            // 2. Hotspot Timer Logic
            // If this is a high-tension measure, start a timer
            const measure = bundle.sections[0].measures[currentIndex];
            if (measure && (measure.weight === 'high' || measure.concepts.length > 0)) {
                stayTimerRef.current = setTimeout(() => {
                    if (isPlayingSignal.value && currentMeasureIndexSignal.value === currentIndex) {
                        triggerProactiveAnalysis(currentSong, currentIndex, 'Focusing on challenge');
                    }
                }, STAY_THRESHOLD_MS);
            }
        }

    }, [currentMeasureIndexSignal.value, isPlayingSignal.value, currentSong]);

    const triggerProactiveAnalysis = async (song: any, index: number, reason: string) => {
        if (isAiThinkingSignal.value) return;

        isAiThinkingSignal.value = true;
        try {
            const task = `The student is currently playing bar ${index + 1} (${reason}). 
            Give a 1-sentence "mentor tip" specifically for this bar's harmony. 
            Keep it very concise. Use a command if helpful.`;

            const advice = await generateJazzLesson(song, 'improvisation', task);

            // Strip UI commands from advice text (Case-insensitive, whitespace resilient)
            const processedAdvice = advice.replace(/\[\[\s*(DRILL|SET|UI)\s*:\s*([^\]\s:]+)\s*(?::\s*([^\]\s]+)\s*)?\]\]/gi, '').trim();
            proactiveAdviceSignal.value = processedAdvice;

            // Auto-clear notification after some time or keep it until user interacts?
            // For now, let's keep it until they see it.
        } catch (e) {
            console.error('Proactive AI err:', e);
        } finally {
            isAiThinkingSignal.value = false;
        }
    };

    return {
        clearAdvice: () => proactiveAdviceSignal.value = null
    };
}
