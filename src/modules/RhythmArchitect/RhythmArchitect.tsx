import { useState } from 'react';
import { Layers, Zap, Activity, Repeat, GraduationCap, BookOpen } from 'lucide-react';

import SubdivisionPyramid from './components/SubdivisionPyramid';
import SyncopationBuilder from './components/SyncopationBuilder';
import PolyrhythmGenerator from './components/PolyrhythmGenerator';
import MotivicDisplacement from './components/MotivicDisplacement';
import RhythmExercises from './components/RhythmExercises';
import StudyMethods from './components/StudyMethods';
import { InteractivePiano } from '../../components/InteractivePiano';

export default function RhythmArchitect() {
    const [activeTab, setActiveTab] = useState<'subdivision' | 'syncopation' | 'polyrhythm' | 'motive' | 'exercises' | 'methods'>('subdivision');
    const [showPiano, setShowPiano] = useState(true);

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white p-6 overflow-hidden">
            <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Rhythm Architect
                    </h1>
                    <button
                        onClick={() => setShowPiano(!showPiano)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${showPiano ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'}`}
                    >
                        {showPiano ? 'Hide Piano' : 'Show Piano'}
                    </button>
                </div>

                {/* Compact Navigation Tabs */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('subdivision')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'subdivision' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Layers size={14} />
                        Subdivisions
                    </button>
                    <button
                        onClick={() => setActiveTab('syncopation')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'syncopation' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Zap size={14} />
                        Syncopation
                    </button>
                    <button
                        onClick={() => setActiveTab('polyrhythm')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'polyrhythm' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Activity size={14} />
                        Polyrhythms
                    </button>
                    <button
                        onClick={() => setActiveTab('exercises')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'exercises' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <GraduationCap size={14} />
                        Exercises
                    </button>
                    <button
                        onClick={() => setActiveTab('methods')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'methods' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <BookOpen size={14} />
                        Methods
                    </button>
                    <button
                        onClick={() => setActiveTab('motive')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'motive' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <Repeat size={14} />
                        Displacement
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 bg-black/20 rounded-2xl border border-white/5 overflow-hidden relative min-h-0">
                <div className="absolute inset-0 overflow-y-auto p-2">
                    {activeTab === 'subdivision' && <SubdivisionPyramid />}
                    {activeTab === 'syncopation' && <SyncopationBuilder />}
                    {activeTab === 'polyrhythm' && <PolyrhythmGenerator />}
                    {activeTab === 'exercises' && <RhythmExercises />}
                    {activeTab === 'methods' && <StudyMethods />}
                    {activeTab === 'motive' && <MotivicDisplacement />}
                </div>
            </div>
            {/* Footer / Piano - ULTRA COMPACT */}
            {showPiano && (
                <div className="mt-2 border-t border-white/5 bg-black/40 shrink-0 overflow-hidden" style={{ height: '120px' }}>
                    <div className="transform scale-75 origin-top-center -mt-4">
                        <InteractivePiano startOctave={3} endOctave={5} enableSound={true} showInput={false} />
                    </div>
                </div>
            )}
        </div>
    );
}

