import { Play, Square, X } from 'lucide-react';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import * as Tone from 'tone';
import { useState, useEffect } from 'react';
import { isPlayingSignal, currentMeasureIndexSignal } from '../state/jazzSignals';
import { useSignals } from '@preact/signals-react/runtime';

interface BarRangeDrillProps {
    onClose: () => void;
}

export function BarRangeDrill({ onClose }: BarRangeDrillProps) {
    useSignals();
    const { currentSong, hotspots } = usePracticeStore();
    const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isDrillActive, setIsDrillActive] = useState(false);
    const [measurePositions, setMeasurePositions] = useState<DOMRect[]>([]);

    useEffect(() => {
        // Get positions of all measure elements
        const updatePositions = () => {
            const leadSheetGrid = document.querySelector('[data-leadsheet-grid]');
            if (leadSheetGrid) {
                // Get all children, but filter out the AnalysisOverlay which has 'pointer-events-none'
                const children = Array.from(leadSheetGrid.children);
                const measureElements = children.filter(el =>
                    el instanceof HTMLElement && !el.classList.contains('pointer-events-none')
                );

                const positions = measureElements.map(el => el.getBoundingClientRect());
                setMeasurePositions(positions);
            }
        };

        // Delay slightly to ensure LeadSheet has rendered
        const timer = setTimeout(updatePositions, 100);
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions);
        };
    }, [currentSong]);

    if (!currentSong) return null;

    const totalMeasures = currentSong.measures?.length || 0;

    const handleMeasureClick = (index: number) => {
        if (!isSelecting) {
            setSelectedRange([index, index]);
            setIsSelecting(true);
        } else {
            if (selectedRange) {
                const start = Math.min(selectedRange[0], index);
                const end = Math.max(selectedRange[0], index);
                setSelectedRange([start, end]);
                setIsSelecting(false);
            }
        }
    };

    const startDrill = async () => {
        if (!selectedRange) return;

        const [start, end] = selectedRange;
        // Set Tone.Transport loop
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = `${start}:0:0`;
        Tone.Transport.loopEnd = `${end + 1}:0:0`;
        Tone.Transport.position = `${start}:0:0`;

        if (!isPlayingSignal.value) {
            await Tone.start();
            Tone.Transport.start();
            isPlayingSignal.value = true;
        }

        setIsDrillActive(true);
    };

    const stopDrill = () => {
        Tone.Transport.loop = false;
        if (isPlayingSignal.value) {
            Tone.Transport.stop();
            isPlayingSignal.value = false;
        }
        setIsDrillActive(false);
    };

    const handleCloseInternal = () => {
        if (isDrillActive) stopDrill();
        setSelectedRange(null);
        setIsSelecting(false);
        onClose();
    };

    return (
        <>
            {/* Top instruction banner */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-orange-600 border border-orange-400/50 rounded-2xl px-8 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] pointer-events-auto min-w-[400px]">
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-0.5">
                            {isSelecting ? '📍 Select End Bar' : '📍 Select Start Bar'}
                        </h3>
                        <p className="text-xs font-bold text-orange-200 uppercase tracking-widest opacity-80">
                            {selectedRange && !isSelecting
                                ? `Practice Loop: Bars ${selectedRange[0] + 1} - ${selectedRange[1] + 1}`
                                : 'Choose a section to master'
                            }
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                        {selectedRange && !isSelecting && (
                            <button
                                onClick={isDrillActive ? stopDrill : startDrill}
                                className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 ${isDrillActive
                                    ? 'bg-white text-orange-600'
                                    : 'bg-orange-400 text-white hover:bg-orange-300'
                                    }`}
                            >
                                {isDrillActive ? (
                                    <>
                                        <Square size={14} fill="currentColor" />
                                        Stop Drill
                                    </>
                                ) : (
                                    <>
                                        <Play size={14} fill="currentColor" />
                                        Start Loop
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleCloseInternal}
                            className="p-2.5 bg-black/20 hover:bg-black/40 rounded-xl text-white transition-all hover:rotate-90"
                            title="Exit Drill Mode"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Measure overlays - positioned over actual measures */}
            {measurePositions.map((rect, i) => {
                if (i >= totalMeasures) return null;

                const isHotspot = hotspots.includes(i);
                const isInRange = selectedRange && i >= selectedRange[0] && i <= selectedRange[1];
                const isStart = selectedRange && i === selectedRange[0];
                const isEnd = selectedRange && i === selectedRange[1];
                const isActivePlayback = i === currentMeasureIndexSignal.value;

                return (
                    <div
                        key={i}
                        onClick={() => handleMeasureClick(i)}
                        className={`
                            fixed cursor-pointer transition-all duration-300 z-50 rounded-lg border-2
                            ${isInRange
                                ? 'bg-orange-500/30 border-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)]'
                                : 'bg-transparent border-transparent hover:bg-orange-500/10 hover:border-orange-500/30'
                            }
                            ${isStart ? 'ring-2 ring-white shadow-2xl z-[51]' : ''}
                            ${isEnd ? 'ring-2 ring-white shadow-2xl z-[51]' : ''}
                            ${isActivePlayback ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-black transition-none scale-105' : ''}
                        `}
                        style={{
                            top: `${rect.top}px`,
                            left: `${rect.left}px`,
                            width: `${rect.width}px`,
                            height: `${rect.height}px`,
                            pointerEvents: 'auto',
                        }}
                    >
                        {/* Status Tags */}
                        <div className="absolute -top-2 left-2 flex gap-1">
                            {(isStart || (isInRange && i % 4 === 0)) && (
                                <div className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded shadow-lg border border-white/20">
                                    BAR {i + 1}
                                </div>
                            )}
                            {isHotspot && (
                                <div className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded shadow-lg animate-pulse">
                                    HOTSPOT
                                </div>
                            )}
                        </div>

                        {/* Visual indicator of selection handle */}
                        {(isStart || isEnd) && (
                            <div className="absolute inset-0 border-4 border-white/30 rounded-lg animate-pulse pointer-events-none" />
                        )}
                    </div>
                );
            })}
        </>
    );
}
