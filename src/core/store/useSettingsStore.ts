import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InstrumentType = 'piano' | 'synth' | 'guitar' | 'epiano';

interface SettingsState {
    masterVolume: number; // 0 to 1
    instrument: InstrumentType;
    showPianoLabels: boolean;
    theme: 'dark' | 'light' | 'amoled';
    userName: string;
    userAvatar: string;
}

interface SettingsActions {
    setMasterVolume: (volume: number) => void;
    setInstrument: (instrument: InstrumentType) => void;
    setPianoLabels: (show: boolean) => void;
    setTheme: (theme: 'dark' | 'light' | 'amoled') => void;
    setUserName: (name: string) => void;
    setUserAvatar: (avatar: string) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
    persist(
        (set) => ({
            masterVolume: 0.8,
            instrument: 'piano',
            showPianoLabels: true,
            theme: 'dark',
            userName: 'Jazz Apprentice',
            userAvatar: '🎹',

            setMasterVolume: (masterVolume) => set({ masterVolume }),
            setInstrument: (instrument) => set({ instrument }),
            setPianoLabels: (showPianoLabels) => set({ showPianoLabels }),
            setTheme: (theme) => set({ theme }),
            setUserName: (userName) => set({ userName }),
            setUserAvatar: (userAvatar) => set({ userAvatar }),
        }),
        {
            name: 'chordlab-settings',
        }
    )
);
