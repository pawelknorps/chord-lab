import { recognizeChordFromSymbol, noteNameToMidi, CHORD_INTERVALS, getChordDna, getChordToneLabel } from '../../../core/theory/index';
import { parseChord } from '../../../core/theory/parseChord';

/** Scale degrees in semitones from root for chord-scale (step scale motion). */
const CHORD_SCALE_DEGREES: Record<string, number[]> = {
  Ionian: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  DimScale: [0, 2, 3, 5, 6, 8, 9],
  AugScale: [0, 2, 4, 6, 8, 10],
};

export type JazzVoicingType = 'rootless' | 'drop2' | 'drop3' | 'drop2-4' | 'quartal' | 'close' | 'spread' | 'cluster';

interface VoicingCandidate {
    notes: number[];
    type: JazzVoicingType;
}

/**
 * Jazz Counterpoint Engine & Voicing Service
 * Unified with the Core app theory (Chord Lab).
 * Uses core theory recognizeChordFromSymbol for iReal-style symbols → canonical quality (shell + extensions).
 *
 * Universal voicing rule (counterpoint theory): we need 2 chord tones — the guide tones (3rd and 7th,
 * already defined in GuideToneCalculator and shown in the lead sheet) — plus extensions or other
 * chord tones. Hence voicings must have at least 3 notes (2 guide tones + 1 extension/other), and
 * preferably 4 or more for fuller counterpoint.
 */
const MIN_VOICING_NOTES = 3;
const PREFERRED_VOICING_NOTES = 4;

/** Priority order for voicing: guide tones (3rd, 7th) first, then 5th, root, then written extensions (9, 11, 13, alt). */
const VOICING_PRIORITY: number[] = [
  3, 4, 10, 11,  // 3rd, 7th (guide tones)
  6, 7, 8,       // 5th (b5, 5, #5)
  0,             // root
  2, 14,         // b9, 9
  5, 6,          // 11, #11 (6 already above)
  8, 21,         // b13, 13 (8 already above)
];

/** Order chord intervals for voicing: chord tones first (3, 7, 5, 1), then written extensions (9, 11, 13). */
function orderIntervalsForVoicing(intervals: number[]): number[] {
  const byPc = (i: number) => i % 12;
  const seen = new Set<number>();
  const out: number[] = [];
  for (const p of VOICING_PRIORITY) {
    const withPc = intervals.filter((i) => byPc(i) === p && !seen.has(byPc(i)));
    if (withPc.length === 0) continue;
    seen.add(p);
    const preferred = withPc.find((i) => i >= 12 && i <= 24) ?? withPc[0];
    out.push(preferred);
  }
  for (const i of intervals) {
    if (!seen.has(byPc(i))) {
      seen.add(byPc(i));
      out.push(i);
    }
  }
  return out.sort((a, b) => (a % 12) - (b % 12));
}

/** Minimum semitone span between consecutive (sorted) notes. Small = cluster-like. */
function minAdjacentSpan(notes: number[]): number {
  if (notes.length < 2) return 12;
  const sorted = [...notes].sort((a, b) => a - b);
  let min = 12;
  for (let i = 1; i < sorted.length; i++) {
    const span = sorted[i] - sorted[i - 1];
    if (span < min) min = span;
  }
  return min;
}

export class JazzTheoryService {
    private static voicingHistory: string[] = [];
    private static MAX_HISTORY = 12;
    private static lastCentroidMovement: number = 0;

    /** Normalize chord symbol: strip iReal alternates/parentheses. Kept for display or when only cleaning is needed. */
    static normalizeChordSymbolForTheory(symbol: string): string {
        if (!symbol || typeof symbol !== 'string') return '';
        return symbol.replace(/\(.*?\)/g, '').replace(/[\[\]]/g, '').trim();
    }

