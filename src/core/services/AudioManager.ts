import * as Tone from 'tone';
import { useSettingsStore } from '../store/useSettingsStore';

type ModuleAudioState = {
    activeNotes: Set<string>;
    scheduledEvents: any[];
};

export class AudioManager {
    private static instance: AudioManager;
    private instruments: Map<string, any> = new Map();
    private modules: Map<string, ModuleAudioState> = new Map();
    private currentGlobalInstrument: string = 'piano';
    private initialized = false;

    private visualizationCallback: ((notes: number[]) => void) | null = null;

    private constructor() {
        // Subscribe to global instrument changes
        useSettingsStore.subscribe((state) => {
            if (this.currentGlobalInstrument !== state.instrument) {
                this.currentGlobalInstrument = state.instrument;
                console.log(`AudioManager: Global instrument switched to ${state.instrument}`);
            }
        });
    }

    static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    setVisualizationCallback(cb: ((notes: number[]) => void) | null): void {
        this.visualizationCallback = cb;
    }

    private emitVisualization(notes: number[]): void {
        if (this.visualizationCallback) {
            this.visualizationCallback(notes);
        }
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await Tone.start();
            Tone.Transport.bpm.value = 120;

            // Load piano (Salamander)
            const piano = new Tone.Sampler({
                urls: {
                    C4: 'C4.mp3',
                    'D#4': 'Ds4.mp3',
                    'F#4': 'Fs4.mp3',
                    A4: 'A4.mp3',
                },
                baseUrl: 'https://tonejs.github.io/audio/salamander/',
            }).toDestination();

            // Load EPiano (Tines)
            const epiano = new Tone.Sampler({
                urls: {
                    C3: 'C3.mp3',
                    'D#3': 'Ds3.mp3',
                    'F#3': 'Fs3.mp3',
                    A3: 'A3.mp3',
                },
                baseUrl: 'https://tonejs.github.io/audio/casio/',
            }).toDestination();

            // Simple Synth for fallback/lead
            const synth = new Tone.PolySynth(Tone.Synth).toDestination();

            this.instruments.set('piano', piano);
            this.instruments.set('epiano', epiano);
            this.instruments.set('synth', synth);

            this.initialized = true;
        } catch (error) {
            console.error('AudioManager initialization failed:', error);
        }
    }

    getInstrument(name: string = 'piano'): any {
        return this.instruments.get(name) || this.instruments.get('piano');
    }

    registerModule(moduleId: string): void {
        if (!this.modules.has(moduleId)) {
            this.modules.set(moduleId, {
                activeNotes: new Set(),
                scheduledEvents: [],
            });
        }
    }

    unregisterModule(moduleId: string): void {
        const state = this.modules.get(moduleId);
        if (state) {
            // Stop all notes for this module
            state.activeNotes.forEach(note => this.stopNote(note));
            state.scheduledEvents.forEach(event => event.cancel());
            this.modules.delete(moduleId);
        }
    }

    playNote(
        note: string | number,
        duration: string = '8n',
        velocity: number = 0.8,
        instrument?: string
    ): void {
        const instName = instrument || this.currentGlobalInstrument;
        const inst = this.instruments.get(instName) || this.instruments.get('piano');
        if (!inst) return;

        const midiNote = typeof note === 'string' ? Tone.Frequency(note).toMidi() : note;
        const noteName = typeof note === 'number' ? Tone.Frequency(note, 'midi').toNote() : note;

        this.emitVisualization([midiNote]);
        inst.triggerAttackRelease(noteName, duration, undefined, velocity);

        // Clear visualization after duration
        const durSec = Tone.Time(duration).toSeconds();
        setTimeout(() => this.emitVisualization([]), durSec * 1000);
    }

    playChord(
        notes: (string | number)[],
        duration: string = '2n',
        velocity: number = 0.8,
        instrument?: string
    ): void {
        const instName = instrument || this.currentGlobalInstrument;
        const inst = this.instruments.get(instName) || this.instruments.get('piano');
        if (!inst) return;

        const midiNotes = notes.map(n =>
            typeof n === 'string' ? Tone.Frequency(n).toMidi() : n
        );
        const noteNames = notes.map(n =>
            typeof n === 'number' ? Tone.Frequency(n, 'midi').toNote() : n
        );

        this.emitVisualization(midiNotes);
        noteNames.forEach(note => {
            inst.triggerAttackRelease(note, duration, undefined, velocity);
        });

        // Clear visualization after duration
        const durSec = Tone.Time(duration).toSeconds();
        setTimeout(() => this.emitVisualization([]), durSec * 1000);
    }

    stopNote(note: string | number, instrument: string = 'piano'): void {
        const inst = this.instruments.get(instrument);
        if (!inst) return;

        const noteName = typeof note === 'number' ? Tone.Frequency(note, 'midi').toNote() : note;
        if ('triggerRelease' in inst) {
            (inst as any).triggerRelease(noteName);
        }
        this.emitVisualization([]);
    }

    stopAll(): void {
        this.instruments.forEach(inst => {
            if ('releaseAll' in inst) {
                (inst as any).releaseAll();
            }
        });
        Tone.Transport.stop();
        this.emitVisualization([]);
    }

    cleanup(): void {
        this.stopAll();
        this.modules.clear();
        this.visualizationCallback = null;
    }

    dispose(): void {
        this.cleanup();
        this.instruments.forEach(inst => inst.dispose());
        this.instruments.clear();
        this.initialized = false;
    }
}

export const audioManager = AudioManager.getInstance();
