import { useState } from 'react';
import { UpperStructureWidget } from './widgets/UpperStructureWidget';
import { NeoRiemannianWidget } from './widgets/NeoRiemannianWidget';
import { NegativeHarmonyWidget } from './widgets/NegativeHarmonyWidget';
import { saveProgress } from '../../../core/store/session';
import type { Lesson } from '../../../core/store/session';

interface LessonEngineProps {
    lesson: Lesson;
    onComplete: () => void;
    onBack: () => void;
}

export function LessonEngine({ lesson, onComplete, onBack }: LessonEngineProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < lesson.content.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            saveProgress(lesson.id);
            onComplete();
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

    const step = lesson.content[currentStep];
    const progressPercent = ((currentStep + 1) / lesson.content.length) * 100;

    return (
        <div className="max-w-4xl mx-auto pb-20 fade-in">
            {/* Header Bar */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="text-white/50 hover:text-white transition">← Back to Menu</button>
                <div className="text-right">
                    <div className="text-sm text-cyan-400 font-bold uppercase tracking-widest">{lesson.concept}</div>
                    <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
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
                        Step {currentStep + 1} of {lesson.content.length}
                    </span>

                    <button
                        onClick={handleNext}
                        className="px-8 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20 transition transform hover:scale-105"
                    >
                        {currentStep === lesson.content.length - 1 ? 'Finish Lesson 🎉' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
