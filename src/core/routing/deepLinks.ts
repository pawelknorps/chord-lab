// Deep linking utilities for cross-module navigation

export interface ProgressionData {
    chords: string[];
    key?: string;
    mode?: string;
}

export interface ChordData {
    root: string;
    quality: string;
    notes?: number[];
}

export function encodeProgression(progression: ProgressionData): string {
    const params = new URLSearchParams();
    params.set('chords', progression.chords.join(','));
    if (progression.key) params.set('key', progression.key);
    if (progression.mode) params.set('mode', progression.mode);
    return params.toString();
}

export function decodeProgression(searchParams: URLSearchParams): ProgressionData | null {
    const chords = searchParams.get('chords');
    if (!chords) return null;

    return {
        chords: chords.split(',').filter(Boolean),
        key: searchParams.get('key') || undefined,
        mode: searchParams.get('mode') || undefined,
    };
}

export function encodeChord(chord: ChordData): string {
    const params = new URLSearchParams();
    params.set('root', chord.root);
    params.set('quality', chord.quality);
    if (chord.notes) params.set('notes', chord.notes.join(','));
    return params.toString();
}

export function decodeChord(searchParams: URLSearchParams): ChordData | null {
    const root = searchParams.get('root');
    const quality = searchParams.get('quality');
    if (!root || !quality) return null;

    const notesStr = searchParams.get('notes');
    const notes = notesStr ? notesStr.split(',').map(Number) : undefined;

    return { root, quality, notes };
}

export function createDeepLink(
    module: string,
    data: ProgressionData | ChordData
): string {
    const isProgression = 'chords' in data;
    const params = isProgression ? encodeProgression(data) : encodeChord(data);
    return `/${module}?${params}`;
}
