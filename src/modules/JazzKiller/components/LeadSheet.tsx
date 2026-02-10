import { useRef, useEffect } from 'react';
import { useSignals } from "@preact/signals-react/runtime";
import {
    currentMeasureIndexSignal,
    currentBeatSignal
} from '../state/jazzSignals';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { AnalysisOverlay } from './AnalysisOverlay';

interface LeadSheetProps {
    song: any;
    filteredPatterns?: any[];
}

export const LeadSheet = ({ song, filteredPatterns }: LeadSheetProps) => {
    useSignals();
    const activeRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const { detectedPatterns, activeFocusIndex, focusOnPattern, showAnalysis } = usePracticeStore();

    const patternsToDisplay = filteredPatterns || detectedPatterns;

    useEffect(() => {
        // Automatic scroll to active measure (React-based scroll is fine for measure changes)
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentMeasureIndexSignal.value]);


    if (!song || !song.music) return null;

    // Handle raw string case (if parser returns raw)
    if (typeof song.music === 'string') {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">{song.title}</h1>
                <p className="mb-4">Music format not fully parsed (Raw String):</p>
                <code className="block bg-neutral-100 p-4 rounded text-xs break-all text-left">
                    {song.music}
                </code>
            </div>
        );
    }

    if (!song.music.measures) return null;

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-[#fdf6e3] text-black font-serif rounded-lg shadow-2xl overflow-hidden relative">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            <div className="relative z-10">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-1 font-mono tracking-tighter">{song.title}</h1>
                <div className="flex justify-between text-xs md:text-sm uppercase tracking-widest border-b-2 border-black pb-4 mb-8 font-sans text-neutral-600">
                    <span>{song.style}</span>
                    <span>{song.composer}</span>
                </div>

                {/* Analysis Overlay - Visual Brackets */}
                <div className="relative">
                    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-0 border-t-2 border-b-2 border-black relative">
                        {/* Analysis Overlay Needs Access to Grid */}
                        {showAnalysis && (
                            <AnalysisOverlay
                                concepts={patternsToDisplay}
                                measureCount={song.music.measures.length}
                                onConceptClick={(concept, index) => focusOnPattern(index)}
                                activeFocusIndex={activeFocusIndex}
                                gridRef={gridRef}
                            />
                        )}

                        {song.music.measures.map((measure: any, index: number) => {
                            const isActive = index === currentMeasureIndexSignal.value;
                            const isSystemStart = index % 4 === 0;
                            const isSystemEnd = index % 4 === 3;

                            // Guide Tones for this measure
                            const { guideTones, showGuideTones } = usePracticeStore();
                            const gt = guideTones.get(index);

                            return (
                                <div
                                    key={index}
                                    ref={isActive ? activeRef : null}
                                    className={`
                                    relative h-24 md:h-32 p-2 flex flex-col items-center justify-center
                                    border-black
                                    ${!isSystemEnd ? 'border-r-2 md:border-r' : 'border-r-0'} 
                                    ${index >= 4 ? 'border-t' : ''}
                                    ${isActive ? 'bg-yellow-200/50 transition-colors duration-200' : ''}
                                `}
                                >
                                    {/* Measure Number */}
                                    {isSystemStart && (
                                        <span className="absolute top-1 left-1 text-[10px] text-neutral-500 font-sans">
                                            {index + 1}
                                        </span>
                                    )}

                                    {isActive && currentBeatSignal.value >= 0 && (
                                        <div
                                            className="absolute top-0 bottom-0 w-1 bg-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-20 transition-all duration-100"
                                            style={{ left: `${(currentBeatSignal.value / 4) * 100}%` }}
                                        />
                                    )}

                                    {/* Guide Tones (Inline) */}
                                    {showGuideTones && gt && (
                                        <div className="flex gap-1.5 text-xs md:text-sm font-bold justify-center items-center mb-1 md:mb-2 z-10 transition-opacity duration-200">
                                            <span className="text-emerald-600 bg-emerald-50/90 px-2 py-0.5 rounded-md shadow-sm border border-emerald-200/50 backdrop-blur-sm">
                                                3: {gt.third}
                                            </span>
                                            <span className="text-blue-600 bg-blue-50/90 px-2 py-0.5 rounded-md shadow-sm border border-blue-200/50 backdrop-blur-sm">
                                                7: {gt.seventh}
                                            </span>
                                        </div>
                                    )}

                                    {/* Chords */}
                                    <div className="text-2xl md:text-3xl font-bold font-jazz w-full text-center z-10 relative">
                                        {renderMeasureChords(measure)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const renderMeasureChords = (measure: any) => {
    // If chords is array of strings
    // Fallback if not parsed correctly
    const chords = measure.chords;
    if (!chords || !Array.isArray(chords)) {
        // Debug: if string, split it
        if (typeof measure === 'string') return measure;
        return null;
    }

    // Logic to space chords
    if (chords.length === 0) return <span className="text-neutral-300">/</span>;

    return (
        <div className="flex w-full justify-around items-baseline">
            {chords.map((chord: string, i: number) => (
                <span key={i} className="">
                    {formatChord(chord)}
                </span>
            ))}
        </div>
    );
};

const formatChord = (c: string) => {
    if (!c) return "";
    return c
        .replace(/\^/g, 'Δ')
        .replace(/-/g, '-')
        .replace(/h/g, 'ø')
        .replace(/o/g, '°');
}
