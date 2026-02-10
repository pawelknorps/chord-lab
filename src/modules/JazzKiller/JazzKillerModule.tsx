import { useState, useMemo, useEffect, useRef } from 'react';
import { useSignals } from "@preact/signals-react/runtime";
import { useJazzLibrary, JazzStandard } from './hooks/useJazzLibrary';
import { LeadSheet } from './components/LeadSheet';
import { PracticeTips } from './components/PracticeTips';
import { useJazzPlayback } from './hooks/useJazzPlayback';
import {
    transposeSignal,
    pianoVolumeSignal,
    bassVolumeSignal,
    drumsVolumeSignal,
    pianoReverbSignal,
    reverbVolumeSignal
} from './state/jazzSignals';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, X, ChevronDown, ChevronUp, Sliders, Target, Music, StopCircle } from 'lucide-react';
import { SendToMenu } from '../../components/shared/SendToMenu';
import { useAudioCleanup } from '../../hooks/useAudioManager';
import { usePracticeStore } from '../../core/store/usePracticeStore';
import { AnalysisToolbar, AnalysisFilters } from './components/AnalysisToolbar';
import { PracticeExercisePanel } from './components/PracticeExercisePanel';
import { DrillDashboard } from './components/DrillDashboard';
import { ProfilePanel } from './components/ProfilePanel';
import { BarRangeDrill } from './components/BarRangeDrill';

