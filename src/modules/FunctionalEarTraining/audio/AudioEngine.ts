import * as Tone from 'tone';

// Singleton Audio Service for Ear Training
class FETAudioEngine {
    private pianoSampler: Tone.Sampler | null = null;
    private targetSynth: Tone.Synth | null = null;
    private distortion: Tone.Distortion | null = null;
    private reverb: Tone.Reverb | null = null;
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;

        await Tone.start();

        // High-Quality Piano for "Context" (Grounding)
        // Using a basic Sampler for now, replaceable with better samples
        this.pianoSampler = new Tone.Sampler({
            urls: {
                "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
                "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
                "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
                "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
                "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
                "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
                "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
                "A7": "A7.mp3", "C8": "C8.mp3"
            },
            baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/piano/",
        }).toDestination();

        // Clean Synth for "Target" (No timbral clues)
        this.targetSynth = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 1 }
        }).toDestination();

        // Distortion/Noise for "Interference"
        this.distortion = new Tone.Distortion(0.8).toDestination();
        this.reverb = new Tone.Reverb(2).toDestination();

        this.pianoSampler.connect(this.reverb);

        this.isInitialized = true;
    }

    playCadence(notes: string[], duration = '2n') {
        if (!this.pianoSampler) return;
        this.pianoSampler.triggerAttackRelease(notes, duration);
    }

    playChord(notes: string[], duration = '2n') {
        if (!this.pianoSampler) return;
        this.pianoSampler.triggerAttackRelease(notes, duration);
    }

    playTarget(note: string, duration = '1n') {
        if (!this.targetSynth) return;
        this.targetSynth.triggerAttackRelease(note, duration);
    }

    playInterference(duration = '8n') {
        if (!this.targetSynth || !this.distortion) return;

        // Connect momentarily to distortion
        this.targetSynth.connect(this.distortion);

        // Play random cluster
        const randomNotes = ['C#5', 'D5', 'G#4'];
        randomNotes.forEach(n => this.targetSynth?.triggerAttackRelease(n, duration, Tone.now() + Math.random() * 0.1));

        // Disconnect after duration
        setTimeout(() => {
            if (this.targetSynth && this.distortion) {
                this.targetSynth.disconnect(this.distortion);
                this.targetSynth.toDestination();
            }
        }, Tone.Time(duration).toSeconds() * 1000 + 200);
    }

    playResolution(from: string, to: string) {
        if (!this.targetSynth) return;
        const now = Tone.now();
        this.targetSynth.triggerAttackRelease(from, '4n', now);
        this.targetSynth.triggerAttackRelease(to, '2n', now + Tone.Time('4n').toSeconds());
    }
}

export const fetAudio = new FETAudioEngine();
