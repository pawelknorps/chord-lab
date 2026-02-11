import { useState, useMemo, useEffect, useRef } from 'react';
import { useSignals } from "@preact/signals-react/runtime";
import { useJazzLibrary, JazzStandard } from './hooks/useJazzLibrary';
import { LeadSheet } from './components/LeadSheet';
import { PracticeTips } from './components/PracticeTips';
import { useJazzEngine } from './hooks/useJazzEngine';
import {
    transposeSignal,
    pianoVolumeSignal,
    bassVolumeSignal,
    drumsVolumeSignal,
    pianoReverbSignal,
    reverbVolumeSignal,
    isPremiumEngineSignal,
    activityLevelSignal,
    proactiveAdviceSignal,
    isAiThinkingSignal
} from './state/jazzSignals';
import { useAiTeacher } from './hooks/useAiTeacher';
import {
    Play, Volume2, Search, X, Target, Music, StopCircle, Sliders, ChevronDown, ChevronUp, Layers, Zap, Info, Activity, BookOpen, BookMarked, Keyboard, Sparkles, Mic
} from 'lucide-react';
import { SendToMenu } from '../../components/shared/SendToMenu';
import { useAudioCleanup } from '../../hooks/useAudioManager';
import { usePracticeStore } from '../../core/store/usePracticeStore';
import { AnalysisToolbar, AnalysisFilters } from './components/AnalysisToolbar';
import { PracticeExercisePanel } from './components/PracticeExercisePanel';
import { DrillDashboard } from './components/DrillDashboard';
import { BarRangeDrill } from './components/BarRangeDrill';
import { WalkthroughPanel } from './components/TheoryWalkthrough/WalkthroughPanel';
import { ChordScalePanel } from './components/ChordScaleExplorer/ChordScalePanel';
import { SmartLessonPane } from './components/SmartLessonPane';
import { LickLibrary } from './components/LickLibrary';
import { MasterKeyTeacher } from './components/MasterKeyTeacher';
import { GuideToneSpotlightEffect } from './components/GuideToneSpotlightEffect';
import { LiveNoteIndicator } from '../../components/shared/LiveNoteIndicator';
import { CallAndResponseDrill } from './components/CallAndResponseDrill';
import { PerformanceScoringOverlay } from './components/PerformanceScoringOverlay';
import { PracticeReportModal } from './components/PracticeReportModal';
import { GuidedPracticePane } from './components/GuidedPracticePane';
import { useGuidedPracticeStore } from '../../core/store/useGuidedPracticeStore';
import * as MicrophoneService from '../../core/audio/MicrophoneService';

