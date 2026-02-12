/**
 * Phase 22: Soft-knee compressor for jazz trio (REQ-HIFI-03, REQ-HIFI-04).
 * Runs in Audio Worklet; params via processorOptions. Logarithmic knee for transparent bass/piano.
 */
const EPS = 1e-6;
const MIN_ENV = 1e-6;

function linToDb(lin) {
  return lin <= 0 ? -100 : 20 * Math.log10(lin);
}

function dbToLin(db) {
  return Math.pow(10, db / 20);
}

class JazzCompressorProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor(options) {
    super();
    const opts = options?.processorOptions || {};
    this.thresholdDb = typeof opts.threshold === 'number' ? opts.threshold : -18;
    this.ratio = Math.max(1.001, typeof opts.ratio === 'number' ? opts.ratio : 4);
    this.kneeDb = Math.max(0, typeof opts.knee === 'number' ? opts.knee : 30);
    const attackSec = typeof opts.attack === 'number' ? opts.attack : 0.005;
    const releaseSec = typeof opts.release === 'number' ? opts.release : 0.15;
    const sr = sampleRate || 44100;
    this.attackCoeff = Math.exp(-1 / (attackSec * sr));
    this.releaseCoeff = Math.exp(-1 / (releaseSec * sr));
    this.envelope = MIN_ENV;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!input || !output) return true;

    const len = input.length;
    const thresh = this.thresholdDb;
    const ratio = this.ratio;
    const knee = this.kneeDb;
    const kLo = thresh - knee / 2;
    const kHi = thresh + knee / 2;
    const attack = this.attackCoeff;
    const release = this.releaseCoeff;
    let env = this.envelope;

    for (let i = 0; i < len; i++) {
      const s = input[i];
      const peak = Math.abs(s);
      if (peak > env) env = attack * env + (1 - attack) * peak;
      else env = release * env + (1 - release) * peak;
      const envDb = linToDb(Math.max(env, MIN_ENV));
      let gainDb = 0;
      if (envDb > kHi) {
        gainDb = (thresh + (envDb - thresh) / ratio) - envDb;
      } else if (envDb > kLo) {
        const t = (envDb - kLo) / (knee + EPS);
        const ratioEff = 1 + (ratio - 1) * t;
        gainDb = (thresh + (envDb - thresh) / ratioEff) - envDb;
      }
      const gainLin = dbToLin(gainDb);
      output[i] = input[i] * gainLin;
    }
    this.envelope = Math.max(env, MIN_ENV);
    return true;
  }
}

registerProcessor('jazz-compressor-processor', JazzCompressorProcessor);