    /**
     * Main chord only for playback/scoring. iReal uses (optional) for alternatives — they are not played.
     * E.g. "E07(Gm7b5)" → "E07", "(C7b9)" → "".
     */
    static getMainChord(symbol: string): string {
        if (!symbol || typeof symbol !== 'string') return '';
        const withoutParens = symbol.replace(/\([^)]*\)/g, '').trim();
        return withoutParens.replace(/,+\s*$|^\s*,+/g, '').trim();
    }

    /**
     * Parse iReal chord with optional alternates in parentheses. For display: main chord + optionals shown smaller above.
     * E.g. "E07(Gm7b5)" → { main: "E07", optionals: ["Gm7b5"] }; "C6(Cmaj7),(Dm7)" → { main: "C6", optionals: ["Cmaj7", "Dm7"] }.
     */
    static parseChordWithOptional(symbol: string): { main: string; optionals: string[] } {
        if (!symbol || typeof symbol !== 'string') return { main: '', optionals: [] };
        const main = JazzTheoryService.getMainChord(symbol);
        const optionals = [...symbol.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
        return { main, optionals };
    }

    static getVoicingIntensity(type: JazzVoicingType): number {
        const intensities: Record<JazzVoicingType, number> = {
            'cluster': 0.1, 'rootless': 0.3, 'close': 0.5, 'drop2': 0.6, 'drop3': 0.7, 'drop2-4': 0.8, 'quartal': 0.85, 'spread': 1.0
        };
        return intensities[type] || 0.5;
    }

    static getNextLogicalVoicingType(_current: JazzVoicingType, targetIntensity: number, tension: number = 0.5, modern: boolean = false): JazzVoicingType {
        const types: JazzVoicingType[] = modern
            ? ['quartal', 'drop3', 'spread']
            : ['rootless', 'drop2', 'close'];
        const spicyTypes: JazzVoicingType[] = modern ? ['quartal', 'spread'] : ['close'];
        if (tension > 0.88 && Math.random() < 0.5) return spicyTypes[Math.floor(Math.random() * spicyTypes.length)];
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
        if (!chordSymbol?.trim()) return [];

        const cleaned = this.normalizeChordSymbolForTheory(chordSymbol);
        const dna = getChordDna(cleaned);
        let rootMidi: number;
        let baseIntervals: number[];

        if (dna && dna.intervals.length > 0) {
            rootMidi = noteNameToMidi(dna.root + "0") % 12;
            baseIntervals = [...dna.intervals];
        } else {
            const { root, quality } = recognizeChordFromSymbol(cleaned);
            rootMidi = noteNameToMidi(root + "0") % 12;
            baseIntervals = [...(CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'])];
        }

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
        if (modern || tension > 0.75) types.push('quartal');
        if (modern && tension > 0.88) types.push('cluster');

        let candidates: VoicingCandidate[] = [];
        types.forEach(t => {
            const variations = (t === 'close' || t === 'drop2' || t === 'drop3' || t === 'rootless') ? 4 : 2;
            for (let v = 0; v < variations; v++) {
                const notes = this.enforceMidrange(this.generateBaseVoicing(rootMidi, baseIntervals, t, targetOctave, v));
                candidates.push({ notes, type: t });
            }
        });

        const meetingMinimum = candidates.filter(c => c.notes.length >= MIN_VOICING_NOTES);
        const candidatesToUse = meetingMinimum.length > 0 ? meetingMinimum : candidates;

        let best: number[];
        if (candidatesToUse.length === 0) {
            best = [];
        } else if (lastVoicing && lastVoicing.length > 0) {
            best = this.selectBestVoicing(candidatesToUse, lastVoicing, preferredType, rootMidi, bassNote);
        } else {
            const preferred = candidatesToUse.filter(c => c.notes.length >= PREFERRED_VOICING_NOTES);
            const pick = (preferred.length > 0 ? preferred : candidatesToUse)[0];
            best = pick.notes;
        }

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

    private static selectBestVoicing(candidates: VoicingCandidate[], last: number[], preferredType: JazzVoicingType, rootPc: number, bassNote?: number): number[] {
        let bestVoicing = candidates[0].notes;
        let minScore = Infinity;

        const lastTop = Math.max(...last);
        const lastCentroid = last.reduce((a, b) => a + b, 0) / last.length;
        const thirdPCs = [(rootPc + 3) % 12, (rootPc + 4) % 12];
        const seventhPCs = [(rootPc + 10) % 12, (rootPc + 11) % 12];

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
                counterpointBonus -= 6;
            }
            if (bassNote) {
                const bassRelative = bassNote - 36;
                const pianoRelative = currentCentroid - 54;
                if (Math.sign(bassRelative) === Math.sign(pianoRelative)) counterpointBonus += 3;
                else counterpointBonus -= 3;
            }

            let parallelPenalty = 0;
            if (voices >= 2) {
                let sameDirection = 0;
                for (let i = 0; i < voices; i++) {
                    const move = (shifted[i] ?? currentCentroid) - (last[i] ?? lastCentroid);
                    if (i > 0 && Math.sign(move) === Math.sign((shifted[i - 1] ?? currentCentroid) - (last[i - 1] ?? lastCentroid)) && Math.abs(move) > 0.5) {
                        sameDirection++;
                    }
                }
                if (sameDirection >= 2) parallelPenalty += 4;
                const lastInterval = last[last.length - 1] - last[last.length - 2];
                const currentInterval = shifted[shifted.length - 1] - shifted[shifted.length - 2];
                if (lastInterval === currentInterval && Math.abs(currentMovement) > 0.5) {
                    if (lastInterval === 7 || lastInterval === 12) parallelPenalty += 5;
                }
            }

            const rangePenalty = (currentCentroid > 64 ? (currentCentroid - 64) * 15 : 0) + (currentCentroid < 42 ? (42 - currentCentroid) * 10 : 0);
            const typeBonus = candidate.type === preferredType ? -10 : candidate.type === 'cluster' ? 14 : 0;
            const noteCountBonus = shifted.length >= PREFERRED_VOICING_NOTES ? -8 : shifted.length >= MIN_VOICING_NOTES ? 0 : 20;

            const pcs = new Set(shifted.map(n => n % 12));
            const hasGuideTones = thirdPCs.some(pc => pcs.has(pc)) && seventhPCs.some(pc => pcs.has(pc));
            const guideToneBonus = hasGuideTones ? -6 : 0;

            const span = minAdjacentSpan(shifted);
            const clusterPenalty = span < 3 ? 12 : span < 4 ? 5 : 0;

            const totalScore = travel + melodyPenalty + rangePenalty + counterpointBonus + parallelPenalty + typeBonus + noteCountBonus + guideToneBonus + clusterPenalty;

            if (totalScore < minScore) {
                minScore = totalScore;
                bestVoicing = shifted;
            }
        });
        return bestVoicing;
    }

    /** Human-readable names for voicing type + variation (same as iReal chart player uses). */
    /** True if voicing includes both guide-tone pitch classes (3rd and 7th). */
    private static hasGuideTonePCs(notes: number[], rootPc: number): boolean {
        const pcs = new Set(notes.map(n => n % 12));
        const thirdPCs = [(rootPc + 3) % 12, (rootPc + 4) % 12];
        const seventhPCs = [(rootPc + 10) % 12, (rootPc + 11) % 12];
        return thirdPCs.some(pc => pcs.has(pc)) && seventhPCs.some(pc => pcs.has(pc));
    }

    private static getVoicingOptionName(type: JazzVoicingType, variation: number): string {
        const variationLabels: Record<JazzVoicingType, string[]> = {
            'rootless': ['Rootless Type A', 'Rootless Type B', 'Rootless Type C', 'Rootless Type D'],
            'drop2': ['Drop 2 A', 'Drop 2 B', 'Drop 2 C', 'Drop 2 D'],
            'drop3': ['Drop 3 A', 'Drop 3 B', 'Drop 3 C', 'Drop 3 D'],
            'drop2-4': ['Drop 2-4 A', 'Drop 2-4 B', 'Drop 2-4 C', 'Drop 2-4 D'],
            'close': ['Close A', 'Close B', 'Close C', 'Close D'],
            'spread': ['Spread A', 'Spread B'],
            'quartal': ['Quartal A', 'Quartal B'],
            'cluster': ['Cluster A', 'Cluster B'],
        };
        const labels = variationLabels[type] ?? [type];
        return labels[variation % labels.length] ?? `${type} ${variation + 1}`;
    }

    private static getVoicingOptionDescription(type: JazzVoicingType): string {
        const desc: Record<JazzVoicingType, string> = {
            'rootless': '3-7-9-13 style; no root (bass covers it). Same as iReal chart comping.',
            'drop2': 'Drop 2: second from top dropped an octave. Warm, classic.',
            'drop3': 'Drop 3: third from top dropped. Wide, orchestral.',
            'drop2-4': 'Drop 2-4: two voices dropped. Very open.',
            'close': 'Close position. Dense, clear.',
            'spread': 'Spread voicing. Wide, modern.',
            'quartal': 'Quartal harmony. Modern jazz sound.',
            'cluster': 'Cluster. Tension, color.',
        };
        return desc[type] ?? 'Piano voicing used by the chart player.';
    }

    /**
     * Returns piano voicing options for a chord using the same engine as the iReal chart player.
     * Order is engine-defined (rootless, drop2, drop3, close, etc.). Use maxOptions to show only top choices.
     */
    static getPianoVoicingOptions(
        chordSymbol: string,
        targetOctave: number = 3,
        maxOptions?: number
    ): Array<{ id: string; name: string; notes: number[]; description: string }> {
        const cleaned = this.normalizeChordSymbolForTheory(chordSymbol);
        if (!cleaned) return [];

        const dna = getChordDna(cleaned);
        let rootMidi: number;
        let baseIntervals: number[];
        if (dna && dna.intervals.length > 0) {
            rootMidi = noteNameToMidi(dna.root + "0") % 12;
            baseIntervals = [...dna.intervals];
        } else {
            const { root, quality } = recognizeChordFromSymbol(cleaned);
            rootMidi = noteNameToMidi(root + "0") % 12;
            baseIntervals = [...(CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'])];
        }

        const types: JazzVoicingType[] = ['rootless', 'drop2', 'drop3', 'drop2-4', 'close', 'spread', 'quartal'];
        if (maxOptions == null || maxOptions >= 8) types.push('cluster');
        const result: Array<{ id: string; name: string; notes: number[]; description: string }> = [];

        types.forEach((type) => {
            const numVariations = (type === 'close' || type === 'drop2' || type === 'drop3' || type === 'rootless' || type === 'drop2-4') ? 4 : 2;
            for (let v = 0; v < numVariations; v++) {
                const notes = this.enforceMidrange(
                    this.generateBaseVoicing(rootMidi, baseIntervals, type, targetOctave, v)
                );
                if (notes.length < MIN_VOICING_NOTES) continue;
                if (!this.hasGuideTonePCs(notes, rootMidi)) continue;
                const id = `${type}-${v}`;
                const name = this.getVoicingOptionName(type, v);
                const description = this.getVoicingOptionDescription(type);
                result.push({ id, name, notes, description });
            }
        });

        result.sort((a, b) => {
            if (a.description.includes('Cluster')) return 1;
            if (b.description.includes('Cluster')) return -1;
            return b.notes.length - a.notes.length;
        });

        if (maxOptions != null && maxOptions > 0) {
            return result.slice(0, maxOptions);
        }
        return result;
    }

    private static generateBaseVoicing(rootMidi: number, intervals: number[], type: JazzVoicingType, octave: number, variation: number): number[] {
        const base = (octave + 1) * 12 + rootMidi;

        // Chord tones first (guide tones 3 & 7, then 5, root), then written extensions; cap at 5 notes for distribution.
        const ordered = orderIntervalsForVoicing(intervals);
        const shell = ordered.slice(0, 5);

        switch (type) {
            case 'rootless':
                // 3, 7, then 5 or 9, then 9 or 13 — no root
                const rootlessShell = shell.filter(i => i % 12 !== 0);
                const rootlessFour = rootlessShell.slice(0, 4);
                return this.getInversion(rootlessFour.length ? rootlessFour : shell.slice(0, 4), variation).map(i => base + i);

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
                // Rare: use chord tones only, tight spread (3rd, 5th, 7th, 9)
                const clusterShell = shell.filter(i => [0, 3, 4, 6, 7, 8, 10, 11, 14].includes(i % 12)).slice(0, 4);
                return this.getInversion(clusterShell.length ? clusterShell : shell.slice(0, 4), variation).map(i => base + i);

            case 'spread':
                const s = [...shell].sort((a, b) => (a % 12) - (b % 12));
                if (s.length < 3) return s.map(i => base + i);
                return [s[0], s[1] + 12, s[s.length - 1] + 7].map(i => base + i - 12);

            default:
                return this.getInversion(shell.slice(0, 4), variation).map(i => base + i);
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

    private static readonly BASS_RANGE_MIN = 28;
    private static readonly BASS_RANGE_MAX = 64;

    /** Avoid similar phrases: last N phrase shapes used. */
    private static bassPhraseShapeHistory: ('arpeggio_up' | 'arpeggio_down' | 'scale_run' | 'chromatic_passing' | 'mixed')[] = [];
    private static readonly BASS_PHRASE_HISTORY_LEN = 4;

    /** Longer linear directions: sustain direction across bars (up/down) before reversing. */
    private static bassDirectionMomentum: { direction: number; bars: number } = { direction: 0, bars: 0 };
    private static readonly BASS_DIRECTION_MIN_BARS = 2;

    /**
     * Target & Approach: generate a full bar (4 notes) with Beat 4 leading into the next chord.
     * Major rules: (1) Beat 4 = approach to next bar; (2) Chord-scale defines allowed scale steps;
     * (3) Linear logical continuation — the line has flow (stepwise preferred, same direction toward target).
     * Order: Beat 1 (anchor) → Beat 4 (approach) → Beat 2 (direction) → Beat 3 (pivot).
     */
    static generateTargetApproachWalkingLine(
        currentChord: string,
        nextChord: string,
        lastNote: number
    ): number[] {
        const cleaned = this.normalizeChordSymbolForTheory(currentChord);
        const nextCleaned = this.normalizeChordSymbolForTheory(nextChord);
        const dna = getChordDna(cleaned);
        const root = dna?.root ?? recognizeChordFromSymbol(cleaned).root;
        const rootMidi = noteNameToMidi(root + "1");
        const intervals = dna?.intervals ?? (CHORD_INTERVALS[recognizeChordFromSymbol(cleaned).quality] || [0, 4, 7]);
        const isMinor = intervals.includes(3);
        const isDim = intervals.includes(6);
        const isAug = intervals.includes(8);
        const fifthSemitones = isAug ? 8 : isDim ? 6 : 7;
        const thirdSemitones = isMinor || isDim ? 3 : 4;
        const seventhSemitones = cleaned.toLowerCase().includes("maj7") || cleaned.includes("^7") ? 11 : 10;
        const chordToneSemis = [0, thirdSemitones, fifthSemitones, seventhSemitones];
        const scaleDegrees = this.getScaleDegreesForChord(cleaned);

        const nextDna = getChordDna(nextCleaned);
        const nextRootName = nextDna?.root ?? recognizeChordFromSymbol(nextCleaned).root;
        const nextRootPc = noteNameToMidi(nextRootName + "1");

        const inRange = (n: number) => n >= this.BASS_RANGE_MIN && n <= this.BASS_RANGE_MAX;

        // --- BEAT 1: The Anchor (92% root, 8% 3rd) ---
        const beat1 = Math.random() < 0.92
            ? this.getClosestNote(rootMidi, lastNote, true)
            : this.getClosestNote(rootMidi + thirdSemitones, lastNote, true);

        // --- BEAT 4: The Approach (calculated before 2 & 3) ---
        const nextRootRef = this.getClosestNote(nextRootPc, beat1, false);
        const strategy = Math.random();
        let beat4Raw: number;
        if (strategy < 0.6) beat4Raw = nextRootRef - 1;
        else if (strategy < 0.9) beat4Raw = nextRootRef + 1;
        else beat4Raw = nextRootRef + 7;
        const beat4 = this.getClosestNote(beat4Raw, beat1, true);
        const beat4Constrained = this.constrainBassRange(beat4);

        const shape = this.choosePhraseShape(beat1, beat4Constrained, lastNote);
        let beat2: number;
        let beat3: number;
        if (shape === 'arpeggio_up') {
            beat2 = this.pickChordToneToward(rootMidi, [thirdSemitones, fifthSemitones], beat1, beat4Constrained, beat1);
            beat3 = this.pickChordToneToward(rootMidi, chordToneSemis, beat2, beat4Constrained, beat1, beat2);
        } else if (shape === 'arpeggio_down') {
            beat2 = this.pickChordToneToward(rootMidi, [fifthSemitones, seventhSemitones], beat1, beat4Constrained, beat1);
            beat3 = this.pickChordToneToward(rootMidi, [thirdSemitones, seventhSemitones], beat2, beat4Constrained, beat1, beat2);
        } else if (shape === 'scale_run') {
            beat2 = this.pickScaleStepToward(rootMidi, scaleDegrees, beat1, beat4Constrained, beat1);
            beat3 = this.pickScaleStepToward(rootMidi, scaleDegrees, beat2, beat4Constrained, beat1, beat2);
        } else if (shape === 'chromatic_passing') {
            beat2 = this.pickChordToneToward(rootMidi, [thirdSemitones, fifthSemitones], beat1, beat4Constrained, beat1);
            const chromBelow = this.constrainBassRange(beat4Constrained - 1);
            const chromAbove = this.constrainBassRange(beat4Constrained + 1);
            const pc = (n: number) => ((n % 12) + 12) % 12;
            const chromCandidates = [chromBelow, chromAbove].filter((n) => n !== beat2 && n !== beat4Constrained && inRange(n) && pc(n) !== pc(beat1) && pc(n) !== pc(beat2));
            beat3 = chromCandidates.length > 0 ? chromCandidates[0] : this.getBridgeNoteWithFlow(rootMidi, chordToneSemis, scaleDegrees, beat2, beat4Constrained, beat1, beat2);
        } else {
            beat2 = this.getBridgeNoteWithFlow(rootMidi, chordToneSemis, scaleDegrees, beat1, beat4Constrained, beat1);
            beat3 = this.getBridgeNoteWithFlow(rootMidi, chordToneSemis, scaleDegrees, beat2, beat4Constrained, beat1, beat2);
        }
        const beat2Constrained = this.constrainBassRange(beat2);
        const beat3Constrained = this.constrainBassRange(beat3);

        const line = [
            this.constrainBassRange(beat1),
            beat2Constrained,
            beat3Constrained,
            beat4Constrained
        ];

        this.bassPhraseShapeHistory.push(shape);
        if (this.bassPhraseShapeHistory.length > this.BASS_PHRASE_HISTORY_LEN) this.bassPhraseShapeHistory.shift();
        const barDirection = Math.sign(beat4Constrained - beat1);
        if (barDirection !== 0) {
            if (barDirection === this.bassDirectionMomentum.direction) {
                this.bassDirectionMomentum.bars += 1;
            } else {
                this.bassDirectionMomentum = { direction: barDirection, bars: 1 };
            }
        }

        return this.eliminateRepeatsForward(line);
    }

    /**
     * Phase 20: Single procedural lead-in note (chromatic or dominant approach to next chord root).
     * Use for last eighth of bar when overriding pattern bass with approach note.
     */
    static getProceduralLeadInNote(_currentChordSymbol: string, nextChordSymbol: string, lastBassMidi: number): number {
        const nextCleaned = this.normalizeChordSymbolForTheory(nextChordSymbol);
        const nextDna = getChordDna(nextCleaned);
        const nextRootName = nextDna?.root ?? recognizeChordFromSymbol(nextCleaned).root;
        const nextRootPc = noteNameToMidi(nextRootName + "1");
        const nextRootRef = this.getClosestNote(nextRootPc, lastBassMidi, false);
        const strategy = Math.random();
        let raw: number;
        if (strategy < 0.6) raw = nextRootRef - 1;
        else if (strategy < 0.9) raw = nextRootRef + 1;
        else raw = nextRootRef + 7;
        return this.constrainBassRange(this.getClosestNote(raw, lastBassMidi, true));
    }

    /**
     * Waltz (3/4) walking line: Root on 1, then two notes (e.g. 5th–5th or 3rd–5th). DMP-07.
     */
    static generateWaltzWalkingLine(
        currentChord: string,
        _nextChord: string,
        lastNote: number
    ): number[] {
        const cleaned = this.normalizeChordSymbolForTheory(currentChord);
        const dna = getChordDna(cleaned);
        const root = dna?.root ?? recognizeChordFromSymbol(cleaned).root;
        const rootMidi = noteNameToMidi(root + "1");
        const intervals = dna?.intervals ?? (CHORD_INTERVALS[recognizeChordFromSymbol(cleaned).quality] || [0, 4, 7]);
        const isMinor = intervals.includes(3);
        const isDim = intervals.includes(6);
        const isAug = intervals.includes(8);
        const fifthSemitones = isAug ? 8 : isDim ? 6 : 7;
        const thirdSemitones = isMinor || isDim ? 3 : 4;
        const chordToneSemis = [0, thirdSemitones, fifthSemitones];

        const beat1 = Math.random() < 0.92
            ? this.getClosestNote(rootMidi, lastNote, true)
            : this.getClosestNote(rootMidi + thirdSemitones, lastNote, true);
        const beat1Constrained = this.constrainBassRange(beat1);

        const beat2 = this.pickChordToneToward(rootMidi, [fifthSemitones, thirdSemitones], beat1Constrained, beat1Constrained, beat1Constrained);
        const beat3 = Math.random() < 0.7
            ? this.getClosestNote(rootMidi + fifthSemitones, beat2, true)
            : this.pickChordToneToward(rootMidi, chordToneSemis, beat2, beat2, beat1Constrained, beat2);

        return [
            beat1Constrained,
            this.constrainBassRange(beat2),
            this.constrainBassRange(beat3),
        ];
    }

    /**
     * Choose phrase shape: avoid recent shapes (no similar phrases) and prefer sustaining direction (longer linear runs).
     */
    private static choosePhraseShape(
        beat1: number,
        beat4: number,
        _lastNote: number
    ): 'arpeggio_up' | 'arpeggio_down' | 'scale_run' | 'chromatic_passing' | 'mixed' {
        const barDirection = Math.sign(beat4 - beat1);
        const wantContinue = this.bassDirectionMomentum.bars < this.BASS_DIRECTION_MIN_BARS && this.bassDirectionMomentum.direction !== 0;
        const sameDir = barDirection === this.bassDirectionMomentum.direction;

        const shapes: ('arpeggio_up' | 'arpeggio_down' | 'scale_run' | 'chromatic_passing' | 'mixed')[] = ['arpeggio_up', 'arpeggio_down', 'scale_run', 'chromatic_passing', 'mixed'];
        const recent = new Set(this.bassPhraseShapeHistory);
        const weights = shapes.map((s) => {
            let w = 1;
            if (recent.has(s)) w *= 0.25;
            if (wantContinue && sameDir) {
                if (barDirection > 0 && (s === 'arpeggio_up' || s === 'scale_run')) w *= 2.5;
                if (barDirection < 0 && (s === 'arpeggio_down' || s === 'scale_run')) w *= 2.5;
            }
            if (barDirection > 0 && s === 'arpeggio_down') w *= 0.5;
            if (barDirection < 0 && s === 'arpeggio_up') w *= 0.5;
            return w;
        });
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < shapes.length; i++) {
            r -= weights[i];
            if (r <= 0) return shapes[i];
        }
        return 'mixed';
    }

    /** Chord tone (from allowed semis) toward endNote, voice-leading friendly; avoid same pitch class as avoidSamePcAs notes. */
    private static pickChordToneToward(
        rootMidi: number,
        allowedSemis: number[],
        startNote: number,
        endNote: number,
        ...avoidSamePcAs: number[]
    ): number {
        const pc = (n: number) => ((n % 12) + 12) % 12;
        const avoidPcs = new Set(avoidSamePcAs.map(pc));
        const inRange = (n: number) => n >= this.BASS_RANGE_MIN && n <= this.BASS_RANGE_MAX;
        const pcBase = ((rootMidi % 12) + 12) % 12;
        const goingUp = endNote > startNote;
        const candidates: number[] = [];
        for (const s of allowedSemis) {
            const p = (pcBase + s) % 12;
            for (let oct = 2; oct <= 5; oct++) {
                const t = p + oct * 12;
                if (inRange(t) && !avoidPcs.has(pc(t)) && t !== startNote && t !== endNote) candidates.push(t);
            }
        }
        const between = (t: number) => (goingUp ? t > startNote && t < endNote : t < startNote && t > endNote);
        const inDir = (t: number) => (goingUp && t > startNote) || (!goingUp && t < startNote);
        const betweenC = candidates.filter(between);
        if (betweenC.length > 0) return this.pickClosestPreferLower(betweenC, endNote);
        const dirC = candidates.filter(inDir);
        if (dirC.length > 0) return this.pickClosestPreferLower(dirC, endNote);
        if (candidates.length > 0) return this.pickClosestPreferLower(candidates, endNote);
        return goingUp ? this.constrainBassRange(startNote + 2) : this.constrainBassRange(startNote - 2);
    }

    /** Scale step (stepwise from start) toward endNote; prefer chromatic step when possible. */
    private static pickScaleStepToward(
        rootMidi: number,
        scaleDegrees: number[],
        startNote: number,
        endNote: number,
        ...avoidSamePcAs: number[]
    ): number {
        const pc = (n: number) => ((n % 12) + 12) % 12;
        const avoidPcs = new Set(avoidSamePcAs.map(pc));
        const inRange = (n: number) => n >= this.BASS_RANGE_MIN && n <= this.BASS_RANGE_MAX;
        const pcBase = ((rootMidi % 12) + 12) % 12;
        const goingUp = endNote > startNote;
        const candidates: number[] = [];
        for (const s of scaleDegrees) {
            const p = (pcBase + s) % 12;
            for (let oct = 2; oct <= 5; oct++) {
                const t = p + oct * 12;
                if (inRange(t) && !avoidPcs.has(pc(t)) && t !== startNote && t !== endNote) candidates.push(t);
            }
        }
        const stepwise = (t: number) => Math.abs(t - startNote) <= 2;
        const inDir = (t: number) => (goingUp && t > startNote) || (!goingUp && t < startNote);
        const stepInDir = candidates.filter((t) => stepwise(t) && inDir(t));
        if (stepInDir.length > 0) {
            const chrom = stepInDir.filter((t) => Math.abs(t - startNote) === 1);
            return this.pickClosestPreferLower(chrom.length > 0 ? chrom : stepInDir, endNote);
        }
        const stepAny = candidates.filter(stepwise);
        if (stepAny.length > 0) return this.pickClosestPreferLower(stepAny, endNote);
        return goingUp ? this.constrainBassRange(startNote + 2) : this.constrainBassRange(startNote - 2);
    }

    /** No repeated pitch classes; nudge beat 2 or 3 stepwise when they repeat the previous note so the line pushes forward. Beat 4 is left unchanged (approach note). */
    private static eliminateRepeatsForward(line: number[]): number[] {
        const pc = (n: number) => ((n % 12) + 12) % 12;
        const inRange = (n: number) => n >= this.BASS_RANGE_MIN && n <= this.BASS_RANGE_MAX;
        const out = [...line];
        for (let i = 1; i < out.length - 1; i++) {
            if (pc(out[i]) !== pc(out[i - 1])) continue;
            const prev = out[i - 1];
            const next = out[i + 1];
            const dir = next > prev ? 1 : -1;
            const tryA = this.constrainBassRange(out[i] + dir);
            const tryB = this.constrainBassRange(out[i] - dir);
            const avoid = new Set([prev, next]);
            if (inRange(tryA) && !avoid.has(tryA) && pc(tryA) !== pc(prev)) out[i] = tryA;
            else if (inRange(tryB) && !avoid.has(tryB) && pc(tryB) !== pc(prev)) out[i] = tryB;
            else if (inRange(tryA) && pc(tryA) !== pc(prev)) out[i] = tryA;
            else if (inRange(tryB) && pc(tryB) !== pc(prev)) out[i] = tryB;
        }
        return out;
    }

    private static constrainBassRange(midi: number): number {
        let n = midi;
        while (n < this.BASS_RANGE_MIN) n += 12;
        while (n > this.BASS_RANGE_MAX) n -= 12;
        return n;
    }

    /**
     * Bridge note with chord-scale and flow rule. Stepwise preferred, often chromatic (half-step) when possible.
     * No repeated pitch classes: exclude any note in avoidSamePcAs (forward-pushing line).
     * Candidates = chord tones + scale tones + chromatic neighbors (start ± 1). Prefer linear continuation:
     * (1) stepwise from start, chromatic preferred; (2) same direction as target; (3) between start and end.
     */
    private static getBridgeNoteWithFlow(
        rootMidi: number,
        chordToneSemis: number[],
        scaleDegrees: number[],
        startNote: number,
        endNote: number,
        ...avoidSamePcAs: number[]
    ): number {
        const inRange = (n: number) => n >= this.BASS_RANGE_MIN && n <= this.BASS_RANGE_MAX;
        const pc = (n: number) => ((n % 12) + 12) % 12;
        const avoidPcs = new Set(avoidSamePcAs.map(pc));
        const chordTonePc = (n: number) => !avoidPcs.has(pc(n));

        const pcBase = ((rootMidi % 12) + 12) % 12;

        const fromSemis = (semis: number[]) => {
            const out: number[] = [];
            for (const s of semis) {
                const p = (pcBase + s) % 12;
                for (let oct = 2; oct <= 5; oct++) {
                    const t = p + oct * 12;
                    if (inRange(t)) out.push(t);
                }
            }
            return out;
        };

        const chordTones = fromSemis(chordToneSemis);
        const scaleTones = fromSemis(scaleDegrees);
        const chromUp = startNote + 1;
        const chromDown = startNote - 1;
        const chromaticNeighbors = [chromUp, chromDown].filter(inRange).filter((t) => t !== endNote);
        const candidates = [...new Set([...chordTones, ...scaleTones, ...chromaticNeighbors])]
            .filter((t) => t !== startNote && t !== endNote && chordTonePc(t));

        const goingUp = endNote > startNote;
        const between = (t: number) => (goingUp ? t > startNote && t < endNote : t < startNote && t > endNote);
        const stepwise = (t: number) => Math.abs(t - startNote) <= 2;
        const chromatic = (t: number) => Math.abs(t - startNote) === 1;
        const sameDirection = (t: number) => (goingUp && t > startNote) || (!goingUp && t < startNote);

        const pickStepwisePreferChromatic = (pool: number[]) => {
            const chrom = pool.filter(chromatic);
            if (chrom.length > 0) return this.pickClosestPreferLower(chrom, endNote);
            return this.pickClosestPreferLower(pool, endNote);
        };

        const inDir = candidates.filter(sameDirection);
        const pool = inDir.length > 0 ? inDir : candidates;
        if (pool.length === 0) {
            const chromAlt = [chromUp, chromDown].filter(inRange).filter((t) => t !== endNote && !avoidPcs.has(pc(t)));
            const chromDir = chromAlt.find(sameDirection);
            if (chromDir != null) return chromDir;
            if (chromAlt.length > 0) return chromAlt[0];
            return goingUp ? this.constrainBassRange(startNote + 2) : this.constrainBassRange(startNote - 2);
        }

        const betweenStepwise = pool.filter((t) => between(t) && stepwise(t));
        if (betweenStepwise.length > 0) return pickStepwisePreferChromatic(betweenStepwise);

        const betweenAny = pool.filter(between);
        if (betweenAny.length > 0) return pickStepwisePreferChromatic(betweenAny);

        const stepwiseInDir = pool.filter((t) => stepwise(t) && sameDirection(t));
        if (stepwiseInDir.length > 0) return pickStepwisePreferChromatic(stepwiseInDir);

        const stepwiseAny = pool.filter(stepwise);
        if (stepwiseAny.length > 0) return pickStepwisePreferChromatic(stepwiseAny);

        const chromInDir = chromaticNeighbors.filter((t) => sameDirection(t));
        if (chromInDir.length > 0) return chromInDir[0];
        if (chromaticNeighbors.length > 0) return chromaticNeighbors[0];
        return goingUp ? this.constrainBassRange(startNote + 2) : this.constrainBassRange(startNote - 2);
    }

    static getNextWalkingBassNote(currentBeat: number, chord: string, nextChord: string | null, lastNote: number, tension: number = 0.5): number {
        if (!chord?.trim()) return lastNote;
        const cleaned = this.normalizeChordSymbolForTheory(chord);
        const dna = getChordDna(cleaned);
        const root = dna?.root ?? recognizeChordFromSymbol(cleaned).root;
        const rootMidi = noteNameToMidi(root + "1");

        const intervals = dna?.intervals ?? (CHORD_INTERVALS[recognizeChordFromSymbol(cleaned).quality] || [0, 4, 7]);
        const isMinor = intervals.includes(3);
        const isDim = intervals.includes(6);
        const isAug = intervals.includes(8);
        const fifthSemitones = isAug ? 8 : isDim ? 6 : 7;
        const thirdSemitones = isMinor || isDim ? 3 : 4;
        const seventhSemitones = cleaned.toLowerCase().includes("maj7") || cleaned.includes("^7") ? 11 : 10;

        const targetOctaveShift = tension > 0.8 ? 12 : 0;
        const rootPc = rootMidi + targetOctaveShift;
        const inRange = (n: number) => n >= 28 && n <= 64;

        if (currentBeat === 0) {
            const rootNote = this.getClosestNote(rootPc, lastNote, true);
            if (Math.random() < 0.92) return rootNote;
            const thirdNote = this.getClosestNote(rootPc + thirdSemitones, lastNote, true);
            const fifthNote = this.getClosestNote(rootPc + fifthSemitones, lastNote, true);
            const strongTones = [rootNote, thirdNote, fifthNote].filter((n) => n !== lastNote && inRange(n));
            if (strongTones.length === 0) return rootNote;
            return this.pickClosestPreferLower(strongTones, lastNote);
        }

        if (currentBeat === 3) {
            const thirdNote = this.getClosestNote(rootPc + thirdSemitones, lastNote, true);
            const fifthNote = this.getClosestNote(rootPc + fifthSemitones, lastNote, true);
            const candidates: number[] = [thirdNote, fifthNote];

            if (nextChord) {
                const nextDna = getChordDna(this.normalizeChordSymbolForTheory(nextChord));
                const nextRootName = nextDna?.root ?? recognizeChordFromSymbol(nextChord).root;
                const nextRoot = noteNameToMidi(nextRootName + "1") + targetOctaveShift;
                const r = Math.random();
                let approachRaw: number;
                if (r < 0.75) {
                    const chromBelow = nextRoot - 1;
                    const chromAbove = nextRoot + 1;
                    approachRaw = Math.random() < 0.7 ? chromBelow : chromAbove;
                } else if (r < 0.9) {
                    approachRaw = nextRoot + 7;
                } else {
                    approachRaw = nextRoot + 2;
                }
                candidates.push(this.getClosestNote(approachRaw, lastNote, true));
            } else {
                candidates.push(this.getClosestNote(rootPc, lastNote, true));
            }

            const valid = [...new Set(candidates)].filter((n) => n !== lastNote && inRange(n));
            if (valid.length === 0) return fifthNote;
            return this.pickClosestPreferLower(valid, lastNote);
        }

        if (currentBeat === 2) {
            const fifthPc = rootPc + fifthSemitones;
            const thirdPc = rootPc + thirdSemitones;
            const fifth = this.getClosestNote(fifthPc, lastNote, true);
            const third = this.getClosestNote(thirdPc, lastNote, true);
            const candidates: number[] = [fifth, third];

            const chromFifth = [fifthPc - 1, fifthPc + 1].flatMap((t) => {
                const n = this.getClosestNote(t, lastNote, true);
                return inRange(n) ? [n] : [];
            });
            const chromThird = [thirdPc - 1, thirdPc + 1].flatMap((t) => {
                const n = this.getClosestNote(t, lastNote, true);
                return inRange(n) ? [n] : [];
            });
            candidates.push(...chromFifth, ...chromThird);

            if (nextChord && Math.random() < 0.35) {
                const nextDna = getChordDna(this.normalizeChordSymbolForTheory(nextChord));
                const nextRootName = nextDna?.root ?? recognizeChordFromSymbol(nextChord).root;
                const nextRoot = noteNameToMidi(nextRootName + "1") + targetOctaveShift;
                const enclosureUpper = this.getClosestNote(nextRoot + 2, lastNote, true);
                const enclosureLower = this.getClosestNote(nextRoot - 1, lastNote, true);
                if (inRange(enclosureUpper)) candidates.push(enclosureUpper);
                if (inRange(enclosureLower)) candidates.push(enclosureLower);
            }

            const valid = [...new Set(candidates)].filter((n) => n !== lastNote && inRange(n));
            if (valid.length === 0) return lastNote + (lastNote < 48 ? 2 : -2);
            return this.pickClosestPreferLower(valid, lastNote);
        }

        const scaleDegrees = this.getScaleDegreesForChord(cleaned);
        const baseRoot = this.getClosestNote(rootPc, lastNote, false);
        const allScaleNotes = scaleDegrees.flatMap((d) =>
            [baseRoot + d, baseRoot - 12 + d, baseRoot + 12 + d].filter(inRange)
        );
        const chordTones = [0, thirdSemitones, fifthSemitones, seventhSemitones];
        const chromNeighbors = chordTones.flatMap((d) =>
            [baseRoot + d - 1, baseRoot + d + 1, baseRoot - 12 + d - 1, baseRoot - 12 + d + 1, baseRoot + 12 + d - 1, baseRoot + 12 + d + 1].filter(inRange)
        );
        const connector = [...new Set([...allScaleNotes, ...chromNeighbors])].filter((n) => n !== lastNote && Math.abs(n - lastNote) <= 7);
        if (connector.length === 0) return this.getClosestNote(rootPc + 4, lastNote, true);
        const stepwise = connector.filter((n) => Math.abs(n - lastNote) <= 2);
        const pool = stepwise.length >= 1 ? stepwise : connector;
        const byLeap = [...pool].sort((a, b) => Math.abs(a - lastNote) - Math.abs(b - lastNote));
        const smallestLeap = Math.abs(byLeap[0] - lastNote);
        const smallLeaps = byLeap.filter((n) => Math.abs(n - lastNote) <= smallestLeap + 1);
        const chromInPool = smallLeaps.filter((n) => {
            const pc = ((n - baseRoot) % 12 + 12) % 12;
            return chordTones.some((c) => {
                const d = Math.abs(pc - c);
                return d === 1 || d === 11;
            });
        });
        if (chromInPool.length >= 1 && Math.random() < 0.4) {
            return this.pickClosestPreferLower(chromInPool, lastNote);
        }
        const poolChoice = this.pickClosestPreferLower(smallLeaps, lastNote);
        return poolChoice;
    }

    /** Returns scale degrees (semitones from root) for step scale motion over the given chord. */
    private static getScaleDegreesForChord(chordSymbol: string): number[] {
        const { quality } = parseChord(chordSymbol.trim());
        const q = quality.toLowerCase();
        if (q === 'maj7' || q === 'maj' || q === '6' || q === 'maj9' || q === 'maj13' || q === 'mm7' || q === 'mmaj7') return CHORD_SCALE_DEGREES.Ionian;
        if (q === 'min7' || q === 'min' || q === 'm6' || q === 'min9' || q === 'min11' || q === 'min13') return CHORD_SCALE_DEGREES.Dorian;
        if (q === 'dim7') return CHORD_SCALE_DEGREES.DimScale;
        if (q === 'm7b5') return CHORD_SCALE_DEGREES.Locrian;
        if (q === 'aug' || q === 'aug7') return CHORD_SCALE_DEGREES.AugScale;
        if (q === 'dom7' || q === '9' || q === '11' || q === '13' || q.startsWith('7') || q.includes('sus')) return CHORD_SCALE_DEGREES.Mixolydian;
        return CHORD_SCALE_DEGREES.Mixolydian;
    }

    /** Among candidates, pick one closest to reference; when within 2 semitones of best distance, prefer lower note (bass register). */
    private static pickClosestPreferLower(candidates: number[], reference: number): number {
        if (candidates.length === 0) return reference;
        const withDist = candidates.map((n) => ({ n, d: Math.abs(n - reference) }));
        const minDist = Math.min(...withDist.map((x) => x.d));
        const close = withDist.filter((x) => x.d <= minDist + 2);
        const byLower = close.sort((a, b) => a.n - b.n);
        return byLower[0].n;
    }

    /** Pick octave of target that is closest to current, in range 28–64. Prefers lower register when continuity allows (tolerance 5 semitones). If avoidRepeat, prefer a different pitch class than current. */
    private static getClosestNote(target: number, current: number, avoidRepeat: boolean = false): number {
        const RANGE_MIN = 28;
        const RANGE_MAX = 64;
        const LOWER_BIAS_TOLERANCE = 5;
        const octaveDiff = Math.round((current - target) / 12);
        let result = target + (octaveDiff * 12);
        if (result < RANGE_MIN) result += 12;
        if (result > RANGE_MAX) result -= 12;
        const inRange = (n: number) => n >= RANGE_MIN && n <= RANGE_MAX;
        const candidates = [result, result - 12, result + 12].filter(inRange);
        const withDist = candidates.map((n) => ({ n, d: Math.abs(n - current) }));
        const minDist = Math.min(...withDist.map((x) => x.d));
        const acceptable = withDist.filter((x) => x.d <= minDist + LOWER_BIAS_TOLERANCE);
        const byLower = acceptable.sort((a, b) => a.n - b.n);
        result = byLower[0].n;
        if (!avoidRepeat) return result;
        const samePc = (a: number, b: number) => ((a % 12) + 12) % 12 === ((b % 12) + 12) % 12;
        if (!samePc(result, current)) return result;
        const up = result + 12;
        const down = result - 12;
        const pick = (n: number) => (inRange(n) ? n : null);
        const alt = [pick(up), pick(down)].filter((n): n is number => n !== null);
        if (alt.length === 0) return result;
        const bestAlt = alt.reduce((best, n) => (Math.abs(n - current) < Math.abs(best - current) ? n : best));
        if (!samePc(bestAlt, current)) return bestAlt;
        const nonRepeat = alt.filter((n) => !samePc(n, current));
        if (nonRepeat.length === 0) return result;
        return Math.min(...nonRepeat);
    }

    /** Note role from chord context (unified with Chord Lab: #9 → extension, not third). */
    static getNoteFunction(midi: number, chord: string): 'root' | 'third' | 'fifth' | 'seventh' | 'extension' {
        const cleaned = this.normalizeChordSymbolForTheory(chord || '');
        const dna = getChordDna(cleaned);
        const root = dna?.root ?? recognizeChordFromSymbol(cleaned).root;
        const rootMidi = noteNameToMidi(root + "0") % 12;
        const label = getChordToneLabel(rootMidi, midi, cleaned || undefined);

        if (label === 'R') return 'root';
        if (label === 'm3' || label === 'M3') return 'third';
        if (label === 'b5' || label === '5' || label === '#5') return 'fifth';
        if (label === 'b7' || label === 'M7') return 'seventh';
        return 'extension';
    }
}
