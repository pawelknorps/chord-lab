import type { AppConfig, CircleConfig, ChordsConfig, ProgressionsConfig, ScalesConfig } from './types'

export async function loadAllConfig(): Promise<AppConfig> {
  const base = import.meta.env.BASE_URL || './'
  const [scales, chords, progressions, circle] = await Promise.all([
    fetch(`${base}config/scales.json`).then(r => r.json()) as Promise<ScalesConfig>,
    fetch(`${base}config/chords.json`).then(r => r.json()) as Promise<ChordsConfig>,
    fetch(`${base}config/progressions.json`).then(r => r.json()) as Promise<ProgressionsConfig>,
    fetch(`${base}config/circleOfFifths.json`).then(r => r.json()) as Promise<CircleConfig>,
  ])

  return {
    scales: scales.scales,
    notes: scales.notes,
    noteNamesRu: scales.noteNamesRu,
    chordPatterns: chords.chordPatterns,
    guitarChords: chords.guitarChords,
    progressions: progressions.progressions,
    majorKeys: circle.majorKeys,
    minorKeys: circle.minorKeys,
    relativeMinor: circle.relativeMinor,
  }
}
