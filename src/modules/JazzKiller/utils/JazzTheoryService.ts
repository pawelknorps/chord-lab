import { parseChord, noteNameToMidi, CHORD_INTERVALS } from '../../../core/theory/index';

export type JazzVoicingType = 'rootless' | 'drop2' | 'drop3' | 'drop2-4' | 'quartal' | 'close' | 'spread' | 'cluster';

interface VoicingCandidate {
    notes: number[];
    type: JazzVoicingType;
}

/**
 * Jazz Counterpoint Engine & Voicing Service
 * Unified with the Core app theory (Chord Lab).
 */
export class JazzTheoryService {
    private static voicingHistory: string[] = [];
    private static MAX_HISTORY = 12;
    private static lastCentroidMovement: number = 0;

    static getVoicingIntensity(type: JazzVoicingType): number {
        const intensities: Record<JazzVoicingType, number> = {
            'cluster': 0.1, 'rootless': 0.3, 'close': 0.5, 'drop2': 0.6, 'drop3': 0.7, 'drop2-4': 0.8, 'quartal': 0.85, 'spread': 1.0
        };
        return intensities[type] || 0.5;
    }

    static getNextLogicalVoicingType(_current: JazzVoicingType, targetIntensity: number, tension: number = 0.5, modern: boolean = false): JazzVoicingType {
        const types: JazzVoicingType[] = modern
            ? ['quartal', 'drop3', 'spread', 'cluster']
            : ['rootless', 'drop2', 'close'];
        const spicyTypes: JazzVoicingType[] = modern ? ['cluster', 'quartal'] : ['close'];
        if (tension > 0.88 && Math.random() < 0.6) return spicyTypes[Math.floor(Math.random() * spicyTypes.length)];
        return types.reduce((prev, curr) => Math.abs(this.getVoicingIntensity(curr) - targetIntensity) < Math.abs(this.getVoicingIntensity(prev) - targetIntensity) ? curr : prev);
    }

