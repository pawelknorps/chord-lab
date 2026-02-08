import { useMemo } from 'react';

// Structure the data (Shared Interface)
export interface MidiFile {
    name: string;
    path: string;
    // url is now loaded on demand
    loadUrl: () => Promise<string>;
    category: string; // Major, Minor, Modal
    style?: string;   // pop, soul, etc.
    key?: string;     // C, Db, D...
    progression?: string; // I IV V
    mood?: string;    // Joyful, Triumphant, etc.
}

// Import all midi files locally (Lazy Load)
const midiModules = import.meta.glob('../midi_progressions/**/*.mid', {
    eager: false, // Don't load everything on startup
    query: '?url',
    import: 'default'
});

export function useMidiLibrary() {
    // Parse paths into metadata
    const files: MidiFile[] = useMemo(() => {
        // midiModules keys are paths
        return Object.keys(midiModules).map((path) => {
            const parts = path.split('/');
            const filename = parts[parts.length - 1];
            const category = parts[parts.length - 2];

            const nameParts = filename.replace('.mid', '').split(' - ');
            let key = nameParts[0];
            // Fix sharp keys (e.g. Cs -> C#)
            key = key.replace('s', '#');

            const progression = nameParts[1];
            const mood = nameParts.length > 2 ? nameParts[2] : '';

            let finalCategory = category;
            let style = 'Classic';

            if (category.includes('style')) {
                style = category.replace(' style', '');
                finalCategory = parts[parts.length - 3] || 'Unknown';
            }

            return {
                name: filename,
                path,
                loadUrl: async () => {
                    const module = await midiModules[path]();
                    return module as string;
                },
                category: finalCategory,
                style,
                key,
                progression,
                mood
            };
        });
    }, []);

    const categories = useMemo(() => Array.from(new Set(files.map(f => f.category))), [files]);
    const styles = useMemo(() => Array.from(new Set(files.map(f => f.style))), [files]);
    const keys = useMemo(() => Array.from(new Set(files.filter(f => f.key).map(f => f.key!))).sort(), [files]);

    return {
        files,
        categories,
        styles,
        keys
    };
}
