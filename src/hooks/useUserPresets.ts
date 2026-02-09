import { useState, useEffect } from 'react';
import type { Progression } from '../core/theory';

const STORAGE_KEY = 'chord_lab_user_presets';

export function useUserPresets() {
    const [userPresets, setUserPresets] = useState<Progression[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUserPresets(parsed);
            } catch (e) {
                console.error('Failed to parse user presets', e);
            }
        }
    }, []);

    const savePreset = (preset: Progression) => {
        setUserPresets(prev => {
            const updated = [...prev, preset];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const deletePreset = (index: number) => {
        setUserPresets(prev => {
            const updated = prev.filter((_, i) => i !== index);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return { userPresets, savePreset, deletePreset };
}
