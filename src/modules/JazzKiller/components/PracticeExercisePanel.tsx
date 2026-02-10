import { Target, Play, Check, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import * as Tone from 'tone';

const PATTERN_COLORS: Record<string, string> = {
    'MajorII-V-I': 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    'MinorII-V-i': 'border-blue-500/50 bg-blue-500/10 text-blue-300',
    'SecondaryDominant': 'border-amber-500/50 bg-amber-500/10 text-amber-300',
    'TritoneSubstitution': 'border-rose-500/50 bg-rose-500/10 text-rose-300',
    'ColtraneChanges': 'border-violet-500/50 bg-violet-500/10 text-violet-300',
};

const THEORY_DATA: Record<string, { title: string, explanation: string, lessons: string[] }> = {
    'MajorII-V-I': {
        title: 'The Major ii-V-I',
        explanation: 'The most essential progression in Jazz. It creates a smooth cycle of fourths movement leading back to the tonic.',
        lessons: [
            'Target the 3rd of the V7 chord (the leading tone) to resolve to the Root or 3rd of the Imaj7.',
            'Connect the 7th of the iim7 to the 3rd of the V7 – they are only a half-step apart!',
            'Try the ii-V-I "cellular" approach: Pentatonics, Bebop scales, and digital patterns.'
        ]
    },
    'MinorII-V-i': {
        title: 'The Minor ii-V-i',
        explanation: 'Darker and more tense than its major counterpart. Uses half-diminished and altered dominant chords.',
        lessons: [
            'Use Locrian #2 over the iim7b5 for a modern, less "muddy" sound.',
            'The V7 chord usually takes the Altered scale or HW Diminished for maximum tension.',
            'The tonic imaj7 or im6 often sounds best with the Melodic Minor scale.'
        ]
    },
    'SecondaryDominant': {
        title: 'Secondary Dominants',
        explanation: 'Chords that act as "V of something else", creating temporary chromatic tension towards a non-tonic chord.',
        lessons: [
            'Identify the "target" chord – the secondary dominant is its relative V7.',
            'Use the Mixolydian b13 or b9b13 scales to emphasize the "pull" to the target.',
            'Great for "rehearsing" modulations without actually leaving the key.'
        ]
    },
    'TritoneSubstitution': {
        title: 'Tritone Substitution',
        explanation: 'A dominant 7th chord replaced by another dominant 7th a tritone away (e.g., Db7 instead of G7).',
        lessons: [
            'Both chords share the same guide tones (3rd and 7th), which is why it works!',
            'This creates chromatic bass movement (ii - bII - I), which is very common in Bop.',
            'Use the Lydian Dominant scale over the bII7 chord.'
        ]
    },
    'ColtraneChanges': {
        title: 'Coltrane Changes (Giant Steps)',
        explanation: 'Multi-tonic system moving in major thirds, popularized by John Coltrane.',
        lessons: [
            'The progression moves through keys a major third apart (e.g., B, G, Eb).',
            'Focus on "shifting gears" quickly between tonal centers.',
            'Use 1-2-3-5 digital patterns to navigate the fast movements.'
        ]
    }
};

export function PracticeExercisePanel() {
    const {
        detectedPatterns,
        practiceExercises,
        activeFocusIndex,
        focusOnPattern,
        clearFocus,
    } = usePracticeStore();

    if (detectedPatterns.length === 0) {
        return (
            <div className="w-full bg-neutral-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <Target className="w-16 h-16 text-neutral-800 mb-6 animate-pulse" />
                <h3 className="text-lg font-bold text-neutral-400 mb-2">Awaiting Analysis</h3>
                <p className="text-neutral-600 text-sm max-w-[200px]">
                    Load a jazz standard to see tactical practice drills and theory.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header Section */}
            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                            <GraduationCap className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-200">
                                Practice Studio
                            </h3>
                            <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-tighter">
                                {detectedPatterns.length} Patterns Found
                            </p>
                        </div>
                    </div>
                    {activeFocusIndex !== null && (
                        <button
                            onClick={clearFocus}
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-neutral-400 hover:text-white border border-white/5"
                        >
                            Reset Focus
                        </button>
                    )}
                </div>
            </div>

            {/* Pattern List */}
            <div className="flex flex-col gap-4">
                {detectedPatterns.map((pattern, index) => {
                    const exercise = practiceExercises[index];
                    const isActive = activeFocusIndex === index;
                    const colorClass = PATTERN_COLORS[pattern.type] || PATTERN_COLORS['MajorII-V-I'];
                    const theory = THEORY_DATA[pattern.type] || THEORY_DATA['MajorII-V-I'];

                    return (
                        <div
                            key={`pattern-${index}`}
                            className={`
                                overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 group
                                ${isActive
                                    ? `${colorClass} ring-8 ring-white/[0.02] shadow-2xl`
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                                }
                            `}
                        >
                            {/* Main Info Area */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-current animate-pulse' : 'bg-neutral-800'}`} />
                                        <div>
                                            <h4 className={`text-lg font-black tracking-tight ${isActive ? 'text-white' : 'text-neutral-300'}`}>
                                                {pattern.type.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            {pattern.metadata.key && (
                                                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">
                                                    Section {pattern.startIndex + 1}-{pattern.endIndex + 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-white/20' : 'bg-white/5 text-neutral-600'}`}>
                                        {pattern.metadata.romanNumerals ? pattern.metadata.romanNumerals.join('-') : 'DRIL'}
                                    </div>
                                </div>

                                {/* Chords Visualization */}
                                {exercise && exercise.chords && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {exercise.chords.map((chord, i) => (
                                            <div
                                                key={i}
                                                className={`px-4 py-2 rounded-2xl text-sm font-black font-mono transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-black/20 text-neutral-400 group-hover:text-neutral-300'}`}
                                            >
                                                {chord}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={async () => {
                                        if (isActive) {
                                            const { isPlaying, togglePlayback } = usePracticeStore.getState();
                                            if (isPlaying) await togglePlayback();
                                            clearFocus();
                                        } else {
                                            focusOnPattern(index);
                                            const patternObj = detectedPatterns[index];
                                            if (patternObj) {
                                                const startMeasure = patternObj.startIndex;
                                                Tone.Transport.position = `${startMeasure}:0:0`;
                                            }
                                            const { isPlaying, togglePlayback } = usePracticeStore.getState();
                                            if (!isPlaying) await togglePlayback();
                                        }
                                    }}
                                    className={`
                                        w-full py-4 rounded-2xl flex items-center justify-center gap-3
                                        text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]
                                        ${isActive
                                            ? 'bg-white text-black shadow-lg'
                                            : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                                        }
                                    `}
                                >
                                    {isActive ? (
                                        <><Check size={16} /> STOP DRILL</>
                                    ) : (
                                        <><Play size={16} /> ENGAGE LOOP</>
                                    )}
                                </button>
                            </div>

                            {/* Collapsible Theory Area (Show when active or on hover if space allows) */}
                            {(isActive || true) && (
                                <div className={`px-6 pb-6 pt-0 transition-all duration-500 ${!isActive && 'opacity-60 grayscale-[0.5]'}`}>
                                    <div className="h-px bg-current opacity-10 mb-6" />

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-widest text-white/90">
                                                <BookOpen size={14} /> Theory & Context
                                            </div>
                                            <p className="text-sm leading-relaxed text-neutral-200 italic font-medium">
                                                {theory.explanation}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Tactical Recommendations */}
                                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-tighter text-neutral-500">
                                                    <Target size={12} /> Target Strategy
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Scale</span>
                                                        <span className="text-xs font-black text-white">{exercise?.practiceScale || 'Universal'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Focus</span>
                                                        <span className="text-xs font-mono text-neutral-200">{exercise?.practiceArpeggio || 'Guide Tones'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lesson Points */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-white/80">
                                                    <Lightbulb size={14} className="text-amber-400" /> Lesson Highlights
                                                </div>
                                                <ul className="space-y-3">
                                                    {theory.lessons.map((lesson, i) => (
                                                        <li key={i} className="flex gap-3 text-xs leading-relaxed text-neutral-200">
                                                            <div className="w-1 h-1 rounded-full bg-current shrink-0 mt-1.5" />
                                                            {lesson}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Global Practice Wisdom */}
            <div className="p-8 rounded-[3rem] border border-white/5 bg-white/[0.02] mt-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                    <GraduationCap size={16} /> Mastering the Drill
                </h4>
                <div className="space-y-4">
                    <p className="text-sm text-neutral-500 leading-relaxed">
                        Jazz improvisation is a language. These cycles represent common "words" and "phrases". Don't just play the notes; listen to the <span className="text-indigo-400">harmonic gravity</span>.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-black/40 rounded-2xl text-[10px] text-neutral-400 font-bold border border-white/5">
                            Slow is smooth, smooth is fast.
                        </div>
                        <div className="p-3 bg-black/40 rounded-2xl text-[10px] text-neutral-400 font-bold border border-white/5">
                            Focus on voice leading.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
