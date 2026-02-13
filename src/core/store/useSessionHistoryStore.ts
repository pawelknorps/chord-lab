import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PerformanceSegment } from '../../modules/ITM/types/PerformanceSegment';

interface SessionHistoryState {
    sessions: PerformanceSegment[];

    // Actions
    addSession: (session: PerformanceSegment) => void;
    clearHistory: () => void;
    getSessionsByStandard: (standardId: string) => PerformanceSegment[];
    getLatestSession: () => PerformanceSegment | null;
}

const MAX_SESSIONS = 50;

/**
 * Global store for persistent practice session history (REQ-MT-02).
 * Caps at 50 sessions to manage LocalStorage size.
 */
export const useSessionHistoryStore = create<SessionHistoryState>()(
    persist(
        (set, get) => ({
            sessions: [],

            addSession: (session) => {
                set((state) => {
                    const newSessions = [session, ...state.sessions].slice(0, MAX_SESSIONS);
                    return { sessions: newSessions };
                });

                // Periodic or immediate cloud sync
                import('../services/itmSyncService').then(({ ItmSyncService }) => {
                    ItmSyncService.syncPerformanceSegment(session).catch(console.error);
                });
            },

            clearHistory: () => set({ sessions: [] }),

            getSessionsByStandard: (standardId) => {
                return get().sessions.filter(s => s.standardId === standardId);
            },

            getLatestSession: () => {
                const sessions = get().sessions;
                return sessions.length > 0 ? sessions[0] : null;
            }
        }),
        {
            name: 'itm-session-history',
        }
    )
);
