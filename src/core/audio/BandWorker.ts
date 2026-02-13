import { DrumEngine } from '../theory/DrumEngine';
import { WalkingBassEngine } from '../theory/WalkingBassEngine';

/**
 * BandWorker: Generative Rhythm Section (Wave II)
 * Offloads Drum and Bass bar generation to a background thread.
 */

let drumEngine: DrumEngine;
let bassEngine: WalkingBassEngine;

self.onmessage = (e) => {
    const { type, data } = e.data;

    if (type === 'init') {
        drumEngine = new DrumEngine();
        bassEngine = new WalkingBassEngine();
        self.postMessage({ type: 'initialized' });
    }

    if (type === 'generate_bar') {
        if (!drumEngine || !bassEngine) {
            drumEngine = new DrumEngine();
            bassEngine = new WalkingBassEngine();
        }

        const {
            barIndex,
            currentChord,
            nextChord,
            density,
            pianoDensity,
            trioContext,
            energy,
            answerContext,
            divisionsPerBar,
            preferClassicRide,
            isFillBar
        } = data;

        // Shared Energy/Tension Budget (Synchronize Drum/Bass intensity)
        // High energy in one instrument encourages the other to peak as well
        const tensionLevel = (energy + density) / 2;
        const syncDensity = Math.min(1.0, density + (energy > 0.8 ? 0.1 : 0));
        const syncEnergy = Math.min(1.0, energy + (density > 0.8 ? 0.1 : 0));

        // Generate Drum Bar
        let drumHits = [];
        if (isFillBar) {
            drumHits = drumEngine.generateFill(barIndex);
        } else {
            drumHits = drumEngine.generateBar(
                syncDensity,
                pianoDensity,
                barIndex,
                answerContext,
                undefined, // pianoStepTimes
                trioContext,
                divisionsPerBar,
                preferClassicRide
            );
        }

        // Generate Bass Bar
        // Note: we can't easily sync lastBassNoteRef across threads without message-passing it
        const bassEvents = bassEngine.generateVariedWalkingLine(
            currentChord,
            nextChord,
            barIndex,
            syncEnergy
        );

        // Keep internal state updated in worker
        const lastNote = bassEngine.getLastNoteMidi();

        // Send back results
        self.postMessage({
            type: 'bar_generated',
            data: {
                barIndex,
                drumHits,
                bassEvents,
                lastBassNote: lastNote
            }
        });
    }

    if (type === 'set_last_bass_note') {
        bassEngine?.setLastNoteMidi(data.midi);
    }
};
