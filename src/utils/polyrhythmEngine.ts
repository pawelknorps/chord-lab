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
    private metronomeHigh: Tone.MembraneSynth;
    private metronomeLow: Tone.MembraneSynth;
    private metronomeLoop: Tone.Loop | null = null;
    public metronomeEnabled: boolean = true;

    constructor() {
        this.synthA = new Tone.MembraneSynth({
            pitchDecay: 0.005,
            octaves: 1.5,
            envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
        }).toDestination();
        this.synthA.volume.value = -6;

        this.synthB = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.06, release: 0.02 },
            harmonicity: 5.1,
            modulationIndex: 12,
            resonance: 3000,
            octaves: 1.2,
            volume: -10
        }).toDestination();

        // High-pitched woodblock-style clicks for metronome
        this.metronomeHigh = new Tone.MembraneSynth({
            pitchDecay: 0.005,
            octaves: 1,
            envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.05 }
        }).toDestination();
        this.metronomeHigh.volume.value = -8;

        this.metronomeLow = new Tone.MembraneSynth({
            pitchDecay: 0.005,
            octaves: 1,
            envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.05 }
        }).toDestination();
        this.metronomeLow.volume.value = -14;
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
        this.stop();

        Tone.start();
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.position = 0; // Reset position

        // Setup metronome if enabled
        if (this.metronomeEnabled) {
            this.metronomeLoop = new Tone.Loop((time) => {
                const beat = parseInt(Tone.Transport.position.toString().split(':')[1]);
                const isBeatOne = beat === 0;

                if (isBeatOne) {
                    this.metronomeHigh.triggerAttackRelease("C6", "32n", time, 1.0);
                } else {
                    this.metronomeLow.triggerAttackRelease("C5", "32n", time, 0.7);
                }
            }, "4n").start(0);
        }

        // Loop A
        this.loopA = new Tone.Loop((time) => {
            const beatDur = Tone.Time('4n').toSeconds();
            const measureDur = beatDur * 4;
            const interval = measureDur / this.divisionsA;

            for (let i = 0; i < this.divisionsA; i++) {
                this.synthA.triggerAttackRelease("G4", "32n", time + (i * interval));
            }
        }, '1m').start(0);

        // Loop B
        this.loopB = new Tone.Loop((time) => {
            const beatDur = Tone.Time('4n').toSeconds();
            const measureDur = beatDur * 4;
            const interval = measureDur / this.divisionsB;

            for (let i = 0; i < this.divisionsB; i++) {
                this.synthB.triggerAttackRelease("A5", "32n", time + (i * interval));
            }
        }, '1m').start(0);

        Tone.Transport.start();
        this.isPlaying = true;
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Critical for instant stop of scheduled events

        this.loopA?.dispose();
        this.loopB?.dispose();
        this.metronomeLoop?.dispose();
        this.loopA = null;
        this.loopB = null;
        this.metronomeLoop = null;

        // Force all synths to release immediately
        this.synthA.triggerRelease();
        this.synthB.triggerRelease();
        this.metronomeHigh.triggerRelease();
        this.metronomeLow.triggerRelease();

        this.isPlaying = false;
    }

    dispose() {
        this.stop();
        this.synthA.dispose();
        this.synthB.dispose();
        this.metronomeHigh.dispose();
        this.metronomeLow.dispose();
    }

    restart() {
        this.stop();
        this.start();
    }
}
