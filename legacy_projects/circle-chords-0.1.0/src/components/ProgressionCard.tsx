import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ChordDiagram from './ChordDiagram'
import CircleWrapper from './CircleWrapper'
import { BassFretboard, VocalFretboard, NoteList } from './Fretboards'
import type { GuitarChordVariation, GeneratedProgression } from '../lib/types'
import { sfChordPlayer } from '../lib/audio-sf'
import { getBassNotes as getBass } from '../lib/theory'

export default function ProgressionCard({ progression, keySig, mode, majorKeys = [], minorKeys = [], notesList, getScale, guitarChords, showDiagrams, showCircle, showFretboards }: {
  progression: GeneratedProgression
  keySig: string
  mode: string
  majorKeys?: string[]
  minorKeys?: string[]
  notesList: string[]
  getScale: (k: string, m: string) => string[]
  guitarChords: Record<string, GuitarChordVariation[]>
  showDiagrams: boolean
  showCircle: boolean
  showFretboards: boolean
}) {
  const { t, i18n } = useTranslation()

  const titleText = useMemo(() => {
    const modeTr = t(`modes.${mode}`) || mode
    const keyTr = t(`notes.${keySig}`) || keySig
    const inKey = t('progressions.inKey', { key: keyTr, mode: modeTr }) || `${keySig} ${mode}`
    const nameKey = `progressions.names.${progression.name}`
    const nameTr = t(nameKey)
    const name = nameTr !== nameKey ? nameTr : progression.name
    return `${name} ${inKey}`
  }, [progression.name, keySig, mode, i18n.language])

  const descriptionText = useMemo(() => {
    const descKey = `progressions.descriptions.${progression.description}`
    const d = t(descKey)
    return d !== descKey ? d : progression.description
  }, [progression.description, i18n.language])

  const bassNotes = useMemo(() => {
    try {
      const b = getBass(progression.chords).map((x) => x.bassNote).filter(Boolean) as string[]
      if (b.length > 0) return b
      // Fallback: use root note of chords
      const roots = progression.chords.map((c) => c.notes?.[0]).filter(Boolean) as string[]
      return roots
    } catch {
      return []
    }
  }, [progression.chords])

  const scaleNotes = useMemo(() => getScale(keySig, mode), [keySig, mode, getScale])

  return (
    <div className="mt-6 p-4 border border-indigo-100 rounded-xl shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold m-0 text-fuchsia-700">{titleText}</h3>
      {descriptionText && (
        <p className="mb-4 text-gray-600">{descriptionText}</p>
      )}

      {showDiagrams ? (
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
          {progression.chords.map((chord, idx) => (
            <div key={idx} className="flex-shrink-0 mx-2 min-w-[180px]">
              <div className="rounded-xl p-3 shadow-sm bg-white border border-gray-200 flex flex-col items-center">
                <ChordDiagram
                  chordName={chord.name}
                  variations={guitarChords[chord.name] || []}
                  onPlay={async () => {
                    await sfChordPlayer.initialize()
                    await sfChordPlayer.playChord(chord.notes)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mt-1">
          {progression.chords.map((ch, idx) => (
            <span key={idx} className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-sm">
              {ch.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2 md:flex-row flex-col">
        <button className="w-full md:w-1/2 inline-flex justify-center items-center gap-2 rounded bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-3 py-2 hover:from-indigo-700 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400" onClick={async () => {
          await sfChordPlayer.initialize()
          await sfChordPlayer.playProgression(progression.chords)
        }}>{t('progressions.playProgression') || 'Play progression'}</button>

        <button className="w-full md:w-1/2 inline-flex justify-center items-center gap-2 rounded bg-gradient-to-r from-emerald-600 to-lime-500 text-white px-3 py-2 hover:from-emerald-700 hover:to-lime-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400" onClick={async () => {
          await sfChordPlayer.initialize()
          await sfChordPlayer.playFullArrangement(
            progression.chords,
            bassNotes,
            scaleNotes
          )
        }}>{t('progressions.playFull') || 'Play full arrangement'}</button>
      </div>

      {showCircle && (
        <div className="mt-3">
          <CircleWrapper keySig={keySig} mode={mode} chords={progression.chords} progressionName={progression.name}
            majorKeys={majorKeys} minorKeys={minorKeys} />
        </div>
      )}

      {showFretboards && (
        <>
          <div className="mt-3">
            <BassFretboard notes={bassNotes} title={t('progressions.bassNotesOnFretboard') || 'Bass notes on fretboard'} notesList={notesList} />
            <NoteList notes={bassNotes} title={t('progressions.bassNotes') || 'Bass notes'} />
          </div>
          <div className="mt-3">
            <VocalFretboard notes={scaleNotes} title={t('progressions.vocalNotesOnFretboard') || 'Vocal notes on fretboard'} notesList={notesList} />
            <NoteList notes={scaleNotes} title={t('progressions.vocalNotes') || 'Vocal notes'} />
          </div>
        </>
      )}
    </div>
  )
}
