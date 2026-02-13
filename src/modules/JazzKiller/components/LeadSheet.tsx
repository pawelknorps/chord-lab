import { useRef, useEffect, useMemo } from 'react';
import { useSignals } from "@preact/signals-react/runtime";
import {
    currentMeasureIndexSignal,
    currentBeatSignal,
    selectedMeasureRangeSignal,
    isPlayingSignal
} from '../state/jazzSignals';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { JazzTheoryService } from '../utils/JazzTheoryService';
import { getMeterAtBar, getParsedMeterAtBar } from '../utils/meterTranslator';
import type { LiveOverrides } from '../../../core/theory/liveHarmonicGrounding';
import { AnalysisOverlay } from './AnalysisOverlay';
import { PerformanceHeatmapOverlay } from './PerformanceHeatmapOverlay';
import { StandardsExerciseHeatmapOverlay } from './StandardsExerciseHeatmapOverlay';
import { useStandardsExerciseHeatmapStore } from '../state/useStandardsExerciseHeatmapStore';

interface LeadSheetProps {
    song: any;
    filteredPatterns?: any[];
    onChordClick?: (chord: string, measureIndex: number) => void;
    /** When true, show Standards Exercise error heatmap instead of scoring heatmap (Phase 15). */
    showExerciseHeatmap?: boolean;
    /** Phase 21: live overrides (subV7, pedal, chordTone) from mic; shown on current-measure bracket when showLiveAnalysis is on. */
    liveOverrides?: LiveOverrides | null;
    /** When true, show chord tone/extension (e.g. R, #11) in the live label */
    showLiveChordTone?: boolean;
}

