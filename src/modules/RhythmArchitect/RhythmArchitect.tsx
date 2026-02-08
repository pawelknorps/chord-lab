import { useState } from 'react';
import { Layers, Zap, Activity, Repeat, GraduationCap } from 'lucide-react';

import SubdivisionPyramid from './components/SubdivisionPyramid';
import SyncopationBuilder from './components/SyncopationBuilder';
import PolyrhythmGenerator from './components/PolyrhythmGenerator';
import MotivicDisplacement from './components/MotivicDisplacement';
import RhythmExercises from './components/RhythmExercises';
import { InteractivePiano } from '../../components/InteractivePiano';

export default function RhythmArchitect() {
    const [activeTab, setActiveTab] = useState<'subdivision' | 'syncopation' | 'polyrhythm' | 'motive' | 'exercises'>('subdivision');

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white p-6 overflow-hidden">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    Rhythm Architect
                </h1>
                <p className="text-white/50 text-sm">
                    Master time feel, syncopation, and complex polyrhythms.
                </p>
            </header>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('subdivision')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'subdivision' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Layers size={18} />
                    Subdivisions
                </button>
                <button
                    onClick={() => setActiveTab('syncopation')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'syncopation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Zap size={18} />
                    Syncopation
                </button>
                <button
                    onClick={() => setActiveTab('polyrhythm')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'polyrhythm' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Activity size={18} />
                    Polyrhythms
                </button>
                <button
                    onClick={() => setActiveTab('exercises')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'exercises' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <GraduationCap size={18} />
                    Exercises
                </button>
                <button
                    onClick={() => setActiveTab('motive')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'motive' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                    <Repeat size={18} />
                    Displacement
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto">
                    {activeTab === 'subdivision' && <SubdivisionPyramid />}
                    {activeTab === 'syncopation' && <SyncopationBuilder />}
                    {activeTab === 'polyrhythm' && <PolyrhythmGenerator />}
                    {activeTab === 'exercises' && <RhythmExercises />}
                    {activeTab === 'motive' && <MotivicDisplacement />}
                </div>
            </div>
            {/* Footer / Piano */}
            <div className="mt-4 flex flex-col items-center gap-8 py-8 border-t border-white/5 bg-black/40">
                <InteractivePiano startOctave={3} endOctave={5} enableSound={true} />
                <div className="w-full max-w-6xl px-6">
                    <QuickExerciseJump currentModule="RhythmArchitect" />
                </div>
            </div>
        </div>
    );
}

import { QuickExerciseJump } from '../../components/widgets/QuickExerciseJump';
