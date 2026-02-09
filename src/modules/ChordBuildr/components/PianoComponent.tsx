import React, { useEffect, useRef } from 'react'
import '../styles/Piano.css'
import { Key } from './Key'
import { useAppContext, getPianoById } from './context/AppContext'
import { getNoteLetter } from '../utils/noteManager'
import { playChordById } from '../utils/synthPlayer'
import { NoteKey } from '../utils/chordPianoHandler'

interface PianoComponentProps {
  pianoComponentId: number
  forceUpdate?: number
}

export const PianoComponent: React.FC<PianoComponentProps> = ({
  pianoComponentId,
  forceUpdate
}) => {
  const { state, dispatch } = useAppContext()
  const pianoId = pianoComponentId
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      // force a re-render of the piano keys on mount
      const piano = getPianoById(state, pianoId)
      if (piano) {
        dispatch({
          type: 'REFRESH_PIANO',
          id: pianoId,
          payload: piano
        })
      }
    }
  }, [pianoId, state, dispatch])

  useEffect(() => {
    if (forceUpdate) {
      const piano = getPianoById(state, pianoId)
      if (piano) {
        dispatch({
          type: 'REFRESH_PIANO',
          id: pianoId,
          payload: piano
        })
      }
    }
  }, [forceUpdate, pianoId, state, dispatch])

  const handleClick = (noteNumber: number, octave: number): void => {
    const noteLetter = getNoteLetter('C', noteNumber)
    const selectedKey = {
      noteLetter,
      octave
    }
    dispatch({
      type: 'UPDATE_KEY',
      id: pianoId,
      payload: selectedKey
    })
  }

  // handleClickRemovePiano was unused and removed

  const handlePlayClick = (): void => {
    playChordById(dispatch, state, pianoId)
  }

  const renderPiano = () => {
    const piano = getPianoById(state, pianoId)?.piano || []
    return piano.map((octave, i) =>
      octave.map((pianoKey: NoteKey) => ({
        ...pianoKey,
        octave: i,
        key: `${pianoKey.note}-${i}-${forceUpdate}`,
        handleClick: () => handleClick(pianoKey.noteNumber, i)
      }))
    ).flat().map(pianoKey => (
      <Key
        key={pianoKey.key}
        pianoKey={pianoKey}
        handleClick={pianoKey.handleClick}
      />
    ))
  }

  return (
    <div className="flex items-center gap-4 w-full justify-center">
      <button
        type="button"
        className="piano-play-button shrunk-on-mobile"
        onClick={handlePlayClick}
        aria-label="Play Chord"
      />
      <div className="pianoBox flex-1">
        <ul className="set !mt-0 !mb-0">{renderPiano()}</ul>
      </div>
    </div>
  );
};