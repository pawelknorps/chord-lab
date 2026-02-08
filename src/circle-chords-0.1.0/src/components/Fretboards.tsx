import React from 'react'

const DEFAULT_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const

function getNoteOnString(openNote: string, fret: number, NOTES: readonly string[] = DEFAULT_NOTES) {
  const openIndex = (NOTES as readonly string[]).indexOf(openNote)
  if (openIndex < 0) return ''
  return NOTES[(openIndex + fret) % 12]
}

function FretHeader({ numFrets }: { numFrets: number }) {
  return (
    <div className="flex items-center mb-2  gap-1">
      <div className="w-12" />
      {Array.from({ length: numFrets + 1 }, (_, f) => (
        <div
          key={f}
          className="w-12 h-84 flex items-center justify-center text-[11px] border text-gray-500 bg-gray-50 rounded py-1"
        >
          {f}
        </div>
      ))}
    </div>
  )
}

export function BassFretboard({ notes, title, notesList = DEFAULT_NOTES }: { notes: string[]; title?: string; notesList?: readonly string[] }) {
  const openStrings = ['E', 'A', 'D', 'G']
  const numFrets = 12
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block border rounded-xl p-3 mb-3 bg-gradient-to-br from-white to-gray-50 shadow-sm min-w-[720px]">
        {title && (
          <div className="font-bold mb-2 text-gray-800">{title}</div>
        )}
        <FretHeader numFrets={numFrets} />
        {openStrings.map((open) => (
          <div key={open} className="flex items-center gap-1 mb-1">
            <div className="w-12 font-semibold text-xs text-gray-700 text-center">{open}</div>
            {Array.from({ length: numFrets + 1 }, (_, f) => {
              const note = getNoteOnString(open, f, notesList)
              const highlight = notes.includes(note)
              return (
                <div
                  key={f}
                  className={
                    `w-12 h-84 flex items-center justify-center text-[11px] rounded-md border ` +
                    `transition-colors ` +
                    (highlight
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-1 ring-indigo-300 font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')
                  }
                >
                  {note}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function VocalFretboard({ notes, title, notesList = DEFAULT_NOTES }: { notes: string[]; title?: string; notesList?: readonly string[] }) {
  const openStrings = ['E', 'A', 'D', 'G', 'B', 'E']
  const numFrets = 12
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block border rounded-xl p-3 mb-3 bg-gradient-to-br from-white to-gray-50 shadow-sm min-w-[720px]">
        {title && (
          <div className="font-bold mb-2 text-gray-800">{title}</div>
        )}
        <FretHeader numFrets={numFrets} />
        {openStrings.map((open, idx) => (
          <div key={`${open}-${idx}`} className="flex items-center gap-1 mb-1">
            <div className="w-12 font-semibold text-xs text-gray-700 text-center">{open}</div>
            {Array.from({ length: numFrets + 1 }, (_, f) => {
              const note = getNoteOnString(open, f, notesList)
              const highlight = notes.includes(note)
              return (
                <div
                  key={f}
                  className={
                    `w-12 h-4 flex items-center justify-center text-[11px] rounded-md border ` +
                    `transition-colors ` +
                    (highlight
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200 ring-1 ring-indigo-300 font-semibold'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')
                  }
                >
                  {note}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function NoteList({ notes, title }: { notes: string[]; title?: string }) {
  return (
    <div className="note-list mt-2 text-sm">
      {title && <span className="font-bold">{title}: </span>}
      {notes.join(', ')}
    </div>
  )
}
