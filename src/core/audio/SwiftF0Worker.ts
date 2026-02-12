import * as ort from 'onnxruntime-web';
import { INSTRUMENT_PROFILES, InstrumentProfile } from './instrumentProfiles';

/**
 * SwiftF0Worker: Neural Pitch Inference (SOTA 2026)
 * Handles non-blocking inference for SwiftF0 model using WebGPU/WASM.
 */

let session: ort.InferenceSession | null = null;
let currentProfile: InstrumentProfile = INSTRUMENT_PROFILES.auto;

// Pre-allocated buffers for inference
const MODEL_INPUT_SIZE = 1024;
const inputTensor = new Float32Array(MODEL_INPUT_SIZE);

/**
 * Initialize the ONNX session.
 */
async function initSession() {
    try {
        // Attempt WebGPU first for 2026 performance, fallback to WASM
        const options: ort.InferenceSession.SessionOptions = {
            executionProviders: ['webgpu', 'wasm'],
            graphOptimizationLevel: 'all',
        };

        session = await ort.InferenceSession.create('/models/swiftf0.onnx', options);
        console.log('SwiftF0: Session initialized with WebGPU/WASM');
    } catch (err) {
        console.error('SwiftF0: Failed to load model', err);
    }
}

/**
 * Run inference on a PCM block.
 */
async function runInference(pcm: Float32Array): Promise<{ pitch: number; confidence: number }> {
    if (!session) return { pitch: 0, confidence: 0 };

    // 1. Logarithmic Compression (mimic human hearing)
    // Input pcm is expected to be raw STFT or time-domain. 
    // User spec: Apply log(1 + 10 * magnitude)
    for (let i = 0; i < pcm.length; i++) {
        inputTensor[i] = Math.log(1 + 10 * Math.abs(pcm[i]));
    }

    // 2. Prepare Tensor
    const tensor = new ort.Tensor('float32', inputTensor, [1, 1, MODEL_INPUT_SIZE]);

    // 3. Inference using Bins 3-134 (Goldilocks zone: 46.8Hz to 2093.7Hz)
    const feeds = { input: tensor };
    const results = await session.run(feeds);

    // 4. Output Processing: Classification + Regression
    // Assuming 'classification' and 'regression' output names
    const classification = results.classification.data as Float32Array;
    const regression = results.regression?.data as Float32Array | undefined;

    // Find peak bin
    let maxVal = -1;
    let peakBin = -1;
    for (let i = 3; i <= 134; i++) {
        if (classification[i] > maxVal) {
            maxVal = classification[i];
            peakBin = i;
        }
    }

    if (peakBin === -1 || maxVal < 0.5) {
        return { pitch: 0, confidence: maxVal };
    }

    // Calculate frequency based on bin index
    // Note: Bin-to-Hz mapping depends on model training (e.g. log-spaced)
    // Placeholder mapping:
    const baseFreq = 46.8 * Math.pow(2, (peakBin - 3) / 20); // 20 bins per octave

    // Apply Regression Head for sub-cent accuracy
    const offset = regression ? regression[peakBin] : 0;
    const stabilizedFreq = baseFreq * Math.pow(2, offset / 1200); // offset in cents

    return { pitch: stabilizedFreq, confidence: maxVal };
}

// Worker message handling
import { CrepeStabilizer } from './CrepeStabilizer';

let stabilizer: CrepeStabilizer | null = null;
let isPolling = false;

/**
 * Polling loop that reads PCM from SharedArrayBuffer and runs inference.
 */
async function startPollingLoop(pcmSab: SharedArrayBuffer) {
    const pcmView = new Float32Array(pcmSab);
    isPolling = true;

    // Initialize stabilizer with our current profile
    stabilizer = new CrepeStabilizer({ profileId: currentProfile.id });

    while (isPolling) {
        // User spec: Run on PCM from SAB
        const result = await runInference(pcmView);

        if (result.pitch > 0 && stabilizer) {
            // 5. User Spec: Instrument-Specific Hysteresis Profiles
            const stabilized = stabilizer.process(result.pitch, result.confidence, 0 /* RMS placeholder */);

            self.postMessage({
                type: 'result',
                data: { pitch: stabilized, confidence: result.confidence }
            });
        }

        // Sleep for approx 8ms (hop size 128 @ 16kHz)
        await new Promise(resolve => setTimeout(resolve, 8));
    }
}

self.onmessage = async (e) => {
    const { type, data } = e.data;

    if (type === 'init') {
        await initSession();
        self.postMessage({ type: 'ready' });
    } else if (type === 'setProfile') {
        currentProfile = INSTRUMENT_PROFILES[data] || INSTRUMENT_PROFILES.auto;
        if (stabilizer) stabilizer.setProfile(currentProfile.id);
    } else if (type === 'startPolling') {
        void startPollingLoop(data);
    } else if (type === 'stopPolling') {
        isPolling = false;
    }
};
