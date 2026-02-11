export interface InstrumentPreset {
    id: string;
    name: string;
    minHz: number;
    maxHz: number;
}

export const INSTRUMENT_PRESETS: Record<string, InstrumentPreset> = {
    auto: { id: 'auto', name: 'Auto (Wide)', minHz: 20, maxHz: 4000 },
    bass: { id: 'bass', name: 'Double Bass', minHz: 30, maxHz: 400 },
    guitar: { id: 'guitar', name: 'Guitar', minHz: 80, maxHz: 1200 },
    trumpet: { id: 'trumpet', name: 'Trumpet', minHz: 160, maxHz: 1200 },
    saxophone: { id: 'saxophone', name: 'Saxophone', minHz: 100, maxHz: 1100 },
    voice: { id: 'voice', name: 'Voice', minHz: 80, maxHz: 1200 },
};

/**
 * Clamps a frequency according to the selected instrument preset.
 * Returns 0 if frequency is out of range (interpreted as no pitch).
 */
export function clampFrequencyByPreset(frequency: number, presetId: string = 'auto'): number {
    const preset = INSTRUMENT_PRESETS[presetId] || INSTRUMENT_PRESETS.auto;
    if (frequency < preset.minHz || frequency > preset.maxHz) {
        return 0;
    }
    return frequency;
}
