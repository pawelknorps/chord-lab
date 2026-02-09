import { useState } from 'react';
import { UpperStructureWidget } from '../modules/ChordLab/components/widgets/UpperStructureWidget';
import { NeoRiemannianWidget } from '../modules/ChordLab/components/widgets/NeoRiemannianWidget';
import { NegativeHarmonyWidget } from '../modules/ChordLab/components/widgets/NegativeHarmonyWidget';
import { getProgress, saveProgress, LESSONS } from '../core/store/session';
import type { Lesson } from '../core/store/session';
import { QuickExerciseJump } from '../components/widgets/QuickExerciseJump';

export default function ProgressionsPage() {
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const handleLessonSelect = (lesson: Lesson) => {
        setActiveLesson(lesson);
        setCurrentStep(0);
    };

    const handleBack = () => {
        setActiveLesson(null);
    };

    const handleComplete = () => {
        if (activeLesson) {
            saveProgress(activeLesson.id);
            setActiveLesson(null);
        }
    };


    const handleNext = () => {
        if (!activeLesson) return;
        if (currentStep < activeLesson.content.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderWidget = (widgetName?: string) => {
        switch (widgetName) {
            case 'UpperStructureWidget': return <UpperStructureWidget />;
            case 'NeoRiemannianWidget': return <NeoRiemannianWidget />;
            case 'NegativeHarmonyWidget': return <NegativeHarmonyWidget />;
            default: return null;
        }
    };



    if (!activeLesson) {
        // --- Browse View ---
        return (
            <div className="max-w-7xl mx-auto p-8 fade-in pb-20">
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent mb-6">
                        The Architectonics of Advanced Jazz
                    </h2>
                    <p className="text-white/50 mb-8 max-w-2xl">
                        Deep dive into advanced harmonic concepts. Unlock new colors for your progressions through interactive studies.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {LESSONS.map((lesson: Lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => handleLessonSelect(lesson)}
                                className="text-left p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:scale-110 transition transform">
                                    {lesson.concept.split(' ')[1]}
                                </div>
                                <div className="relative z-10">
                                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                                        {lesson.concept}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                                    <p className="text-sm text-white/50 mb-4 line-clamp-3">
                                        {lesson.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${lesson.difficulty === 'Expert' ? 'bg-purple-500/20 text-purple-300' :
                                            lesson.difficulty === 'Advanced' ? 'bg-amber-500/20 text-amber-300' :
                                                'bg-emerald-500/20 text-emerald-300'
                                            }`}>
                                            {lesson.difficulty}
                                        </span>
                                        {getProgress().includes(lesson.id) && (
                                            <span className="text-emerald-400 text-xs">✓ Completed</span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-12">
                    <QuickExerciseJump currentModule="ChordLab" />
                </div>
            </div>
        );
    }

    // --- Player View ---
    const step = activeLesson.content[currentStep];
    const progressPercent = ((currentStep + 1) / activeLesson.content.length) * 100;

    return (
        <div className="max-w-4xl mx-auto pb-20 fade-in">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={handleBack} className="text-white/50 hover:text-white transition">← Back to Menu</button>
                <div className="text-right">
                    <div className="text-sm text-cyan-400 font-bold uppercase tracking-widest">{activeLesson.concept}</div>
                    <h1 className="text-2xl font-bold text-white">{activeLesson.title}</h1>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full mb-12 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                <div className="prose prose-invert prose-lg max-w-none">
                    {/* Step Title/Header (if we add it to data) */}

                    {/* Text Content */}
                    <div className="whitespace-pre-wrap leading-relaxed text-white/90">
                        {step.content}
                    </div>

                    {/* Interactive Widget */}
                    {step.widget && (
                        <div className="my-8 animate-fade-in-up">
                            {renderWidget(step.widget)}
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 p-4 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition font-semibold"
                    >
                        Previous
                    </button>

                    <span className="text-white/40 text-sm">
                        Step {currentStep + 1} of {activeLesson.content.length}
                    </span>

                    <button
                        onClick={handleNext}
                        className="px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20 transition transform hover:scale-105"
                    >
                        {currentStep === activeLesson.content.length - 1 ? 'Finish Lesson 🎉' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
