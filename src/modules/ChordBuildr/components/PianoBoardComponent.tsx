import React, { useEffect, useState, useLayoutEffect, memo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAppContext } from "../components/context/AppContext"
import { getStateParamsCode } from "../utils/chordCodeHandler"
import { ChordInput } from "./ChordInput"
import { GuitarChord } from "./GuitarChord"
import useNavHeight from "../utils/hooks/useNavHeight"
import { isGuitar } from '../utils/guitarUtil'
import { PianoComponent } from "./PianoComponent"
import InlineConfig from './InlineConfig'
import MusicalAnimation from "./MusicalAnimation"

import "../styles/ModernUI.css"

const MemoizedChordPiano = memo(({ id, onRemove }: { id: number, onRemove: () => void }) => (
  <div className="chord-card">
    <button className="close-chord-btn" onClick={onRemove}>&times;</button>
    <div className="chord-card-content">
      <ChordInput pianoComponentId={id} />
      <div className="chord-display-area">
        <PianoComponent
          pianoComponentId={Number(id)}
        />
      </div>
    </div>
  </div>
))

const MemoizedGuitarChordSet = memo(({ id, onRemove }: { id: number, onRemove: () => void }) => (
  <div className="chord-card">
    <button className="close-chord-btn" onClick={onRemove}>&times;</button>
    <div className="chord-card-content">
      <ChordInput pianoComponentId={id} />
      <div className="chord-display-area guitar-chord-container">
        <GuitarChord pianoComponentId={id} />
      </div>
    </div>
  </div>
))

export const PianoBoardComponent: React.FC = () => {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [refresh, setRefresh] = useState<number>(0)
  const navHeight = useNavHeight('nav')

  useEffect(() => {
    document.documentElement.setAttribute('data-format', isGuitar(state.format) ? 'g' : 'p')
  }, [state.format])

  useLayoutEffect(() => {
    if (!isInitialized && (location.search || location.hash)) {
      dispatch({
        type: "BUILD_PROG_FROM_CODE",
        payload: location.search + location.hash
      })
      setIsInitialized(true)
      setRefresh(prev => prev + 1)
    }
  }, [location.search, location.hash, isInitialized, dispatch])

  useLayoutEffect(() => {
    if (state.refreshBoard && state.refreshBoard !== refresh) {
      setRefresh(state.refreshBoard)
    }
  }, [state.refreshBoard, refresh])

  useEffect(() => {
    if (!state.chordPianoSet) return

    const currentCode = "?" + getStateParamsCode(state)
    const newParams = location.search + location.hash

    if (currentCode !== newParams) {
      navigate(currentCode, { replace: true })
    }
  }, [state, navigate, location.search, location.hash])

  const handleRemove = (id: number) => {
    dispatch({ type: 'REMOVE_PIANO', id })
  }

  const handleAdd = () => {
    dispatch({ type: 'ADD_CHORD_PIANO', payload: {} })
  }

  if (!state.chordPianoSet?.length) {
    return (
      <div className="pianoBoard">
        <div className="introBody">
          <MusicalAnimation />
          <div className="introText">
            welcome to chord buildr<br />
            use the controls above to get started
          </div>
          <InlineConfig />
        </div>
      </div>
    )
  }

  return (
    <div
      key={`pianoBoard-${refresh}`}
      className="max-w-[1600px] mx-auto px-6 py-12"
      style={{ marginTop: `${navHeight - 60}px` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {state.chordPianoSet.map((chordPiano) => (
          !isGuitar(state.format) ? (
            <MemoizedChordPiano
              key={`piano-${chordPiano.id}`}
              id={chordPiano.id}
              onRemove={() => handleRemove(chordPiano.id)}
            />
          ) : (
            <MemoizedGuitarChordSet
              key={`guitar-${chordPiano.id}`}
              id={chordPiano.id}
              onRemove={() => handleRemove(chordPiano.id)}
            />
          )
        ))}

        {/* Add Chord Placeholder Card */}
        <button
          onClick={handleAdd}
          className="chord-card border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-white/60 hover:border-white/30 transition-all min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center text-2xl font-light">
            +
          </div>
          <span className="font-medium tracking-wide">Add Chord</span>
        </button>
      </div>

      <div className="mt-16 flex justify-center">
        <InlineConfig />
      </div>
    </div>
  )
}