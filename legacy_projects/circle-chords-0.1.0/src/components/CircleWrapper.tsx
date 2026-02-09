import React from 'react'
import { useTranslation } from 'react-i18next'
import { buildChord } from '../lib/theory'
import { sfChordPlayer } from '../lib/audio-sf'

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

export default function CircleWrapper({
    keySig,
    mode,
    chords,
    progressionName: _progressionName,
    majorKeys = [],
    minorKeys = []
}: {
    keySig: string
    mode: string
    chords: Array<{ name: string }>
    progressionName: string
    majorKeys?: string[]
    minorKeys?: string[]
}) {
    const size = 320
    const cx = size / 2
    const cy = size / 2
    // Thicker rings for better text fit
    const outer = 145
    const inner = 65
    const mid = 105
    const angles = Array.from({ length: 12 }, (_, i) => ((i * 30 - 90) * Math.PI) / 180)
    const { t } = useTranslation()

    const majorSet = new Set<string>()
    const minorSet = new Set<string>()
    chords.forEach(ch => {
        if (ch.name.includes('m') && !ch.name.includes('maj')) {
            minorSet.add(ch.name.replace('m', ''))
        } else {
            majorSet.add(ch.name)
        }
    })

    const circleTitle = t('circle.title', { key: t(`notes.${keySig}`) || keySig, mode: t(`modes.${mode}`) || mode })

    const onSectorClick = async (isMajor: boolean, i: number) => {
        try {
            await sfChordPlayer.initialize()
            const root = isMajor ? majorKeys[i] : (minorKeys[i] || '').replace('m', '')
            const notes = buildChord(root, isMajor ? 'major' : 'minor')
            await sfChordPlayer.playChord(notes)
        } catch (e) {
            console.error('Play sector chord failed', e)
        }
    }

    return (
        <div className="circle-container">
            <h4 className="my-2 text-sm text-gray-700 text-center">{circleTitle}</h4>
            <div className={'justify-center flex'}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="circle-of-fifths w-full max-w-[340px] md:max-w-[340px] h-auto rounded-xl"
                    role="img"
                    aria-label={String(circleTitle)}
                >
                    <circle cx={cx} cy={cy} r={outer + 10} fill="#f8f9fa" stroke="#dee2e6" strokeWidth={2} />
                    {angles.map((a, i) => {
                        const a1 = a - Math.PI / 12
                        const a2 = a + Math.PI / 12
                        const maj = majorKeys[i]
                        const min = (minorKeys[i] || '').replace('m', '')
                        const isMajIn = majorSet.has(maj)
                        const isMinIn = minorSet.has(min)
                        const isMajCurrent = mode === 'major' && maj === keySig
                        const isMinCurrent = mode === 'minor' && min === keySig
                        const majOpacity = isMajIn || isMajCurrent ? 1 : 0.3
                        const minOpacity = isMinIn || isMinCurrent ? 1 : 0.3
                        const majFill = isMajCurrent ? '#667eea' : isMajIn ? '#e3f2fd' : '#ffffff'
                        const minFill = isMinCurrent ? '#667eea' : isMinIn ? '#e3f2fd' : '#f0f0f0'

                        const majorPath = ringSectorPath(cx, cy, outer, mid, a1, a2)
                        const minorPath = ringSectorPath(cx, cy, mid, inner, a1, a2)

                        const majorTextPos = polarToCartesian(cx, cy, (outer + mid) / 2, a)
                        const minorTextPos = polarToCartesian(cx, cy, (mid + inner) / 2, a)

                        return (
                            <g key={i}>
                                <path d={majorPath} fill={majFill} opacity={majOpacity} stroke="#dee2e6" strokeWidth={1}
                                    style={{ cursor: isMajIn ? 'pointer' : 'default' }}
                                    onClick={() => isMajIn && onSectorClick(true, i)} />
                                <path d={minorPath} fill={minFill} opacity={minOpacity} stroke="#dee2e6" strokeWidth={1}
                                    style={{ cursor: isMinIn ? 'pointer' : 'default' }}
                                    onClick={() => isMinIn && onSectorClick(false, i)} />
                                <text x={majorTextPos[0]} y={majorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Arial, sans-serif" fontSize={12} fontWeight="bold"
                                    fill={isMajCurrent ? 'white' : '#495057'}
                                    style={{ cursor: isMajIn ? 'pointer' : 'default' }}
                                    onClick={() => isMajIn && onSectorClick(true, i)}>{t(`notes.${maj}`) || maj}</text>
                                <text x={minorTextPos[0]} y={minorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Arial, sans-serif" fontSize={10}
                                    fill={isMinCurrent ? 'white' : '#6c757d'}
                                    style={{ cursor: isMinIn ? 'pointer' : 'default' }}
                                    onClick={() => isMinIn && onSectorClick(false, i)}>{t(`notes.${min}`) || min}m</text>
                            </g>
                        )
                    })}
                    <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Arial, sans-serif" fontSize={14} fontWeight="bold" fill="#495057">{t(`notes.${keySig}`) || keySig}</text>
                    <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Arial, sans-serif" fontSize={12}
                        fill="#6c757d">{t('circle.circleTitle') || 'Chord progression'}</text>
                </svg>
            </div>
        </div>
    )
}
