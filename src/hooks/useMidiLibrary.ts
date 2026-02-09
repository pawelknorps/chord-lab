
import { useState, useEffect, useMemo } from 'react';

// Structure the data (Shared Interface)
export interface MidiFile {
    name: string;
    path: string;
    loadUrl: () => Promise<string>;
    category: string; // Major, Minor, Modal
    style?: string;   // pop, soul, etc.
    key?: string;     // C, Db, D...
    progression?: string; // I IV V
    mood?: string;    // Joyful, Triumphant, etc.
}

export interface GroupedProgression {
    id: string;
    progression: string;
    category: string;
    style: string;
    mood: string;
    availableKeys: string[];
    keyMap: Record<string, MidiFile>;
}

// Global cache
let globalFilesCache: MidiFile[] | null = null;
let fetchPromise: Promise<MidiFile[]> | null = null;

export function useMidiLibrary() {
    const [files, setFiles] = useState<MidiFile[]>(globalFilesCache || []);
    const [loading, setLoading] = useState(!globalFilesCache);

    useEffect(() => {
        if (globalFilesCache) {
            setFiles(globalFilesCache);
            setLoading(false);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = fetch('/midi_index.json')
                .then(res => res.json())
                .then((data: any[]) => {
                    const processed = data.map((item: any) => ({
                        ...item,
                        loadUrl: async () => item.path
                    }));
                    globalFilesCache = processed;
                    return processed;
                })
                .catch(err => {
                    console.error("Failed to load MIDI index", err);
                    return [];
                });
        }

        fetchPromise.then(loadedFiles => {
            setFiles(loadedFiles);
            setLoading(false);
        });
    }, []);

    const groupedProgressions = useMemo(() => {
        if (!files.length) return [];

        const groups: Record<string, GroupedProgression> = {};

        files.forEach(file => {
            const id = `${file.category}-${file.style}-${file.progression}-${file.mood}`;
            if (!groups[id]) {
                groups[id] = {
                    id,
                    progression: file.progression || 'Unknown',
                    category: file.category,
                    style: file.style || 'Classic',
                    mood: file.mood || '',
                    availableKeys: [],
                    keyMap: {}
                };
            }
            if (file.key) {
                groups[id].availableKeys.push(file.key);
                groups[id].keyMap[file.key] = file;
            }
        });

        // Sort keys for each group
        Object.values(groups).forEach(group => {
            group.availableKeys.sort();
        });

        return Object.values(groups);
    }, [files]);

    const categories = useMemo(() => Array.from(new Set(files.map(f => f.category))), [files]);
    const styles = useMemo(() => Array.from(new Set(files.map(f => f.style))), [files]);
    const keys = useMemo(() => Array.from(new Set(files.filter(f => f.key).map(f => f.key!))).sort(), [files]);

    return {
        files,
        groupedProgressions,
        categories,
        styles,
        keys,
        loading
    };
}

