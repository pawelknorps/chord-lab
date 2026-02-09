import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import InteractiveCircle from '../components/InteractiveCircle'
import ChordDiagram from '../components/ChordDiagram'
import type { GuitarChordVariation } from '../lib/types'
import { buildChord, getChordName } from '../lib/theory'
import { sfChordPlayer } from '../lib/audio-sf'

type Props = {
  majorKeys: string[]
  minorKeys: string[]
  guitarChords: Record<string, GuitarChordVariation[]>
}

export default function ChordExplorer({ majorKeys, minorKeys, guitarChords }: Props) {
  const { t } = useTranslation()
  const [selKey, setSelKey] = useState<string>('C')
  const [selMode, setSelMode] = useState<string>('major')
  const chordTypes = ['major','minor','maj7','min7','dom7','dim','dim7','m7b5','sus2','sus4','7sus4'] as const
  const [selType, setSelType] = useState<typeof chordTypes[number]>('major')

  // If user selects from circle, default to that quality
  const effectiveType = selType || (selMode === 'major' ? 'major' : 'minor')
  const chordName = useMemo(() => getChordName(selKey, effectiveType), [selKey, effectiveType])
  const variations = guitarChords[chordName] || []
  const chordNotes = useMemo(() => buildChord(selKey, effectiveType), [selKey, effectiveType])

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">{t('circle.circleTitle') || 'Circle of Fifths'}</h2>
      <InteractiveCircle
        keyValue={selKey}
        modeValue={selMode}
        onTonalityChange={(k, m) => { setSelKey(k); setSelMode(m) }}
        majorKeys={majorKeys}
        minorKeys={minorKeys}
      />

      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">{t('progressions.progression') || 'Progression'}: {chordName}</h3>
        <button
          className="inline-flex items-center gap-2 rounded bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700 text-sm"
          onClick={async () => { await sfChordPlayer.initialize(); await sfChordPlayer.playChord(chordNotes) }}
        >
          {t('progressions.playChord') || 'Play'} {chordName}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {chordTypes.map((ct) => (
          <button
            key={ct}
            className={`px-3 py-1.5 text-sm rounded border ${effectiveType === ct ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setSelType(ct)}
            title={t(`chordTypes.${ct}`) as string}
          >
            {selKey}{t(`chordTypes.${ct}`) as string}
          </button>
        ))}
      </div>

      {variations.length === 0 && (
        <p className="text-sm text-gray-500">{t('ui.noChordVariations') || 'No stored chord variations for this chord.'}</p>
      )}

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 mt-2">
        {variations.map((_, idx) => (
          <div key={idx} className="flex-shrink-0 mx-2 min-w-[180px]">
            <div className="rounded-xl p-3 shadow-sm bg-white border border-gray-200 flex flex-col items-center">
              <ChordDiagram
                chordName={chordName}
                variations={[variations[idx]]}
                onPlay={async () => { await sfChordPlayer.initialize(); await sfChordPlayer.playChord(chordNotes) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
