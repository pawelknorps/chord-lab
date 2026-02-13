import * as Tone from 'tone';

export class MetronomeEngine {
    private loop: Tone.Loop | null = null;
    private subdivision: number = 4; // 1 = quarter, 2 = 8th, 3 = triplet, 4 = 16th, etc.
    private bpm: number = 120;
    private swing: number = 0;
    private isPlaying: boolean = false;
    public lastStartTime: number = 0;

    // Synths
    private clickSynth: Tone.MembraneSynth;
    private ghostSynth: Tone.MembraneSynth;
    private metronomeHigh: Tone.MembraneSynth;
    private metronomeLow: Tone.MembraneSynth;
    private metronomeLoop: Tone.Loop | null = null;
    public metronomeEnabled: boolean = true;

    constructor() {
        this.clickSynth = new Tone.MembraneSynth({
            pitchDecay: 0.005,
            octaves: 1.5,
            envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
        }).toDestination();
        this.clickSynth.volume.value = -6;

        this.ghostSynth = new Tone.MembraneSynth({
            pitchDecay: 0.002,
            octaves: 1,
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
        }).toDestination();
        this.ghostSynth.volume.value = -20;

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

    setBpm(bpm: number) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = bpm;
    }

    setSwing(amount: number) {
        this.swing = amount;
        Tone.Transport.swing = amount;
        Tone.Transport.swingSubdivision = "8n"; // Standard swing feel
    }

    setSubdivision(sub: number) {
        this.subdivision = sub;
        if (this.isPlaying) {
            this.restart();
        }
    }

    // Syncopation Pattern (16 steps for 4/4)
    private pattern: number[] = []; // 0=Rest, 1=Ghost, 2=Accent

    setPattern(pattern: number[]) {
        this.pattern = pattern;
        if (this.isPlaying && this.subdivision === 4) { // Only update if in 16th note mode
            this.restart();
        }
    }

    async start() {
        if (this.isPlaying) return;

        await Tone.start();
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.swing = this.swing;

        // Setup metronome if enabled
        if (this.metronomeEnabled) {
            this.metronomeLoop = new Tone.Loop((time) => {
                // Determine if it's beat 1 for accent
                // Tone.Transport.position is "bar:beat:sixteenth"
                const beat = parseInt(Tone.Transport.position.toString().split(':')[1]);
                const isBeatOne = beat === 0;

                if (isBeatOne) {
                    this.metronomeHigh.triggerAttackRelease("C6", "32n", time, 1.0);
                } else {
                    this.metronomeLow.triggerAttackRelease("C5", "32n", time, 0.7);
                }
            }, "4n").start(0);
        }

        this.scheduleLoop();
        Tone.Transport.start();
        this.lastStartTime = performance.now();
        this.isPlaying = true;
    }

    private scheduleLoop() {
        this.stopLoop();
        // Pattern Mode
        if (this.pattern.length > 0) {
            const interval = '16n';
            let step = 0;
            this.loop = new Tone.Loop((time) => {
                const currentStep = step % this.pattern.length;
                const type = this.pattern[currentStep];
                if (type === 2) {
                    this.clickSynth.triggerAttackRelease("G4", "32n", time, 1.0);
                } else if (type === 1) {
                    this.ghostSynth.triggerAttackRelease("G4", "32n", time, 0.6);
                } else if (type === 3) {
                    this.clickSynth.triggerAttackRelease("G4", "32n", time, 0.5);
                }
                step++;
            }, interval).start(0);
            return;
        }

        // Standard Grid (1-4)
        if (this.subdivision <= 4) {
            let interval = '4n';
            if (this.subdivision === 2) interval = '8n';
            if (this.subdivision === 3) interval = '8t';
            if (this.subdivision === 4) interval = '16n';

            this.loop = new Tone.Loop((time) => {
                this.clickSynth.triggerAttackRelease("G4", "32n", time);
            }, interval).start(0);
        } else {
            // Complex Patterns (5, 6, 7)
            this.loop = new Tone.Loop((time) => {
                const oneBeat = Tone.Time('4n').toSeconds();
                const subInterval = oneBeat / this.subdivision;
                for (let i = 0; i < this.subdivision; i++) {
                    const t = time + (i * subInterval);
                    this.clickSynth.triggerAttackRelease("G4", "32n", t);
                }
            }, '4n').start(0);
        }
    }

    private stopLoop() {
        if (this.loop) {
            this.loop.dispose();
            this.loop = null;
        }
    }

    stop() {
        Tone.Transport.stop();
        Tone.Transport.cancel();

        this.stopLoop();
        if (this.metronomeLoop) {
            this.metronomeLoop.stop();
            this.metronomeLoop.dispose();
            this.metronomeLoop = null;
        }

        // Kill sounds immediately
        this.clickSynth.triggerRelease();
        this.ghostSynth.triggerRelease();
        this.metronomeHigh.triggerRelease();
        this.metronomeLow.triggerRelease();

        this.isPlaying = false;
    }

    restart() {
        this.stop();
        void this.start();
    }

    dispose() {
        this.stop();
        this.clickSynth.dispose();
        this.ghostSynth.dispose();
        this.metronomeHigh.dispose();
        this.metronomeLow.dispose();
    }
}
