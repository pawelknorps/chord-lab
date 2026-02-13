import * as Note from "@tonaljs/note";
import * as Chord from "@tonaljs/chord";
import { toTonalChordSymbol } from './chordSymbolForTonal';

export type BassEvent = {
    time: string;       // "0:0:0"
    duration: string;   // "4n"
    velocity: number;   // 0.8 to 1.0 for normal, 0.4 for ghost
    isGhost?: boolean;  // True = Muted/Dead note sound
    note: number;       // MIDI pitch
};

/**
 * BassRhythmVariator (Phase 12.2: Bebop Engine)
 * 
 * Captures Paul Chambers / Ray Brown style:
 * 1. The "Push" (Anticipation): Hit root of next chord on "and of 4".
 * 2. The "Skip" (Double Time): 8th note bursts, octave jumps, rakes.
 * 3. State Memory: Anticipation in Bar A results in silent downbeat in Bar B.
 */
export class BassRhythmVariator {
    // Probability Controls
    private readonly SKIP_CHANCE_BASE = 0.15;
    private readonly PUSH_CHANCE_BASE = 0.20;

    // MEMORY: Did we push the last bar?
    private skipNextDownbeat: boolean = false;

    /**
     * Transforms a standard 4-note walking line into a rhythmic bebop variation.
     * @param line - Array of 4 MIDI notes [Beat1, Beat2, Beat3, Beat4]
     * @param barIndex - Current bar index
     * @param energy - 0.0 to 1.0 (activityLevel)
     * @param nextChordSymbol - Needed for "The Push" root targeting
     * @param answerContext - When bass is "answering" another instrument: echo = push/skip more, complement = solid walk, space = minimal.
     * @param soloistSpace - Phase 18: when true (solo choruses or Ballad), no push/skip/rake (leave space). Hybrid—additive.
     */
    public applyVariations(
        line: number[],
        _barIndex: number,
        energy: number,
        nextChordSymbol: string,
        answerContext?: { questionFrom: string; answerType: 'echo' | 'complement' | 'space' },
        soloistSpace?: boolean
    ): BassEvent[] {
        const events: BassEvent[] = [];

        let pushChance = soloistSpace ? 0 : this.PUSH_CHANCE_BASE;
        let skipChanceMultiplier = soloistSpace ? 0 : 1;
        if (answerContext && !soloistSpace) {
            if (answerContext.answerType === 'echo') {
                pushChance = 0.5;
                skipChanceMultiplier = 2;
            } else if (answerContext.answerType === 'complement') {
                pushChance = 0.35;
                skipChanceMultiplier = 1.2;
            } else {
                pushChance = 0.08;
                skipChanceMultiplier = 0.3;
            }
        }

        // 1. CHECK: Downbeat Skip (from previous bar's Push)
        let startIndex = 0;
        if (this.skipNextDownbeat) {
            startIndex = 1; // Start on Beat 2
            this.skipNextDownbeat = false;
        }

        // 2. Iterate through beats (4/4 or 3/4 waltz: line.length is 4 or 3)
        const numBeats = line.length;
        for (let i = startIndex; i < numBeats; i++) {
            const note = line[i];
            const time = `0:${i}:0`;

            // --- BEBOP TRICK 1: THE PUSH (Anticipation) ---
            // Only in 4/4 at beat 4 (calm start = steady quarters, no anticipation). DMP-07: no push in 3/4 waltz.
            if (numBeats === 4 && i === 3 && energy > 0.55 && Math.random() < pushChance) {
                const nextChord = Chord.get(toTonalChordSymbol(nextChordSymbol));
                const nextRootName = nextChord.tonic || "C";
                const nextRootMidi = Note.midi(nextRootName + "1") || 36; // Big low push

                events.push({
                    time: "0:3:2", // "And" of 4
                    duration: "4n", // Let it ring over barline
                    note: nextRootMidi,
                    velocity: 0.95
                });

                this.skipNextDownbeat = true;
                continue; // Skip standard beat 4
            }

            // --- BEBOP TRICK 2: DOUBLE TIME (The Skip / Run) ---
            // Replace Beat 2 or 3 with two 8th notes.
            if ((i === 1 || i === 2) && Math.random() < (energy * this.SKIP_CHANCE_BASE * 2 * skipChanceMultiplier)) {
                this.addBebopFill(events, i, note, line[i + 1] || note);
                continue;
            }

            // --- BEBOP TRICK 3: THE RAKE (Quick ghost into beat) ---
            // Calm start = fewer short articulations; scale with energy. Skip when soloist space.
            if (i === 0 && !soloistSpace && energy > 0.4 && Math.random() < 0.12 * energy) {
                events.push({ time: `0:0:0`, duration: "32n", note: note, velocity: 0.5, isGhost: true });
                events.push({ time: `0:0:1`, duration: "8n", note: note, velocity: 1.0 });
                continue;
            }

            // --- STANDARD WALK (Paul Chambers / Ray Brown Velocity Profile); waltz uses first 3 slots ---
            const bebopVelocities = [1.0, 0.6, 0.9, 0.85];
            const vel = bebopVelocities[i] ?? 0.85;
            events.push({
                time,
                duration: "4n",
                note,
                velocity: vel
            });
        }

        return events;
    }

    /**
     * Ray Brown / Paul Chambers style 8th note fills
     */
    private addBebopFill(events: BassEvent[], beatIndex: number, currentNote: number, nextNote: number) {
        const strategy = Math.random();

        // A. The "Rake" (thud-DUM)
        // Ghost (0) -> Real (&)
        if (strategy < 0.3) {
            events.push({
                time: `0:${beatIndex}:0`,
                duration: "16n",
                note: currentNote,
                velocity: 0.5,
                isGhost: true
            });
            events.push({
                time: `0:${beatIndex}:2`, // On the "And"
                duration: "8n",
                note: currentNote,
                velocity: 0.9
            });
        }
        // B. The "Octave Skip"
        else if (strategy < 0.6) {
            events.push({ time: `0:${beatIndex}:0`, duration: "8n", note: currentNote, velocity: 0.9 });
            events.push({ time: `0:${beatIndex}:2`, duration: "8n", note: currentNote + 12, velocity: 0.7, isGhost: true });
        }
        // C. The "Chromatic Approach"
        else {
            events.push({ time: `0:${beatIndex}:0`, duration: "8n", note: currentNote, velocity: 0.9 });
            const passingTone = currentNote < nextNote ? nextNote - 1 : nextNote + 1;
            events.push({ time: `0:${beatIndex}:2`, duration: "8n", note: passingTone, velocity: 0.8 });
        }
    }

    /** Reset state (e.g. when playback stops) */
    public reset() {
        this.skipNextDownbeat = false;
    }
}
