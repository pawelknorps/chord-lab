import React, { useState } from "react"
import Chord from "@techies23/react-chords"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { getPianoById, useAppContext } from "./context/AppContext"
import { ChordPiano } from "../utils/chordPianoHandler"
import { findChordPositions, getInstrumentByFormat } from "../utils/guitarUtil"
import { playChord } from "../utils/synthPlayer"
import { Instrument } from "../utils/guitarUtil"

interface GuitarChordProps {
  pianoComponentId: number;
}

export const GuitarChord: React.FC<GuitarChordProps> = ({ pianoComponentId }) => {
  const { state, dispatch } = useAppContext()
  const chordPiano: ChordPiano | null = getPianoById(state, pianoComponentId);
  const [position, setPosition] = useState(chordPiano?.selectedChord?.position ?? 0)

  // useEffect(() => {
  //   console.log(chordPiano?.isPlaying)
  // }, [chordPiano?.isPlaying, state.chordPianoSet])

  if (!chordPiano) {
    return;
  }

  const instrument: Instrument = getInstrumentByFormat(state.format);

  const tabPositions = findChordPositions(
    chordPiano.selectedChord,
    instrument.chords,
    state.format
  );


  const handleNewPosition = (position: number): void => {
    setPosition(position);

    chordPiano.selectedChord.position = position;
    //let newChordPiano = {...chordPiano, selectedChord: false} as ChordPiano;

    dispatch({
      type: "UPDATE_PIANO",
      id: chordPiano.id,
      payload: chordPiano
    })
  }

  const handlePlayClick = (): void => {
    playChord(
      dispatch,
      state,
      chordPiano,
    );
  };

  return (
    <div
      id={`piano-${pianoComponentId}`}
      className="flex flex-col items-center gap-4 w-full"
    >
      <div className={`chord-wrapper relative w-full flex flex-col items-center`} data-playing={chordPiano.isPlaying?.toString()} >
        {tabPositions?.length ? (
          <>
            <div
              onClick={handlePlayClick}
              className="cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] w-full flex justify-center"
            >
              <Chord
                chord={tabPositions[position]}
                instrument={instrument as any}
              />
            </div>

            {/* Position Pagination */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => handleNewPosition(position === 0 ? tabPositions.length - 1 : position - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
              </button>
              <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">
                {position + 1} <span className="text-white/20 mx-1">/</span> {tabPositions.length}
              </span>
              <button
                onClick={() => handleNewPosition(position === tabPositions.length - 1 ? 0 : position + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <FontAwesomeIcon icon={faChevronRight} size="xs" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[120px] text-white/30 text-xs italic">
            Chord type not supported
          </div>
        )}
      </div>
    </div>
  );
};

