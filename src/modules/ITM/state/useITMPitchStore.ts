import { create } from 'zustand';
import { createPitchMemory, isPitchMemorySupported, createPcmMemory } from '../../../core/audio/PitchMemory';
import { getPitchAudioContext, closePitchAudioContext } from '../../../core/audio/sharedAudioContext';

const WORKLET_URL = '/worklets/pitch-processor.js';

/** Min confidence to count as "first pitch" for latency measurement (match worklet gate). */
const LATENCY_CONFIDENCE_THRESHOLD = 0.92;

export interface PitchStoreOptions {
    /** Run inference every N blocks (1 = every block, 2 = low CPU). Default 1. */
    hopBlocks?: number;
    /** Enable SwiftF0 neural pitch engine (2026 SOTA). */
    useSwiftF0?: boolean;
}

interface PitchState {
    isReady: boolean;
    stream: MediaStream | null;
    sharedBuffer: Float32Array | null;
    pcmBuffer: Float32Array | null;
    audioContext: AudioContext | null;
    contextOwned: boolean;
    mediaStreamSource: MediaStreamAudioSourceNode | null;
    workletNode: AudioWorkletNode | null;
    swiftF0Worker: Worker | null;
    neuralPitch: { frequency: number; clarity: number } | null;

    /** Start time when measuring latency (performance.now()); null when not measuring. */
    measurementStartTime: number | null;
    /** Last measured latency (ms) from start to first confident SAB update; null until measured. */
    lastLatencyMs: number | null;

    initialize: (stream: MediaStream, instrumentId?: string, options?: PitchStoreOptions) => Promise<void>;
    /** Disconnect nodes and clear state; does not close the pitch context (safe to call before re-init). */
    _disconnectAndClearState: () => void;
    /** Full cleanup: disconnect, clear state, and close the pitch context. Call when mic is turned off. */
    cleanup: () => void;
    getLatestPitch: () => { frequency: number; clarity: number } | null;
    /** Start latency measurement; next confident pitch will set lastLatencyMs. */
    startLatencyMeasurement: () => void;
    /** Stop measurement without recording. */
    stopLatencyMeasurement: () => void;
}

/**
 * Singleton state for the High-Performance Ear (CREPE-WASM-ready, 2026).
 * Uses SharedArrayBuffer + Audio Worklet; pitch written by worklet, read by main thread (zero-latency).
 * Now supports SwiftF0 neural offloading to a Web Worker.
 */
export const useITMPitchStore = create<PitchState>((set, get) => ({
    isReady: false,
    stream: null,
    sharedBuffer: null,
    pcmBuffer: null,
    audioContext: null,
    contextOwned: false,
    mediaStreamSource: null,
    workletNode: null,
    swiftF0Worker: null,
    neuralPitch: null,
    measurementStartTime: null,
    lastLatencyMs: null,

    initialize: async (stream: MediaStream, instrumentId: string = 'auto', options?: PitchStoreOptions) => {
        if (get().isReady && get().stream === stream) return;

        get()._disconnectAndClearState();

        if (!isPitchMemorySupported()) {
            console.warn('[ITM] SharedArrayBuffer not available. Enable COOP/COEP for high-performance pitch.');
            return;
        }

        try {
            const { sab, view: sharedBuffer } = createPitchMemory();
            const { sab: pcmSab, view: pcmBuffer } = createPcmMemory();
            const { context: audioContext, owned: contextOwned } = getPitchAudioContext();
            const hopBlocks = Math.max(1, options?.hopBlocks ?? 1);

            if (audioContext.state === 'suspended') await audioContext.resume();

            await audioContext.audioWorklet.addModule(WORKLET_URL);

            const mediaStreamSource = audioContext.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(audioContext, 'pitch-processor', {
                processorOptions: {
                    sab,
                    pcmSab,
                    sampleRate: audioContext.sampleRate,
                    instrumentId,
                    hopBlocks,
                },
            });

            // Initialize SwiftF0 Worker if requested
            let swiftF0Worker: Worker | null = null;
            if (options?.useSwiftF0) {
                swiftF0Worker = new Worker(new URL('../../../core/audio/SwiftF0Worker.ts', import.meta.url), { type: 'module' });
                swiftF0Worker.onmessage = (e) => {
                    const { type, data } = e.data;
                    if (type === 'result') {
                        // Throttle state update implicitly by just updating the local variable
                        // getLatestPitch will favor this if present
                        set({ neuralPitch: { frequency: data.pitch, clarity: data.confidence } });
                    }
                };
                swiftF0Worker.postMessage({ type: 'init' });
                swiftF0Worker.postMessage({ type: 'setProfile', data: instrumentId });

                // Set up the polling loop for the worker since it can't "watch" the SAB directly
                // without an Atomic or loop. We'll post the SAB once and let it poll.
                swiftF0Worker.postMessage({ type: 'startPolling', data: pcmSab });
            }

            mediaStreamSource.connect(workletNode);

            set({
                isReady: true,
                stream,
                sharedBuffer,
                pcmBuffer,
                audioContext,
                contextOwned,
                mediaStreamSource,
                workletNode,
                swiftF0Worker,
            });

            console.log('[ITM] High-Performance Pitch Store Ready. SwiftF0 active:', !!swiftF0Worker);
        } catch (err) {
            console.error('[ITM] Failed to initialize Pitch Store:', err);
        }
    },

    _disconnectAndClearState: () => {
        const { mediaStreamSource, workletNode, swiftF0Worker } = get();
        if (mediaStreamSource) mediaStreamSource.disconnect();
        if (workletNode) workletNode.disconnect();
        if (swiftF0Worker) swiftF0Worker.terminate();
        set({
            isReady: false,
            stream: null,
            sharedBuffer: null,
            pcmBuffer: null,
            audioContext: null,
            contextOwned: false,
            mediaStreamSource: null,
            workletNode: null,
            swiftF0Worker: null,
            neuralPitch: null,
            measurementStartTime: null,
        });
    },

    cleanup: () => {
        get()._disconnectAndClearState();
        closePitchAudioContext();
    },

    getLatestPitch: () => {
        const { sharedBuffer, neuralPitch, measurementStartTime } = get();

        // Favor Neural (SwiftF0) if available and confident
        if (neuralPitch && neuralPitch.clarity > 0.8) {
            return neuralPitch;
        }

        if (!sharedBuffer) return null;

        const frequency = sharedBuffer[0];
        const clarity = sharedBuffer[1];

        if (measurementStartTime !== null && frequency > 0 && clarity >= LATENCY_CONFIDENCE_THRESHOLD) {
            const lastLatencyMs = performance.now() - measurementStartTime;
            set({ lastLatencyMs, measurementStartTime: null });
        }

        return { frequency, clarity };
    },

    startLatencyMeasurement: () => {
        set({ measurementStartTime: performance.now(), lastLatencyMs: null });
    },

    stopLatencyMeasurement: () => {
        set({ measurementStartTime: null });
    },
}));
