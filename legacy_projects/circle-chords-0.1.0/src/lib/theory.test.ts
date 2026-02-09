import { describe, it, expect, beforeAll } from 'vitest'
import { initTheory, getScale, buildChord, generateProgressions, getBassNotes, getChordName } from './theory'
import scales from '../../public/config/scales.json'
import chords from '../../public/config/chords.json'
import progressions from '../../public/config/progressions.json'
import circle from '../../public/config/circleOfFifths.json'

beforeAll(() => {
  initTheory({
    scales: (scales as any).scales,
    notes: (scales as any).notes,
    noteNamesRu: (scales as any).noteNamesRu,
    chordPatterns: (chords as any).chordPatterns,
    guitarChords: (chords as any).guitarChords,
    progressions: (progressions as any).progressions,
    majorKeys: (circle as any).majorKeys,
    minorKeys: (circle as any).minorKeys,
    relativeMinor: (circle as any).relativeMinor,
  })
})

describe('theory', () => {
  it('computes C major scale', () => {
    expect(getScale('C', 'major')).toEqual(['C','D','E','F','G','A','B'])
  })
  it('builds major and minor chords', () => {
    expect(buildChord('C', 'major')).toEqual(['C','E','G'])
    expect(buildChord('A', 'minor')).toEqual(['A','C','E'])
  })
  it('computes natural minor (A minor)', () => {
    expect(getScale('A', 'minor')).toEqual(['A','B','C','D','E','F','G'])
  })
  it('computes D dorian scale', () => {
    expect(getScale('D', 'dorian')).toEqual(['D','E','F','G','A','B','C'])
  })
  it('computes G mixolydian scale', () => {
    expect(getScale('G', 'mixolydian')).toEqual(['G','A','B','C','D','E','F'])
  })
  it('computes F lydian scale', () => {
    expect(getScale('F', 'lydian')).toEqual(['F','G','A','B','C','D','E'])
  })
  it('maps chord names correctly', () => {
    expect(getChordName('C', 'major')).toBe('C')
    expect(getChordName('A', 'minor')).toBe('Am')
    expect(getChordName('B', 'dim')).toBe('Bdim')
    expect(getChordName('E', 'maj7')).toBe('Emaj7')
    expect(getChordName('D', 'min7')).toBe('Dm7')
    expect(getChordName('G', 'dom7')).toBe('G7')
  })
  it('generates progressions for C major', () => {
    const res = generateProgressions('C', 'major')
    expect(Array.isArray(res)).toBe(true)
    expect(res[0].chords?.[0]?.notes?.length).toBeGreaterThan(0)
  })
  it('returns bass notes from chords', () => {
    const res = generateProgressions('C', 'major')
    const bass = getBassNotes(res[0].chords)
    expect(Array.isArray(bass)).toBe(true)
    expect(bass[0]).toHaveProperty('bassNote')
    expect(bass[0].alternatives.length).toBeGreaterThan(0)
  })
})
