import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';
import { CurriculumNode } from '../../../core/store/useMasteryTreeStore';

interface MasteryNodeProps {
    node: CurriculumNode;
    xp: number;
    onClick?: () => void;
}

/**
 * Animated node for the visual Mastery Tree (REQ-MT-04).
 * Surfaces status (Locked, Unlocked, Mastered) with premium aesthetics.
 */
export const MasteryNode: React.FC<MasteryNodeProps> = ({ node, xp, onClick }) => {
    const isLocked = node.unlockStatus === 'locked';
    const isMastered = node.unlockStatus === 'mastered';
    const progress = Math.min(100, (xp / node.requiredPoints) * 100);

    const getColors = () => {
        if (isLocked) return 'bg-neutral-900 border-neutral-800 text-neutral-600';
        if (isMastered) return 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
        return 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]';
    };

    return (
        <motion.div
            layout
            whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            onClick={!isLocked ? onClick : undefined}
            className={`
                relative w-48 p-5 rounded-[24px] border-2 transition-all duration-300
                ${getColors()}
                ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
            `}
        >
            {/* Status Icon */}
            <div className="absolute -top-3 -right-3 p-2 bg-black rounded-full border border-white/10 shadow-xl">
                {isLocked ? <Lock size={12} /> : isMastered ? <CheckCircle2 size={12} className="text-amber-500" /> : <Unlock size={12} className="text-indigo-400" />}
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    {node.category}
                </span>
                <h3 className="text-sm font-black tracking-tight leading-tight">
                    {node.label}
                </h3>

                {!isLocked && (
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
                            <span>{Math.round(progress)}% Progress</span>
                            <span>{xp} / {node.requiredPoints} XP</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={`h-full rounded-full ${isMastered ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Shine effect for mastered nodes */}
            {isMastered && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-[24px]" />
            )}
        </motion.div>
    );
};
