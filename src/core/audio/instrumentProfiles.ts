/**
 * Instrument Parameter Map for SwiftF0.
 * Manual dropdown selection constrains fmin/fmax and confidence threshold per instrument,
 * preventing octave doubling/halving and reducing false triggers (0ms classifier overhead).
 */
export interface InstrumentProfile {
    id: string;
    name: string;
    /** fmin (Hz) — lower bound of pitch search; prevents octave halving. */
    minHz: number;
    /** fmax (Hz) — upper bound; prevents octave doubling (e.g. guitar 2nd harmonic). */
    maxHz: number;
    /** Confidence threshold; higher = stricter (voice/sibilance), lower = more detection (sax breath). */
    confidenceThreshold: number;
    /** Hysteresis (cents): only change note if new pitch > this away (e.g. 60 = sticky note, no C/C# flicker). */
    hysteresisCents: number;
    /** Consecutive stable frames before updating note (~32ms per frame at 8ms hop; higher = more confirmation). */
    stabilityThreshold: number;
    /** Running median window size; larger = smoother confirmed pitch, more latency to change note. */
     windowSize?: number;
    description: string;
    /** Target RMS for input normalization; higher = more aggressive normalization. */
    targetRms?: number;
    /** Min RMS to apply gain; prevents amplifying silence. */
    minRmsForGain?: number;
    /** Max gain for normalization; prevents excessive amplification of quiet sounds. */
    maxGain?: number;
}

export const INSTRUMENT_PROFILES: Record<string, InstrumentProfile> = {
    general: {
        id: 'general',
        name: 'General / Full Range',
        minHz: 46.875,
        maxHz: 2093.75,
        confidenceThreshold: 0.62,
        hysteresisCents: 55,
        stabilityThreshold: 5,
        windowSize: 7,
        description: 'Wide range; 7-frame median + 5-frame confirmation for stable pitch.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
    voice: {
        id: 'voice',
        name: 'Voice (General)',
        minHz: 75,
        maxHz: 1200,
        confidenceThreshold: 0.72,
        hysteresisCents: 60,
        stabilityThreshold: 3,
        windowSize: 7,
        description: 'Sticky note (~60¢) + 3-frame confirmation; filters breath/sibilance.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
    acousticGuitar: {
        id: 'acousticGuitar',
        name: 'Acoustic Guitar',
        minHz: 82,
        maxHz: 1050,
        confidenceThreshold: 0.62,
        hysteresisCents: 25,
        stabilityThreshold: 3,
        windowSize: 5,
        description: 'Quiet plucks; 5-frame median + 3-frame confirmation.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
    electricGuitar: {
        id: 'electricGuitar',
        name: 'Electric Guitar',
        minHz: 82,
        maxHz: 1400,
        confidenceThreshold: 0.58,
        hysteresisCents: 25,
        stabilityThreshold: 3,
        windowSize: 5,
        description: 'Quiet and fast runs; 5-frame median + 3-frame confirmation.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
    saxophone: {
        id: 'saxophone',
        name: 'Saxophone',
        minHz: 100,
        maxHz: 1400,
        confidenceThreshold: 0.65,
        hysteresisCents: 40,
        stabilityThreshold: 5,
        windowSize: 7,
        description: 'Lower threshold for breath; 5-frame confirmation.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
    trumpet: {
        id: 'trumpet',
        name: 'Trumpet',
        minHz: 160,
        maxHz: 1200,
        confidenceThreshold: 0.72,
        hysteresisCents: 35,
        stabilityThreshold: 4,
        windowSize: 6,
        description: 'Valve changes; 6-frame median + 4-frame confirmation.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
    bassGuitar: {
        id: 'bassGuitar',
        name: 'Bass Guitar',
        minHz: 41,
        maxHz: 350,
        confidenceThreshold: 0.65,
        hysteresisCents: 30,
        stabilityThreshold: 4,
        windowSize: 6,
        description: 'Low range; 6-frame median + 4-frame confirmation.',
        targetRms: 0.08,
        minRmsForGain: 0.003,
        maxGain: 6,
    },
};
