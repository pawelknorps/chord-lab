import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { noteNameToMidi } from '../../../../core/theory';
import { playChordPart, triggerAttack, triggerRelease } from '../../../../core/audio/globalAudio';
import { useMasteryStore } from '../../../../core/store/useMasteryStore';
import { useEarPerformanceStore } from '../../state/useEarPerformanceStore';
import { useMidi } from '../../../../context/MidiContext';
import { Brain, Target, RotateCw, Play } from 'lucide-react';
import { useFunctionalEarTrainingStore } from '../../state/useFunctionalEarTrainingStore';
import { getNextChallenge } from '../../utils/adaptiveCurriculum';
import { UnifiedPiano } from '../../../../components/shared/UnifiedPiano';
import { QuickExerciseJump } from '../../../../components/widgets/QuickExerciseJump';

type DrillMode = 'Extensions' | 'Triads' | 'Sevenths';
type Difficulty = 'Novice' | 'Advanced' | 'Pro';

export function ChordQualitiesLevel() {
    const { t } = useTranslation();
    const { addExperience, updateStreak } = useMasteryStore();
    const { lastNote } = useMidi();
    const recordAttempt = useEarPerformanceStore((s) => s.recordAttempt);
    const { externalData, setExternalData } = useFunctionalEarTrainingStore();

    const [difficulty, setDifficulty] = useState<Difficulty>('Novice');
    const [currentMode, setCurrentMode] = useState<DrillMode>('Triads');
    const [currentRoot] = useState('C');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [quizMode, setQuizMode] = useState(false);
    const [targetAnswer, setTargetAnswer] = useState<string | null>(null);
    const [targetIntervals, setTargetIntervals] = useState<number[]>([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [inputBuffer, setInputBuffer] = useState<number[]>([]);

    const EXTENSIONS = [
        { name: 'b9', interval: 13, flavor: 'Dark / Phrygian' },
        { name: '9', interval: 14, flavor: 'Rich / Color' },
        { name: '#9', interval: 15, flavor: 'Tension / Alt' },
        { name: '#11', interval: 18, flavor: 'Lydian / Bright' },
        { name: 'b13', interval: 20, flavor: 'Minor / Aeolian' },
        { name: '13', interval: 21, flavor: 'Major / Dorian' },
        { name: '7b9#11', interval: 18, intervals: [0, 4, 10, 13, 18], flavor: 'Very Advanced Tension' }
    ];

    const TRIADS = [
        { name: 'Major', intervals: [0, 4, 7], flavor: 'Happy / Stable' },
        { name: 'Minor', intervals: [0, 3, 7], flavor: 'Sad / Melancholy' },
        { name: 'Diminished', intervals: [0, 3, 6], flavor: 'Tense / Compressed' },
        { name: 'Augmented', intervals: [0, 4, 8], flavor: 'Dreamy / Unsettled' },
    ];

    const SEVENTHS = [
        { name: 'Maj7', intervals: [0, 4, 7, 11], flavor: 'Jazz / Open' },
        { name: 'min7', intervals: [0, 3, 7, 10], flavor: 'Smooth / Mellow' },
        { name: 'Dom7', intervals: [0, 4, 7, 10], flavor: 'Bluesy / Resolving' },
        { name: 'm7b5', intervals: [0, 3, 6, 10], flavor: 'Dark / Half-Dim' },
        { name: 'Dim7', intervals: [0, 3, 6, 9], flavor: 'Scary / Symmetrical' },
    ];

    useEffect(() => {
        if (difficulty === 'Novice' && currentMode === 'Extensions') setCurrentMode('Triads');
        if (difficulty === 'Novice' && currentMode === 'Sevenths') setCurrentMode('Triads');
        if (difficulty === 'Advanced' && currentMode === 'Extensions') setCurrentMode('Sevenths');
    }, [difficulty, currentMode]);

    useEffect(() => {
        if (!quizMode || !lastNote) return;
        const midiAllowed = difficulty === 'Pro' ||
            (difficulty === 'Advanced' && currentMode === 'Sevenths') ||
            (difficulty === 'Novice' && currentMode === 'Triads');
        if (!midiAllowed) return;

        if (lastNote.type === 'noteon') {
            const notePos = lastNote.note % 12;
            const rootMidi = noteNameToMidi(currentRoot + '4') % 12;
            const interval = (notePos - rootMidi + 12) % 12;

            setInputBuffer(prev => {
                const next = prev.includes(interval) ? prev : [...prev, interval].sort((a, b) => a - b);
                checkProAnswer(next);
                return next;
            });
            triggerAttack(lastNote.note, lastNote.velocity / 127);
        } else {
            triggerRelease(lastNote.note);
        }
    }, [lastNote, quizMode, difficulty, currentMode]);

    const checkProAnswer = (input: number[]) => {
        if (input.length < targetIntervals.length) return;
        const sortedTarget = [...targetIntervals].map(i => i % 12).sort((a, b) => a - b);
        const sortedInput = [...input].sort((a, b) => a - b);

        if (JSON.stringify(sortedTarget) === JSON.stringify(sortedInput)) {
            handleAnswer(targetAnswer!);
            setInputBuffer([]);
        } else if (input.length >= targetIntervals.length) {
            setFeedback('Mismatching notes. Listen again.');
            setTimeout(() => setInputBuffer([]), 1000);
        }
    };

    const nextQuestion = useCallback(() => {
        if (externalData) {
            if (externalData.quality) {
                setTargetAnswer(externalData.quality);
                if (externalData.notes) {
                    const rootMidi = externalData.notes[0];
                    setTargetIntervals(externalData.notes.map((n: number) => n - rootMidi));
                }
            }
            return;
        }
        const data = currentMode === 'Triads' ? TRIADS : currentMode === 'Sevenths' ? SEVENTHS : EXTENSIONS;
        const extended = difficulty === 'Pro' && currentMode === 'Sevenths' ? EXTENSIONS : null;
        const randomItem = getNextChallenge('ChordQualities', data, extended, targetAnswer);
        setTargetAnswer(randomItem.name);
        playDrillItem(randomItem);
    }, [currentMode, externalData]);

    const handleAnswer = useCallback((answer: string) => {
        if (!quizMode || !targetAnswer) return;
        if (answer === targetAnswer || (externalData && answer.toLowerCase() === targetAnswer.toLowerCase())) {
            recordAttempt('ChordQualities', targetAnswer, true);
            setFeedback('Correct! 🎉');
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 2 : 5;
            setScore(s => ({ ...s, correct: s.correct + multiplier, total: s.total + 1 }));
            addExperience('ChordLab', multiplier * 20);
            updateStreak('ChordLab', score.correct / 5);
            if (externalData) setExternalData(null);
            setTimeout(nextQuestion, 1500);
        } else {
            recordAttempt('ChordQualities', targetAnswer, false);
            setFeedback(`Try again! (It was ${targetAnswer})`);
            setScore(s => ({ ...s, total: s.total + 1 }));
        }
    }, [quizMode, targetAnswer, difficulty, score.correct, addExperience, updateStreak, externalData, setExternalData, nextQuestion, recordAttempt]);

    const playDrillItem = useCallback((item: any) => {
        const rootMidi = noteNameToMidi(currentRoot + '4');
        if (currentMode === 'Extensions') {
            const third = rootMidi + 4;
            const seventh = rootMidi + 10;
            const targetInts = item.intervals ? item.intervals : [4, 10, item.interval];
            setTargetIntervals(targetInts);
            if (item.intervals) {
                playChordPart(item.intervals.map((i: number) => rootMidi + i), '1n', 'shell');
            } else {
                playChordPart([rootMidi, third, seventh], '2n', 'shell');
                setTimeout(() => {
                    const extMidi = rootMidi + item.interval;
                    playChordPart([extMidi], '2n', 'extension');
                }, 500);
            }
        } else {
            setTargetIntervals(item.intervals);
            const notes = item.intervals.map((int: number) => rootMidi + int);
            playChordPart(notes, '1n', 'shell');
        }
        if (!quizMode) setFeedback(`${item.name} - ${item.flavor}`);
    }, [currentRoot, currentMode, quizMode]);

    const drillData = currentMode === 'Triads' ? TRIADS : currentMode === 'Sevenths' ? SEVENTHS : EXTENSIONS;

    return (
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Brain size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Ear Training Labs</h2>
                        <div className="flex gap-2 mt-1">
                            {(['Novice', 'Advanced', 'Pro'] as Difficulty[]).map(d => (
                                <button key={d} onClick={() => setDifficulty(d)} className={`px-2 py-0.5 rounded text-[10px] uppercase font-black transition-all ${difficulty === d ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-white/40 hover:text-white'}`}>{d}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
                    {(['Extensions', 'Triads', 'Sevenths'] as DrillMode[])
                        .filter(m => difficulty === 'Novice' ? m === 'Triads' : difficulty === 'Advanced' ? m !== 'Extensions' : true)
                        .map(mode => (
                            <button key={mode} onClick={() => { setCurrentMode(mode); setQuizMode(false); setFeedback(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentMode === mode ? 'bg-purple-600 text-white shadow-lg' : 'bg-transparent text-white/40 hover:text-white'}`}>{t(`earTraining.modes.${mode}`)}</button>
                        ))}
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-0.5">Points</div>
                        <div className="text-2xl font-mono text-emerald-400 leading-none">{score.correct}</div>
                    </div>
                    <button onClick={() => setQuizMode(!quizMode)} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${quizMode ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/10 text-white hover:bg-white/20'}`}>{quizMode ? 'Exit Lab' : 'Start Drill'}</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-white text-sm font-bold flex items-center justify-between"><span className="flex items-center gap-2"><Target size={16} className="text-purple-400" />{quizMode ? 'Identify Target' : 'Explore Relationships'}</span></h3>
                        {(difficulty === 'Pro' || (difficulty === 'Advanced' && currentMode === 'Sevenths') || (difficulty === 'Novice' && currentMode === 'Triads')) && quizMode ? (
                            <div className="flex flex-col items-center gap-6 py-4">
                                <UnifiedPiano mode="highlight" highlightedNotes={inputBuffer.map(i => noteNameToMidi(currentRoot + '4') + i)} octaveRange={[4, 5]} showLabels="none" />
                                <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest">Playing: {inputBuffer.map(i => i === 0 ? 'R' : i).join(' - ')}</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {drillData.map((item: any) => (
                                    <button key={item.name} onClick={() => quizMode ? handleAnswer(item.name) : playDrillItem(item)} className={`py-4 rounded-xl font-mono text-sm transition-all border ${quizMode ? 'bg-black/20 hover:bg-purple-500/20 text-white border-white/5 hover:border-purple-500/50' : 'bg-black/20 hover:bg-white/10 text-cyan-400 border-white/5 hover:border-white/20'}`}><div className="font-black">{item.name}</div>{!quizMode && <div className="text-[8px] text-white/30 mt-1 uppercase tracking-tighter">{item.flavor}</div>}</button>
                                ))}
                            </div>
                        )}
                        {quizMode && <button onClick={() => { setInputBuffer([]); nextQuestion(); }} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-[10px] uppercase font-black text-white/40 rounded-xl transition-all"><RotateCw size={14} />Replay Audio</button>}
                    </div>
                </div>
                <div className="relative min-h-[250px] bg-black/60 rounded-3xl border border-white/5 flex flex-col items-center justify-center overflow-hidden p-8">
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"><div className="w-64 h-64 rounded-full bg-purple-500/5 blur-3xl animate-pulse" /><div className="w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl animate-pulse delay-700" /></div>
                    {feedback ? (
                        <div className="text-center z-10 space-y-4 animate-reveal"><div className={`text-4xl font-black ${feedback.includes('Correct') ? 'text-emerald-400' : 'text-red-400'}`}>{feedback === 'Correct! 🎉' ? 'EXCELLENT' : 'NOT QUITE'}</div><div className="text-white/40 text-sm font-bold uppercase tracking-[0.2em]">{feedback.includes('Try again') ? `Expected: ${targetAnswer}` : (feedback.split(' - ')[1] || 'Dynamic Hearing Detected')}</div></div>
                    ) : (
                        <div className="text-center z-10 space-y-4"><div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10"><Play size={24} className="text-white/20" /></div><div className="text-white/20 text-xs font-black uppercase tracking-[0.3em]">{quizMode ? 'Listening for Target...' : 'Select a quality to analyze'}</div></div>
                    )}
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10"><QuickExerciseJump currentModule="EarTraining" /></div>
        </div>
    );
}
