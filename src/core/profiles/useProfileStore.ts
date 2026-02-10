import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudentProfile, SongProgress, ProfileStats } from './ProfileTypes';

interface ProfileStore {
    currentProfile: StudentProfile | null;
    profiles: StudentProfile[];

    createProfile: (name: string) => void;
    switchProfile: (id: string) => void;
    updateSongProgress: (songTitle: string, bpm: number, hotspotIndex?: number, score?: number) => void;
    markSongMastered: (songTitle: string) => void;
    getStats: () => ProfileStats;
}

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set, get) => ({
            currentProfile: null,
            profiles: [],

            createProfile: (name) => {
                const profile: StudentProfile = {
                    id: Date.now().toString(),
                    name,
                    createdAt: Date.now(),
                    lastActive: Date.now(),
                    songProgress: new Map(),
                    totalPracticeTime: 0,
                    achievements: [],
                };

                set((state) => ({
                    profiles: [...state.profiles, profile],
                    currentProfile: profile,
                }));
            },

            switchProfile: (id) => {
                const profile = get().profiles.find(p => p.id === id);
                if (profile) {
                    set({ currentProfile: { ...profile, lastActive: Date.now() } });
                }
            },

            updateSongProgress: (songTitle, bpm, hotspotIndex, score) => {
                const { currentProfile } = get();
                if (!currentProfile) return;

                const existing = currentProfile.songProgress.get(songTitle);
                const progress: SongProgress = existing || {
                    songTitle,
                    maxBpm: 0,
                    attempts: 0,
                    lastPracticed: Date.now(),
                    mastered: false,
                    hotspotScores: new Map(),
                };

                progress.maxBpm = Math.max(progress.maxBpm, bpm);
                progress.attempts += 1;
                progress.lastPracticed = Date.now();

                if (hotspotIndex !== undefined && score !== undefined) {
                    progress.hotspotScores.set(hotspotIndex, score);
                }

                currentProfile.songProgress.set(songTitle, progress);
                set({ currentProfile: { ...currentProfile } });
            },

            markSongMastered: (songTitle) => {
                const { currentProfile } = get();
                if (!currentProfile) return;

                const progress = currentProfile.songProgress.get(songTitle);
                if (progress) {
                    progress.mastered = true;
                    currentProfile.songProgress.set(songTitle, progress);
                    set({ currentProfile: { ...currentProfile } });
                }
            },

            getStats: () => {
                const { currentProfile } = get();
                if (!currentProfile) return { totalSongs: 0, masteredSongs: 0, averageBpm: 0, practiceStreak: 0 };

                const songs = Array.from(currentProfile.songProgress.values());
                const totalSongs = songs.length;
                const masteredSongs = songs.filter(s => s.mastered).length;
                const averageBpm = songs.reduce((sum, s) => sum + s.maxBpm, 0) / (totalSongs || 1);

                return { totalSongs, masteredSongs, averageBpm, practiceStreak: 0 };
            },
        }),
        {
            name: 'student-profiles',
            partialize: (state) => ({
                profiles: state.profiles.map(p => ({
                    ...p,
                    songProgress: Array.from(p.songProgress.entries()),
                })),
                currentProfile: state.currentProfile ? {
                    ...state.currentProfile,
                    songProgress: Array.from(state.currentProfile.songProgress.entries()),
                } : null,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.profiles) {
                    state.profiles = state.profiles.map((p: any) => ({
                        ...p,
                        songProgress: new Map(p.songProgress || []),
                    }));
                }
                if (state?.currentProfile) {
                    state.currentProfile.songProgress = new Map(state.currentProfile.songProgress || []);
                }
            },
        }
    )
);
