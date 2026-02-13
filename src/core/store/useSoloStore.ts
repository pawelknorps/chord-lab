import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayedNote } from '../../modules/ITM/types/PerformanceSegment';

export interface RecordedSolo {
    id: string;
    standardId: string;
    timestamp: number;
    notes: PlayedNote[];
    bpm: number;
    musicalizedText?: string; // AI-refined transcription
}

interface SoloState {
    solos: RecordedSolo[];
    addSolo: (solo: RecordedSolo) => void;
    updateSolo: (id: string, updates: Partial<RecordedSolo>) => void;
    deleteSolo: (id: string) => void;
    getSolosByStandard: (standardId: string) => RecordedSolo[];
}

export const useSoloStore = create<SoloState>()(
    persist(
        (set, get) => ({
            solos: [],

            addSolo: (solo) => {
                set((state) => ({
                    solos: [solo, ...state.solos].slice(0, 20) // Keep last 20 solos
                }));

                // Auto-sync solo to the cloud (private by default)
                import('../services/itmSyncService').then(({ ItmSyncService }) => {
                    ItmSyncService.syncSolo(solo).catch(console.error);
                });
            },

            updateSolo: (id, updates) => set((state) => ({
                solos: state.solos.map(s => s.id === id ? { ...s, ...updates } : s)
            })),

            deleteSolo: (id) => set((state) => ({
                solos: state.solos.filter(s => s.id !== id)
            })),

            getSolosByStandard: (standardId) => {
                return get().solos.filter(s => s.standardId === standardId);
            }
        }),
        {
            name: 'itm-solo-vault',
        }
    )
);
