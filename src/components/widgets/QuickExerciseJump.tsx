import { Link } from 'react-router-dom';
import { Activity, Brain, Circle, Sparkles } from 'lucide-react';

interface QuickExerciseJumpProps {
    currentModule: 'ChordLab' | 'CircleChords' | 'RhythmArchitect' | 'EarTraining';
}

export function QuickExerciseJump({ currentModule }: QuickExerciseJumpProps) {
    const jumps = [
        {
            id: 'ChordLab',
            to: '/',
            label: 'Chord Lab',
            icon: Sparkles,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            desc: 'Build Harmony'
        },
        {
            id: 'CircleChords',
            to: '/circle-chords',
            label: 'Circle of 5ths',
            icon: Circle,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            desc: 'Analyze Progression'
        },
        {
            id: 'RhythmArchitect',
            to: '/rhythm-architect',
            label: 'Rhythm Architect',
            icon: Activity,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            desc: 'Practice Timing'
        },
        {
            id: 'EarTraining',
            to: '/functional-ear-training',
            label: 'Ear Training',
            icon: Brain,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            desc: 'Recognize Degrees'
        }
    ];

    const filteredJumps = jumps.filter(j => j.id !== currentModule);

    return (
        <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-6">Continue your Training</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredJumps.map((jump) => (
                    <Link
                        key={jump.id}
                        to={jump.to}
                        className="group glass-panel p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-lg ${jump.bg} ${jump.color} group-hover:scale-110 transition-transform`}>
                            <jump.icon size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{jump.label}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-tighter">{jump.desc}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
