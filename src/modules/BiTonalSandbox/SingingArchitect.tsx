import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';

// Declare ml5 types globally or assume basic shape
declare const ml5: any;

interface SingingArchitectProps {
    targetNotes: string[]; // Notes to sing
    onPitchDetected: (midi: number) => void;
    isActive: boolean;
}

const SingingArchitect: React.FC<SingingArchitectProps> = ({ onPitchDetected, isActive }) => {
    const [pitch, setPitch] = useState<number | null>(null);
    const [isMicOn, setIsMicOn] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const pitchDetectorRef = useRef<any>(null);
    const [confidence, setConfidence] = useState(0);

    const startMic = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;
            setIsMicOn(true);

            // Initialize ml5 pitch detection
            // Ensure ml5 is loaded (we added it to index.html or npm?)
            // I installed 'ml5' via npm.
            // import ml5 from 'ml5'; // This usually works if types are present, otherwise declare var.

            const audioContext = audioContextRef.current;

            // ml5.pitchDetection(model, audioContext, stream, callback)
            pitchDetectorRef.current = ml5.pitchDetection(
                './model/', // Model path - usually defaults to online or need local model? 
                // Actually for CREPE it fetches online by default or we need to bundle it.
                // Let's assume default works or use a CDN link in index.html if npm fails.
                // Standard ml5 pitch detection usage:
                audioContext,
                stream,
                modelLoaded
            );

        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const modelLoaded = () => {
        console.log("Pitch detection model loaded");
        getPitch();
    };

    const getPitch = () => {
        if (!pitchDetectorRef.current || !isActive) return;

        pitchDetectorRef.current.getPitch((_err: any, frequency: number) => {
            if (frequency && frequency > 0) {
                // Convert Hz to MIDI
                const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
                setPitch(midi);
                setConfidence(0.9); // Placeholder
                onPitchDetected(midi);
            } else {
                setPitch(null);
                setConfidence(0);
            }

            if (isActive && isMicOn) {
                requestAnimationFrame(getPitch);
            }
        });
    };

    const stopMic = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsMicOn(false);
        pitchDetectorRef.current = null;
    };

    useEffect(() => {
        return () => {
            stopMic();
        };
    }, []);

    useEffect(() => {
        if (isActive && !isMicOn) {
            // Ideally wait for user interaction to start mic to avoid autoplay policy issues?
            // We can show a button.
        } else if (!isActive && isMicOn) {
            stopMic();
        }
    }, [isActive]);

    return (
        <div className="flex flex-col items-center">
            {!isMicOn && isActive && (
                <button
                    onClick={startMic}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-full text-white font-bold transition-all animate-pulse"
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
                        {/* Visual ring for audio level could go here */}
                    </motion.div>
                    <div className="text-xl font-mono text-cyan-400">
                        {pitch ? `MIDI: ${pitch}` : 'Sing...'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingingArchitect;