export default function JazzKillerModule() {
    useAudioCleanup('jazz-killer');
    useSignals();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStandard, setSelectedStandard] = useState<JazzStandard | null>(null);
    const [showMixer, setShowMixer] = useState(false);
    const [showPracticeTips, setShowPracticeTips] = useState(false);
    const [showPracticePanel, setShowPracticePanel] = useState(false);
    const [showDrillMode, setShowDrillMode] = useState(false);
    const [showBarRangeDrill, setShowBarRangeDrill] = useState(false);
    const [showWalkthrough, setShowWalkthrough] = useState(false);
    const [showChordScaleExplorer, setShowChordScaleExplorer] = useState(false);
    const [selectedChordForScale, setSelectedChordForScale] = useState<string | null>(null);
    const [showRelated, setShowRelated] = useState(false);
    const [showLickLibrary, setShowLickLibrary] = useState(false);
    const [showMasterKeyTeacher, setShowMasterKeyTeacher] = useState(false);
    const [showGuidedPractice, setShowGuidedPractice] = useState(false);

    // Hint animation for onboarding
    const [showToolHints, setShowToolHints] = useState(false);
    useEffect(() => {
        if (selectedStandard) {
            setShowToolHints(true);
            const timer = setTimeout(() => setShowToolHints(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [selectedStandard]);
    const { standards, getSongAsIRealFormat } = useJazzLibrary();

    // Practice Store integration
    const { loadSong, detectedPatterns, showGuideTones, toggleGuideTones, showAnalysis, toggleAnalysis, guideToneSpotlightMode, setGuideToneSpotlightMode } = usePracticeStore();
    const { isFinished: isRoutineFinished, resetRoutine } = useGuidedPracticeStore();

    // Analysis filters
    const [analysisFilters, setAnalysisFilters] = useState<AnalysisFilters>({
        showMajorTwoFiveOne: true,
        showMinorTwoFiveOne: true,
        showSecondaryDominants: true,
        showTritoneSubstitutions: true,
        showColtraneChanges: true,
    });

    const filteredPatterns = useMemo(() => {
        return detectedPatterns.filter(pattern => {
            if (pattern.type === 'MajorII-V-I') return analysisFilters.showMajorTwoFiveOne;
            if (pattern.type === 'MinorII-V-i') return analysisFilters.showMinorTwoFiveOne;
            if (pattern.type === 'SecondaryDominant') return analysisFilters.showSecondaryDominants;
            if (pattern.type === 'TritoneSubstitution') return analysisFilters.showTritoneSubstitutions;
            if (pattern.type === 'ColtraneChanges') return analysisFilters.showColtraneChanges;
            return true;
        });
    }, [detectedPatterns, analysisFilters]);

    const selectedSong = useMemo(() => {
        if (!selectedStandard) return null;
        return getSongAsIRealFormat(selectedStandard, transposeSignal.value);
    }, [selectedStandard, transposeSignal.value, getSongAsIRealFormat]);

    const {
        isLoadedSignal,
        isPlayingSignal,
        bpmSignal,
        loopCountSignal,
        totalLoopsSignal,
        togglePlayback,
        playChord,
        setBpm,
        toggleEngine
    } = useJazzEngine(selectedSong);

    // Scan standards for ii-V-I patterns on mount
    useEffect(() => {
        const scanPatterns = async () => {
            const { patternDatabase } = await import('../../core/drills/IIVIPatternDatabase');
            await patternDatabase.scanStandards(standards);
        };

        if (standards.length > 0) {
            scanPatterns();
        }
    }, [standards]);

    // Track last analyzed song to prevent infinite loops
    const lastAnalyzedSongRef = useRef<string | null>(null);

    // Analyze song when loaded
    useEffect(() => {
        if (selectedSong && selectedSong.music) {
            const songKey = `${selectedSong.title}-${transposeSignal.value}`;

            if (lastAnalyzedSongRef.current !== songKey) {
                const measures = selectedSong.music.measures.map((m: any) =>
                    m.chords.filter((c: string) => c && c !== "")
                );

                loadSong({
                    title: selectedSong.title,
                    measures,
                    key: selectedSong.key,
                    bars: selectedSong.music.measures.length
                });

                lastAnalyzedSongRef.current = songKey;
            }
        }
    }, [selectedSong, transposeSignal.value, loadSong]);

    const filteredStandards = useMemo(() => {
        if (!searchQuery) return [];
        return standards.filter(std =>
            std.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (std.Composer && std.Composer.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [standards, searchQuery]);

    const handleChordClick = (chord: string, _measureIndex: number) => {
        playChord(chord);
        setSelectedChordForScale(chord);
        setShowChordScaleExplorer(true);
    };

    const handleSelectSong = (song: JazzStandard) => {
        setSearchQuery('');
        setSelectedStandard(song);
        localStorage.setItem('jazz-killer-last-song', song.Title);
        if (song.Tempo != null) setBpm(song.Tempo);
        if (song.DefaultLoops != null) totalLoopsSignal.value = Math.max(1, song.DefaultLoops);
    };

    const handleCloseSong = () => {
        if (isPlayingSignal.value) togglePlayback();
        setSelectedStandard(null);
        localStorage.removeItem('jazz-killer-last-song');
        transposeSignal.value = 0;
    };

    // Restore last song on mount
    useEffect(() => {
        const saved = localStorage.getItem('jazz-killer-last-song');
        if (saved && !selectedStandard && standards.length > 0) {
            const song = standards.find(s => s.Title === saved);
            if (song) {
                // We use a small timeout to ensure the engine is ready
                const timer = setTimeout(() => {
                    handleSelectSong(song);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [standards]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && selectedSong) {
                const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
                if (!isTyping) {
                    e.preventDefault();
                    togglePlayback();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedSong, togglePlayback]);

    const nextStandards = useMemo(() => {
        if (!selectedStandard) return [];
        return standards
            .filter(s => s.Title !== selectedStandard.Title)
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);
    }, [selectedStandard, standards]);

    const progressionData = useMemo(() => {
        if (!selectedSong) return null;
        const chords = selectedSong.music.measures
            .flatMap(m => m.chords)
            .filter(c => c && c !== "");
        return {
            name: selectedSong.title,
            chords,
            key: selectedSong.key,
            source: 'jazz-killer'
        };
    }, [selectedSong]);

    const currentSongChords = useMemo(() => {
        if (!selectedSong?.music?.measures) return [];
        return selectedSong.music.measures.flatMap((m: { chords: string[] }) => m.chords).filter((c: string) => c && c.trim() !== "");
    }, [selectedSong]);

    const { clearAdvice } = useAiTeacher();

    return (
        <div className="h-full w-full min-w-0 bg-[#0a0a0a] text-white p-1.5 md:p-3 flex flex-col gap-2 md:gap-3 overflow-hidden relative">
            {/* AI Proactive Notification */}
            {proactiveAdviceSignal.value && (
                <div className="fixed bottom-24 right-6 z-[200] max-w-sm animate-in slide-in-from-right-8 duration-500">
                    <div className="bg-indigo-900/90 backdrop-blur-2xl border border-indigo-400/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
                        <div className="absolute -left-1 -top-1">
                            <div className="bg-indigo-500 rounded-full p-1 animate-bounce">
                                <Sparkles size={16} className="text-white" />
                            </div>
                        </div>
                        <button
                            onClick={clearAdvice}
                            className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex flex-col gap-1 pr-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Sensei Tip</span>
                            <p className="text-xs font-medium leading-relaxed text-indigo-50/90">
                                {proactiveAdviceSignal.value}
                            </p>
                        </div>
                        {isAiThinkingSignal.value && (
                            <div className="absolute bottom-0 left-0 h-1 bg-indigo-400/50 animate-pulse w-full rounded-b-2xl"></div>
                        )}
                    </div>
                </div>
            )}

            {/* ITM Scoring Overlay */}
            <div className="fixed bottom-6 left-6 z-[200]">
                <PerformanceScoringOverlay />
            </div>

            <style>
                {`
                    @keyframes hint-pulse {
                        0%, 100% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
                    }
                    .animate-hint-pulse {
                        animation: hint-pulse 1.5s ease-in-out infinite;
                    }
                `}
            </style>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] -z-10 rounded-full"></div>

            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 md:gap-3 pr-14">
                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                    {!selectedSong && (
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Jazz<span className="text-white">Killer</span>
                            </h1>
                            <p className="hidden md:block text-neutral-400 text-[10px] font-bold tracking-tight mt-0.5">Professional Practice Engine • {standards.length} Standards</p>
                        </div>
                    )}

                    {selectedSong && (
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-black tracking-tighter bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Jazz<span className="text-white">Killer</span>
                            </h1>
                            <button
                                onClick={handleCloseSong}
                                className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-neutral-500 hover:text-white transition-all border border-white/5"
                                title="Exit Song"
                            >
                                <X size={14} />
                                EXIT
                            </button>
                        </div>
                    )}
                </div>

                {selectedSong && (
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-3 bg-neutral-900/40 backdrop-blur-xl border border-white/10 p-1 md:p-2 rounded-xl md:rounded-2xl shadow-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
                        {/* Transpose Control */}
                        <div className="flex flex-col px-2 md:px-4 border-r border-white/10">
                            <span className="text-[8px] md:text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1">Trans</span>
                            <div className="flex items-center gap-2 md:gap-3">
                                <button
                                    onClick={() => transposeSignal.value -= 1}
                                    className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-all"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <span className={`min-w-[1.5rem] md:min-w-[2.5rem] text-center text-lg md:text-2xl font-black font-mono leading-none ${transposeSignal.value === 0 ? 'text-white/40' : 'text-orange-400'}`}>
                                    {transposeSignal.value > 0 ? '+' : ''}{transposeSignal.value}
                                </span>
                                <button
                                    onClick={() => transposeSignal.value += 1}
                                    className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-all"
                                >
                                    <ChevronUp size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Tempo Control */}
                        <div className="flex flex-col px-2 md:px-4 border-r border-white/10">
                            <span className="text-[8px] md:text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1">Tempo</span>
                            <div className="flex items-center gap-1 md:gap-2">
                                <input
                                    type="number"
                                    value={bpmSignal.value}
                                    onChange={(e) => setBpm(Number(e.target.value))}
                                    className="w-10 md:w-16 bg-transparent text-lg md:text-2xl font-black font-mono leading-none focus:outline-none text-amber-500 [appearance:textfield]"
                                />
                                <span className="text-[8px] md:text-[10px] text-neutral-600 font-black uppercase tracking-tighter">BPM</span>
                            </div>
                        </div>

                        {/* Loop Control */}
                        <div className="flex flex-col px-2 md:px-4 border-r border-white/10">
                            <span className="text-[8px] md:text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1">Cycles</span>
                            <div className="flex items-center gap-1 md:gap-2">
                                <input
                                    type="number"
                                    value={isPlayingSignal.value ? loopCountSignal.value + 1 : totalLoopsSignal.value}
                                    onChange={(e) => totalLoopsSignal.value = Math.max(1, Number(e.target.value))}
                                    disabled={isPlayingSignal.value}
                                    className={`w-8 md:w-12 bg-transparent text-lg md:text-2xl font-black font-mono leading-none focus:outline-none ${isPlayingSignal.value ? 'text-indigo-400' : 'text-amber-500'}`}
                                />
                                <span className="text-[8px] md:text-[10px] text-neutral-600 font-black uppercase tracking-tighter">{isPlayingSignal.value ? `/${totalLoopsSignal.value}` : 'REP'}</span>
                            </div>
                        </div>

                        {/* Main Play Action */}
                        <button
                            onClick={togglePlayback}
                            disabled={!isLoadedSignal.value}
                            className={`flex items-center gap-2 md:gap-3 px-3 md:px-6 py-1.5 md:py-3 rounded-xl md:rounded-2xl font-black tracking-widest transition-all active:scale-95 text-[10px] md:text-sm ${!isLoadedSignal.value
                                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                : isPlayingSignal.value
                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                                    : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                }`}
                        >
                            {!isLoadedSignal.value ? (
                                <>
                                    <div className="w-3 h-3 md:w-5 md:h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></div>
                                    WAIT
                                </>
                            ) : (
                                <>
                                    {isPlayingSignal.value ? <StopCircle size={18} className="md:w-6 md:h-6" /> : <Play size={18} className="md:w-6 md:h-6" />}
                                    {isPlayingSignal.value ? 'STOP' : 'START'}
                                </>
                            )}
                        </button>

                        <div className="h-8 md:h-12 w-px bg-white/10 mx-1 hidden lg:block"></div>

                        {/* Toolbar Group */}
                        <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl md:rounded-2xl border border-white/5 shadow-inner">
                            <button
                                onClick={toggleAnalysis}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showAnalysis ? 'bg-blue-500 text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-blue-400' : ''}`}
                                title="Analysis"
                            >
                                <Layers size={18} />
                            </button>
                            <button
                                onClick={toggleGuideTones}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showGuideTones ? 'bg-emerald-500 text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-emerald-400' : ''}`}
                                title="Guide Tones"
                            >
                                <Target size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    const next = !guideToneSpotlightMode;
                                    setGuideToneSpotlightMode(next);
                                    if (next) void MicrophoneService.start();
                                }}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${guideToneSpotlightMode ? 'bg-red-500 text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-red-400' : ''}`}
                                title="Guide Tone Spotlight (mic): play 3rd of chord, bar lights green"
                            >
                                <Mic size={18} />
                            </button>
                            <div className="w-px h-4 md:h-6 bg-white/10 mx-0.5" />
                            <button
                                onClick={() => setShowPracticeTips(!showPracticeTips)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showPracticeTips ? 'bg-amber-500 text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-amber-500' : ''}`}
                                title="Tips"
                            >
                                <Info size={18} />
                            </button>
                            <button
                                onClick={() => setShowPracticePanel(!showPracticePanel)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showPracticePanel ? 'bg-purple-500 text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-purple-400' : ''}`}
                                title="Drills"
                            >
                                <Zap size={18} />
                            </button>
                            <button
                                onClick={() => setShowWalkthrough(!showWalkthrough)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showWalkthrough ? 'bg-indigo-500 text-white' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-indigo-400' : ''}`}
                                title="Walkthrough"
                            >
                                <BookOpen size={18} />
                            </button>
                            <div className="w-px h-4 md:h-6 bg-white/10 mx-0.5" />
                            <button
                                onClick={() => setShowMixer(!showMixer)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showMixer ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-white' : ''}`}
                                title="Mixer"
                            >
                                <Sliders size={18} />
                            </button>
                            <button
                                onClick={() => setShowDrillMode(!showDrillMode)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showDrillMode ? 'bg-pink-500 text-black shadow-[0_0_20px_rgba(236,72,153,0.4)]' : 'text-neutral-500 hover:text-white hover:bg-white/5'} ${showToolHints ? 'animate-hint-pulse text-pink-400' : ''}`}
                                title="Advanced Drills"
                            >
                                <Activity size={18} />
                            </button>
                            <div className="w-px h-4 md:h-6 bg-white/10 mx-0.5" />
                            <button
                                onClick={() => setShowLickLibrary(!showLickLibrary)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showLickLibrary ? 'bg-amber-600 text-white' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-amber-400' : ''}`}
                                title="Lick Library"
                            >
                                <BookMarked size={18} />
                            </button>
                            <button
                                onClick={() => setShowMasterKeyTeacher(!showMasterKeyTeacher)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showMasterKeyTeacher ? 'bg-teal-500 text-black' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-teal-400' : ''}`}
                                title="Master Key (Cycle of 5ths)"
                            >
                                <Keyboard size={18} />
                            </button>
                            <button
                                onClick={() => setShowGuidedPractice(!showGuidedPractice)}
                                className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all ${showGuidedPractice ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-neutral-500 hover:text-white'} ${showToolHints ? 'animate-hint-pulse text-purple-400' : ''}`}
                                title="Teaching Machine (Guided Practice)"
                            >
                                <Zap size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {!selectedSong && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full gap-8 p-4">
                    <div className="w-full relative group">
                        <div className="absolute inset-0 bg-amber-500/20 blur-2xl group-focus-within:bg-amber-500/40 transition-all duration-500"></div>
                        <div className="relative flex items-center bg-neutral-900 border border-white/10 rounded-3xl p-2 shadow-2xl">
                            <Search className="ml-4 text-neutral-500" size={24} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Standards..."
                                className="flex-1 bg-transparent px-4 py-4 text-xl outline-none placeholder:text-neutral-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {searchQuery && filteredStandards.length > 0 && (
                            <div className="flex flex-col gap-2 py-4">
                                {filteredStandards.map((std, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectSong(std)}
                                        className="w-full flex items-center justify-between p-4 bg-neutral-900/60 border border-white/5 hover:border-amber-500/50 rounded-2xl transition-all group hover:bg-neutral-800"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-neutral-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                                <Music size={20} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-lg leading-tight">{std.Title}</h4>
                                                <p className="text-sm text-neutral-500">{std.Composer}{std.Tempo != null ? ` • ${std.Tempo} BPM` : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {std.Tempo != null && (
                                                <span className="text-[10px] font-bold text-amber-500/90 tabular-nums">{std.Tempo} BPM</span>
                                            )}
                                            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-300 transition-colors border border-transparent group-hover:border-white/10">
                                                Analyze
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchQuery && filteredStandards.length === 0 && (
                            <div className="text-center py-20 text-neutral-600">
                                <Music size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No standards found</p>
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="flex flex-col gap-10 py-6 w-full animate-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {standards.slice(0, 9).map((song, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectSong(song)}
                                            className="relative overflow-hidden p-5 bg-neutral-900/40 border border-white/5 hover:border-amber-500/30 rounded-2xl text-left hover:bg-neutral-800/60 transition-all group duration-300"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/5 group-hover:via-amber-500/5 group-hover:to-amber-500/10 transition-all duration-500" />
                                            <div className="relative flex items-start justify-between">
                                                <div>
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 shadow-lg shadow-black/20">
                                                        <Music size={18} />
                                                    </div>
                                                    <h3 className="font-bold text-neutral-200 group-hover:text-amber-100 text-lg leading-tight mb-1 transition-colors">{song.Title}</h3>
                                                    <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors uppercase tracking-wider font-medium">{song.Composer}{song.Tempo != null ? ` • ${song.Tempo} BPM` : ''}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Detailed How-To Instructions */}
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                                    <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                            <Search size={20} />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-white/50">1. Select Standard</h4>
                                        <p className="text-sm text-neutral-400 leading-relaxed">Search for a tune or pick from the grid to load the interactive lead sheet and setup the rhythm trio.</p>
                                    </div>
                                    <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <Layers size={20} />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-white/50">2. Analyze Harmony</h4>
                                        <p className="text-sm text-neutral-400 leading-relaxed">Toggle the **Layers icon** to visualize ii-V-I patterns, secondary dominants, and harmonic substitutions.</p>
                                    </div>
                                    <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                            <Zap size={20} />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-white/50">3. Interactive Play</h4>
                                        <p className="text-sm text-neutral-400 leading-relaxed">**Click any chord** to hear its sound. Press **Space** to start the piano trio and practice along at any tempo.</p>
                                    </div>
                                    <div className="flex flex-col gap-3 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                            <Activity size={20} />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-white/50">4. Master the Tune</h4>
                                        <p className="text-sm text-neutral-400 leading-relaxed">Open **Drills** and **Walkthroughs** to build vocabulary and understand the song's architecture in depth.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedSong && (
                <div className="flex-1 overflow-hidden flex flex-col p-1.5 bg-white/5 rounded-[32px] border border-white/5">
                    <div className="px-4 md:px-6 py-2 md:py-3 flex flex-row items-center justify-between border-b border-white/5">
                        <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[8px] md:text-[10px] font-black bg-amber-500 text-black px-1.5 md:px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.4)] ${isPlayingSignal.value ? 'animate-pulse' : ''}`}>LIVE</span>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight truncate">{selectedStandard?.Title}</h2>
                            </div>
                            <p className="text-neutral-400 text-[9px] md:text-xs truncate">by <span className="text-neutral-200 font-medium">{selectedSong.composer}</span> • {selectedSong.style} • Key of {selectedSong.key}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {/* Compact Search / Jump */}
                            <div className="hidden sm:flex relative items-center gap-2 px-3 py-1.5 bg-black/20 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-all group">
                                <Search className="text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={14} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Jump to..."
                                    className="w-24 md:w-48 lg:w-64 bg-transparent text-[10px] md:text-xs font-bold focus:outline-none placeholder:text-neutral-700"
                                />

                                {/* Search Results Dropdown */}
                                {searchQuery && (
                                    <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[110] flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {filteredStandards.length > 0 ? (
                                            filteredStandards.map((std, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSelectSong(std)}
                                                    className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5 group"
                                                >
                                                    <h4 className="font-bold text-xs text-neutral-200 group-hover:text-amber-400 truncate">{std.Title}</h4>
                                                    <p className="text-[10px] text-neutral-500 truncate">{std.Composer}{std.Tempo != null ? ` • ${std.Tempo} BPM` : ''}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                                                No matches
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Up Next Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowRelated(!showRelated)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 transition-all ${showRelated ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/20 text-neutral-400 hover:text-white hover:bg-white/5'}`}
                                    title="Up Next"
                                >
                                    <Music size={14} />
                                    <span className="hidden lg:inline text-[10px] font-black uppercase tracking-tight">Up Next</span>
                                </button>

                                {showRelated && (
                                    <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[110] flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        <div className="px-3 py-2 text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] border-b border-white/5 mb-1">
                                            Suggestions
                                        </div>
                                        {nextStandards.map((std, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    handleSelectSong(std);
                                                    setShowRelated(false);
                                                }}
                                                className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5 group"
                                            >
                                                <h4 className="font-bold text-xs text-neutral-200 group-hover:text-amber-400 truncate">{std.Title}</h4>
                                                <p className="text-[10px] text-neutral-500 truncate">{std.Composer}{std.Tempo != null ? ` • ${std.Tempo} BPM` : ''}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Export / Share */}
                            {progressionData && (
                                <div className="scale-90 origin-right">
                                    <SendToMenu
                                        progression={progressionData}
                                        sourceModule="jazz-killer"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-row p-1.5 md:p-3 gap-2 md:gap-4 relative">
                        {/* LEFT SIDEBAR AREA */}
                        {(showAnalysis || showPracticeTips || showWalkthrough || showChordScaleExplorer) && (
                            <>
                                <div
                                    className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                                    onClick={() => {
                                        setShowPracticeTips(false);
                                        setShowWalkthrough(false);
                                        setShowChordScaleExplorer(false);
                                    }}
                                />
                                <div className="flex flex-col gap-4 max-h-full overflow-hidden shrink-0 
                                              fixed xl:relative left-4 xl:left-0 top-24 xl:top-0 bottom-4 xl:bottom-auto
                                              z-50 xl:z-auto w-[calc(100vw-2rem)] md:w-80 lg:w-[320px] xl:w-[350px] 
                                              bg-neutral-900 xl:bg-transparent border border-white/10 xl:border-none rounded-3xl xl:rounded-none p-4 xl:p-0
                                              overflow-y-auto custom-scrollbar animate-in slide-in-from-left duration-300">

                                    <button
                                        className="xl:hidden absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10"
                                        onClick={() => { setShowPracticeTips(false); setShowWalkthrough(false); setShowChordScaleExplorer(false); }}
                                    >
                                        <X size={20} />
                                    </button>

                                    {showWalkthrough && (
                                        <WalkthroughPanel
                                            song={selectedSong}
                                            onClose={() => setShowWalkthrough(false)}
                                            onExploreScales={(chord) => handleChordClick(chord, -1)}
                                        />
                                    )}

                                    {showAnalysis && !showWalkthrough && (
                                        <AnalysisToolbar
                                            orientation="vertical"
                                            filters={analysisFilters}
                                            onFiltersChange={setAnalysisFilters}
                                            totalPatterns={detectedPatterns.length}
                                        />
                                    )}

                                    {showChordScaleExplorer && selectedChordForScale && (
                                        <ChordScalePanel
                                            chordSymbol={selectedChordForScale}
                                            onClose={() => setShowChordScaleExplorer(false)}
                                        />
                                    )}

                                    {showPracticeTips && !showWalkthrough && (
                                        <PracticeTips
                                            song={selectedSong}
                                            onClose={() => setShowPracticeTips(false)}
                                        />
                                    )}

                                    {selectedStandard && (
                                        <SmartLessonPane
                                            songId={selectedStandard.Title.toLowerCase().replace(/\s+/g, '-')}
                                            songTitle={selectedStandard.Title}
                                            songKey={selectedSong?.key}
                                            progressionChords={currentSongChords}
                                            measures={selectedSong?.music?.measures}
                                            onSetBpm={setBpm}
                                            onSetTranspose={(val) => transposeSignal.value = val}
                                            onToggleAnalysis={toggleAnalysis}
                                            onToggleGuideTones={toggleGuideTones}
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        {/* MAIN CONTENT */}
                        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-auto px-1 md:px-2 custom-scrollbar transition-all duration-300">
                            <GuideToneSpotlightEffect />
                            <LeadSheet
                                song={selectedSong}
                                filteredPatterns={filteredPatterns}
                                onChordClick={handleChordClick}
                            />
                            {guideToneSpotlightMode && <LiveNoteIndicator />}
                            <div className="h-32 xl:hidden" />
                        </div>

                        {/* RIGHT SIDEBAR AREA */}
                        {(showPracticePanel || showMixer || showLickLibrary || showMasterKeyTeacher) && (
                            <>
                                <div
                                    className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                                    onClick={() => {
                                        setShowMixer(false);
                                        setShowPracticePanel(false);
                                        setShowLickLibrary(false);
                                        setShowMasterKeyTeacher(false);
                                    }}
                                />
                                <div className="flex flex-col gap-4 max-h-full overflow-y-auto shrink-0 
                                              fixed xl:relative right-4 xl:right-0 top-24 xl:top-0 bottom-4 xl:bottom-auto
                                              z-50 xl:z-auto w-[calc(100vw-2rem)] md:w-80 lg:w-[450px] xl:w-[500px] 2xl:w-[550px]
                                              bg-neutral-900 xl:bg-transparent border border-white/10 xl:border-none rounded-3xl xl:rounded-none p-4 xl:p-0
                                              custom-scrollbar animate-in slide-in-from-right duration-300">

                                    <button
                                        className="xl:hidden absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10"
                                        onClick={() => { setShowMixer(false); setShowPracticePanel(false); setShowLickLibrary(false); setShowMasterKeyTeacher(false); }}
                                    >
                                        <X size={20} />
                                    </button>

                                    {showMixer && (
                                        <div className="bg-neutral-900/40 backdrop-blur-md rounded-3xl border border-white/5 p-4 md:p-6 flex flex-col gap-6 md:gap-8">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                                    <Volume2 size={16} /> MIXER
                                                </h3>
                                                <button onClick={() => setShowMixer(false)} className="hidden xl:block text-neutral-600 hover:text-white transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* Engine Toggle Toggle */}
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles size={16} className={isPremiumEngineSignal.value ? "text-amber-400" : "text-neutral-600"} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Premium AI Engine</span>
                                                    </div>
                                                    <button
                                                        onClick={toggleEngine}
                                                        className={`w-10 h-5 rounded-full transition-all relative ${isPremiumEngineSignal.value ? 'bg-amber-500' : 'bg-neutral-800'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPremiumEngineSignal.value ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                                <p className="text-[9px] text-neutral-500 leading-relaxed font-medium">
                                                    {isPremiumEngineSignal.value
                                                        ? "Active: Ron Carter Bass, Red Garland Phrasing, Nate Smith Drums. Multi-sampled HQ audio."
                                                        : "Active: Standard MIDI synthesis. Low latency, legacy compatibility."}
                                                </p>

                                                {isPremiumEngineSignal.value && (
                                                    <div className="mt-2 pt-3 border-t border-white/5 space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter">Activity Level</span>
                                                            <span className="text-[9px] font-mono text-amber-500">{Math.round(activityLevelSignal.value * 100)}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0" max="1" step="0.01"
                                                            value={activityLevelSignal.value}
                                                            onChange={(e) => activityLevelSignal.value = Number(e.target.value)}
                                                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6 md:space-y-8">
                                                {[
                                                    { label: 'Piano', signal: pianoVolumeSignal, min: -60, max: 0, step: 1, unit: 'dB' },
                                                    { label: 'Piano Reverb', signal: pianoReverbSignal, min: 0, max: 1, step: 0.01, unit: '%' },
                                                    { label: 'Double Bass', signal: bassVolumeSignal, min: -60, max: 0, step: 1, unit: 'dB' },
                                                    { label: 'Drums', signal: drumsVolumeSignal, min: -60, max: 0, step: 1, unit: 'dB' },
                                                    { label: 'Master Reverb', signal: reverbVolumeSignal, min: 0, max: 1, step: 0.01, unit: '%' }
                                                ].map((ctrl, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">{ctrl.label}</span>
                                                            <span className="text-xs font-mono text-amber-500">
                                                                {ctrl.unit === '%' ? Math.round(ctrl.signal.value * 100) : ctrl.signal.value}{ctrl.unit}
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={ctrl.min} max={ctrl.max} step={ctrl.step}
                                                            value={ctrl.signal.value}
                                                            onChange={(e) => ctrl.signal.value = Number(e.target.value)}
                                                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {showPracticePanel && (
                                        <div className="flex-none space-y-4">
                                            <PracticeExercisePanel />
                                            <CallAndResponseDrill />
                                        </div>
                                    )}

                                    {showLickLibrary && (
                                        <LickLibrary
                                            currentSongChords={currentSongChords}
                                            onClose={() => setShowLickLibrary(false)}
                                        />
                                    )}

                                    {showMasterKeyTeacher && (
                                        <MasterKeyTeacher />
                                    )}

                                    {showGuidedPractice && (
                                        <GuidedPracticePane />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showDrillMode && <DrillDashboard />}
            {showBarRangeDrill && <BarRangeDrill onClose={() => setShowBarRangeDrill(false)} />}

            {isRoutineFinished && selectedStandard && (
                <PracticeReportModal
                    songTitle={selectedStandard.Title}
                    songKey={selectedSong?.key || selectedStandard.Key || 'C'}
                    onClose={resetRoutine}
                />
            )}
        </div>
    );
}
