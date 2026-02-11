import { create } from 'zustand';
import { createPitchMemory, isPitchMemorySupported } from '../../../core/audio/PitchMemory';

const WORKLET_URL = '/worklets/pitch-processor.js';

interface PitchState {
    isReady: boolean;
    stream: MediaStream | null;
    sharedBuffer: Float32Array | null;
    audioContext: AudioContext | null;
    workletNode: AudioWorkletNode | null;
    initialize: (stream: MediaStream) => Promise<void>;
    cleanup: () => void;
    getLatestPitch: () => { frequency: number; clarity: number } | null;
}

/**
 * Singleton state for the High-Performance Ear (CREPE-WASM-ready, 2026).
 * Uses SharedArrayBuffer + Audio Worklet; pitch written by worklet, read by main thread (zero-latency).
 */
export const useITMPitchStore = create<PitchState>((set, get) => ({
    isReady: false,
    stream: null,
    sharedBuffer: null,
    audioContext: null,
    workletNode: null,

    initialize: async (stream: MediaStream) => {
        if (get().isReady && get().stream === stream) return;

        get().cleanup();

        if (!isPitchMemorySupported()) {
            console.warn('[ITM] SharedArrayBuffer not available. Enable COOP/COEP for high-performance pitch.');
            return;
        }

        try {
            const { sab, view: sharedBuffer } = createPitchMemory();
            const audioContext = new AudioContext({
                latencyHint: 'interactive',
                sampleRate: 44100,
            });

            await audioContext.audioWorklet.addModule(WORKLET_URL);

            const source = audioContext.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(audioContext, 'pitch-processor', {
                processorOptions: {
                    sab,
                    sampleRate: audioContext.sampleRate,
                },
            });

            source.connect(workletNode);

            set({
                isReady: true,
                stream,
                sharedBuffer,
                audioContext,
                workletNode,
            });

            console.log('[ITM] High-Performance Pitch Store Ready (SAB + Worklet)');
        } catch (err) {
            console.error('[ITM] Failed to initialize Pitch Store:', err);
        }
    },

    cleanup: () => {
        const { audioContext, workletNode } = get();
        if (workletNode) workletNode.disconnect();
        if (audioContext) void audioContext.close();

        set({
            isReady: false,
            stream: null,
            sharedBuffer: null,
            audioContext: null,
            workletNode: null,
        });
    },

    getLatestPitch: () => {
        const { sharedBuffer } = get();
        if (!sharedBuffer) return null;
        return {
            frequency: sharedBuffer[0],
            clarity: sharedBuffer[1],
        };
    },
}));
