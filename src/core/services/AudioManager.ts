import * as Tone from 'tone';
import { useSettingsStore } from '../store/useSettingsStore';
import { instrumentService, InstrumentName } from './InstrumentService';

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
                // Pre-load the new instrument
                this.preloadInstrument(state.instrument);
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
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }
            Tone.Transport.bpm.value = 120;

            // Load default instruments via InstrumentService
            const [piano, epiano, synth] = await Promise.all([
                instrumentService.getInstrument('piano-salamander'),
                instrumentService.getInstrument('epiano-casio'),
                instrumentService.getInstrument('synth-plumber')
            ]);

            this.instruments.set('piano', piano);
            this.instruments.set('epiano', epiano);
            this.instruments.set('synth', synth);

            this.initialized = true;
            console.log('AudioManager: Initialized with shared instruments');
        } catch (error) {
            console.error('AudioManager initialization failed:', error);
        }
    }

    private async preloadInstrument(name: string) {
        const mappedName = this.mapInstrumentName(name);
        const inst = await instrumentService.getInstrument(mappedName);
        this.instruments.set(name, inst);
    }

    private mapInstrumentName(name: string): InstrumentName | string {
        const mapping: Record<string, string> = {
            'piano': 'piano-salamander',
            'epiano': 'epiano-casio',
            'synth': 'synth-plumber',
            'guitar-nylon': 'guitar-nylon'
        };
        return mapping[name] || name;
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
        this.initialized = false;
    }
}

export const audioManager = AudioManager.getInstance();
