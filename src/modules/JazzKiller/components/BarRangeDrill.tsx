import { Play, Square, X } from 'lucide-react';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import * as Tone from 'tone';
import { useState, useEffect, useRef } from 'react';

export function BarRangeDrill() {
    const { currentSong, hotspots } = usePracticeStore();
    const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isDrillActive, setIsDrillActive] = useState(false);
    const [measurePositions, setMeasurePositions] = useState<DOMRect[]>([]);

    useEffect(() => {
        // Get positions of all measure elements
        const updatePositions = () => {
            const leadSheetGrid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
            if (leadSheetGrid) {
                const measureElements = leadSheetGrid.querySelectorAll(':scope > div');
                const positions = Array.from(measureElements).map(el => el.getBoundingClientRect());
                setMeasurePositions(positions);
            }
        };

        updatePositions();
        window.addEventListener('resize', updatePositions);
        window.addEventListener('scroll', updatePositions);

        return () => {
            window.removeEventListener('resize', updatePositions);
            window.removeEventListener('scroll', updatePositions);
        };
    }, [currentSong]);

    if (!currentSong) return null;

    const totalMeasures = currentSong.chords?.length || 0;

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
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = `${start}:0:0`;
        Tone.Transport.loopEnd = `${end + 1}:0:0`;
        Tone.Transport.position = `${start}:0:0`;

        const { isPlaying, togglePlayback } = usePracticeStore.getState();
        if (!isPlaying) await togglePlayback();

        setIsDrillActive(true);
    };

    const stopDrill = async () => {
        Tone.Transport.loop = false;
        const { isPlaying, togglePlayback } = usePracticeStore.getState();
        if (isPlaying) await togglePlayback();
        setIsDrillActive(false);
    };

    const handleClose = () => {
        if (isDrillActive) stopDrill();
        setSelectedRange(null);
        setIsSelecting(false);
        // Close the drill mode
        const closeButton = document.querySelector('[title="Bar Range Drill"]') as HTMLButtonElement;
        closeButton?.click();
    };

    return (
        <>
            {/* Top instruction banner */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-orange-500/95 backdrop-blur-md border border-orange-400/50 rounded-2xl px-8 py-4 shadow-2xl z-50 pointer-events-auto">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                            {isSelecting ? '📍 Click End Measure' : '📍 Click Start Measure'}
                        </h3>
                        <p className="text-sm text-orange-100">
                            {selectedRange && !isSelecting
                                ? `Selected: Measures ${selectedRange[0] + 1} - ${selectedRange[1] + 1}`
                                : 'Select a range of measures to loop and practice'
                            }
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {selectedRange && !isSelecting && (
                            <button
                                onClick={isDrillActive ? stopDrill : startDrill}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isDrillActive
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-white hover:bg-orange-50 text-orange-600'
                                    }`}
                            >
                                {isDrillActive ? (
                                    <>
                                        <Square size={18} fill="currentColor" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Play size={18} fill="currentColor" />
                                        Start Loop
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"
                            title="Close"
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

                return (
                    <div
                        key={i}
                        onClick={() => handleMeasureClick(i)}
                        className={`
              fixed cursor-pointer transition-all duration-200 z-40 rounded-lg
              ${isInRange
                                ? 'bg-orange-400/40 border-4 border-orange-500 shadow-lg'
                                : 'hover:bg-orange-300/30 border-2 border-orange-400/40'
                            }
              ${isStart ? 'ring-4 ring-orange-400 shadow-2xl' : ''}
              ${isEnd ? 'ring-4 ring-orange-400 shadow-2xl' : ''}
              ${isHotspot ? 'border-red-500/60' : ''}
            `}
                        style={{
                            top: `${rect.top}px`,
                            left: `${rect.left}px`,
                            width: `${rect.width}px`,
                            height: `${rect.height}px`,
                            pointerEvents: 'auto',
                        }}
                    >
                        {/* Measure number indicator */}
                        {(isStart || isEnd || (isInRange && i % 4 === 0)) && (
                            <div className="absolute -top-3 -left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white">
                                {i + 1}
                            </div>
                        )}

                        {/* Hotspot indicator */}
                        {isHotspot && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg" title="Practice Hotspot" />
                        )}
                    </div>
                );
            })}
        </>
    );
}
