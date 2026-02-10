import { useEffect, useState } from 'react';
import { Layers, Zap, Activity, Repeat, GraduationCap, BookOpen, Piano, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import SubdivisionPyramid from './components/SubdivisionPyramid';
import SyncopationBuilder from './components/SyncopationBuilder';
import PolyrhythmGenerator from './components/PolyrhythmGenerator';
import MotivicDisplacement from './components/MotivicDisplacement';
import RhythmExercises from './components/RhythmExercises';
import StudyMethods from './components/StudyMethods';
import { InteractivePiano } from '../../components/InteractivePiano';
import { useRhythmStore, RhythmLevel } from './state/useRhythmStore';
import { RhythmHUD } from './components/HUD';

export default function RhythmArchitect() {
    const { level, setLevel, difficulty } = useRhythmStore();
    const [showPiano, setShowPiano] = useState(false);

    const tabs = [
        { id: 'Subdivision', label: 'Pyramid Lab', icon: Layers },
        { id: 'Syncopation', label: 'Syncopation Lab', icon: Zap },
        { id: 'Polyrhythm', label: 'Polyrhythm Lab', icon: Activity },
        { id: 'Displacement', label: 'Displacement Lab', icon: Repeat },
        { id: 'Arena', label: 'Rhythm Arena', icon: GraduationCap },
        { id: 'Methodology', label: 'Library', icon: BookOpen },
    ] as const;

    useEffect(() => {
        import('tone').then(Tone => {
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
            }
        });
    }, [level]);

    return (
        <div className="flex h-full w-full bg-black text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_50%)] z-0" />

            {/* Minimalist Sidebar */}
            <aside className="w-64 flex flex-col border-r border-white/5 bg-black z-20 shadow-2xl relative">
                <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-indigo-500" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Rhythm Lab</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setLevel(tab.id as RhythmLevel)}
                            className={`
                                w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-all border-l-2
                                ${level === tab.id
                                    ? 'border-indigo-500 bg-white/5 text-white font-medium'
                                    : 'border-transparent text-white/40 hover:text-white hover:bg-white/[0.02]'
                                }
                            `}
                        >
                            <tab.icon size={16} className={level === tab.id ? 'text-indigo-400' : 'opacity-70'} />
                            <span className="tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5">
                    <div className="px-4 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-center">
                        <span className="text-[9px] uppercase font-black tracking-[0.2em] text-indigo-400">{difficulty} MODE</span>
                    </div>
                </div>
            </aside>

            {/* Main Work Area */}
            <main className="flex-1 flex flex-col relative z-10 bg-black">
                {/* Top Toolbar (HUD) */}
                <header className="h-14 flex items-center justify-between px-8 border-b border-white/5 bg-black">
                    <div className="flex items-center gap-2 text-white/90">
                        <Brain size={16} className="text-indigo-500" />
                        <span className="font-bold tracking-tight">{tabs.find(t => t.id === level)?.label}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <RhythmHUD />
                        <button
                            onClick={() => setShowPiano(!showPiano)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${showPiano ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}`}
                        >
                            <Piano size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Piano</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar active-area-container">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={level}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full flex items-center justify-center p-8"
                            >
                                <div className="w-full max-w-6xl">
                                    {level === 'Subdivision' && <SubdivisionPyramid />}
                                    {level === 'Syncopation' && <SyncopationBuilder />}
                                    {level === 'Polyrhythm' && <PolyrhythmGenerator />}
                                    {level === 'Arena' && <RhythmExercises />}
                                    {level === 'Methodology' && <StudyMethods />}
                                    {level === 'Displacement' && <MotivicDisplacement />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {showPiano && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-black/80 backdrop-blur-2xl z-40 h-32"
                            >
                                <button
                                    onClick={() => setShowPiano(false)}
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/10 rounded-full hover:bg-white/30 transition-all"
                                />
                                <div className="w-full h-full flex items-center justify-center px-4">
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
