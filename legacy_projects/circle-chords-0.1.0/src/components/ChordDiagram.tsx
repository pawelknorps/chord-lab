import React from 'react'
import type { GuitarChordVariation } from '../lib/types'
import { useTranslation } from 'react-i18next'
import { sfChordPlayer } from '../lib/audio-sf'

function FretPositionLabel({ startFret }: { startFret: number }) {
  const { t } = useTranslation()
  if (startFret <= 0) return null
  return <div className="text-xs text-gray-500">{t('guitar.fretPosition', { fret: startFret }) || `${startFret}`}</div>
}

function Variation({ variation }: { variation: GuitarChordVariation }) {
  const { t } = useTranslation()
  const STRINGS = ['E', 'A', 'D', 'G', 'B', 'E']
  const fretsUsed = variation.frets.filter((f): f is number => f !== null && f > 0)
  const minFret = fretsUsed.length > 0 ? Math.min(...fretsUsed) : 0
  const maxFret = fretsUsed.length > 0 ? Math.max(...fretsUsed) : 4
  const startFret = minFret > 0 ? minFret : 0
  const endFret = Math.max(startFret + 4, maxFret)

  const translateName = (name: string) => {
    const key = `guitar.chordPositions.${name}`
    const tr = t(key)
    if (tr !== key) return tr as string
    const match = name.match(/^Barre (\d+) fret$/)
    if (match) {
      return (t('guitar.chordPositions.Barre {fret} fret', { fret: match[1] }) as string) || name
    }
    return name
  }

  return (
    <div className="chord-variation w-full">
      <div className="variation-title text-gray-600 text-xs text-center">{translateName(variation.name)}</div>
      <FretPositionLabel startFret={startFret} />
      {/* String names header */}
      <div className="grid grid-cols-6 gap-[4px] text-[10px] text-gray-500 mt-1">
        {STRINGS.map((s, i) => (
          <div key={i} className="text-center">{s}</div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-[4px] mt-1 bg-black p-1 rounded border border-gray-300">
        {Array.from({ length: endFret - startFret + 1 }).map((_, k) => {
          const fret = startFret + k
          return Array.from({ length: 6 }).map((__, stringIdx) => {
            const fretNumber = variation.frets[stringIdx]
            const finger = variation.fingers[stringIdx]
            const isFinger = fretNumber === fret && finger > 0
            const isX = fretNumber === null && fret === startFret
            const isO = fretNumber === 0 && fret === startFret
            return (
              <div
                key={`${stringIdx}-${fret}`}
                className={
                  `relative w-8 h-8 flex items-center justify-center border bg-white ` +
                  `${(startFret === 0 && fret === startFret) ? 'border-t-4 border-gray-800 border-x border-b' : 'border-gray-300'}`
                }
              >
                {/* Fret number at row start */}
                {stringIdx === 0 && (
                  <span className="absolute -left-4 text-[14px] text-gray-500">{fret}</span>
                )}
                {isFinger && (
                  <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] leading-none flex items-center justify-center">
                    {finger}
                  </span>
                )}
                {!isFinger && (isX || isO) && (
                  <span className="text-[14px] text-gray-700">{isX ? 'X' : 'O'}</span>
                )}
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}

export default function ChordDiagram({ chordName, variations, onPlay }: { chordName: string; variations: GuitarChordVariation[]; onPlay?: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="w-full flex flex-col items-center">
      <button
        className="inline-flex w-full font-bold justify-center items-center gap-2 rounded border border-gray-300 bg-white text-gray-800 px-3 py-2 hover:bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
        title={`${t('progressions.playChord') || 'Play'} ${chordName}`}
        onClick={async () => { await sfChordPlayer.initialize(); onPlay && onPlay() }}
      >
        {(t('progressions.playChord') as string || 'Play') + ' ' + chordName}
      </button>
      <div className="overflow-x-auto w-full">
        <div className="min-w-[180px]">
          {variations.map((v, i) => (
            <Variation key={i} variation={v} />
          ))}
        </div>
      </div>
    </div>
  )
}
