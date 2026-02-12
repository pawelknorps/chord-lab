/**
 * Phase 21: Harmonic Analysis Pipeline
 *
 * Preprocessing → TonalitySegmentationEngine → FunctionalLabelingEngine → Concept[].
 * REQ-HAT-09, REQ-HAT-10.
 */

import type { Concept, ConceptType, KeySegmentRef } from './AnalysisTypes';
import { TonalitySegmentationEngine, type ChordSlot } from './TonalitySegmentationEngine';
import { FunctionalLabelingEngine, type LabelResult } from './FunctionalLabelingEngine';

export interface AnalyzeHarmonyInput {
  /** One row per measure; each row is array of chord symbols (e.g. [["Cm7","F7"], ["Bbm7","Eb7"]]). */
  measures: string[][];
  /** Key signature (e.g. "C", "Bb") for fallback. */
  key?: string;
}

export interface AnalyzeHarmonyOptions {
  /** Use tonality segmentation + functional labeling (default true). */
  useSegmentation?: boolean;
}

/**
 * Preprocessing: convert measures to ChordSlot[] (one slot per chord; barIndex = measure index).
 * REQ-HAT-09.
 */
export function preprocessToSlots(measures: string[][]): ChordSlot[] {
  const slots: ChordSlot[] = [];
  measures.forEach((measureChords, barIndex) => {
    measureChords.forEach((chordSymbol) => {
      if (chordSymbol && chordSymbol.trim() !== '') {
        slots.push({ barIndex, chordSymbol: chordSymbol.trim() });
      }
    });
  });
  return slots;
}

/**
 * Build Concept[] from LabelResult[]: group consecutive labels with same conceptType into one Concept.
 */
function labelResultsToConcepts(
  labels: LabelResult[],
  segments: { startBar: number; endBar: number; key: string }[]
): Concept[] {
  const concepts: Concept[] = [];
  const defaultType: ConceptType = 'MajorII-V-I';

  let i = 0;
  while (i < labels.length) {
    const first = labels[i];
    const conceptType = first.conceptType ?? defaultType;
    const romanNumerals: string[] = [first.romanNumeral];
    let startBar = first.barIndex;
    let endBar = first.barIndex;
    let j = i + 1;
    while (j < labels.length && labels[j].conceptType === conceptType) {
      romanNumerals.push(labels[j].romanNumeral);
      startBar = Math.min(startBar, labels[j].barIndex);
      endBar = Math.max(endBar, labels[j].barIndex);
      j++;
    }
    const seg = segments.find((s) => s.startBar <= first.barIndex && s.endBar >= first.barIndex);
    concepts.push({
      type: conceptType,
      startIndex: startBar,
      endIndex: endBar,
      metadata: {
        key: first.key,
        romanNumerals,
      },
      keySegment: seg ? { startBar: seg.startBar, endBar: seg.endBar, key: seg.key } : undefined,
      romanNumeral: first.romanNumeral,
      segmentLabel: first.segmentLabel,
    });
    i = j;
  }
  return concepts;
}

/**
 * Single entry point: Preprocessing → Segmentation → Functional Labeling → Concept[].
 * REQ-HAT-10. Backward compatible with AnalysisOverlay (type, startIndex, endIndex, metadata).
 */
export function analyzeHarmony(
  input: AnalyzeHarmonyInput,
  options: AnalyzeHarmonyOptions = {}
): Concept[] {
  const { measures, key = 'C' } = input;
  const useSegmentation = options.useSegmentation !== false;

  if (!measures || measures.length === 0) return [];

  const slots = preprocessToSlots(measures);
  if (slots.length === 0) return [];

  if (!useSegmentation) {
    return [];
  }

  const segmentationEngine = new TonalitySegmentationEngine();
  segmentationEngine.setSlots(slots);
  segmentationEngine.segment();
  const segments = segmentationEngine.getSegments();

  const labelingEngine = new FunctionalLabelingEngine();
  const labels = labelingEngine.label(slots, segments);

  return labelResultsToConcepts(labels, segments);
}
