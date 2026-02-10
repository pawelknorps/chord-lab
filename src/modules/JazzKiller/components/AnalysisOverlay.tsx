import { Concept } from '../../../core/theory/AnalysisTypes';
import { useState, useEffect, RefObject } from 'react';

interface AnalysisOverlayProps {
    concepts: Concept[];
    measureCount: number;
    onConceptClick?: (concept: Concept, index: number) => void;
    activeFocusIndex?: number | null;
    gridRef?: RefObject<HTMLDivElement | null>;
}

const CONCEPT_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
    'MajorII-V-I': {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-400',
        text: 'text-emerald-300',
        label: 'Major ii-V-I',
    },
    'MinorII-V-i': {
        bg: 'bg-blue-600/25',
        border: 'border-blue-400',
        text: 'text-blue-300',
        label: 'Minor ii-V-i',
    },
    'SecondaryDominant': {
        bg: 'bg-amber-500/20',
        border: 'border-amber-400',
        text: 'text-amber-300',
        label: 'Sec. Dominant',
    },
    'TritoneSubstitution': {
        bg: 'bg-rose-600/25',
        border: 'border-rose-400',
        text: 'text-rose-300',
        label: 'Tritone Sub',
    },
    'ColtraneChanges': {
        bg: 'bg-violet-600/25',
        border: 'border-violet-400',
        text: 'text-violet-300',
        label: 'Coltrane Changes',
    },
};

export function AnalysisOverlay({
    concepts,
    onConceptClick,
    activeFocusIndex,
    gridRef
}: Omit<AnalysisOverlayProps, 'measureCount'>) {
    if (concepts.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {concepts.map((concept, index) => {
                const colorScheme = CONCEPT_COLORS[concept.type] || CONCEPT_COLORS['MajorII-V-I'];
                const isActive = activeFocusIndex === index;

                return (
                    <AnalysisBracket
                        key={`${concept.type}-${index}`}
                        concept={concept}
                        index={index}
                        isActive={isActive}
                        colorScheme={colorScheme}
                        onConceptClick={onConceptClick}
                        gridRef={gridRef}
                    />
                );
            })}
        </div>
    );
}

interface Segment {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface CurrentSegment {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

function AnalysisBracket({ concept, index, isActive, colorScheme, onConceptClick, gridRef }: any) {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [hidden, setHidden] = useState(true);

    useEffect(() => {
        const updatePosition = () => {
            if (!gridRef?.current) return;

            const containerRect = gridRef.current.getBoundingClientRect();
            // Get all direct children (measures)
            const children = Array.from(gridRef.current.children);
            const measureElements = children.filter((el): el is HTMLElement =>
                el instanceof HTMLElement && !el.classList.contains('pointer-events-none')
            );

            // Filter to get only the measures (divs with specific border classes or similar)
            // Just filtering by 'div' tag and ensuring they are not the overlay itself (which is absolute)
            const correctMeasureElements = measureElements.filter(el => {
                const style = window.getComputedStyle(el);
                return style.position !== 'absolute';
            });

            if (correctMeasureElements.length === 0) return;

            const rects: DOMRect[] = [];
            for (let i = concept.startIndex; i <= concept.endIndex; i++) {
                const el = correctMeasureElements[i];
                if (el) {
                    rects.push(el.getBoundingClientRect());
                }
            }

            if (rects.length === 0) {
                setHidden(true);
                return;
            }

            // Compute segments
            const newSegments: Segment[] = [];
            let currentSegment: CurrentSegment | null = null;

            for (const rect of rects) {
                const rTop = rect.top - containerRect.top;
                const rLeft = rect.left - containerRect.left;
                const rRight = rect.right - containerRect.left;
                const rBottom = rect.bottom - containerRect.top;

                if (!currentSegment) {
                    currentSegment = { top: rTop, left: rLeft, right: rRight, bottom: rBottom };
                } else {
                    // Check if on same row (within small tolerance)
                    if (Math.abs(rTop - currentSegment.top) < 10) {
                        // Extend
                        currentSegment.right = Math.max(currentSegment.right, rRight);
                        currentSegment.bottom = Math.max(currentSegment.bottom, rBottom);
                        // Left stays same (min)
                    } else {
                        // Push and start new
                        newSegments.push({
                            top: currentSegment.top,
                            left: currentSegment.left,
                            width: currentSegment.right - currentSegment.left,
                            height: currentSegment.bottom - currentSegment.top
                        });
                        currentSegment = { top: rTop, left: rLeft, right: rRight, bottom: rBottom };
                    }
                }
            }

            if (currentSegment) {
                newSegments.push({
                    top: currentSegment.top,
                    left: currentSegment.left,
                    width: currentSegment.right - currentSegment.left,
                    height: currentSegment.bottom - currentSegment.top
                });
            }

            setSegments(newSegments);
            setHidden(false);
        };

        const resizeObserver = new ResizeObserver(updatePosition);
        if (gridRef?.current) {
            resizeObserver.observe(gridRef.current);
        }

        // Also update on window resize/scroll just in case
        window.addEventListener('resize', updatePosition);
        // Initial
        requestAnimationFrame(updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
            resizeObserver.disconnect();
        };
    }, [concept.startIndex, concept.endIndex, gridRef]);

    if (hidden || segments.length === 0) return null;

    return (
        <>
            {segments.map((style, segIndex) => (
                <button
                    key={segIndex}
                    onClick={() => onConceptClick?.(concept, index)}
                    className={`
                        absolute pointer-events-auto
                        border-2 
                        transition-all duration-300
                        ${colorScheme.bg} ${colorScheme.border}
                        ${isActive ? 'ring-4 ring-amber-500/50 scale-[1.01] z-30' : 'hover:scale-[1.005] z-20'}
                        cursor-pointer group
                        ${segIndex === 0 ? 'rounded-tl-xl rounded-bl-xl' : ''}
                        ${segIndex === segments.length - 1 ? 'rounded-tr-xl rounded-br-xl' : ''}
                        ${segments.length === 1 ? 'rounded-xl' : ''}
                    `}
                    style={{
                        top: `${style.top}px`,
                        left: `${style.left}px`,
                        width: `${style.width}px`,
                        height: `${style.height}px`,
                    }}
                >
                    {/* Label only on first segment */}
                    {segIndex === 0 && (
                        <div
                            className={`
                                absolute -top-3.5 left-3
                                px-2 py-0.5 rounded-md
                                text-[9px] font-black uppercase tracking-widest
                                ${colorScheme.border.replace('border-', 'bg-')} text-black
                                shadow-[0_4px_12px_rgba(0,0,0,0.5)]
                                border border-white/20
                                ${isActive ? 'animate-pulse scale-110' : ''}
                                z-40 whitespace-nowrap transition-all
                            `}
                        >
                            {colorScheme.label}
                        </div>
                    )}

                    {/* Corner brackets */}
                    <div className={`absolute inset-0 ${colorScheme.text} opacity-50`}>
                        {/* Only show corners relevant to segment position */}
                        {(segIndex === 0 || segments.length === 1) && (
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current" />
                        )}
                        {(segIndex === 0 || segments.length === 1) && (
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current" />
                        )}

                        {(segIndex === segments.length - 1 || segments.length === 1) && (
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current" />
                        )}
                        {(segIndex === segments.length - 1 || segments.length === 1) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current" />
                        )}
                    </div>
                </button>
            ))}
        </>
    );
}
