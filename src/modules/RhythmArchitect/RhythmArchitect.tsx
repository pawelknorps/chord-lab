import { useState, useEffect } from 'react';
import { Layers, Zap, Activity, Repeat, GraduationCap, BookOpen, Piano } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const tabs = [
        { id: 'subdivision', label: 'Subdivisions', icon: Layers },
        { id: 'syncopation', label: 'Syncopation', icon: Zap },
        { id: 'polyrhythm', label: 'Polyrhythms', icon: Activity },
        { id: 'exercises', label: 'Exercises', icon: GraduationCap },
        { id: 'methods', label: 'Study Methods', icon: BookOpen },
        { id: 'motive', label: 'Displacement', icon: Repeat },
    ] as const;
    // Safety Audio Stop on Tab Change
    useEffect(() => {
        // Force stop any running transport when switching views
        // This ensures no rhythm engine is left playing
        import('tone').then(Tone => {
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
            }
        });
    }, [activeTab]);

    return (
        <div className="flex h-full w-full bg-black text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black z-0" />
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

            {/* Glass Sidebar */}
            <aside className="w-72 flex flex-col border-r border-white/5 bg-white/5 backdrop-blur-2xl z-20 shadow-2xl relative">
                <div className="h-24 flex items-center px-8 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shadow-inner ring-1 ring-indigo-500/20">
                            <Activity size={22} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-white leading-none mb-1">Rhythm Lab</h1>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Architect</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-8 px-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group w-full flex items-center gap-4 px-5 py-4 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden
                                ${activeTab === tab.id
                                    ? 'bg-white/10 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] ring-1 ring-white/10 translate-x-1'
                                    : 'text-white/40 hover:text-white hover:bg-white/5 hover:translate-x-1'
                                }
                            `}
                        >
                            <div className={`
                                flex items-center justify-center transition-colors duration-300
                                ${activeTab === tab.id ? 'text-indigo-400' : 'text-white/30 group-hover:text-indigo-300'}
                            `}>
                                <tab.icon size={20} />
                            </div>
                            <span className="tracking-wide">{tab.label}</span>

                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-glow"
                                    className="absolute right-4 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-white/5 text-center">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">v2.0 Rhythm Engine</p>
                </div>
            </aside>

            {/* Main Work Area */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Header Toolbar - Floating Glass */}
                <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm z-30">
                    <div className="flex items-center gap-3 text-white">
                        <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                        <span className="text-2xl font-bold tracking-tight">{tabs.find(t => t.id === activeTab)?.label}</span>
                    </div>

                    <button
                        onClick={() => setShowPiano(!showPiano)}
                        className={`
                            flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border
                            ${showPiano
                                ? 'bg-white/10 text-white border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                : 'bg-transparent text-white/40 border-white/5 hover:bg-white/5 hover:text-white hover:border-white/10'
                            }
                        `}
                    >
                        <Piano size={16} />
                        {showPiano ? 'Hide Piano' : 'Show Piano'}
                    </button>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pb-32">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.15 } }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full max-w-6xl mx-auto"
                            >
                                {activeTab === 'subdivision' && <SubdivisionPyramid />}
                                {activeTab === 'syncopation' && <SyncopationBuilder />}
                                {activeTab === 'polyrhythm' && <PolyrhythmGenerator />}
                                {activeTab === 'exercises' && <RhythmExercises />}
                                {activeTab === 'methods' && <StudyMethods />}
                                {activeTab === 'motive' && <MotivicDisplacement />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Piano Footer - Glass Overlay */}
                    <AnimatePresence>
                        {showPiano && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-2xl z-40 h-[160px]"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-white/20 rounded-full" />
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <InteractivePiano startOctave={3} endOctave={5} enableSound={true} showInput={false} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

