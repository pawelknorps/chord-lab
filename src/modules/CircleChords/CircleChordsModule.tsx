import { useEffect, useState, useCallback } from 'react'
import InteractiveCircle from './components/InteractiveCircle'
import SimpleProgressionCard from './components/SimpleProgressionCard'
import type { AppConfig, GeneratedProgression, Note } from './lib/types'
import { loadAllConfig } from './lib/config'
import { initTheory, generateProgressions as gen, getScale, buildChord } from './lib/theory'
import { sfChordPlayer } from './audio/SoundFontAudio'
import { Brain, Trophy, Target, Play, Activity, Sparkles } from 'lucide-react'
import { useMasteryStore } from '../../core/store/useMasteryStore'

// Default notes if config fails
const DEFAULT_NOTES = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

type Difficulty = 'Novice' | 'Advanced' | 'Pro'

export default function CircleChordsModule() {
    const { addExperience, updateStreak, globalLevel } = useMasteryStore();
    const [ready, setReady] = useState(false)
    const [keySig, setKeySig] = useState<string>('C')
    const [mode, setMode] = useState<string>('major')
    const [progressions, setProgressions] = useState<GeneratedProgression[]>([])
    const [notesList, setNotesList] = useState<string[]>(DEFAULT_NOTES)
    const [circleData, setCircleData] = useState<{ majorKeys: string[]; minorKeys: string[] }>({ majorKeys: [], minorKeys: [] })
    const [modes, setModes] = useState<string[]>(['major', 'minor'])
    const [difficulty, setDifficulty] = useState<Difficulty>('Novice')
    const [view, setView] = useState<'workshop' | 'challenge'>('workshop')

    const [score, setScore] = useState(0)
    const [challengeState, setChallengeState] = useState<{ target: string, options: string[], isPlaying: boolean, feedback: string | null }>({
        target: '',
        options: [],
        isPlaying: false,
        feedback: null
    })

    const [customProgression, setCustomProgression] = useState<GeneratedProgression>({
        name: 'Custom Sequence',
        degrees: [],
        types: [],
        description: 'Build your own progression by clicking chords on the circle.',
        chords: []
    })

    // Initialize config + theory
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const config: AppConfig = await loadAllConfig()
                initTheory(config)
                setCircleData({ majorKeys: config.majorKeys || [], minorKeys: config.minorKeys || [] })
                if (Array.isArray(config.notes) && config.notes.length === 12) setNotesList(config.notes)
                if (config.scales) setModes(Object.keys(config.scales))

                sfChordPlayer.initialize().catch(() => { })

                if (!cancelled) setReady(true)
            } catch (e) {
                console.error('Initialization error:', e)
            }
        })()
        return () => { cancelled = true }
    }, [])

    // Challenge Logic
    const startNewChallenge = useCallback(() => {
        const sharpsFlats: any = {
            'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7,
            'F': 1, 'Bb': 2, 'Eb': 3, 'Ab': 4, 'Db': 5, 'Gb': 6, 'Cb': 7
        };

        const pool = circleData.majorKeys.filter(k => {
            const count = sharpsFlats[k] || 0;
            if (difficulty === 'Novice') return count <= 2;
            if (difficulty === 'Advanced') return count > 2 && count <= 5;
            return count > 5;
        });

        const target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : circleData.majorKeys[0];

        // Generate options: 1 correct + 3 random from majorKeys
        const options = [target];
        while (options.length < 4) {
            const opt = circleData.majorKeys[Math.floor(Math.random() * circleData.majorKeys.length)];
            if (!options.includes(opt)) options.push(opt);
        }

        setChallengeState({
            target,
            options: options.sort(() => Math.random() - 0.5),
            isPlaying: false,
            feedback: null
        });
    }, [difficulty, circleData.majorKeys]);

    const playChallengeAudio = async () => {
        if (challengeState.isPlaying) return;
        setChallengeState(s => ({ ...s, isPlaying: true }));

        // Play I - IV - V - I cadence
        const root = challengeState.target as Note;
        const scale = getScale(root, 'major');
        const iChord = buildChord(scale[0], 'maj');
        const ivChord = buildChord(scale[3], 'maj');
        const vChord = buildChord(scale[4], 'maj');

        await sfChordPlayer.playChord(iChord, 0.8);
        await new Promise(r => setTimeout(r, 1000));
        await sfChordPlayer.playChord(ivChord, 0.8);
        await new Promise(r => setTimeout(r, 1000));
        await sfChordPlayer.playChord(vChord, 0.8);
        await new Promise(r => setTimeout(r, 1000));
        await sfChordPlayer.playChord(iChord, 1.2);

        setChallengeState(s => ({ ...s, isPlaying: false }));
    };

    const handleChallengeGuess = (guess: string) => {
        if (guess === challengeState.target) {
            const points = (difficulty === 'Novice' ? 10 : difficulty === 'Advanced' ? 25 : 100);
            setScore(s => s + points);
            setChallengeState(s => ({ ...s, feedback: 'Perfect! 🎉' }));
            addExperience('CircleChords', points * 2);
            updateStreak('CircleChords', Math.floor(score / 100));
            setTimeout(startNewChallenge, 2000);
        } else {
            setChallengeState(s => ({ ...s, feedback: `Not quite. It was ${challengeState.target}` }));
            updateStreak('CircleChords', 0);
            setTimeout(startNewChallenge, 3000);
        }
    };

    useEffect(() => {
        if (view === 'challenge' && ready) {
            startNewChallenge();
        }
    }, [view, ready, startNewChallenge]);

    // Recompute progressions when key/mode changes
    useEffect(() => {
        if (!ready) return
        try {
            const list = gen(keySig, mode)
            setProgressions(list)
        } catch (e) {
            console.error('Failed to generate progressions:', e)
        }
    }, [ready, keySig, mode])

    const onTonalityChange = (key: string, m: string) => {
        setKeySig(key)
        setMode(m)
    }

    const addToCustom = (chordName: string, root: string, type: string) => {
        const newChord = {
            root: root as Note,
            type: type,
            name: chordName,
            degree: -1,
            notes: buildChord(root as Note, type)
        }
        setCustomProgression(prev => ({
            ...prev,
            chords: [...prev.chords, newChord]
        }))
    }

    const removeFromCustom = (index: number) => {
        setCustomProgression(prev => ({
            ...prev,
            chords: prev.chords.filter((_, i) => i !== index)
        }))
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-black/60 text-white fade-in">
            <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Harmonic Circles
                        </h1>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                            <Sparkles size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black text-white/60">LVL {globalLevel}</span>
                        </div>
                    </div>
                    <p className="text-white/40 font-medium">Professional Theory Workshop & Ear Lab</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setView('workshop')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'workshop' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/40 hover:text-white'}`}
                    >
                        Workshop
                    </button>
                    <button
                        onClick={() => setView('challenge')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'challenge' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-white/40 hover:text-white'}`}
                    >
                        Challenge Lab
                    </button>
                </div>
            </header>

            {!ready ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
            ) : view === 'workshop' ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Controls & Circle */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <h2 className="text-xl font-black text-center mb-6 tracking-tight">Master Circle</h2>
                            <InteractiveCircle
                                keyValue={keySig}
                                modeValue={mode}
                                onTonalityChange={onTonalityChange}
                                majorKeys={circleData.majorKeys}
                                minorKeys={circleData.minorKeys}
                                onChordSelect={addToCustom}
                            />
                        </div>

                        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity size={20} className="text-cyan-400" />
                                Config
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-white/30 mb-2">Key Center</label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {notesList.map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setKeySig(n)}
                                                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${keySig === n ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-white/30 mb-2">Mode / Scale</label>
                                    <div className="flex flex-wrap gap-2">
                                        {modes.map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-all ${mode === m ? 'bg-purple-500 text-white font-black' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Progressions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Custom Workshop Area */}
                        <div>
                            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg"><Brain size={18} className="text-purple-400" /></div>
                                    Chord Workshop
                                </span>
                                {customProgression.chords.length > 0 && (
                                    <button
                                        onClick={() => setCustomProgression(prev => ({ ...prev, chords: [] }))}
                                        className="px-3 py-1 bg-white/5 hover:bg-red-500/20 text-[10px] uppercase font-bold text-white/40 hover:text-red-400 rounded-lg transition-all"
                                    >
                                        Clear Sequence
                                    </button>
                                )}
                            </h2>
                            <SimpleProgressionCard
                                progression={customProgression}
                                keySig={keySig}
                                mode={mode}
                                majorKeys={circleData.majorKeys}
                                minorKeys={circleData.minorKeys}
                                getScale={(k, m) => getScale(k, m)}
                                isWorkshop={true}
                                onRemoveChord={removeFromCustom}
                            />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg"><Target size={18} className="text-cyan-400" /></div>
                                Library Progressions
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                {progressions.map((p, idx) => (
                                    <SimpleProgressionCard
                                        key={idx}
                                        progression={p}
                                        keySig={keySig}
                                        mode={mode}
                                        majorKeys={circleData.majorKeys}
                                        minorKeys={circleData.minorKeys}
                                        getScale={(k, m) => getScale(k, m)}
                                        onEdit={() => setCustomProgression({ ...p, name: `Custom ${p.name}` })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Challenge Lab UI */}
                    <div className="glass-panel p-10 rounded-[3rem] border border-white/10 text-center space-y-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                            <div className={`h-full bg-purple-500 transition-all duration-[4s] ${challengeState.isPlaying ? 'w-full' : 'w-0'}`} />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-white">Identify the Key Center</h2>
                            <div className="flex justify-center gap-2">
                                {(['Novice', 'Advanced', 'Pro'] as Difficulty[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={playChallengeAudio}
                                disabled={challengeState.isPlaying}
                                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${challengeState.isPlaying ? 'bg-white/10 scale-110' : 'bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-900/40 hover:scale-105 active:scale-95'}`}
                            >
                                {challengeState.isPlaying ? (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-6 bg-white animate-bounce" />
                                        <div className="w-1.5 h-10 bg-white animate-bounce delay-100" />
                                        <div className="w-1.5 h-6 bg-white animate-bounce delay-300" />
                                    </div>
                                ) : (
                                    <Play fill="white" size={40} className="ml-1" />
                                )}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {challengeState.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleChallengeGuess(opt)}
                                    disabled={challengeState.isPlaying || !!challengeState.feedback}
                                    className="p-8 glass-panel border border-white/5 hover:border-purple-500/50 hover:bg-white/5 rounded-3xl transition-all group"
                                >
                                    <div className="text-4xl font-black text-white group-hover:text-purple-400">{opt}</div>
                                    <div className="text-[10px] uppercase font-bold text-white/20 mt-2 tracking-widest group-hover:text-purple-500/50">Major</div>
                                </button>
                            ))}
                        </div>

                        {challengeState.feedback && (
                            <div className={`text-2xl font-black animate-reveal ${challengeState.feedback.includes('Perfect') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {challengeState.feedback}
                            </div>
                        )}

                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                            <div className="text-left">
                                <div className="text-[10px] uppercase font-black tracking-widest text-white/30">Current Lab</div>
                                <div className="text-xl font-bold text-white">{difficulty} Identification</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-black tracking-widest text-white/30">Total Points</div>
                                <div className="text-2xl font-mono font-black text-emerald-400">{score}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                            <Trophy className="text-amber-400" size={32} />
                            <h4 className="font-bold text-white">Absolute Mastery</h4>
                            <p className="text-sm text-white/40">Pro level tests your ear on keys with 6-7 accidentals like F# and Cb.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                            <Activity className="text-cyan-400" size={32} />
                            <h4 className="font-bold text-white">Functional Logic</h4>
                            <p className="text-sm text-white/40">Listen for the resolution of the V-I cadence to find the tonic.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                            <Brain className="text-purple-400" size={32} />
                            <h4 className="font-bold text-white">Cognitive Load</h4>
                            <p className="text-sm text-white/40">Switching between keys builds subconscious theoretical reflex.</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-6xl mx-auto mt-12 pb-12">
                <QuickExerciseJump currentModule="CircleChords" />
            </div>
        </div>
    )
}

import { QuickExerciseJump } from '../../components/widgets/QuickExerciseJump'
