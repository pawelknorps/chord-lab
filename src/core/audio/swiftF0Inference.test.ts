import { describe, it, expect } from 'vitest';
import {
    classificationToPitch,
    computeRMS,
    preprocessPcm,
    binToBaseFreq,
    BIN_BASE,
    BIN_MAX,
    BASE_FREQ_HZ,
} from './swiftF0Inference';
import { INSTRUMENT_PROFILES } from './instrumentProfiles';

describe('swiftF0Inference', () => {
    describe('computeRMS', () => {
        it('returns 0 for empty buffer', () => {
            expect(computeRMS(new Float32Array(0))).toBe(0);
        });
        it('returns 0 for silence', () => {
            expect(computeRMS(new Float32Array(1024))).toBe(0);
        });
        it('returns correct RMS for constant signal', () => {
            const buf = new Float32Array(100);
            buf.fill(0.1);
            expect(computeRMS(buf)).toBeCloseTo(0.1, 5);
        });
        it('returns correct RMS for alternating ±1', () => {
            const buf = new Float32Array(4);
            buf[0] = 1;
            buf[1] = -1;
            buf[2] = 1;
            buf[3] = -1;
            expect(computeRMS(buf)).toBeCloseTo(1, 5);
        });
    });

    describe('preprocessPcm', () => {
        it('writes log-compressed values into output', () => {
            const pcm = new Float32Array(4);
            pcm[0] = 0.5;
            pcm[1] = -0.3;
            pcm[2] = 0;
            pcm[3] = 0.1;
            const out = new Float32Array(4);
            const gain = preprocessPcm(pcm, out);
            expect(gain).toBe(1);
            expect(out[0]).toBeCloseTo(Math.log(1 + 10 * 0.5), 4);
            expect(out[1]).toBeCloseTo(Math.log(1 + 10 * 0.3), 4);
            expect(out[2]).toBe(0);
            expect(out[3]).toBeCloseTo(Math.log(1 + 10 * 0.1), 4);
        });
        it('applies gain when RMS is below target', () => {
            const pcm = new Float32Array(1024);
            pcm.fill(0.01);
            const out = new Float32Array(1024);
            const gain = preprocessPcm(pcm, out, 0.08, 0.003, 6);
            expect(gain).toBeGreaterThan(1);
            expect(gain).toBeLessThanOrEqual(6);
        });
        it('does not apply gain when RMS is above target', () => {
            const pcm = new Float32Array(1024);
            pcm.fill(0.2);
            const out = new Float32Array(1024);
            const gain = preprocessPcm(pcm, out, 0.08, 0.003, 6);
            expect(gain).toBe(1);
        });
    });

    describe('binToBaseFreq', () => {
        it('bin 3 is ~46.8 Hz', () => {
            expect(binToBaseFreq(3)).toBeCloseTo(BASE_FREQ_HZ, 2);
        });
        it('bin 23 is ~93.6 Hz (one octave up)', () => {
            expect(binToBaseFreq(23)).toBeCloseTo(BASE_FREQ_HZ * 2, 1);
        });
        it('A4 (440 Hz) is near bin 67–68', () => {
            const f67 = binToBaseFreq(67);
            const f68 = binToBaseFreq(68);
            expect(f67).toBeLessThan(440);
            expect(f68).toBeGreaterThan(440);
            expect(Math.abs(f67 - 440) < 30 || Math.abs(f68 - 440) < 30).toBe(true);
        });
    });

    describe('classificationToPitch', () => {
        const general = INSTRUMENT_PROFILES.general;
        const bass = INSTRUMENT_PROFILES.bassGuitar;
        const guitar = INSTRUMENT_PROFILES.electricGuitar;

        function makeClassification(peakBin: number, peakVal: number, length: number = 200): Float32Array {
            const c = new Float32Array(length);
            for (let i = BIN_BASE; i <= BIN_MAX; i++) {
                c[i] = i === peakBin ? peakVal : 0.01;
            }
            return c;
        }

        it('returns pitch 0 when classification too short', () => {
            const c = new Float32Array(50);
            c[10] = 0.9;
            const r = classificationToPitch(c, general);
            expect(r.pitch).toBe(0);
            expect(r.confidence).toBe(0);
        });

        it('returns pitch 0 when peak below profile confidenceThreshold', () => {
            const c = makeClassification(50, 0.3);
            const r = classificationToPitch(c, general);
            expect(r.pitch).toBe(0);
            expect(r.confidence).toBeCloseTo(0.3, 2);
        });

        it('returns correct frequency for single peak bin (no regression)', () => {
            const peakBin = 50;
            const expectedHz = binToBaseFreq(50);
            const c = makeClassification(peakBin, 0.9);
            const r = classificationToPitch(c, general);
            expect(r.pitch).toBeCloseTo(expectedHz, 0);
            expect(r.confidence).toBeCloseTo(0.9, 2);
            expect(r.peakBin).toBe(peakBin);
        });

        it('clamps to profile minHz/maxHz', () => {
            const lowBin = 0;
            const c = new Float32Array(200);
            c[3] = 0.95;
            const rLow = classificationToPitch(c, bass);
            expect(rLow.pitch).toBeGreaterThanOrEqual(bass.minHz);
            expect(rLow.pitch).toBeLessThanOrEqual(bass.maxHz);

            const highBin = 134;
            const ch = new Float32Array(200);
            ch[134] = 0.95;
            const rHigh = classificationToPitch(ch, bass);
            expect(rHigh.pitch).toBeLessThanOrEqual(bass.maxHz);
            expect(rHigh.pitch).toBeGreaterThanOrEqual(bass.minHz);
        });

        it('electric guitar profile allows higher maxHz than bass', () => {
            expect(guitar.maxHz).toBeGreaterThan(bass.maxHz);
            const c = makeClassification(100, 0.85);
            const rBass = classificationToPitch(c, bass);
            const rGuitar = classificationToPitch(c, guitar);
            expect(rBass.pitch).toBeLessThanOrEqual(bass.maxHz);
            expect(rGuitar.pitch).toBeLessThanOrEqual(guitar.maxHz);
            expect(rGuitar.pitch).toBeGreaterThan(0);
        });

        it('uses 9-bin weighted average when peak has neighbors', () => {
            const c = new Float32Array(200);
            c[50] = 0.7;
            c[51] = 0.25;
            c[49] = 0.05;
            const r = classificationToPitch(c, general);
            const singleBinFreq = binToBaseFreq(50);
            expect(r.pitch).not.toBe(singleBinFreq);
            expect(r.pitch).toBeGreaterThan(0);
            expect(r.pitch).toBeLessThanOrEqual(general.maxHz);
            expect(r.pitch).toBeGreaterThanOrEqual(general.minHz);
        });

        it('regression offset adjusts frequency', () => {
            const c = makeClassification(50, 0.9);
            const regression = new Float32Array(200);
            regression[50] = 50;
            const rNoReg = classificationToPitch(c, general);
            const rWithReg = classificationToPitch(c, general, regression);
            expect(rWithReg.pitch).not.toBe(rNoReg.pitch);
            expect(rWithReg.pitch).toBeGreaterThan(0);
        });

        it('general profile accepts confidence at threshold', () => {
            const th = general.confidenceThreshold;
            const c = makeClassification(60, th);
            const r = classificationToPitch(c, general);
            expect(r.pitch).toBeGreaterThan(0);
            expect(r.confidence).toBeCloseTo(th, 2);
        });
    });
});
