import React, { useState, useEffect, useMemo } from 'react';
import { useSignals } from "@preact/signals-react/runtime";
import { useJazzPlayback } from '../../hooks/useJazzPlayback';
import { usePracticeStore } from '../../../../core/store/usePracticeStore';
import { WalkthroughEngine, WalkthroughSession, WalkthroughStep } from '../../../../core/theory/WalkthroughEngine';
import { ConceptCard } from './ConceptCard';
import { ChevronLeft, ArrowRight, Music, X, Repeat, BookOpen } from 'lucide-react';

// Define the structure of the song object passed to this component
// It seems to be the processed "IRealFormat" object, not the raw JazzStandard
interface ProcessedSong {
    title: string;
    key: string;
    music: {
        measures: { chords: string[] }[];
    };
}

interface WalkthroughPanelProps {
    song: ProcessedSong;
    onClose: () => void;
    onExploreScales?: (chord: string) => void;
}




export const WalkthroughPanel: React.FC<WalkthroughPanelProps> = ({ song, onClose, onExploreScales }) => {
    useSignals();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [session, setSession] = useState<WalkthroughSession | null>(null);

    const { detectedPatterns } = usePracticeStore();

    // Initialize Walkthrough
    useEffect(() => {
        if (song && detectedPatterns) {
            const analysis = { concepts: detectedPatterns };

            const newSession = WalkthroughEngine.generate(
                analysis,
                song.title,
                song.key || 'C',
                song.music?.measures ? song.music.measures.length : 32
            );
            setSession(newSession);
            setCurrentStepIndex(0);
        }
    }, [song, detectedPatterns]);

    const currentStep = useMemo(() => {
        return session?.steps[currentStepIndex];
    }, [session, currentStepIndex]);

    const handleNext = () => {
        if (session && currentStepIndex < session.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Auto-focus logic would go here (communicating with parent to highlight bars)

    if (!session || !currentStep) return (
        <div className="flex items-center justify-center p-8 text-neutral-500 animate-pulse">
            Loading Lesson...
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-neutral-900/90 backdrop-blur-xl border-l border-white/5 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className="font-black text-lg text-white leading-tight">Guided Lesson</h2>
                        <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Step {currentStepIndex + 1} of {session.steps.length}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -z-10 rounded-full pointer-events-none" />

                {/* Narrative Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />

                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        {currentStep.title}
                    </h3>

                    <p className="text-neutral-300 leading-relaxed text-sm md:text-base font-medium">
                        {currentStep.narrative}
                    </p>

                    {currentStep.type === 'intro' && (
                        <div className="mt-4 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                            <Music className="text-indigo-400" size={20} />
                            <span className="text-xs text-indigo-300">
                                This interactive lesson will walk you through the harmonic structure of the tune. Use the arrows below to navigate.
                            </span>
                        </div>
                    )}
                </div>

                {/* Concepts Display */}
                {currentStep.concepts.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">
                            <span>Key Concepts</span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>
                        <div className="grid gap-3">
                            {currentStep.concepts.map((concept, idx) => (
                                <ConceptCard key={idx} concept={concept} onExploreScales={onExploreScales} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Area (Focus Loop) */}
                {currentStep.focusRange && (
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-neutral-500">
                                <Repeat size={14} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-neutral-200">Practice Loop</h4>
                                <p className="text-[10px] text-neutral-500">Bars {currentStep.focusRange.start + 1} - {currentStep.focusRange.end + 1}</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-500/30">
                            SET LOOP
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20 flex items-center gap-3">
                <button
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    onClick={handleNext}
                    disabled={session && currentStepIndex === session.steps.length - 1}
                    className="flex-1 p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                >
                    {currentStepIndex === session.steps.length - 1 ? (
                        <span>Finish Lesson</span>
                    ) : (
                        <>
                            <span>Next Step</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
