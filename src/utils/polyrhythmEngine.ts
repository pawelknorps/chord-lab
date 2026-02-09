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
        // Don't restart, let the loop pick up the new value on the next measure cycle.
        // This prevents stuttering when dragging sliders.
    }

    setBpm(bpm: number) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = bpm;
    }

    start() {
        if (this.isPlaying) return;

        // Clean up any existing loops first
        this.loopA?.dispose();
        this.loopB?.dispose();
        this.loopA = null;
        this.loopB = null;

        Tone.start();
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.position = 0; // Reset position

        // We treat the "Bar" as one measure of 4/4 (or just 1 measure). 
        // Tone.Transport '1m' depends on time signature. Let's assume 1 measure duration.
        // We schedule N events for A and M events for B within '1m'.

        // Actually, let's use a Loop of '1m'.

        // Loop A
        // The loop is 1 measure long. Be rigorous with '1m' in Tonejs terms.
        this.loopA = new Tone.Loop((time) => {
            // Calculate measure duration in seconds based on current BPM
            // 1 measure = 4 beats usually
            const beatDur = Tone.Time('4n').toSeconds();
            const measureDur = beatDur * 4;

            const interval = measureDur / this.divisionsA;

            for (let i = 0; i < this.divisionsA; i++) {
                // Trigger Membrane
                this.synthA.triggerAttackRelease("C2", "32n", time + (i * interval));
            }
        }, '1m').start(0);

        // Loop B
        this.loopB = new Tone.Loop((time) => {
            const beatDur = Tone.Time('4n').toSeconds();
            const measureDur = beatDur * 4;

            const interval = measureDur / this.divisionsB;

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
