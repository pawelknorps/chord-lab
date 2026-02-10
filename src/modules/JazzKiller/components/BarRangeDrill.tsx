import { Play, Square } from 'lucide-react';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import * as Tone from 'tone';
import { useState } from 'react';

export function BarRangeDrill() {
    const { currentSong, hotspots } = usePracticeStore();
    const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isDrillActive, setIsDrillActive] = useState(false);

    if (!currentSong) return null;

    const totalMeasures = currentSong.music.measures.length;
    const measuresPerRow = 4;
    const rows = Math.ceil(totalMeasures / measuresPerRow);

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

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-2">Custom Bar Range Drill</h2>
                <p className="text-sm text-neutral-400 mb-6">
                    {isSelecting ? 'Click end measure' : 'Click start measure'}
                </p>

                {/* Measure Grid */}
                <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${measuresPerRow}, 1fr)` }}>
                    {Array.from({ length: totalMeasures }).map((_, i) => {
                        const isHotspot = hotspots.includes(i);
                        const isInRange = selectedRange && i >= selectedRange[0] && i <= selectedRange[1];
                        const isStart = selectedRange && i === selectedRange[0];
                        const isEnd = selectedRange && i === selectedRange[1];

                        return (
                            <button
                                key={i}
                                onClick={() => handleMeasureClick(i)}
                                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${isInRange ? 'bg-blue-500/20 border-blue-500' : 'bg-neutral-800 border-white/10'}
                  ${isStart || isEnd ? 'ring-4 ring-blue-400' : ''}
                  ${isHotspot ? 'border-red-500/50' : ''}
                  hover:border-blue-400
                `}
                            >
                                <div className="text-sm font-bold text-white">{i + 1}</div>
                                {isHotspot && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-neutral-400">
                        {selectedRange && !isSelecting && (
                            <span>Selected: Measures {selectedRange[0] + 1} - {selectedRange[1] + 1}</span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setSelectedRange(null);
                                setIsSelecting(false);
                                if (isDrillActive) stopDrill();
                            }}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-all"
                        >
                            Cancel
                        </button>

                        {selectedRange && !isSelecting && (
                            <button
                                onClick={isDrillActive ? stopDrill : startDrill}
                                className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isDrillActive
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white`}
                            >
                                {isDrillActive ? (
                                    <>
                                        <Square size={16} />
                                        Stop Drill
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} />
                                        Start Drill
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
