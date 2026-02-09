import * as Tone from 'tone';

export class MetronomeEngine {
    private loop: Tone.Loop | null = null;
    private subdivision: number = 4; // 1 = quarter, 2 = 8th, 3 = triplet, 4 = 16th, etc.
    private bpm: number = 120;
    private swing: number = 0;
    private isPlaying: boolean = false;

    // Synths
    private clickSynth: Tone.MembraneSynth;
    private subSynth: Tone.MetalSynth;

    constructor() {
        this.clickSynth = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
        }).toDestination();

        this.subSynth = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
        }).toDestination();
        this.subSynth.volume.value = -12;
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

    start() {
        if (this.isPlaying) return;

        Tone.start();
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.swing = this.swing;

        // Calculate interval based on subdivision
        // 1 = 4n, 2 = 8n, 3 = 8t, 4 = 16n, 5 = 5:4, 6 = 16t, 7 = 7:4
        // For simplicity in Tone.js, we might need custom intervals or just use 'n' values

        // We will implement a custom loop callback that calculates next time

        this.scheduleLoop();
        Tone.Transport.start();
        this.isPlaying = true;
    }

    private scheduleLoop() {
        this.stopLoop();

        // Pattern Mode (if pattern exists and subdivision is 16th or we force it)
        // For Syncopation Builder, we assume 16th note grid (subdivision 4).
        if (this.pattern.length > 0) {
            const interval = '16n';

            // Create a sequence or stick to Loop?
            // Loop is easier for infinite, but we need index.
            // Tone.Sequence is better for patterns.

            // Actually, let's use Tone.Loop and calculate step from Transport position
            // or just a counter.

            let step = 0;
            this.loop = new Tone.Loop((time) => {
                const currentStep = step % this.pattern.length;
                const type = this.pattern[currentStep];

                // 0 = Rest, 1 = Ghost (Low Vel), 2 = Accent (High Vel), 3 = Normal (Med)

                if (type === 2) {
                    this.clickSynth.triggerAttackRelease("C2", "32n", time, 1.0);
                } else if (type === 1) {
                    this.subSynth.triggerAttackRelease("32n", time, 0.2); // Ghost
                } else if (type === 3) {
                    this.subSynth.triggerAttackRelease("32n", time, 0.6); // Normal
                }

                step++;
            }, interval).start(0);

            return;
        }

        // Standard Grid (1-4)
        if (this.subdivision <= 4) {
            let interval = '4n';
            if (this.subdivision === 2) interval = '8n';
            if (this.subdivision === 3) interval = '8t'; // this is triplet 8th
            if (this.subdivision === 4) interval = '16n';

            this.loop = new Tone.Loop((time) => {
                // Determine if downbeat
                // We need to count.
                // Tone.Transport.position gives bars:beats:sixteenths.
                // But for pure metronome, we can just track a counter if we want, or use modulo of time?
                // Actually, let's just play click. Differentiating downbeat requires synchronizing to '1'.

                // For MVP: High click on beat 1, low on others is hard if we just loop an interval.
                // Easier: Use a Sequence or Part?

                // Let's just play a subdivision click for now.
                // To emphasize the quarter note, we can check `Tone.Transport.position`.

                this.clickSynth.triggerAttackRelease("C2", "32n", time);
            }, interval).start(0);
        } else {
            // Complex Patterns (5, 6, 7)
            // Use a repeated event every beat, then schedule N micro-events

            this.loop = new Tone.Loop((time) => {
                // beats are 1/4 note usually
                // Calculate exact duration of one beat in seconds
                const oneBeat = Tone.Time('4n').toSeconds();
                const subInterval = oneBeat / this.subdivision;

                for (let i = 0; i < this.subdivision; i++) {
                    const t = time + (i * subInterval);
                    // Uniform sound for all subdivisions as requested
                    this.clickSynth.triggerAttackRelease("C2", "32n", t);
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
        this.stopLoop();
        Tone.Transport.stop();
        this.isPlaying = false;
    }

    restart() {
        this.stop();
        this.start();
    }
}
