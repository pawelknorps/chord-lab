import React from 'react'
import { useTranslation } from 'react-i18next'
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
    majorKeys = [],
    minorKeys = []
}: {
    keyValue: string
    modeValue: string
    onTonalityChange: (k: string, m: string) => void
    majorKeys?: string[]
    minorKeys?: string[]
}) {
    const size = 200
    const cx = size / 2
    const cy = size / 2
    // Thicker rings for better text fit
    const outer = 92
    const inner = 42
    const mid = 68
    const angles = Array.from({ length: 12 }, (_, i) => ((i * 30 - 90) * Math.PI) / 180)
    const { t } = useTranslation()

    const scaleChords = React.useMemo(() => {
        try {
            const ps = gen(keySig, mode)
            const set = new Set<string>()
            ps.forEach(p => p.chords.forEach(c => set.add(c.name)))
            return Array.from(set)
        } catch {
            return []
        }
    }, [keySig, mode])

    return (
        <div className="interactive-circle-container">
            <h4 className="my-2 text-sm text-gray-600 text-center">{t('circle.clickToChange') || 'Click to change key'}</h4>
            <div className={' justify-center flex'}>
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="circle-of-fifths interactive-circle w-full max-w-[320px] md:max-w-[320px] h-auto rounded-xl"
                    role="img"
                    aria-label={t('circle.clickToChange') as string}
                >
                    <circle cx={cx} cy={cy} r={outer + 5} fill="#f8f9fa" stroke="#dee2e6" strokeWidth="2" />
                    {angles.map((a, i) => {
                        const a1 = a - Math.PI / 12
                        const a2 = a + Math.PI / 12
                        const maj = majorKeys[i]
                        const min = (minorKeys[i] || '').replace('m', '')
                        const isMajCurrent = mode === 'major' && maj === keySig
                        const isMinCurrent = mode === 'minor' && min === keySig
                        const majInScale = scaleChords.includes(maj)
                        const minInScale = scaleChords.includes(min + 'm')
                        const majorFill = isMajCurrent ? '#667eea' : majInScale ? '#e3f2fd' : '#ffffff'
                        const minorFill = isMinCurrent ? '#667eea' : minInScale ? '#e3f2fd' : '#f0f0f0'

                        const majorPath = ringSectorPath(cx, cy, outer, mid, a1, a2)
                        const minorPath = ringSectorPath(cx, cy, mid, inner, a1, a2)

                        const majorTextPos = polarToCartesian(cx, cy, (outer + mid) / 2, a)
                        const minorTextPos = polarToCartesian(cx, cy, (mid + inner) / 2, a)

                        return (
                            <g key={i}>
                                <path d={majorPath} fill={majorFill} stroke="#dee2e6" strokeWidth={1}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onTonalityChange(maj, 'major')} />
                                <path d={minorPath} fill={minorFill} stroke="#dee2e6" strokeWidth={1}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onTonalityChange(min, 'minor')} />
                                <text x={majorTextPos[0]} y={majorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Arial, sans-serif" fontSize={11} fontWeight="bold"
                                    fill={isMajCurrent ? 'white' : '#495057'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onTonalityChange(maj, 'major')}>{t(`notes.${maj}`) || maj}</text>
                                <text x={minorTextPos[0]} y={minorTextPos[1]} textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontFamily="Arial, sans-serif" fontSize={9}
                                    fill={isMinCurrent ? 'white' : '#6c757d'}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => onTonalityChange(min, 'minor')}>{t(`notes.${min}`) || min}m</text>
                            </g>
                        )
                    })}
                    <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Arial, sans-serif" fontSize={13} fontWeight="bold" fill="#495057">{t(`notes.${keySig}`) || keySig}</text>
                    <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
                        fontFamily="Arial, sans-serif" fontSize={9}
                        fill="#6c757d">{t(`circle.${mode}`) || mode}</text>
                </svg>
            </div>
        </div>
    )
}