export const LeadSheet = ({ song, filteredPatterns, onChordClick, showExerciseHeatmap, liveOverrides, showLiveChordTone }: LeadSheetProps) => {
    useSignals();
    const activeRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const { detectedPatterns, activeFocusIndex, focusOnPattern, showAnalysis, guideTones, showGuideTones, guideToneSpotlightMode, guideToneBarsHit } = usePracticeStore();
    const exerciseStatsByMeasure = useStandardsExerciseHeatmapStore((s) => s.statsByMeasure);

    // Access signals at top level for reactivity
    const curMeasure = currentMeasureIndexSignal.value;
    const curBeat = currentBeatSignal.value;
    const isPlaying = isPlayingSignal.value;

    const patternsToDisplay = filteredPatterns || detectedPatterns;

    useEffect(() => {
        // Automatic scroll to active measure
        if (activeRef.current && curMeasure >= 0) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [curMeasure]);

    const handleMeasureClick = (index: number, isAlt: boolean) => {
        const current = selectedMeasureRangeSignal.value;
        if (isAlt && current) {
            const start = Math.min(current[0], index);
            const end = Math.max(current[0], index);
            selectedMeasureRangeSignal.value = [start, end];
        } else {
            // Toggle selection if clicking the same single measure
            if (current && current[0] === index && current[1] === index) {
                selectedMeasureRangeSignal.value = null;
            } else {
                selectedMeasureRangeSignal.value = [index, index];
            }
        }
    };


    if (!song || !song.music) return null;

    // Handle raw string case (if parser returns raw)
    if (typeof song.music === 'string') {
        return (
            <div className="p-8 text-center text-black bg-[#fdf6e3]">
                <h1 className="text-2xl font-bold mb-4">{song.title}</h1>
                <p className="mb-4">Music format not fully parsed (Raw String):</p>
                <code className="block bg-black/5 p-4 rounded text-xs break-all text-left">
                    {song.music}
                </code>
            </div>
        );
    }

    if (!song.music.measures) return null;

    const selectedRange = selectedMeasureRangeSignal.value;
    const defaultMeter = song.TimeSignature || '4/4';
    const ROW_SIZE = 4;
    const measures = song.music.measures;

    // Chunk measures into rows of 4 for layout (DMP-09: bar width by meter)
    const rows = useMemo(() => {
        const out: number[][] = [];
        for (let i = 0; i < measures.length; i += ROW_SIZE) {
            out.push(Array.from({ length: Math.min(ROW_SIZE, measures.length - i) }, (_, j) => i + j));
        }
        return out;
    }, [measures.length]);

    return (
        <div className="w-full max-w-5xl min-w-0 mx-auto p-1.5 md:p-8 bg-[#fdf6e3] text-black font-serif rounded-lg shadow-2xl overflow-auto relative">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>

            <div className="relative z-10">
                <h1 className="text-2xl md:text-5xl font-bold text-center mb-1 font-mono tracking-tighter">{song.title}</h1>
                <div className="flex justify-between text-[8px] md:text-sm uppercase tracking-widest border-b-2 border-black pb-2 md:pb-4 mb-4 md:mb-8 font-sans text-neutral-600">
                    <span>{song.style}</span>
                    <span>{song.composer}</span>
                </div>

                {/* Analysis Overlay - Visual Brackets */}
                <div className="relative">
                    <div ref={gridRef} data-leadsheet-grid className="flex flex-col gap-y-0 border-2 border-black relative">
                        {/* Analysis Overlay Needs Access to Grid */}
                        {showAnalysis && (
                            <AnalysisOverlay
                                concepts={patternsToDisplay}
                                onConceptClick={(_, index) => focusOnPattern(index)}
                                activeFocusIndex={activeFocusIndex}
                                gridRef={gridRef}
                                liveOverrides={liveOverrides}
                                currentMeasureIndex={curMeasure}
                                showLiveChordTone={showLiveChordTone}
                            />
                        )}

                        {rows.map((rowIndices, rowIdx) => {
                            const rowWeight = rowIndices.reduce(
                                (sum, i) => sum + getParsedMeterAtBar(i, song.meterChanges, defaultMeter).divisionsPerBar,
                                0
                            );
                            return (
                                <div key={rowIdx} className="flex w-full border-t border-black first:border-t-0">
                                    {rowIndices.map((index: number) => {
                                        const measure = measures[index];
                                        const isActive = index === curMeasure;
                                        const isLastMeasure = index === measures.length - 1;
                                        const isSystemStart = index % ROW_SIZE === 0;
                                        const isInSelectedRange = selectedRange && index >= selectedRange[0] && index <= selectedRange[1];
                                        const parsed = getParsedMeterAtBar(index, song.meterChanges, defaultMeter);
                                        const widthPct = rowWeight > 0 ? (parsed.divisionsPerBar / rowWeight) * 100 : 25;
                                        const isMeterChangeBar = song.meterChanges?.some((c: { bar: number }) => c.bar === index + 1);
                                        const meterLabel = isMeterChangeBar ? getMeterAtBar(index, song.meterChanges, defaultMeter) : null;
                                        const gt = guideTones.get(index);

                                        return (
                                            <div
                                                key={index}
                                                ref={isActive ? activeRef : null}
                                                onClick={(e) => handleMeasureClick(index, e.altKey || e.shiftKey)}
                                                style={{ width: `${widthPct}%`, minWidth: 0 }}
                                                className={`
                                                relative h-20 md:h-32 p-1 md:p-2 flex flex-col items-center justify-center
                                                border-black cursor-cell group/measure flex-shrink-0
                                                border-r md:border-r-2 last:border-r-0
                                                ${isActive ? 'bg-yellow-100/80 ring-2 ring-amber-400 z-50 transition-all duration-200 shadow-inner' : ''}
                                                ${guideToneSpotlightMode && guideToneBarsHit[index] ? 'bg-emerald-500/30 ring-2 ring-emerald-400' : ''}
                                                ${isInSelectedRange ? 'bg-cyan-500/10 ring-2 ring-inset ring-cyan-500/30' : ''}
                                                hover:bg-black/5 transition-all
                                            `}
                                            >
                                                {showExerciseHeatmap ? (
                                                    <StandardsExerciseHeatmapOverlay measureIndex={index} statsByMeasure={exerciseStatsByMeasure} />
                                                ) : (
                                                    <PerformanceHeatmapOverlay measureIndex={index} />
                                                )}
                                                {isInSelectedRange && (
                                                    <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none" />
                                                )}

                                                {measure.sectionLabel && measure.isFirstOfSection && (
                                                    <div className="absolute -top-3 -left-3 bg-black text-white w-7 h-7 flex items-center justify-center font-bold rounded shadow-lg z-30 transform -rotate-3 text-lg border-2 border-white">
                                                        {measure.sectionLabel}
                                                    </div>
                                                )}

                                                {measure.endingNumber && measure.isFirstOfEnding && (
                                                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-black z-10 flex items-start justify-start p-0.5">
                                                        <span className="text-[10px] font-bold font-mono leading-none">{measure.endingNumber}.</span>
                                                    </div>
                                                )}

                                                {/* DMP-10: meter marker at change bars */}
                                                {meterLabel && (
                                                    <div className="absolute top-0.5 right-2 text-[9px] md:text-[10px] font-bold font-mono text-neutral-600 bg-amber-100/90 px-1 rounded z-40 border border-amber-300/50">
                                                        {meterLabel}
                                                    </div>
                                                )}

                                                {(isSystemStart || measure.isFirstOfSection) && (
                                                    <span className="absolute top-0.5 left-2 text-[8px] md:text-[10px] text-neutral-500 font-sans z-40">
                                                        {index + 1}
                                                    </span>
                                                )}

                                                {measure.isStartRepeat && (
                                                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-[60]">
                                                        <div className="w-1 md:w-1.5 h-full bg-black shadow-sm"></div>
                                                        <div className="w-[1px] h-full bg-black ml-[1px] md:ml-[2px]"></div>
                                                        <div className="flex flex-col gap-2 ml-1 md:ml-2">
                                                            <div className="w-1 md:w-1.2 h-1 md:h-1.2 bg-black rounded-full shadow-sm"></div>
                                                            <div className="w-1 md:w-1.2 h-1 md:h-1.2 bg-black rounded-full shadow-sm"></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {measure.isEndRepeat && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none z-[60]">
                                                        <div className="flex flex-col gap-2 mr-1 md:mr-2">
                                                            <div className="w-1 md:w-1.2 h-1 md:h-1.2 bg-black rounded-full shadow-sm"></div>
                                                            <div className="w-1 md:w-1.2 h-1 md:h-1.2 bg-black rounded-full shadow-sm"></div>
                                                        </div>
                                                        <div className="w-[1px] h-full bg-black mr-[1px] md:mr-[2px]"></div>
                                                        <div className="w-1 md:w-1.5 h-full bg-black shadow-sm"></div>
                                                    </div>
                                                )}

                                                {measures[index + 1]?.afterDoubleBar && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none z-[60]">
                                                        <div className="w-[1px] h-full bg-black mr-[2px]"></div>
                                                        <div className="w-1.5 md:w-2 h-full bg-black shadow-sm"></div>
                                                    </div>
                                                )}
                                                {isLastMeasure && !measure.isEndRepeat && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none z-[60]">
                                                        <div className="w-[1px] h-full bg-black mr-[2px]"></div>
                                                        <div className="w-1.5 md:w-2 h-full bg-black shadow-sm"></div>
                                                    </div>
                                                )}

                                                {showGuideTones && gt && gt.length > 0 && (
                                                    <div className="flex gap-1 md:gap-3 justify-center items-center mb-0.5 md:mb-2 z-10 transition-opacity duration-200">
                                                        {gt.map((tone: any, i: number) => (
                                                            <div key={i} className="flex gap-0.5 md:gap-1.5 text-[8px] md:text-sm font-bold items-center">
                                                                <span className="text-emerald-600 bg-emerald-50/90 px-1 md:px-2 py-0 md:py-0.5 rounded shadow-sm border border-emerald-200/50 backdrop-blur-sm" title="3rd">
                                                                    {tone.third}
                                                                </span>
                                                                <span className="text-blue-600 bg-blue-50/90 px-1 md:px-2 py-0 md:py-0.5 rounded shadow-sm border border-blue-200/50 backdrop-blur-sm" title="7th">
                                                                    {tone.seventh}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="text-sm sm:text-base md:text-3xl font-bold font-jazz w-full text-center z-10 relative leading-tight">
                                                    {renderMeasureChords(measure, index, onChordClick)}
                                                </div>

                                                {!selectedRange && (
                                                    <div className="absolute inset-0 opacity-0 group-hover/measure:opacity-100 bg-cyan-500/5 flex items-center justify-center transition-opacity pointer-events-none">
                                                        <div className="bg-cyan-500/80 text-white text-[8px] font-black uppercase tracking-tighter px-1 rounded">Focus</div>
                                                    </div>
                                                )}

                                                {/* DMP-11: playhead position by current bar meter (divisionsPerBar) */}
                                                {isActive && isPlaying && (
                                                    <div
                                                        className="absolute inset-y-0 w-1.5 md:w-2 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-[200] pointer-events-none transition-all duration-75"
                                                        style={{
                                                            left: `${parsed.divisionsPerBar > 0 ? (Math.max(0, curBeat) / parsed.divisionsPerBar) * 100 : 0}%`,
                                                        }}
                                                    >
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rotate-45 -translate-y-1/2 shadow-lg" />
                                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 rotate-45 translate-y-1/2 shadow-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const renderMeasureChords = (measure: any, measureIndex: number, onChordClick?: (chord: string, measureIndex: number) => void) => {
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
            {chords.map((chord: string, i: number) => {
                const { main, optionals } = JazzTheoryService.parseChordWithOptional(chord);
                const hasOptional = optionals.length > 0;
                const hasMain = main.length > 0;
                return (
                    <span
                        key={i}
                        className={`cursor-pointer hover:text-purple-600 transition-colors active:scale-95 px-1 flex flex-col items-center justify-end ${chord === '' ? 'pointer-events-none' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            const forClick = main || optionals[0] || chord;
                            if (forClick && onChordClick) onChordClick(forClick, measureIndex);
                        }}
                    >
                        {hasOptional && (
                            <span className="text-[0.5em] md:text-[0.55em] leading-tight text-neutral-500 font-normal opacity-90">
                                {optionals.map((opt) => formatChord(opt)).join(' ')}
                            </span>
                        )}
                        {hasMain && (
                            <span className={hasOptional ? 'text-[0.85em] md:text-[0.9em]' : ''}>
                                {formatChord(main)}
                            </span>
                        )}
                        {!hasMain && !hasOptional && chord && (
                            <span>{formatChord(chord)}</span>
                        )}
                    </span>
                );
            })}
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
