import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MusicalClipboard {
    progression: { chords: string[]; key?: string } | null;
    chord: { root: string; quality: string; notes?: number[] } | null;
    sourceModule: string | null;
    timestamp: number;
}

interface MusicalClipboardStore extends MusicalClipboard {
    copyProgression: (progression: { chords: string[]; key?: string }, source: string) => void;
    copyChord: (chord: { root: string; quality: string; notes?: number[] }, source: string) => void;
    pasteProgression: () => { chords: string[]; key?: string; source: string } | null;
    pasteChord: () => { root: string; quality: string; notes?: number[]; source: string } | null;
    clear: () => void;
}

export const useMusicalClipboard = create<MusicalClipboardStore>()(
    persist(
        (set, get) => ({
            progression: null,
            chord: null,
            sourceModule: null,
            timestamp: 0,

            copyProgression: (progression, source) => {
                set({
                    progression,
                    chord: null,
                    sourceModule: source,
                    timestamp: Date.now(),
                });
            },

            copyChord: (chord, source) => {
                set({
                    chord,
                    progression: null,
                    sourceModule: source,
                    timestamp: Date.now(),
                });
            },

            pasteProgression: () => {
                const { progression, sourceModule } = get();
                if (!progression) return null;
                return { ...progression, source: sourceModule || 'unknown' };
            },

            pasteChord: () => {
                const { chord, sourceModule } = get();
                if (!chord) return null;
                return { ...chord, source: sourceModule || 'unknown' };
            },

            clear: () => {
                set({
                    progression: null,
                    chord: null,
                    sourceModule: null,
                    timestamp: 0,
                });
            },
        }),
        {
            name: 'musical-clipboard',
        }
    )
);
