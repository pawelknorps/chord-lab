import { useMemo, useState } from 'react'
import CircleWrapper from './CircleWrapper'
import type { GeneratedProgression } from '../lib/types'
import { sfChordPlayer } from '../audio/SoundFontAudio'
import { getBassNotes as getBass } from '../lib/theory'

export default function SimpleProgressionCard({
    progression,
    keySig,
    mode,
    majorKeys = [],
    minorKeys = [],
    getScale,
    isWorkshop = false,
    onRemoveChord,
    onEdit
}: {
    progression: GeneratedProgression
    keySig: string
    mode: string
    majorKeys?: string[]
    minorKeys?: string[]
    getScale: (k: string, m: string) => string[]
    isWorkshop?: boolean
    onRemoveChord?: (index: number) => void
    onEdit?: () => void
}) {
    const [isPlaying, setIsPlaying] = useState(false)

    const titleText = isWorkshop ? `Chord Workshop: ${progression.chords.length} Chords` : `${progression.name} in ${keySig} ${mode}`

    const bassNotes = useMemo(() => {
        try {
            const b = getBass(progression.chords).map((x) => x.bassNote).filter(Boolean) as string[]
            if (b.length > 0) return b
            const roots = progression.chords.map((c) => c.notes?.[0]).filter(Boolean) as string[]
            return roots
        } catch {
            return []
        }
    }, [progression.chords])

    const scaleNotes = useMemo(() => getScale(keySig, mode), [keySig, mode, getScale])

    const handlePlayProgression = async () => {
        if (isPlaying) return
        if (progression.chords.length === 0) return
        setIsPlaying(true)
        try {
            await sfChordPlayer.initialize()
            await sfChordPlayer.playProgression(progression.chords)
        } finally {
            setIsPlaying(false)
        }
    }

    const handlePlayArrangement = async () => {
        if (isPlaying) return
        if (progression.chords.length === 0) return
        setIsPlaying(true)
        try {
            await sfChordPlayer.initialize()
            await sfChordPlayer.playFullArrangement(progression.chords, bassNotes, scaleNotes)
        } finally {
            setIsPlaying(false)
        }
    }

    return (
        <div className={`glass-panel p-4 rounded-xl mb-4 border border-white/10 ${isWorkshop ? 'bg-purple-900/10' : 'bg-white/5'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{titleText}</h3>
                    {progression.description && (
                        <p className="text-sm text-white/50">{progression.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition"
                        >
                            ✎ Edit
                        </button>
                    )}
                    <button
                        disabled={isPlaying || progression.chords.length === 0}
                        onClick={handlePlayProgression}
                        className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg text-sm transition disabled:opacity-30"
                    >
                        ▶ Chord Sequence
                    </button>
                    <button
                        disabled={isPlaying || progression.chords.length === 0}
                        onClick={handlePlayArrangement}
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg text-sm transition disabled:opacity-30"
                    >
                        ▶ Jam with Band
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] items-center">
                {progression.chords.length === 0 && (
                    <span className="text-xs text-white/20">Progression is empty. Click on the circle to add chords.</span>
                )}
                {progression.chords.map((ch, idx) => (
                    <div key={idx} className="group relative">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/5 text-sm font-medium flex items-center gap-2">
                            {ch.name}
                            {isWorkshop && onRemoveChord && (
                                <button
                                    onClick={() => onRemoveChord(idx)}
                                    className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/80 text-[10px] transition"
                                >
                                    ✕
                                </button>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-center">
                <CircleWrapper
                    keySig={keySig}
                    mode={mode}
                    chords={progression.chords}
                    progressionName={progression.name}
                    majorKeys={majorKeys}
                    minorKeys={minorKeys}
                />
            </div>
        </div>
    )
}
