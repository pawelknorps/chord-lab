import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { useITMPitchStore } from '../ITM/state/useITMPitchStore';
import { createPitchPipeline, type PitchPipeline } from '../../core/audio/pitchDetection';

interface SingingArchitectProps {
    targetNotes: string[];
    onPitchDetected: (midi: number) => void;
    isActive: boolean;
    /** When provided, use app-wide mic stream (MicrophoneService) instead of opening own getUserMedia. */
    stream?: MediaStream | null;
}

/** Min clarity (0–1) to report a pitch; avoids noise/breath triggering wrong notes. */
const MIN_CLARITY = 0.5;

/** Convert frequency (Hz) to MIDI note number. */
function frequencyToMidi(frequency: number): number {
    return Math.round(69 + 12 * Math.log2(frequency / 440));
}

const SingingArchitect: React.FC<SingingArchitectProps> = ({ onPitchDetected, isActive, stream: externalStream }) => {
    const [pitch, setPitch] = useState<number | null>(null);
    const [isMicOn, setIsMicOn] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    const [confidence, setConfidence] = useState(0);
    const ownsStreamRef = useRef(false);
    const rafRef = useRef<number>(0);
    /** Legacy pipeline when SharedArrayBuffer is not available. */
    const legacyPipelineRef = useRef<PitchPipeline | null>(null);

    const { initialize, setInstrumentProfile } = useITMPitchStore();

    const startMic = async () => {
        try {
            const stream =
                externalStream && externalStream.active
                    ? externalStream
                    : await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            if (!ownsStreamRef.current) ownsStreamRef.current = !externalStream;
            streamRef.current = stream;
            setIsMicOn(true);

            if (typeof SharedArrayBuffer !== 'undefined') {
                // High-performance pitch (SwiftF0 + CrepeStabilizer) with voice profile for singing
                await initialize(stream, 'voice', {
                    useSwiftF0: true,
                    useStabilizer: true,
                    stabilizerMode: 'full',
                });
                setInstrumentProfile('voice');
            } else {
                // Fallback: autocorrelation pipeline when COOP/COEP not enabled
                const pipeline = createPitchPipeline(stream);
                legacyPipelineRef.current = pipeline;
                pipeline.start((result) => {
                    if (result && result.frequency > 0 && result.clarity >= MIN_CLARITY) {
                        const midi = frequencyToMidi(result.frequency);
                        setPitch(midi);
                        setConfidence(result.clarity);
                        onPitchDetected(midi);
                    } else {
                        setPitch(null);
                        setConfidence(0);
                    }
                });
            }
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };

    // Poll high-performance store only when SAB is available (SwiftF0/MPM path)
    useEffect(() => {
        if (!isActive || !isMicOn || typeof SharedArrayBuffer === 'undefined') return;

        const loop = () => {
            if (!isActive) return;

            const store = useITMPitchStore.getState();
            if (!store.isReady || store.stream !== streamRef.current) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            const result = store.getLatestPitch();
            if (result && result.frequency > 0 && result.clarity >= MIN_CLARITY) {
                const midi = frequencyToMidi(result.frequency);
                setPitch(midi);
                setConfidence(result.clarity);
                onPitchDetected(midi);
            } else {
                setPitch(null);
                setConfidence(0);
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isActive, isMicOn, onPitchDetected]);

    const stopMic = () => {
        if (legacyPipelineRef.current) {
            legacyPipelineRef.current.stop();
            legacyPipelineRef.current = null;
        }
        if (streamRef.current && ownsStreamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        streamRef.current = null;
        setIsMicOn(false);
        // Don't call cleanup() — other parts of the app may use the same pitch context.
        setInstrumentProfile('general');
    };

    useEffect(() => {
        return () => {
            stopMic();
        };
    }, []);

    useEffect(() => {
        if (isActive && externalStream?.active && !isMicOn) {
            startMic();
        } else if (!isActive && isMicOn) {
            stopMic();
        }
    }, [isActive, externalStream?.active]);

    return (
        <div className="flex flex-col items-center">
            {!isMicOn && isActive && !externalStream && (
                <button
                    onClick={startMic}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold animate-pulse"
                >
                    <Mic size={24} /> Enable Microphone
                </button>
            )}

            {isMicOn && (
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center relative"
                        animate={{ scale: confidence > 0.5 ? 1.2 : 1 }}
                    >
                        <Mic size={32} className="text-red-500" />
                    </motion.div>
                    <div className="text-xl font-mono text-cyan-400">
                        {pitch != null ? `MIDI: ${pitch}` : 'Sing...'}
                    </div>
                    {typeof SharedArrayBuffer === 'undefined' && (
                        <p className="text-xs text-amber-500">
                            For best accuracy, enable high-performance pitch (COOP/COEP headers).
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SingingArchitect;
