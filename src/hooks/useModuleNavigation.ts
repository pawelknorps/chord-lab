import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { createDeepLink } from '../core/routing/deepLinks';
import { useMusicalClipboard } from '../core/state/musicalClipboard';
import { useSessionStore } from '../core/store/useSessionStore';
import { ProgressionData, ChordData } from '../components/shared/types';

export function useModuleNavigation() {
    const navigate = useNavigate();
    const { copyProgression, copyChord } = useMusicalClipboard();
    const { startSession, addGoal } = useSessionStore();

    const navigateToEarTraining = useCallback(
        (data: ProgressionData | ChordData, options?: { mode?: string }) => {
            const link = createDeepLink('ear-training', data as any);
            const finalLink = options?.mode ? `${link}&exercise=${options.mode}` : link;

            if ('chords' in data) {
                copyProgression(data, 'navigation');
                startSession({ progression: data });
                addGoal({ type: 'identify', description: 'Transcribe Progression' });
            } else {
                copyChord(data, 'navigation');
                startSession({ chord: data });
                addGoal({ type: 'identify', description: `Identify ${data.name || 'Chord'}` });
            }

            navigate(finalLink);
        },
        [navigate, copyProgression, copyChord, startSession, addGoal]
    );

    const navigateToChordLab = useCallback(
        (data: ProgressionData) => {
            const link = createDeepLink('chordlab', data as any);
            copyProgression(data, 'navigation');
            startSession({ progression: data });
            addGoal({ type: 'construct', description: 'Apply Voicings' });
            navigate(link);
        },
        [navigate, copyProgression, startSession, addGoal]
    );

    const navigateToChordBuilder = useCallback(
        (data: ChordData) => {
            const link = createDeepLink('chord-builder', data as any);
            copyChord(data, 'navigation');
            startSession({ chord: data });
            addGoal({ type: 'construct', description: 'Analyze Intervals' });
            navigate(link);
        },
        [navigate, copyChord, startSession, addGoal]
    );

    const navigateToJazzStandards = useCallback(
        (options?: { standard?: string; measure?: number }) => {
            let link = '/jazz-standards'; // Changed from /jazzkiller to match App routes
            if (options?.standard) {
                link += `?standard=${encodeURIComponent(options.standard)}`;
                if (options.measure) {
                    link += `&measure=${options.measure}`;
                }
            }
            navigate(link);
        },
        [navigate]
    );

    return {
        navigateToEarTraining,
        navigateToChordLab,
        navigateToChordBuilder,
        navigateToJazzStandards,
    };
}
