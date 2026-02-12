export interface InstrumentProfile {
    id: string;
    name: string;
    hysteresisCents: number;
    stabilityThreshold: number; // in frames
    minHz: number;
    maxHz: number;
    description: string;
}

export const INSTRUMENT_PROFILES: Record<string, InstrumentProfile> = {
    vocals: {
        id: 'vocals',
        name: 'Vocals',
        hysteresisCents: 48, // 45-50 range
        stabilityThreshold: 5,
        minHz: 80,
        maxHz: 1200,
        description: 'Filters pitch scoops and heavy vibrato.',
    },
    trumpet: {
        id: 'trumpet',
        name: 'Trumpet',
        hysteresisCents: 28, // 25-30 range
        stabilityThreshold: 2,
        minHz: 160,
        maxHz: 1200,
        description: 'Fast response for rapid valve changes and articulation.',
    },
    guitar: {
        id: 'guitar',
        name: 'Guitar',
        hysteresisCents: 38, // 35-40 range
        stabilityThreshold: 3,
        minHz: 80,
        maxHz: 1000,
        description: 'Ignores initial sharp pluck/spike.',
    },
    auto: {
        id: 'auto',
        name: 'Auto (Jazz Default)',
        hysteresisCents: 35,
        stabilityThreshold: 3,
        minHz: 20,
        maxHz: 4000,
        description: 'Balanced profile for general jazz use.',
    },
};
