import * as Tone from 'tone';

export class PyramidEngine {
    private synths: Map<number, Tone.MembraneSynth> = new Map();
    private loops: Map<number, Tone.Loop> = new Map();
    private isPlaying: boolean = false;

    constructor() {
        // Shared synth parameters
    }

    private getOrCreateSynth(sub: number) {
        if (!this.synths.has(sub)) {
            const synth = new Tone.MembraneSynth({
                pitchDecay: 0.005,
                octaves: 2,
                envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
            }).toDestination();
            this.synths.set(sub, synth);
        }
        return this.synths.get(sub)!;
    }

    toggleLayer(sub: number, active: boolean) {
        if (active) {
            this.startLayer(sub);
        } else {
            this.stopLayer(sub);
        }
    }

    private startLayer(sub: number) {
        if (this.loops.has(sub)) return;

        const synth = this.getOrCreateSynth(sub);
        const loop = new Tone.Loop((time) => {
            const oneBeat = Tone.Time('4n').toSeconds();
            const subInterval = oneBeat / sub;

            for (let i = 0; i < sub; i++) {
                const t = time + (i * subInterval);
                const freq = 100 + (sub * 30);
                synth.triggerAttackRelease(freq, "32n", t, sub === 1 ? 1.0 : 0.6);
            }
        }, '4n');

        this.loops.set(sub, loop);
        if (this.isPlaying) {
            loop.start(0);
        }
    }

    private stopLayer(sub: number) {
        const loop = this.loops.get(sub);
        if (loop) {
            loop.dispose();
            this.loops.delete(sub);
        }
    }

    setBpm(bpm: number) {
        Tone.Transport.bpm.value = bpm;
    }

    start() {
        if (this.isPlaying) return;
        Tone.start();
        Tone.Transport.start();
        this.loops.forEach(loop => loop.start(0));
        this.isPlaying = true;
    }

    stop() {
        Tone.Transport.stop();
        this.loops.forEach(loop => loop.stop());
        this.isPlaying = false;
    }

    stopAll() {
        this.stop();
        this.loops.forEach(loop => loop.dispose());
        this.loops.clear();
        this.synths.forEach(synth => synth.dispose());
        this.synths.clear();
    }
}
