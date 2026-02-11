import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeProgression, decodeChord } from '../../core/routing/deepLinks';
import { useFunctionalEarTrainingStore } from './state/useFunctionalEarTrainingStore';
import { useMusicalClipboard } from '../../core/state/musicalClipboard';
import { TendencyLevel } from './components/levels/TendencyLevel';
import { ModulationLevel } from './components/levels/ModulationLevel';
import { BassLevel } from './components/levels/BassLevel';
import { InterferenceLevel } from './components/levels/InterferenceLevel';
import { HarmonicContextLevel } from './components/levels/HarmonicContextLevel';
import { InstrumentMappingLevel } from './components/levels/InstrumentMappingLevel';
import { IntervalsLevel } from './components/levels/IntervalsLevel';
import { MelodyStepsLevel } from './components/levels/MelodyStepsLevel';
import { ChordQualitiesLevel } from './components/levels/ChordQualitiesLevel';
import { ChordTonesLevel } from './components/levels/ChordTonesLevel';
import { SecondaryDominantsLevel } from './components/levels/SecondaryDominantsLevel';
import { ModalInterchangeLevel } from './components/levels/ModalInterchangeLevel';
import { FretboardLevel } from './components/levels/FretboardLevel';
import { PositionsLevel } from './components/levels/PositionsLevel';
import { JazzStandardsLevel } from './components/levels/JazzStandardsLevel';
import { ProgressionsLevel } from './components/levels/ProgressionsLevel';
import { HUD } from './components/HUD';
import { FocusAreaPanel } from './components/FocusAreaPanel';
import { useMasteryStore } from '../../core/store/useMasteryStore';
import { useAudioCleanup } from '../../hooks/useAudioManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Repeat, Anchor, Layers, Music, Zap, Piano, Binary, Guitar, Box, Brain, Sparkles, Network, GitBranch, Pyramid } from 'lucide-react';

export function FunctionalEarTraining() {
    useAudioCleanup('functional-ear-training');
    const { level, setLevel, setExternalData } = useFunctionalEarTrainingStore();
    const [searchParams] = useSearchParams();
    const { globalLevel } = useMasteryStore();
    const { pasteProgression, pasteChord, clear: clearClipboard } = useMusicalClipboard();

    useEffect(() => {
        // 1. Check SearchParams (Deep Linking)
        const deepProg = decodeProgression(searchParams);
        if (deepProg) {
            const exercise = searchParams.get('exercise');
            if (exercise === 'JazzStandards' || exercise === 'Progressions') {
                setLevel('HarmonicContext');
            } else {
                setLevel('HarmonicContext');
            }
            setExternalData(deepProg);
            return;
        }

        const deepChord = decodeChord(searchParams);
        if (deepChord) {
            setLevel('ChordQualities');
            setExternalData(deepChord);
            return;
        }

        // 2. Check Musical Clipboard (Local session)
        const inboundProg = pasteProgression();
        if (inboundProg && inboundProg.source === 'navigation') {
            setLevel('HarmonicContext');
            setExternalData(inboundProg);
            clearClipboard();
            return;
        }

        const inboundChord = pasteChord();
        if (inboundChord && inboundChord.source === 'navigation') {
            setLevel('ChordQualities');
            setExternalData(inboundChord);
            clearClipboard();
        }
    }, [searchParams, pasteProgression, pasteChord, setLevel, setExternalData, clearClipboard]);

    const levels = [
        { id: 'Tendency', label: 'Tendency Tones', icon: Activity },
        { id: 'Modulation', label: 'Modulation', icon: Repeat },
        { id: 'Bass', label: 'Bass Function', icon: Anchor },
        { id: 'Interference', label: 'Interference', icon: Layers },
        { id: 'HarmonicContext', label: 'Harmonization', icon: Music },
        { id: 'MelodySteps', label: 'Melody Steps', icon: Zap },
        { id: 'ChordQualities', label: 'Chord Qualities', icon: Piano },
        { id: 'Intervals', label: 'Pure Intervals', icon: Binary },
        { id: 'InstrumentMapping', label: 'Fretboard Map', icon: Guitar },
        { id: 'ChordTones', label: 'Chord Tones', icon: Layers },
        { id: 'SecondaryDominants', label: 'V/x Dominants', icon: Network },
        { id: 'ModalInterchange', label: 'Borrowed', icon: GitBranch },
        { id: 'Fretboard', label: 'Fretboard Logic', icon: Box },
        { id: 'Positions', label: 'Geometry', icon: Pyramid },
        { id: 'JazzStandards', label: 'Jazz Standards', icon: Music },
        { id: 'Progressions', label: 'Progressions', icon: GitBranch },
        { id: 'UST', label: 'Upper Upper', icon: Pyramid },
    ] as const;

    return (
        <div className="flex h-full w-full min-w-0 bg-[var(--bg-app)] relative overflow-hidden">
            {/* Minimalist Side Navigation for Levels */}
            <aside className="w-64 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-panel)] z-20">
                <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Ear Training</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--bg-surface)] rounded text-[var(--text-secondary)] text-[10px] font-mono">
                        <Sparkles size={10} className="text-[var(--accent)]" />
                        LVL {globalLevel}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    {levels.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => setLevel(l.id)}
                            className={`
                                w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors border-l-2
                                ${level === l.id
                                    ? 'border-[var(--accent)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium'
                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                                }
                            `}
                        >
                            <l.icon size={16} className={level === l.id ? 'text-[var(--accent)]' : 'opacity-70'} />
                            <span>{l.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Work Area */}
            <main className="flex-1 flex flex-col relative z-10 bg-[var(--bg-app)]">
                {/* Top Toolbar (HUD) */}
                <header className="h-14 flex items-center justify-between px-8 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]">
                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                        <Brain size={16} className="text-[var(--accent)]" />
                        <span className="font-semibold tracking-tight">{levels.find(l => l.id === level)?.label}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <HUD />
                        <FocusAreaPanel />
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={level}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex items-center justify-center p-8 active-area-container"
                        >
                            {/* Inner wrapper to contain the heavy visual components without them stretching full width if they aren't designed to */}
                            <div className="w-full max-w-5xl min-w-0 h-full flex flex-col items-center justify-center px-2 md:px-4">
                                {level === 'Tendency' && <TendencyLevel />}
                                {level === 'Modulation' && <ModulationLevel />}
                                {level === 'Bass' && <BassLevel />}
                                {level === 'Interference' && <InterferenceLevel />}
                                {level === 'HarmonicContext' && <HarmonicContextLevel />}
                                {level === 'MelodySteps' && <MelodyStepsLevel />}
                                {level === 'ChordQualities' && <ChordQualitiesLevel />}
                                {level === 'InstrumentMapping' && <InstrumentMappingLevel />}
                                {level === 'ChordTones' && <ChordTonesLevel />}
                                {level === 'Intervals' && <IntervalsLevel />}
                                {level === 'SecondaryDominants' && <SecondaryDominantsLevel />}
                                {level === 'ModalInterchange' && <ModalInterchangeLevel />}
                                {level === 'Fretboard' && <FretboardLevel />}
                                {level === 'Positions' && <PositionsLevel />}
                                {level === 'JazzStandards' && <JazzStandardsLevel />}
                                {level === 'Progressions' && <ProgressionsLevel />}
                                {level === 'UST' && <div className="text-[var(--text-muted)] font-mono text-sm tracking-widest uppercase">Upper Structures Coming Soon</div>}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