    static getPianoVoicing(
        chordSymbol: string,
        preferredType: JazzVoicingType = 'rootless',
        targetOctave: number = 3,
        lastVoicing?: number[],
        tension: number = 0.5,
        modern: boolean = false,
        bassNote?: number
    ): number[] {
        const { root, quality } = parseChord(chordSymbol);
        const rootMidi = noteNameToMidi(root + "0") % 12;

        // UNIFIED SOURCE OF TRUTH: Use CHORD_INTERVALS from core
        let baseIntervals = [...(CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'])];

        // Style Check: If it's a basic triad or basic 7th but we're in a high-tension/modern jazz context,
        // we "season" the chord with 9ths/11ths/13ths automatically.
        const shouldSeason = modern || tension > 0.6;
        if (shouldSeason && baseIntervals.length <= 4) {
            const isMajor = baseIntervals.includes(4) && !baseIntervals.includes(10);
            const isMinor = baseIntervals.includes(3) && !baseIntervals.includes(6);
            const isDom = baseIntervals.includes(4) && baseIntervals.includes(10);

            if (isMajor && !baseIntervals.includes(14)) baseIntervals.push(14); // Add 9
            if (isMinor && !baseIntervals.includes(14)) baseIntervals.push(14); // Add 9
            if (isDom) {
                if (!baseIntervals.includes(14)) baseIntervals.push(14); // Add 9
                if (!baseIntervals.includes(21)) baseIntervals.push(21); // Add 13
            }
        }

        const types: JazzVoicingType[] = ['rootless', 'drop2', 'drop3', 'drop2-4', 'close', 'spread'];
        if (modern || tension > 0.7) types.push('quartal', 'cluster');

        let candidates: VoicingCandidate[] = [];
        types.forEach(t => {
            const variations = (t === 'close' || t === 'drop2' || t === 'drop3' || t === 'rootless') ? 4 : 2;
            for (let v = 0; v < variations; v++) {
                candidates.push({
                    notes: this.generateBaseVoicing(rootMidi, baseIntervals, t, targetOctave, v),
                    type: t
                });
            }
        });

        let best = (lastVoicing && lastVoicing.length > 0)
            ? this.selectBestVoicing(candidates, lastVoicing, preferredType, bassNote)
            : this.enforceMidrange(candidates[0].notes);

        const newCentroid = best.reduce((a, b) => a + b, 0) / best.length;
        if (lastVoicing) {
            const oldCentroid = lastVoicing.reduce((a, b) => a + b, 0) / lastVoicing.length;
            this.lastCentroidMovement = newCentroid - oldCentroid;
        }

        const voicingStr = best.sort((a, b) => a - b).join(',');
        this.voicingHistory.push(voicingStr);
        if (this.voicingHistory.length > this.MAX_HISTORY) this.voicingHistory.shift();

        return best;
    }

    private static selectBestVoicing(candidates: VoicingCandidate[], last: number[], preferredType: JazzVoicingType, bassNote?: number): number[] {
        let bestVoicing = candidates[0].notes;
        let minScore = Infinity;

        const lastTop = Math.max(...last);
        const lastCentroid = last.reduce((a, b) => a + b, 0) / last.length;

        candidates.forEach(candidate => {
            const notes = candidate.notes;
            const candidateCentroid = notes.reduce((a, b) => a + b, 0) / notes.length;
            const octShift = Math.round((lastCentroid - candidateCentroid) / 12) * 12;
            const shifted = notes.map(n => n + octShift).sort((a, b) => a - b);
            const currentCentroid = shifted.reduce((a, b) => a + b, 0) / shifted.length;
            const currentMovement = currentCentroid - lastCentroid;

            let travel = 0;
            const voices = Math.min(shifted.length, last.length);
            for (let i = 0; i < voices; i++) {
                travel += Math.pow(Math.abs(shifted[i] - (last[i] || lastCentroid)), 1.6);
            }

            const currentTop = Math.max(...shifted);
            const melodyDiff = Math.abs(currentTop - lastTop);
            const melodyPenalty = melodyDiff > 4 ? melodyDiff * 6 : melodyDiff * 2;

            let counterpointBonus = 0;
            if (Math.sign(currentMovement) === -Math.sign(this.lastCentroidMovement) && Math.abs(currentMovement) > 0.5) {
                counterpointBonus -= 4;
            }
            if (bassNote) {
                const bassRelative = bassNote - 36;
                const pianoRelative = currentCentroid - 54;
                if (Math.sign(bassRelative) === Math.sign(pianoRelative)) counterpointBonus += 3;
                else counterpointBonus -= 3;
            }

            let parallelPenalty = 0;
            if (last.length >= 2 && shifted.length >= 2) {
                const lastInterval = last[last.length - 1] - last[last.length - 2];
                const currentInterval = shifted[shifted.length - 1] - shifted[shifted.length - 2];
                if (lastInterval === currentInterval && Math.abs(currentMovement) > 0.5) {
                    if (lastInterval === 7 || lastInterval === 12) parallelPenalty += 5;
                }
            }

            const rangePenalty = (currentCentroid > 64 ? (currentCentroid - 64) * 15 : 0) + (currentCentroid < 42 ? (42 - currentCentroid) * 10 : 0);
            const typeBonus = candidate.type === preferredType ? -10 : 0;

            const totalScore = travel + melodyPenalty + rangePenalty + counterpointBonus + parallelPenalty + typeBonus;

            if (totalScore < minScore) {
                minScore = totalScore;
                bestVoicing = shifted;
            }
        });
        return bestVoicing;
    }

    private static generateBaseVoicing(rootMidi: number, intervals: number[], type: JazzVoicingType, octave: number, variation: number): number[] {
        const base = (octave + 1) * 12 + rootMidi;

        // Shell selection: prioritize color tones (3, 7, extensions)
        let shell = [...intervals];

        switch (type) {
            case 'rootless':
                // Classic A/B type rootless voicings logic
                // Filter to get color tones (exclude root and potentially 5th)
                const colors = shell.filter(i => i % 12 !== 0 && (i % 12 !== 7 || shell.length < 4));
                // Sort by pitch class to easily creating inversions
                const sortedColors = colors.sort((a, b) => a - b);
                return this.getInversion(sortedColors.slice(0, 4), variation).map(i => base + i);

            case 'close':
                return this.getInversion(shell.slice(0, 4), variation).map(i => base + i);

            case 'drop2':
                const d2 = this.getInversion(shell.slice(0, 4), variation);
                if (d2.length >= 2) d2[d2.length - 2] -= 12;
                return d2.map(i => base + i);

            case 'drop3':
                const d3 = this.getInversion(shell.slice(0, 4), variation);
                if (d3.length >= 3) d3[d3.length - 3] -= 12;
                return d3.map(i => base + i);

            case 'drop2-4':
                const d24 = this.getInversion(shell.slice(0, 4), variation);
                if (d24.length >= 4) { d24[d24.length - 2] -= 12; d24[d24.length - 4] -= 12; }
                return d24.map(i => base + i);

            case 'quartal':
                return [0, 5, 10, 15, 20].filter(i => i % 12 !== 0).map(i => base + i);

            case 'cluster':
                return [0, 2, 4, 5, 7].slice(0, 4).map(i => base + i + variation);

            case 'spread':
                const s = [...shell].sort((a, b) => a - b);
                if (s.length < 3) return s.map(i => base + i);
                return [s[0], s[1] + 12, s[s.length - 1] + 7].map(i => base + i - 12);

            default:
                return this.getInversion(shell, variation).map(i => base + i);
        }
    }

    private static getInversion(intervals: number[], index: number): number[] {
        if (intervals.length === 0) return [];
        const res = [...intervals].sort((a, b) => a - b);
        for (let i = 0; i < index % res.length; i++) {
            const first = res.shift()!;
            res.push(first + 12);
        }
        return res.sort((a, b) => a - b);
    }

    private static enforceMidrange(notes: number[]): number[] {
        if (notes.length === 0) return notes;
        const centroid = notes.reduce((a, b) => a + b, 0) / notes.length;
        if (centroid < 44) return notes.map(n => n + 12);
        if (centroid > 64) return notes.map(n => n - 12);
        return notes;
    }

    static getNextWalkingBassNote(currentBeat: number, chord: string, nextChord: string | null, lastNote: number, tension: number = 0.5): number {
        const { root, quality } = parseChord(chord);
        const rootMidi = noteNameToMidi(root + "1");

        // Simplified category check using core intervals
        const intervals = CHORD_INTERVALS[quality] || [0, 4, 7];
        const isMinor = intervals.includes(3);
        const isDim = intervals.includes(3) && intervals.includes(6);

        const targetOctaveShift = tension > 0.8 ? 12 : 0;

        if (currentBeat === 0) return this.getClosestNote(rootMidi + targetOctaveShift, lastNote);

        if (currentBeat === 3 && nextChord) {
            const { root: nextRootName } = parseChord(nextChord);
            const nextRoot = noteNameToMidi(nextRootName + "1");
            return Math.random() < 0.6 ? (Math.random() > 0.5 ? nextRoot + 1 + targetOctaveShift : nextRoot - 1 + targetOctaveShift) : nextRoot + 7 + targetOctaveShift;
        }

        if (currentBeat === 2) {
            let iv = [7, 4];
            if (isMinor) iv[1] = 3;
            if (isDim) { iv[0] = 6; iv[1] = 3; }
            return this.getClosestNote(rootMidi + (Math.random() > 0.3 ? iv[0] : iv[1]) + targetOctaveShift, lastNote);
        }

        const scale = [0, 2, 4, 5, 7, 9, 10];
        const scaleNotes = scale.map(s => rootMidi + s + targetOctaveShift);
        const connector = scaleNotes.filter(n => Math.abs(n - lastNote) <= 5 && n !== lastNote);
        return connector.length > 0 ? connector[Math.floor(Math.random() * connector.length)] : this.getClosestNote(rootMidi + 4 + targetOctaveShift, lastNote);
    }

    private static getClosestNote(target: number, current: number): number {
        const octaveDiff = Math.round((current - target) / 12);
        let result = target + (octaveDiff * 12);
        if (result < 28) result += 12;
        if (result > 64) result -= 12;
        return result;
    }
}
