import * as Tone from 'tone';

export class PolyrhythmEngine {
    private loopA: Tone.Loop | null = null;
    private loopB: Tone.Loop | null = null;

    // Default 5:4 (5 beats in x time vs 4 beats in x time)
    // Actually polyrhythm usually means X beats against Y beats in the SAME total duration.
    // e.g. 5 against 4 over 1 bar.

    private divisionsA: number = 4;
    private divisionsB: number = 5;
    private bpm: number = 60; // Slow for polyrhythms
    private isPlaying: boolean = false;

    private synthA: Tone.MembraneSynth;
    private synthB: Tone.MetalSynth;

    constructor() {
        this.synthA = new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 2,
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
        }).toDestination();

        this.synthB = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 10,
            resonance: 3000,
            octaves: 1,
            volume: -5
        }).toDestination();
    }

    setDivisions(a: number, b: number) {
        this.divisionsA = a;
        this.divisionsB = b;
        if (this.isPlaying) {
            this.restart();
        }
    }

    setBpm(bpm: number) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = bpm;
    }

    start() {
        if (this.isPlaying) return;
        Tone.start();
        Tone.Transport.bpm.value = this.bpm;

        // We treat the "Bar" as one measure of 4/4 (or just 1 measure). 
        // Tone.Transport '1m' depends on time signature. Let's assume 1 measure duration.
        // We schedule N events for A and M events for B within '1m'.

        // Actually, let's use a Loop of '1m'.

        // Loop A
        const measureSec = (60 / this.bpm) * 4;

        this.loopA = new Tone.Loop((time) => {
            // In this loop (which fires every measure), we schedule N beats
            // We can't use Tone.Loop inside Tone.Loop easily for sub-divisions if we want them aligned.
            // Better: Schedule events for the next measure.

            const interval = measureSec / this.divisionsA;

            for (let i = 0; i < this.divisionsA; i++) {
                // Trigger Membrane
                this.synthA.triggerAttackRelease("C2", "32n", time + (i * interval));
            }
        }, '1m').start(0);

        // Loop B
        this.loopB = new Tone.Loop((time) => {
            const interval = measureSec / this.divisionsB;

            for (let i = 0; i < this.divisionsB; i++) {
                // Different sound/pitch
                // Trigger Metal - provide note for safety
                this.synthB.triggerAttackRelease("G2", "32n", time + (i * interval));
            }
        }, '1m').start(0);

        Tone.Transport.start();
        this.isPlaying = true;
    }

    stop() {
        this.loopA?.dispose();
        this.loopB?.dispose();
        this.loopA = null;
        this.loopB = null;
        Tone.Transport.stop();
        this.isPlaying = false;
    }

    restart() {
        this.stop();
        this.start();
    }
}
