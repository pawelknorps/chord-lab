import * as Tone from 'tone';

export type InstrumentName =
    | 'piano-salamander'
    | 'epiano-casio'
    | 'synth-plumber'
    | 'synth-wave'
    | 'synth-organ'
    | 'synth-pluck'
    | 'guitar-nylon'
    | 'guitar-electric'
    | 'harp';

export class InstrumentService {
    private static instance: InstrumentService;
    private instruments: Map<string, any> = new Map();
    private loadingPromises: Map<string, Promise<any>> = new Map();

    private constructor() { }

    static getInstance(): InstrumentService {
        if (!InstrumentService.instance) {
            InstrumentService.instance = new InstrumentService();
        }
        return InstrumentService.instance;
    }

    async getInstrument(name: InstrumentName | string): Promise<any> {
        if (this.instruments.has(name)) {
            return this.instruments.get(name)!;
        }

        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name)!;
        }

        const promise = this.loadInstrument(name);
        this.loadingPromises.set(name, promise);

        try {
            const inst = await promise;
            this.instruments.set(name, inst);
            this.loadingPromises.delete(name);
            return inst;
        } catch (error) {
            this.loadingPromises.delete(name);
            console.error(`Failed to load instrument: ${name}`, error);
            // Return a fallback synth
            return this.getFallbackSynth();
        }
    }

    private async loadInstrument(name: string): Promise<any> {
        switch (name) {
            case 'piano-salamander':
                return new Promise((resolve) => {
                    const sampler = new Tone.Sampler({
                        urls: {
                            C4: 'C4.mp3',
                            'D#4': 'Ds4.mp3',
                            'F#4': 'Fs4.mp3',
                            A4: 'A4.mp3',
                        },
                        baseUrl: 'https://tonejs.github.io/audio/salamander/',
                        onload: () => resolve(sampler.toDestination())
                    });
                });

            case 'epiano-casio':
                return new Promise((resolve) => {
                    const sampler = new Tone.Sampler({
                        urls: {
                            C3: 'C3.mp3',
                            'D#3': 'Ds3.mp3',
                            'F#3': 'Fs3.mp3',
                            A3: 'A3.mp3',
                        },
                        baseUrl: 'https://tonejs.github.io/audio/casio/',
                        onload: () => resolve(sampler.toDestination())
                    });
                });

            case 'guitar-nylon':
                return new Promise((resolve) => {
                    const sampler = new Tone.Sampler({
                        urls: {
                            "A2": "A2.mp3",
                            "C3": "C3.mp3",
                            "E3": "E3.mp3",
                            "G3": "G3.mp3",
                        },
                        baseUrl: "https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-nylon/",
                        onload: () => resolve(sampler.toDestination())
                    });
                });

            case 'synth-plumber':
                return new Tone.PolySynth(Tone.Synth).toDestination();

            case 'synth-wave':
                const waveSynth = new Tone.PolySynth(Tone.Synth).toDestination();
                const vibrato = new Tone.Vibrato(5, 0.1).toDestination();
                waveSynth.connect(vibrato);
                return waveSynth;

            case 'synth-organ':
                const organSynth = new Tone.PolySynth(Tone.Synth).toDestination();
                organSynth.set({
                    oscillator: {
                        type: "fatcustom",
                        partials: [0.7, 1, 0, 0.3, 0.1],
                        spread: 10,
                        count: 3
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 1.6,
                        sustain: 0.5,
                        release: 1.6
                    }
                } as any);
                return organSynth;

            case 'synth-pluck':
                const pluckSynth = new Tone.PolySynth(Tone.Synth).toDestination();
                pluckSynth.set({
                    harmonicity: 8,
                    modulationIndex: 6,
                    oscillator: { type: "sine2" },
                    envelope: {
                        attack: 0.001,
                        decay: 2,
                        sustain: 0.1,
                        release: 2
                    },
                    modulation: { type: "square2" },
                    modulationEnvelope: {
                        attack: 0.002,
                        decay: 0.2,
                        sustain: 0,
                        release: 0.2
                    }
                } as any);
                return pluckSynth;

            default:
                return this.getFallbackSynth();
        }
    }

    private getFallbackSynth(): any {
        const fallbackId = 'fallback-synth';
        if (this.instruments.has(fallbackId)) {
            return this.instruments.get(fallbackId)!;
        }
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        this.instruments.set(fallbackId, synth);
        return synth;
    }

    disposeAll(): void {
        this.instruments.forEach(inst => inst.dispose());
        this.instruments.clear();
        this.loadingPromises.clear();
    }
}

export const instrumentService = InstrumentService.getInstance();
