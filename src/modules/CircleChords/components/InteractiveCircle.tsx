import { useMemo, useState } from 'react'
import { generateProgressions as gen } from '../lib/theory'

function polarToCartesian(cx: number, cy: number, r: number, angle: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

function ringSectorPath(cx: number, cy: number, rOuter: number, rInner: number, a1: number, a2: number): string {
    const [x1o, y1o] = polarToCartesian(cx, cy, rOuter, a1)
    const [x2o, y2o] = polarToCartesian(cx, cy, rOuter, a2)
    const [x2i, y2i] = polarToCartesian(cx, cy, rInner, a2)
    const [x1i, y1i] = polarToCartesian(cx, cy, rInner, a1)
    const largeArc = (a2 - a1) % (Math.PI * 2) > Math.PI ? 1 : 0
    return [
        `M ${x1o} ${y1o}`,
        `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2o} ${y2o}`,
        `L ${x2i} ${y2i}`,
        `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1i} ${y1i}`,
        'Z'
    ].join(' ')
}

export default function InteractiveCircle({
    keyValue: keySig,
    modeValue: mode,
    onTonalityChange,
    onChordSelect,
    majorKeys = [],
    minorKeys = []
}: {
    keyValue: string
    modeValue: string
    onTonalityChange: (k: string, m: string) => void
    onChordSelect?: (name: string, root: string, type: string) => void
    majorKeys?: string[]
    minorKeys?: string[]
}) {
    const [interactionMode, setInteractionMode] = useState<'key' | 'workshop'>('key')
    const size = 200
    const cx = size / 2
    const cy = size / 2
    // Thicker rings for better text fit
    const outer = 92
    const inner = 42
    const mid = 68
    const angles = Array.from({ length: 12 }, (_, i) => ((i * 30 - 90) * Math.PI) / 180)

    const scaleChords = useMemo(() => {
        try {
            const ps = gen(keySig, mode)
            const set = new Set<string>()
            ps.forEach(p => p.chords.forEach(c => set.add(c.name)))
            return Array.from(set)
        } catch {
            return []
        }
    }, [keySig, mode])

    const handleClick = (root: string, type: string, fullName: string) => {
        if (interactionMode === 'workshop' && onChordSelect) {
            onChordSelect(fullName, root, type)
        } else {
            onTonalityChange(root, type)
        }
    }

    return (
        <div className="interactive-circle-container">
            <div className="flex justify-center gap-2 mb-4">
                <button
                    onClick={() => setInteractionMode('key')}
                    className={`px-3 py-1 text-xs rounded-full transition ${interactionMode === 'key' ? 'bg-cyan-500 text-black shadow-neon' : 'bg-white/10 text-white'}`}
                >
                    Change Key
                </button>
                <button
                    onClick={() => setInteractionMode('workshop')}
                    className={`px-3 py-1 text-xs rounded-full transition ${interactionMode === 'workshop' ? 'bg-purple-500 text-white shadow-neon-purple' : 'bg-white/10 text-white'}`}
                >
                    Add to Workshop
                </button>
            </div>

            <div className={' justify-center flex'}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="circle-of-fifths interactive-circle w-full max-w-[320px] md:max-w-[320px] h-auto rounded-xl"
                    role="img"
                    aria-label="Click to interact"
                >
                    <circle cx={cx} cy={cy} r={outer + 5} fill="transparent" stroke="#dee2e6" strokeWidth="2" strokeOpacity={0.1} />
                    {angles.map((a, i) => {
                        const a1 = a - Math.PI / 12
                        const a2 = a + Math.PI / 12
                        const maj = majorKeys[i]
                        const minNote = (minorKeys[i] || '').replace('m', '')
                        const minChord = minorKeys[i] || ''

                        const isMajCurrent = mode === 'major' && maj === keySig
                        const isMinCurrent = mode === 'minor' && minNote === keySig

                        const majInScale = scaleChords.includes(maj)
                        const minInScale = scaleChords.includes(minChord)

                        const majorFillHex = isMajCurrent ? '#06b6d4' : majInScale ? '#ffffff30' : '#ffffff05'
                        const minorFillHex = isMinCurrent ? '#06b6d4' : minInScale ? '#ffffff30' : '#ffffff05'

                        const majorPath = ringSectorPath(cx, cy, outer, mid, a1, a2)
                        const minorPath = ringSectorPath(cx, cy, mid, inner, a1, a2)

                        const majorTextPos = polarToCartesian(cx, cy, (outer + mid) / 2, a)
                        const minorTextPos = polarToCartesian(cx, cy, (mid + inner) / 2, a)

                        return (
                            <g key={i}>
                                <path d={majorPath} fill={majorFillHex} stroke="#000000" strokeWidth={1} strokeOpacity={0.2}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleClick(maj, 'major', maj)} />
                                <path d={minorPath} fill={minorFillHex} stroke="#000000" strokeWidth={1} strokeOpacity={0.2}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleClick(minNote, 'minor', minChord)} />
                                <text x={majorTextPos[0]} y={majorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Arial, sans-serif" fontSize={11} fontWeight="bold"
                                    fill={isMajCurrent ? 'white' : '#e5e5e5'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleClick(maj, 'major', maj)}>{maj}</text>
                                <text x={minorTextPos[0]} y={minorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Arial, sans-serif" fontSize={9}
                                    fill={isMinCurrent ? 'white' : '#a3a3a3'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleClick(minNote, 'minor', minChord)}>{minChord}</text>
                            </g>
                        )
                    })}
                    <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Arial, sans-serif" fontSize={13} fontWeight="bold" fill="#ffffff">{keySig}</text>
                    <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Arial, sans-serif" fontSize={9}
                        fill="#a3a3a3">{mode}</text>
                </svg>
            </div>

            <p className="mt-4 text-[10px] text-center text-white/30 uppercase tracking-widest">
                {interactionMode === 'workshop' ? '✨ Mode: Click chords to build sequence' : '🔍 Mode: Click sectors to change master key'}
            </p>
        </div>
    )
}
