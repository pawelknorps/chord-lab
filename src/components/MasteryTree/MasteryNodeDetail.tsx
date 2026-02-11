import React from 'react';
import { motion } from 'framer-motion';
import { useMasteryTreeStore, CurriculumNodeId } from '../../core/store/useMasteryTreeStore';
import { usePracticeStore } from '../../core/store/usePracticeStore';
import { X, PlayCircle, Trophy, Target, Book } from 'lucide-react';
import standardsData from '../../modules/JazzKiller/utils/standards.json';

interface MasteryNodeDetailProps {
    nodeId: CurriculumNodeId;
    onClose: () => void;
}

export const MasteryNodeDetail: React.FC<MasteryNodeDetailProps> = ({ nodeId, onClose }) => {
    const { nodes, xpByNode } = useMasteryTreeStore();
    const { loadSong } = usePracticeStore();

    const node = nodes[nodeId];
    if (!node) return null;

    const xp = xpByNode[nodeId] || 0;
    const progress = Math.min(100, (xp / node.requiredPoints) * 100);
    const isLocked = node.unlockStatus === 'locked';
    const isMastered = node.unlockStatus === 'mastered';

    const handleStartSong = (songTitle: string) => {
        // Find the song in the standards library
        const songData = (standardsData as any[]).find(s => s.title === songTitle);
        if (songData) {
            loadSong(songData);
            onClose();
            // Optional: navigate to practice view
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#141418] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Image/Pattern */}
                <div className={`h-32 w-full ${isMastered ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-purple-600 to-pink-600'} flex items-center justify-center`}>
                    <Book size={48} className="text-white/20" />
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/50 hover:text-white hover:bg-black/40 transition-all"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/40 mb-2 inline-block">
                                node details
                            </span>
                            <h2 className="text-3xl font-bold text-white">{node.label}</h2>
                        </div>
                        {isMastered && (
                            <div className="bg-yellow-400/10 border border-yellow-400/50 p-2 rounded-xl text-yellow-400">
                                <Trophy size={24} />
                            </div>
                        )}
                    </div>

                    <p className="text-white/60 text-base mb-8 leading-relaxed">
                        {node.description}
                    </p>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <Target size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Current XP</span>
                            </div>
                            <div className="text-xl font-mono text-white">
                                {xp} <span className="text-white/20 text-sm">/ {node.requiredPoints}</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 text-white/40 mb-1">
                                <PlayCircle size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Status</span>
                            </div>
                            <div className={`text-xl font-bold ${isLocked ? 'text-white/20' : isMastered ? 'text-yellow-400' : 'text-purple-400'}`}>
                                {node.unlockStatus.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* ProgressBar */}
                    {!isLocked && (
                        <div className="h-2 w-full bg-white/5 rounded-full mb-8 overflow-hidden">
                            <motion.div
                                className={`h-full ${isMastered ? 'bg-yellow-400' : 'bg-purple-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    )}

                    {/* Associated Standards */}
                    {node.standards.length > 0 && !isLocked && (
                        <div>
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Practice Songs</h3>
                            <div className="space-y-3">
                                {node.standards.map((songTitle) => (
                                    <div
                                        key={songTitle}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
                                        onClick={() => handleStartSong(songTitle)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                                <PlayCircle size={20} />
                                            </div>
                                            <span className="font-semibold text-white/80">{songTitle}</span>
                                        </div>
                                        <span className="text-[10px] text-white/20 font-bold group-hover:text-purple-400 transition-all">START LESSON</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLocked && (
                        <div className="p-6 bg-red-400/5 border border-red-400/20 rounded-2xl flex flex-col items-center gap-2 text-center">
                            <Lock size={24} className="text-red-400/40 mb-2" />
                            <h4 className="text-red-400/80 font-bold text-sm">Node is Locked</h4>
                            <p className="text-[11px] text-red-400/40">Master previous nodes in the tree to unlock this harmonic concept.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const Lock: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
