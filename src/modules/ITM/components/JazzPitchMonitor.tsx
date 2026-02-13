import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useITMPitchStore } from '../state/useITMPitchStore';
import { frequencyToNote, NoteInfo } from '../../../core/audio/frequencyToNote';
import { isPlayingSignal } from '../../../core/audio/audioSignals';
import { useSignals } from '@preact/signals-react/runtime';
import { TunerBar } from '../../../components/shared/TunerBar';

/**
 * JazzPitchMonitor (2026): A liquid, spring-animated pitch indicator.
 * Provides visual smoothing even when raw audio data is jittery.
 */
/** When playback is on, throttle pitch UI updates to reduce main-thread load and avoid glitches. */
const THROTTLE_WHEN_PLAYING = 2;

export const JazzPitchMonitor = () => {
    useSignals();
    const { getLatestPitch, isReady, startLatencyMeasurement, lastLatencyMs } = useITMPitchStore();
    const [noteInfo, setNoteInfo] = useState<NoteInfo | null>(null);
    const [isActive, setIsActive] = useState(false);
    const frameRef = useRef(0);

    useEffect(() => {
        if (!isReady) return;

        let rafId: number;
        const update = () => {
            const playing = isPlayingSignal.value;
            frameRef.current++;
            const shouldUpdate = playing
                ? frameRef.current % THROTTLE_WHEN_PLAYING === 0
                : true;
            if (shouldUpdate) {
                const pitch = getLatestPitch();
                if (pitch && pitch.frequency > 0) {
                    const info = frequencyToNote(pitch.frequency);
                    setNoteInfo(info);
                    setIsActive(true);
                } else {
                    setIsActive(false);
                }
            }
            rafId = requestAnimationFrame(update);
        };

        rafId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(rafId);
    }, [isReady, getLatestPitch]);

    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-center gap-2 z-[1000]">
            {/* Latency measure: button + readout (pointer-events-auto so clickable) */}
            {isReady && (
                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        type="button"
                        onClick={startLatencyMeasurement}
                        className="px-2 py-1 text-[10px] font-mono uppercase bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-600"
                    >
                        Measure latency
                    </button>
                    {lastLatencyMs !== null && (
                        <span className="text-[10px] font-mono text-emerald-400" title="Time from Measure click to first confident pitch in UI">
                            {lastLatencyMs.toFixed(0)} ms
                        </span>
                    )}
                </div>
            )}
            <div className="pointer-events-none">
                <AnimatePresence>
                    {isActive && noteInfo && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                boxShadow: `0 0 ${20 + Math.abs(noteInfo.centsDeviation)}px rgba(16, 185, 129, 0.4)`
                            }}
                            exit={{ opacity: 0, scale: 0.5, y: -20 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 0.8
                            }}
                            className="bg-black/80 backdrop-blur-xl border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center min-w-[120px]"
                        >
                            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Live Pitched Note</div>

                            <div className="flex items-baseline gap-1">
                                <motion.span
                                    key={noteInfo.noteName}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-4xl font-black text-emerald-400 font-mono"
                                >
                                    {noteInfo.pitchClass}
                                </motion.span>
                                <span className="text-xl text-emerald-600 font-bold">{noteInfo.octave}</span>
                            </div>

                            {/* Tuning Meter (The Liquid Smoother) - REQ-SF0-P05 */}
                            <TunerBar
                                cents={noteInfo.centsDeviation}
                                className="mt-3"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
