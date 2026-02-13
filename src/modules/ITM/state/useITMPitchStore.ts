import { create } from 'zustand';
import { createPitchMemory, isPitchMemorySupported, createPcmMemory } from '../../../core/audio/PitchMemory';
import { getPitchAudioContext, closePitchAudioContext } from '../../../core/audio/sharedAudioContext';

const WORKLET_URL = '/worklets/pitch-processor.js';

/** Min confidence to count as "first pitch" for latency measurement (match worklet gate). */
const LATENCY_CONFIDENCE_THRESHOLD = 0.92;

export interface PitchStoreOptions {
    /** Run inference every N blocks (1 = every block, 2 = low CPU). Default 1. */
    hopBlocks?: number;
    /** Enable SwiftF0 neural pitch engine (2026 SOTA). Default true. */
    useSwiftF0?: boolean;
    /** Dev-only: enable SwiftF0 timing (postMessage 'timing' each frame; log when DEV). REQ-SF0-S01 */
    enableTiming?: boolean;
    /** When false, skip post-processing (CrepeStabilizer). Raw SwiftF0 pitch only. Default true. */
    useStabilizer?: boolean;
    /** When 'light', use only confidence gate (no median/hysteresis); lower CPU. Ignored if useStabilizer is false. */
    stabilizerMode?: 'full' | 'light';
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
    /** MPM (autocorrelation) fallback when SwiftF0 is disabled; null when using SwiftF0 only. */
    mpmWorker: Worker | null;

    /** Start time when measuring latency (performance.now()); null when not measuring. */
    measurementStartTime: number | null;
    /** Last measured latency (ms) from start to first confident SAB update; null until measured. */
    lastLatencyMs: number | null;
    /** User-selected instrument profile id (e.g. 'general', 'electricGuitar'). */
    selectedInstrumentId: string;

    initialize: (stream: MediaStream, instrumentId?: string, options?: PitchStoreOptions) => Promise<void>;
    /** Update instrument profile and send to SwiftF0 worker (fmin/fmax/threshold). */
    setInstrumentProfile: (profileId: string) => void;
    /** Disconnect nodes and clear state; does not close the pitch context (safe to call before re-init). */
    _disconnectAndClearState: () => void;
    /** Full cleanup: disconnect, clear state, and close the pitch context. Call when mic is turned off. */
    cleanup: () => void;
    getLatestPitch: () => { frequency: number; clarity: number; rms: number; onset: number } | null;
    /** Start latency measurement; next confident pitch will set lastLatencyMs. */
    startLatencyMeasurement: () => void;
    /** Stop measurement without recording. */
    stopLatencyMeasurement: () => void;
}

/**
 * Singleton state for the High-Performance Ear (SwiftF0, 2026).
 * Pitch detection uses SwiftF0 neural engine by default; CREPE is not used anywhere.
 * Uses SharedArrayBuffer + Audio Worklet; pitch written by worklet, read by main thread (zero-latency).
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
    mpmWorker: null,
    measurementStartTime: null,
    lastLatencyMs: null,
    selectedInstrumentId: 'general',

    initialize: async (stream: MediaStream, instrumentId: string = 'general', options?: PitchStoreOptions) => {
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
                    performanceOffset: performance.now() - audioContext.currentTime * 1000,
                },
            });

            // SwiftF0 on by default (full stabilizer mode). Wait for worker 'ready' before startPolling so model is loaded first.
            let swiftF0Worker: Worker | null = null;
            if (options?.useSwiftF0 !== false) {
                swiftF0Worker = new Worker(new URL('../../../core/audio/SwiftF0Worker.ts', import.meta.url), { type: 'module' });
                const readyPromise = new Promise<void>((resolve) => {
                    const onMsg = (e: MessageEvent) => {
                        if (e.data?.type === 'ready') {
                            swiftF0Worker!.removeEventListener('message', onMsg);
                            resolve();
                        }
                    };
                    swiftF0Worker!.addEventListener('message', onMsg);
                });
                swiftF0Worker.onmessage = (e) => {
                    const { type, data } = e.data;
                    if (type === 'timing' && import.meta.env.DEV) {
                        console.log('[SwiftF0 timing]', data);
                    }
                };
                swiftF0Worker.postMessage({ type: 'init' });
                await readyPromise;
                swiftF0Worker.postMessage({ type: 'setProfile', data: instrumentId });
                if (options?.enableTiming) {
                    swiftF0Worker.postMessage({ type: 'setTiming', data: true });
                }
                swiftF0Worker.postMessage({ type: 'setStabilizer', data: options?.useStabilizer !== false });
                swiftF0Worker.postMessage({ type: 'setStabilizerMode', data: options?.stabilizerMode ?? 'full' });

                // REQ-AG-02: Zero-copy feedback loop (passing both pcm and pitch buffers)
                swiftF0Worker.postMessage({ type: 'startPolling', data: { pcmSab, pitchSab: sab } });
            }

            // MPM only when SwiftF0 is disabled (fallback). 
            let mpmWorker: Worker | null = null;
            if (options?.useSwiftF0 === false) {
                mpmWorker = new Worker(new URL('../../../core/audio/MpmWorker.ts', import.meta.url), { type: 'module' });
                mpmWorker.postMessage({ type: 'init', data: { sab, pcmSab, instrumentId } });
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
                mpmWorker,
                selectedInstrumentId: instrumentId,
            });

            console.log('[ITM] High-Performance Pitch Store Ready. SwiftF0 only:', !!swiftF0Worker, 'MPM fallback:', !!mpmWorker);
        } catch (err) {
            console.error('[ITM] Failed to initialize Pitch Store:', err);
        }
    },

    _disconnectAndClearState: () => {
        const { mediaStreamSource, workletNode, swiftF0Worker, mpmWorker } = get();
        if (mediaStreamSource) mediaStreamSource.disconnect();
        if (workletNode) workletNode.disconnect();
        if (swiftF0Worker) swiftF0Worker.terminate();
        if (mpmWorker) {
            mpmWorker.postMessage({ type: 'stop' });
            mpmWorker.terminate();
        }
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
            mpmWorker: null,
            measurementStartTime: null,
        });
    },

    cleanup: () => {
        get()._disconnectAndClearState();
        closePitchAudioContext();
    },

    getLatestPitch: () => {
        const { sharedBuffer, measurementStartTime } = get();

        if (!sharedBuffer) return null;

        const frequency = sharedBuffer[0];
        const clarity = sharedBuffer[1];
        const rms = sharedBuffer[2];
        const onset = sharedBuffer[3];
        const latencyScore = sharedBuffer[5];

        // REQ-AG-05: Accurate latency monitoring using SAB timestamp
        if (measurementStartTime !== null && frequency > 0 && clarity >= LATENCY_CONFIDENCE_THRESHOLD) {
            const lastLatencyMs = performance.now() - measurementStartTime;
            set({ lastLatencyMs, measurementStartTime: null });
        }

        return { frequency, clarity, rms, onset, latencyScore };
    },

    startLatencyMeasurement: () => {
        set({ measurementStartTime: performance.now(), lastLatencyMs: null });
    },

    stopLatencyMeasurement: () => {
        set({ measurementStartTime: null });
    },

    setInstrumentProfile: (profileId: string) => {
        const { swiftF0Worker } = get();
        set({ selectedInstrumentId: profileId });
        if (swiftF0Worker) swiftF0Worker.postMessage({ type: 'setProfile', data: profileId });
    },
}));
