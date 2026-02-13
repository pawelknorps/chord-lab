import * as ort from 'onnxruntime-web';
import { INSTRUMENT_PROFILES, InstrumentProfile } from './instrumentProfiles';
import { classificationToPitch, computeRMS, MODEL_INPUT_SIZE, preprocessPcm } from './swiftF0Inference';

/**
 * SwiftF0Worker: Neural Pitch Inference (SOTA 2026)
 * Handles non-blocking inference for SwiftF0 model using WebGPU/WASM.
 * Instrument is set via manual dropdown (setProfile); fmin/fmax and threshold constrain search space (0ms classifier overhead).
 */

// Load ONNX Runtime WASM from CDN to avoid dev server returning HTML (wrong MIME) for .wasm requests
const ONNX_WASM_VERSION = '1.24.1';
if (typeof ort.env !== 'undefined') {
    if (ort.env.wasm) {
        ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ONNX_WASM_VERSION}/dist/`;
    }
    ort.env.logLevel = 'error';
}

let session: ort.InferenceSession | null = null;
/** Resolves when initSession() has finished (success or failure). Ensures polling does not run before model is loaded. */
let sessionReady: Promise<void> = Promise.resolve();
let sessionReadyResolve: (() => void) | null = null;
let currentProfile: InstrumentProfile = INSTRUMENT_PROFILES.general;
/** Cached input tensor name from session (model may use "input", "input_audio", "audio", etc.). */
let sessionInputName: string = 'input_audio';

/** When true, postMessage('timing', { preprocessMs, inferenceMs, totalMs }) each frame (dev-only, REQ-SF0-S01). */
let enableTiming = false;
/** When false, skip CrepeStabilizer and post raw pitch (optimization / A-B test). */
let useStabilizer = true;

// Pre-allocated buffers for inference (REQ-SF0-S02: zero allocations in hot path)
const inputTensor = new Float32Array(MODEL_INPUT_SIZE);
/** Reused input tensor wrapper; buffer updated in place each frame. */
const inputTensorOrt = new ort.Tensor('float32', inputTensor, [1, MODEL_INPUT_SIZE]);

/**
 * Initialize the ONNX session.
 */
async function initSession() {
    sessionReady = new Promise<void>((resolve) => {
        sessionReadyResolve = resolve;
    });
    try {
        // RESEARCH §2: ORT tuning — WebGPU first, WASM fallback; enableCpuMemArena, numThreads for wasm
        const options: ort.InferenceSession.SessionOptions = {
            executionProviders: ['webgpu', 'wasm'],
            graphOptimizationLevel: 'all',
            enableCpuMemArena: true,
            extra: {
                session: { numThreads: 4 },
            } as Record<string, unknown>,
        };

        session = await ort.InferenceSession.create('/models/model.onnx', options);
        sessionInputName = session.inputNames?.[0] ?? 'input_audio';
        console.log('SwiftF0: Session initialized with WebGPU/WASM, input:', sessionInputName);
    } catch (err) {
        console.error('SwiftF0: Failed to load model', err);
    } finally {
        if (sessionReadyResolve) {
            sessionReadyResolve();
            sessionReadyResolve = null;
        }
    }
}

/**
 * Run inference on a PCM block.
 */
async function runInference(pcm: Float32Array): Promise<{ pitch: number; confidence: number; rms: number }> {
    if (!session) return { pitch: 0, confidence: 0, rms: 0 };

    const t0 = enableTiming ? performance.now() : 0;

    const rms = computeRMS(pcm);

    preprocessPcm(
        pcm,
        inputTensor,
        currentProfile.targetRms,
        currentProfile.minRmsForGain,
        currentProfile.maxGain
    );

    const t1 = enableTiming ? performance.now() : 0;

    const feeds = { [sessionInputName]: inputTensorOrt };
    const results = await session.run(feeds);

    const t2 = enableTiming ? performance.now() : 0;
    if (enableTiming && t2 > 0) {
        self.postMessage({
            type: 'timing',
            data: {
                preprocessMs: t1 - t0,
                inferenceMs: t2 - t1,
                totalMs: t2 - t0,
            },
        });
    }

    const outNames = session.outputNames;
    const classificationTensor = outNames[0] ? results[outNames[0]] : undefined;
    const regressionTensor = outNames[1] ? results[outNames[1]] : undefined;
    const classification = classificationTensor?.data as Float32Array | undefined;
    const regression = regressionTensor?.data as Float32Array | undefined;

    if (!classification) return { pitch: 0, confidence: 0, rms: 0 };
    const { pitch, confidence } = classificationToPitch(classification, currentProfile, regression);
    return { pitch, confidence, rms };
}

// Worker message handling
import { CrepeStabilizer, type CrepeStabilizerMode } from './CrepeStabilizer';

let stabilizer: CrepeStabilizer | null = null;
/** Used when creating stabilizer in startPollingLoop. */
let stabilizerMode: CrepeStabilizerMode = 'full';
let isPolling = false;

/**
 * Polling loop that reads PCM from SharedArrayBuffer and runs inference.
 * Waits for the ONNX session to be ready before running inference so mic notes are not stuck at 0.
 */
async function startPollingLoop(pcmSab: SharedArrayBuffer, pitchSab?: SharedArrayBuffer) {
    const pcmView = new Float32Array(pcmSab);
    const pitchView = pitchSab ? new Float32Array(pitchSab) : null;
    isPolling = true;

    await sessionReady;
    if (!session) {
        console.warn('SwiftF0: Polling started but model failed to load; pitch will stay 0.');
    }

    stabilizer = useStabilizer
        ? new CrepeStabilizer({
            profileId: currentProfile.id,
            mode: stabilizerMode,
            minConfidence: currentProfile.confidenceThreshold, // so guitar (0.58) etc. can update stabilizer
        })
        : null;

    const cycleMs = 8; // target cycle (hop size 128 @ 16kHz)
    while (isPolling) {
        const t0 = performance.now();
        const result = await runInference(pcmView);
        const elapsed = performance.now() - t0;

        const finalPitch = stabilizer
            ? stabilizer.process(result.pitch, result.confidence, result.rms)
            : result.pitch;

        if (pitchView) {
            // REQ-AG-02: Direct SAB write for zero-copy
            pitchView[0] = finalPitch;
            pitchView[1] = result.confidence;

            // REQ-AG-05: Accurate latency monitoring
            const captureTime = pitchView[4];
            const now = performance.now();
            if (captureTime > 0) {
                pitchView[5] = now - captureTime;
            }
            pitchView[4] = now; // lastUpdated
        } else {
            // Fallback to postMessage if pitchSab not provided
            self.postMessage({ type: 'result', data: { pitch: finalPitch, confidence: result.confidence } });
        }

        // REQ-SF0-S04: sleep only the remainder of the target cycle
        const sleepMs = Math.max(0, cycleMs - elapsed);
        await new Promise(resolve => setTimeout(resolve, sleepMs));
    }
}

self.onmessage = async (e) => {
    const { type, data } = e.data;

    if (type === 'init') {
        await initSession();
        self.postMessage({ type: 'ready' });
    } else if (type === 'setProfile') {
        currentProfile = INSTRUMENT_PROFILES[data] || INSTRUMENT_PROFILES.general;
        if (stabilizer) stabilizer.setProfile(currentProfile.id);
    } else if (type === 'setTiming') {
        enableTiming = Boolean(data);
    } else if (type === 'setStabilizer') {
        useStabilizer = Boolean(data);
        if (stabilizer && !useStabilizer) stabilizer = null;
    } else if (type === 'setStabilizerMode') {
        stabilizerMode = data === 'light' ? 'light' : 'full';
        if (stabilizer) stabilizer = new CrepeStabilizer({ profileId: currentProfile.id, mode: stabilizerMode });
    } else if (type === 'startPolling') {
        // data can be pcmSab or { pcmSab, pitchSab }
        if (data instanceof SharedArrayBuffer) {
            void startPollingLoop(data);
        } else {
            void startPollingLoop(data.pcmSab, data.pitchSab);
        }
    } else if (type === 'stopPolling') {
        isPolling = false;
    }
};
