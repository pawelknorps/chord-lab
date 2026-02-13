import { useCallback } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import {
    currentMeasureIndexSignal,
    proactiveAdviceSignal,
    isAiThinkingSignal,
} from '../state/jazzSignals';
import { generateJazzLesson } from '../ai/jazzTeacherLogic';
import { usePracticeStore } from '../../../core/store/usePracticeStore';

/**
 * useAiTeacher: On-demand AI tips only. No automatic inference in the background
 * to avoid CPU load and audio dropouts. User requests a "Sensei" tip via button click.
 */
export function useAiTeacher() {
    useSignals();
    const { currentSong } = usePracticeStore();

    const triggerProactiveAnalysis = useCallback(async (song: any, index: number, reason: string) => {
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
        } catch (e) {
            console.error('AI Sensei err:', e);
        } finally {
            isAiThinkingSignal.value = false;
        }
    }, []);

    /** Request a tip for the current bar. Only runs when user clicks; no background inference. */
    const requestAdviceForCurrentMeasure = useCallback(() => {
        if (!currentSong) return;
        const index = currentMeasureIndexSignal.value;
        if (index < 0) {
            triggerProactiveAnalysis(currentSong, 0, 'User requested tip');
            return;
        }
        triggerProactiveAnalysis(currentSong, index, 'User requested tip');
    }, [currentSong, triggerProactiveAnalysis]);

    return {
        clearAdvice: () => { proactiveAdviceSignal.value = null; },
        requestAdviceForCurrentMeasure,
    };
}
