import { useSessionStore } from '../../core/store/useSessionStore';
import { Target, CheckCircle2, Circle, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function SessionHUD() {
    const { isActive, goals, activeChord, activeProgression, endSession, toggleGoal } = useSessionStore();

    if (!isActive) return null;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 px-6 py-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        >
            {/* Session Title/Target */}
            <div className="flex items-center gap-4 pr-6 border-r border-white/10">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <Target size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Active Session</h4>
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">
                        {activeChord?.name || activeProgression?.name || 'Free Practice'}
                    </p>
                </div>
            </div>

            {/* Goals List */}
            <div className="flex items-center gap-4">
                {goals.map((goal) => (
                    <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${goal.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                            }`}
                    >
                        {goal.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-tighter">{goal.description}</span>
                    </button>
                ))}

                {goals.length === 0 && (
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">No specific goals set</span>
                )}
            </div>

            <div className="w-px h-8 bg-white/10"></div>

            {/* Actions */}
            <button
                onClick={endSession}
                className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors"
                title="End Session"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
}