export default function JazzKillerModule() {
    useAudioCleanup('jazz-killer');
    useSignals();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStandard, setSelectedStandard] = useState<JazzStandard | null>(null);
    const [showMixer, setShowMixer] = useState(false);
    const [showPracticeTips, setShowPracticeTips] = useState(true);
    const [showPracticePanel, setShowPracticePanel] = useState(false);
    const [showDrillMode, setShowDrillMode] = useState(false);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [showBarRangeDrill, setShowBarRangeDrill] = useState(false);
    const { standards, getSongAsIRealFormat } = useJazzLibrary();

    // Practice Store integration
    const { loadSong, detectedPatterns, practiceExercises, activeFocusIndex, showGuideTones, toggleGuideTones, showAnalysis, toggleAnalysis } = usePracticeStore();

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
        isPlayingSignal,
        isLoadedSignal,
        togglePlayback,
        setBpm,
        bpmSignal,
        loopCountSignal,
        totalLoopsSignal
    } = useJazzPlayback(selectedSong);

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
            // Create a unique key for this song state
            const songKey = `${selectedSong.title}-${transposeSignal.value}`;

            // Only analyze if this is a different song or transposition
            if (lastAnalyzedSongRef.current !== songKey) {
                const chords = selectedSong.music.measures
                    .flatMap(m => m.chords)
                    .filter(c => c && c !== "");

                loadSong({
                    title: selectedSong.title,
                    chords,
                    key: selectedSong.key,
                    bars: selectedSong.music.measures.length
                });

                lastAnalyzedSongRef.current = songKey;
            }
        }
    }, [selectedSong, transposeSignal.value]); // loadSong is stable from Zustand

    const filteredStandards = useMemo(() => {
        if (!searchQuery) return [];
        return standards.filter(s =>
            s.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.Composer && s.Composer.toLowerCase().includes(searchQuery.toLowerCase()))
        ).slice(0, 50);
    }, [searchQuery, standards]);

    const handleSelectSong = (standard: JazzStandard) => {
        setSelectedStandard(standard);
        setSearchQuery('');
    };

    const handleCloseSong = () => {
        if (isPlayingSignal.value) togglePlayback();
        setSelectedStandard(null);
        transposeSignal.value = 0;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && selectedSong) {
                // Prevent scrolling if not in search
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
        // Just pick 6 random standards or some related ones?
        // Let's just pick 6 different ones for now
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
            chords,
            key: selectedSong.key
        };
    }, [selectedSong]);

    return (
        <div className="h-full w-full bg-[#0a0a0a] text-white p-4 md:p-8 flex flex-col gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] -z-10 rounded-full"></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Jazz<span className="text-white">Killer</span>
                    </h1>
                    <p className="text-neutral-500 text-sm font-medium">Professional Practice Engine • {standards.length} Standards</p>
                </div>

                {selectedSong && (
                    <div className="flex items-center gap-3 bg-neutral-900/50 backdrop-blur-md border border-white/5 p-2 rounded-2xl">
                        <div className="flex flex-col px-3">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Transpose</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => transposeSignal.value -= 1}
                                    className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <span className={`w-6 text-center text-lg font-mono font-bold ${transposeSignal.value === 0 ? 'text-amber-400' : 'text-orange-400'}`}>
                                    {transposeSignal.value > 0 ? '+' : ''}{transposeSignal.value}
                                </span>
                                <button
                                    onClick={() => transposeSignal.value += 1}
                                    className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition-colors"
                                >
                                    <ChevronUp size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        <div className="flex flex-col px-3">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Tempo</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={bpmSignal.value}
                                    onChange={(e) => setBpm(Number(e.target.value))}
                                    className="w-12 bg-transparent text-lg font-mono font-bold focus:outline-none text-amber-400"
                                />
                                <span className="text-xs text-neutral-600 font-bold">BPM</span>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        <div className="flex flex-col px-3">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Loops</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={isPlayingSignal.value ? loopCountSignal.value + 1 : totalLoopsSignal.value}
                                    onChange={(e) => totalLoopsSignal.value = Math.max(1, Number(e.target.value))}
                                    disabled={isPlayingSignal.value}
                                    className={`w-10 bg-transparent text-lg font-mono font-bold focus:outline-none ${isPlayingSignal.value ? 'text-white' : 'text-amber-400'}`}
                                />
                                <span className="text-xs text-neutral-600 font-bold">{isPlayingSignal.value ? `of ${totalLoopsSignal.value}` : 'total'}</span>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        <button
                            onClick={togglePlayback}
                            disabled={!isLoadedSignal.value}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all active:scale-95 ${!isLoadedSignal.value
                                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                : isPlayingSignal.value
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                }`}
                        >
                            {!isLoadedSignal.value ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></div>
                                    LOADING...
                                </>
                            ) : (
                                <>
                                    {isPlayingSignal.value ? <StopCircle size={20} /> : <Play size={20} />}
                                    {isPlayingSignal.value ? 'STOP' : 'PLAY'}
                                </>
                            )}
                        </button>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        <button
                            onClick={() => setShowPracticePanel(!showPracticePanel)}
                            className={`px-4 py-2 rounded-xl transition-all ${showPracticePanel ? 'bg-amber-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="Practice Drills"
                        >
                            <Target size={18} />
                        </button>
                        <button
                            onClick={toggleGuideTones}
                            className={`px-4 py-2 rounded-xl transition-all ${showGuideTones ? 'bg-emerald-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="Guide Tones (3rds & 7ths)"
                        >
                            🎯
                        </button>
                        <button
                            onClick={toggleAnalysis}
                            className={`px-4 py-2 rounded-xl transition-all ${showAnalysis ? 'bg-blue-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="Analysis Brackets"
                        >
                            📊
                        </button>
                        <button
                            onClick={() => setShowDrillMode(!showDrillMode)}
                            className={`px-4 py-2 rounded-xl transition-all ${showDrillMode ? 'bg-purple-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="ii-V-I Drills"
                        >
                            🎓
                        </button>
                        <button
                            onClick={() => setShowProfilePanel(!showProfilePanel)}
                            className={`px-4 py-2 rounded-xl transition-all ${showProfilePanel ? 'bg-green-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="Student Profile"
                        >
                            👤
                        </button>
                        <button
                            onClick={() => setShowBarRangeDrill(!showBarRangeDrill)}
                            className={`px-4 py-2 rounded-xl transition-all ${showBarRangeDrill ? 'bg-orange-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="Bar Range Drill"
                        >
                            🎯
                        </button>
                        <button
                            onClick={() => setShowMixer(!showMixer)}
                            className={`px-4 py-2 rounded-xl transition-all ${showMixer ? 'bg-amber-500 text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                            title="Mixer"
                        >
                            <Volume2 size={18} />
                        </button>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        <button
                            onClick={() => {
                                if (detectedPatterns.length > 0) {
                                    setShowPracticePanel(!showPracticePanel);
                                } else {
                                    setShowPracticeTips(!showPracticeTips);
                                }
                            }}
                            className={`p-2.5 rounded-xl transition-all ${(showPracticeTips || showPracticePanel) ? 'bg-amber-500 text-black' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                            title={detectedPatterns.length > 0 ? "Toggle Practice Drills" : "Toggle Practice Tips"}
                        >
                            <Target size={20} />
                        </button>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        {/* Quick Search in Header */}
                        <div className="flex items-center gap-2 group px-2">
                            <Search className="text-neutral-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Quick search..."
                                className="w-32 bg-transparent text-sm font-medium focus:outline-none focus:w-48 transition-all placeholder:text-neutral-700"
                            />
                            {searchQuery && (
                                <div className="absolute top-16 right-8 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {filteredStandards.map((std, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectSong(std)}
                                            className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 flex items-center gap-3 group/item"
                                        >
                                            <Music size={14} className="text-neutral-600 group-hover/item:text-amber-500" />
                                            <div>
                                                <div className="text-sm font-bold text-neutral-200">{std.Title}</div>
                                                <div className="text-[10px] text-neutral-500">{std.Composer}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        {progressionData && (
                            <SendToMenu
                                progression={progressionData}
                                sourceModule="jazz-killer"
                            />
                        )}

                        <div className="h-10 w-px bg-white/10 mx-1"></div>

                        <button
                            onClick={handleCloseSong}
                            className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </header>

            {!selectedSong && (
                <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-8">
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
                        {searchQuery && filteredStandards.length === 0 && (
                            <div className="text-center py-20 text-neutral-600">
                                <Music size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No standards found</p>
                            </div>
                        )}

                        {!searchQuery && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                                {['Autumn Leaves', 'Blue Bossa', 'Solar', 'Tune Up', 'Summertime', 'All The Things You Are'].map(title => {
                                    const song = standards.find(s => s.Title === title);
                                    if (!song) return null;
                                    return (
                                        <button
                                            key={title}
                                            onClick={() => handleSelectSong(song)}
                                            className="p-6 bg-neutral-900/50 border border-white/5 rounded-3xl text-left hover:bg-neutral-800 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-all">
                                                <Music size={18} />
                                            </div>
                                            <h3 className="font-bold text-neutral-200 group-hover:text-white">{song.Title}</h3>
                                            <p className="text-xs text-neutral-600 mt-1">{song.Composer}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {searchQuery && filteredStandards.map((standard, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelectSong(standard)}
                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-all">
                                        <Music size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-lg leading-tight">{standard.Title}</h4>
                                        <p className="text-sm text-neutral-500">{standard.Composer}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Play size={16} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedSong && (
                <div className="flex-1 overflow-hidden flex flex-col p-2 bg-white/5 rounded-[40px] border border-white/5">
                    {/* Analysis Toolbar */}
                    {detectedPatterns.length > 0 && (
                        <AnalysisToolbar
                            filters={analysisFilters}
                            onFiltersChange={setAnalysisFilters}
                            totalPatterns={detectedPatterns.length}
                        />
                    )}

                    <div className="px-8 py-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.4)]">LIVE SESSION</span>
                            <h2 className="text-2xl font-black tracking-tight">{selectedSong.title}</h2>
                        </div>
                        <p className="text-neutral-400 text-sm">Composed by <span className="text-neutral-200 font-medium">{selectedSong.composer}</span> • {selectedSong.style} • Key of {selectedSong.key}</p>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-row p-6 gap-6">
                        {/* Guided Practice Sidebar (Original) - LEFT */}
                        {showPracticeTips && !showPracticePanel && (
                            <PracticeTips
                                song={selectedSong}
                                onClose={() => setShowPracticeTips(false)}
                            />
                        )}

                        <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300`}>
                            <LeadSheet song={selectedSong} filteredPatterns={filteredPatterns} />
                        </div>

                        {/* Practice Exercise Panel (New Teaching Machine) - RIGHT */}
                        {showPracticePanel && detectedPatterns.length > 0 && (
                            <PracticeExercisePanel />
                        )}

                        {/* Mixer Panel - RIGHT */}
                        {showMixer && !showPracticePanel && (
                            <div className="w-64 bg-neutral-900/40 backdrop-blur-md border-l border-white/5 p-6 flex flex-col gap-8 animate-in slide-in-from-right duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                        <Volume2 size={16} /> MIXER
                                    </h3>
                                    <button
                                        onClick={() => setShowMixer(false)}
                                        className="text-neutral-600 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Piano Volume */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Piano</span>
                                            <span className="text-xs font-mono text-amber-500">{pianoVolumeSignal.value}dB</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-60"
                                            max="0"
                                            step="1"
                                            value={pianoVolumeSignal.value}
                                            onChange={(e) => pianoVolumeSignal.value = Number(e.target.value)}
                                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                    </div>

                                    {/* Piano Reverb (New) */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Piano Reverb</span>
                                            <span className="text-xs font-mono text-amber-500">{Math.round(pianoReverbSignal.value * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={pianoReverbSignal.value}
                                            onChange={(e) => pianoReverbSignal.value = Number(e.target.value)}
                                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                    </div>

                                    {/* Bass Volume */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Double Bass</span>
                                            <span className="text-xs font-mono text-amber-500">{bassVolumeSignal.value}dB</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-60"
                                            max="0"
                                            step="1"
                                            value={bassVolumeSignal.value}
                                            onChange={(e) => bassVolumeSignal.value = Number(e.target.value)}
                                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                    </div>

                                    {/* Drums Volume */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Drums</span>
                                            <span className="text-xs font-mono text-amber-500">{drumsVolumeSignal.value}dB</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-60"
                                            max="0"
                                            step="1"
                                            value={drumsVolumeSignal.value}
                                            onChange={(e) => drumsVolumeSignal.value = Number(e.target.value)}
                                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                    </div>

                                    {/* Master Reverb Level */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Master Reverb</span>
                                            <span className="text-xs font-mono text-amber-500">{Math.round(reverbVolumeSignal.value * 100)}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={reverbVolumeSignal.value}
                                            onChange={(e) => reverbVolumeSignal.value = Number(e.target.value)}
                                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <p className="text-[10px] text-neutral-600 leading-relaxed italic">
                                        Pro tip: Lower the piano volume to practice your own comping.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Next Standards Section - Hidden when playing to save space */}
                    {!isPlayingSignal.value && (
                        <div className="px-8 py-6 border-t border-white/5 bg-neutral-900/30 animate-in slide-in-from-bottom duration-500">
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Up Next • Related Standards</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {nextStandards.map((std, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectSong(std)}
                                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left transition-all group"
                                    >
                                        <h4 className="text-sm font-bold text-neutral-200 group-hover:text-amber-400 truncate">{std.Title}</h4>
                                        <p className="text-[10px] text-neutral-600 truncate">{std.Composer}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Drill Dashboard */}
            {showDrillMode && <DrillDashboard />}
            {showProfilePanel && <ProfilePanel />}
            {showBarRangeDrill && <BarRangeDrill />}
        </div>
    );
}
