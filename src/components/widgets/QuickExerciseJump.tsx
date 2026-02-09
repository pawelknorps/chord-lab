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
        <div className="flex items-center gap-3 mt-4 overflow-x-auto no-scrollbar py-1">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap hidden sm:block">
                Quick Jump
            </div>
            <div className="flex items-center gap-2">
                {filteredJumps.map((jump) => (
                    <Link
                        key={jump.id}
                        to={jump.to}
                        title={`${jump.label} - ${jump.desc}`}
                        className="
                            group flex items-center gap-2 px-3 py-1.5 rounded-full 
                            bg-[var(--bg-surface)] border border-[var(--border-subtle)] 
                            hover:border-[var(--text-muted)] hover:bg-[var(--bg-hover)] 
                            transition-all duration-200 whitespace-nowrap
                        "
                    >
                        <jump.icon size={12} className={`text-[var(--text-muted)] group-hover:${jump.color} transition-colors`} />
                        <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                            {jump.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
