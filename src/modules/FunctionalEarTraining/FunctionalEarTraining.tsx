import { useFunctionalEarTrainingStore } from './state/useFunctionalEarTrainingStore';
import { TendencyLevel } from './components/levels/TendencyLevel';
import { ModulationLevel } from './components/levels/ModulationLevel';
import { BassLevel } from './components/levels/BassLevel';
import { InterferenceLevel } from './components/levels/InterferenceLevel';
import { ProgressionsLevel } from './components/levels/ProgressionsLevel';
import { MelodyStepsLevel } from './components/levels/MelodyStepsLevel';
import { ChordQualitiesLevel } from './components/levels/ChordQualitiesLevel';
import { JazzStandardsLevel } from './components/levels/JazzStandardsLevel';
import { FretboardLevel } from './components/levels/FretboardLevel';
import { ChordTonesLevel } from './components/levels/ChordTonesLevel';
import { PositionsLevel } from './components/levels/PositionsLevel';
import { IntervalsLevel } from './components/levels/IntervalsLevel';
import { QuickExerciseJump } from '../../components/widgets/QuickExerciseJump';
import { useMasteryStore } from '../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Repeat, Anchor, Layers, Music, Zap, Piano, Binary, Guitar, Box, Brain, Sparkles, Network, GitBranch, Pyramid } from 'lucide-react';

export function FunctionalEarTraining() {
    const { level, setLevel, difficulty, setDifficulty, score, streak } = useFunctionalEarTrainingStore();
    const { globalLevel } = useMasteryStore();

    const levels = [
        { id: 'Tendency', label: 'Tendency Tones', icon: <Activity size={16} />, color: 'from-blue-400 to-cyan-400' },
        { id: 'Modulation', label: 'Modulation', icon: <Repeat size={16} />, color: 'from-purple-400 to-pink-400' },
        { id: 'Bass', label: 'Bass Function', icon: <Anchor size={16} />, color: 'from-indigo-400 to-blue-400' },
        { id: 'Interference', label: 'Interference', icon: <Layers size={16} />, color: 'from-orange-400 to-amber-400' },
        { id: 'Progressions', label: 'Progressions', icon: <Music size={16} />, color: 'from-emerald-400 to-teal-400' },
        { id: 'MelodySteps', label: 'Melody Steps', icon: <Zap size={16} />, color: 'from-orange-400 to-red-400' },
        { id: 'ChordQualities', label: 'Chord Qualities', icon: <Piano size={16} />, color: 'from-amber-400 to-yellow-400' },
        { id: 'JazzStandards', label: 'Jazz Standards', icon: <Music size={16} />, color: 'from-blue-400 to-indigo-400' },
        { id: 'Intervals', label: 'Pure Intervals', icon: <Binary size={16} />, color: 'from-indigo-400 to-purple-400' },
        { id: 'Fretboard', label: 'Fretboard', icon: <Guitar size={16} />, color: 'from-cyan-400 to-teal-400' },
        { id: 'ChordTones', label: 'Chord Tones', icon: <Layers size={16} />, color: 'from-orange-400 to-amber-400' },
        { id: 'Positions', label: 'Positions', icon: <Box size={16} />, color: 'from-pink-400 to-rose-400' },
        { id: 'SecondaryDominants', label: 'V/x Dominants', icon: <Network size={16} />, color: 'from-red-400 to-orange-400' },
        { id: 'ModalInterchange', label: 'Borrowed', icon: <GitBranch size={16} />, color: 'from-blue-400 to-indigo-400' },
        { id: 'UST', label: 'Upper Upper', icon: <Pyramid size={16} />, color: 'from-yellow-400 to-lime-400' },
    ] as const;

    return (
        <div className="flex flex-col h-full p-6 space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -ml-64 -mb-64 animate-pulse pointer-events-none" />

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex justify-between items-center glass-panel p-6 rounded-3xl border border-white/10 relative z-10 shadow-2xl"
            >
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] border border-cyan-500/20">
                        <Brain size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Aural Mastery</h1>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                                <Sparkles size={12} className="text-cyan-400" />
                                <span className="text-[10px] font-black text-white/80">LVL {globalLevel}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {(['Novice', 'Advanced', 'Pro'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${difficulty === d
                                        ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">Score</div>
                        <div className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 leading-none drop-shadow-sm">{score.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">Streak</div>
                        <div className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 leading-none">
                            <span className="text-2xl align-top mr-1">🔥</span>{streak}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl self-start border border-white/5 backdrop-blur-xl relative z-10 overflow-x-auto no-scrollbar max-w-full">
                {levels.map((l) => (
                    <button
                        key={l.id}
                        onClick={() => setLevel(l.id)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 relative group
                            ${level === l.id ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        {level === l.id && (
                            <motion.div
                                layoutId="level-bg"
                                className={`absolute inset-0 bg-gradient-to-r ${l.color} opacity-20 rounded-xl`}
                            />
                        )}
                        <span className={`${level === l.id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                            {l.icon}
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider relative z-10 whitespace-nowrap">
                            {l.label}
                        </span>
                        {level === l.id && (
                            <motion.div
                                layoutId="active-dot"
                                className="w-1 h-1 bg-white rounded-full ml-1"
                            />
                        )}
                    </button>
                ))}
            </div>

            <motion.div
                key={level}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 glass-panel rounded-[32px] p-8 relative overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] bg-white/[0.02]"
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={level}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {level === 'Tendency' && <TendencyLevel />}
                        {level === 'Modulation' && <ModulationLevel />}
                        {level === 'Bass' && <BassLevel />}
                        {level === 'Interference' && <InterferenceLevel />}
                        {level === 'Progressions' && <ProgressionsLevel />}
                        {level === 'MelodySteps' && <MelodyStepsLevel />}
                        {level === 'ChordQualities' && <ChordQualitiesLevel />}
                        {level === 'JazzStandards' && <JazzStandardsLevel />}
                        {level === 'Fretboard' && <FretboardLevel />}
                        {level === 'ChordTones' && <ChordTonesLevel />}
                        {level === 'Positions' && <PositionsLevel />}
                        {level === 'Intervals' && <IntervalsLevel />}
                        {level === 'SecondaryDominants' && <div className="text-white/20 font-black italic uppercase tracking-[0.5em] text-2xl">Secondary Dominants Coming Soon</div>}
                        {level === 'ModalInterchange' && <div className="text-white/20 font-black italic uppercase tracking-[0.5em] text-2xl">Modal Interchange Coming Soon</div>}
                        {level === 'UST' && <div className="text-white/20 font-black italic uppercase tracking-[0.5em] text-2xl">Upper Structures Coming Soon</div>}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            <div className="mt-4 relative z-10">
                <QuickExerciseJump currentModule="EarTraining" />
            </div>
        </div>
    );
}
