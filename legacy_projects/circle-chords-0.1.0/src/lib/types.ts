export type Note = string

export interface ScalesConfig {
  scales: Record<string, number[]>
  notes: Note[]
  noteNamesRu?: Record<string, string>
}

export interface GuitarChordVariation {
  name: string
  frets: Array<number | null>
  fingers: number[]
}

export interface ChordsConfig {
  chordPatterns: Record<string, number[]>
  guitarChords: Record<string, GuitarChordVariation[]>
}

export interface ProgressionDef {
  name: string
  degrees: number[]
  types: string[]
  description?: string
}

export interface ProgressionsConfig {
  progressions: Record<string, ProgressionDef[]>
}

export interface CircleConfig {
  majorKeys: string[]
  minorKeys: string[]
  relativeMinor?: Record<string, string>
}

export interface AppConfig {
  scales: Record<string, number[]>
  notes: Note[]
  noteNamesRu?: Record<string, string>
  chordPatterns: Record<string, number[]>
  guitarChords: Record<string, GuitarChordVariation[]>
  progressions: Record<string, ProgressionDef[]>
  majorKeys: string[]
  minorKeys: string[]
  relativeMinor?: Record<string, string>
}

export interface GeneratedChord {
  root: Note
  type: string
  name: string
  degree: number
  notes: Note[]
}

export interface GeneratedProgression extends ProgressionDef {
  chords: GeneratedChord[]
}

