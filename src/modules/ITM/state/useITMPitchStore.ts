import { create } from 'zustand';
import { pitchWorkletCode } from '../audio/pitchWorkletCode';

interface PitchState {
    isReady: boolean;
    stream: MediaStream | null;
    sharedBuffer: Float32Array | null;
    audioContext: AudioContext | null;
    workletNode: AudioWorkletNode | null;
    initialize: (stream: MediaStream) => Promise<void>;
    cleanup: () => void;
    getLatestPitch: () => { frequency: number; clarity: number; timestamp: number } | null;
}

/**
 * Singleton state for the High-Performance Pitch Engine (ITM 2026).
 * Manages a single AudioWorklet and SharedArrayBuffer for the entire app.
 */
export const useITMPitchStore = create<PitchState>((set, get) => ({
    isReady: false,
    stream: null,
    sharedBuffer: null,
    audioContext: null,
    workletNode: null,

    initialize: async (stream: MediaStream) => {
        if (get().isReady && get().stream === stream) return;

        // Cleanup old if exists
        get().cleanup();

        try {
            const audioContext = new AudioContext({
                latencyHint: 'interactive',
                sampleRate: 44100,
            });

            if (typeof SharedArrayBuffer === 'undefined') {
                console.warn('[ITM] SharedArrayBuffer is not available. High-performance pitch detection requires COOP/COEP headers and a secure context.');
                return;
            }

            const sab = new SharedArrayBuffer(3 * Float32Array.BYTES_PER_ELEMENT);
            const sharedBuffer = new Float32Array(sab);

            const blob = new Blob([pitchWorkletCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            await audioContext.audioWorklet.addModule(url);

            const source = audioContext.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(audioContext, 'pitch-processor');

            workletNode.port.postMessage({
                type: 'init',
                buffer: sab,
                sampleRate: audioContext.sampleRate
            });

            source.connect(workletNode);
            // pitchNode.connect(audioContext.destination); // Don't monitor mic

            set({
                isReady: true,
                stream,
                sharedBuffer,
                audioContext,
                workletNode
            });

            console.log('[ITM] High-Performance Pitch Store Ready');
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
            workletNode: null
        });
    },

    getLatestPitch: () => {
        const { sharedBuffer } = get();
        if (!sharedBuffer) return null;
        return {
            frequency: sharedBuffer[0],
            clarity: sharedBuffer[1],
            timestamp: sharedBuffer[2]
        };
    }
}));
