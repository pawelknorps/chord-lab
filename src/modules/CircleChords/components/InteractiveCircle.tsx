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
                    className={`px-3 py-1 text-xs rounded-full transition font-medium border ${interactionMode === 'key' ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'}`}
                >
                    Change Key
                </button>
                <button
                    onClick={() => setInteractionMode('workshop')}
                    className={`px-3 py-1 text-xs rounded-full transition font-medium border ${interactionMode === 'workshop' ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'}`}
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
                    <circle cx={cx} cy={cy} r={outer + 5} fill="transparent" stroke="var(--border-subtle)" strokeWidth="2" strokeOpacity={1} />
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

                        // Visual Logic for Swiss/Minimalist
                        const majorFillHex = isMajCurrent ? '#3b82f6' : majInScale ? '#3f3f46' : '#18181b'
                        const minorFillHex = isMinCurrent ? '#3b82f6' : minInScale ? '#3f3f46' : '#18181b'

                        const strokeColor = '#27272a' // var(--border-subtle)

                        const majorPath = ringSectorPath(cx, cy, outer, mid, a1, a2)
                        const minorPath = ringSectorPath(cx, cy, mid, inner, a1, a2)

                        const majorTextPos = polarToCartesian(cx, cy, (outer + mid) / 2, a)
                        const minorTextPos = polarToCartesian(cx, cy, (mid + inner) / 2, a)

                        return (
                            <g key={i}>
                                <path d={majorPath} fill={majorFillHex} stroke={strokeColor} strokeWidth={1}
                                    style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                                    onClick={() => handleClick(maj, 'major', maj)} />
                                <path d={minorPath} fill={minorFillHex} stroke={strokeColor} strokeWidth={1}
                                    style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                                    onClick={() => handleClick(minNote, 'minor', minChord)} />
                                <text x={majorTextPos[0]} y={majorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Inter, sans-serif" fontSize={10} fontWeight="600"
                                    fill={isMajCurrent ? 'white' : '#e4e4e7'}
                                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>{maj}</text>
                                <text x={minorTextPos[0]} y={minorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Inter, sans-serif" fontSize={9}
                                    fill={isMinCurrent ? 'white' : '#a1a1aa'}
                                    style={{ cursor: 'pointer', pointerEvents: 'none' }}>{minChord}</text>
                            </g>
                        )
                    })}
                    <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Inter, sans-serif" fontSize={14} fontWeight="bold" fill="#f4f4f5">{keySig}</text>
                    <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Inter, sans-serif" fontSize={9}
                        fill="#a1a1aa">{mode}</text>
                </svg>
            </div>

            <p className="mt-4 text-[10px] text-center text-[var(--text-muted)] uppercase tracking-widest font-medium">
                {interactionMode === 'workshop' ? '✨ Mode: Click chords to build sequence' : '🔍 Mode: Click sectors to change master key'}
            </p>
        </div>
    )
}
