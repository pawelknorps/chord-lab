import { useJazzPlayback } from './useJazzPlayback';
import { useJazzBand } from './useJazzBand';
import { isPremiumEngineSignal } from '../state/jazzSignals';
import { useSignals } from '@preact/signals-react/runtime';

/**
 * Orchestrator hook that switches between the Legacy and Premium jazz engines.
 */
export const useJazzEngine = (song: any) => {
    useSignals();

    // We call BOTH hooks (they handle their own cleanup)
    // but only expose the methods from the active one.
    const isPremium = isPremiumEngineSignal.value;
    const legacy = useJazzPlayback(song, !isPremium);
    const premium = useJazzBand(song, isPremium);

    const active = isPremiumEngineSignal.value ? premium : legacy;

    return {
        ...active,
        isPremium: isPremiumEngineSignal.value,
        toggleEngine: () => {
            if (active.isPlayingSignal.value) active.togglePlayback();
            isPremiumEngineSignal.value = !isPremiumEngineSignal.value;
        },
        getChordAtTransportTime: (active as { getChordAtTransportTime?: (t: number) => string }).getChordAtTransportTime ?? (() => ''),
        isPlayingSignal: active.isPlayingSignal,
        isLoadedSignal: active.isLoadedSignal,
        loopCountSignal: active.loopCountSignal,
        currentMeasureIndexSignal: active.currentMeasureIndexSignal,
        currentBeatSignal: active.currentBeatSignal,
        bpmSignal: active.bpmSignal,
        totalLoopsSignal: active.totalLoopsSignal,
        onNote: active.onNote
    };
};
