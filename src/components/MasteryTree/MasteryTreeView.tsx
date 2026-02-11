import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryTreeStore, CurriculumNodeId } from '../../core/store/useMasteryTreeStore';
import { Trophy, Lock, Rocket, Music, BookOpen } from 'lucide-react';
import { MasteryNodeDetail } from './MasteryNodeDetail';

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
    'foundations': { x: 400, y: 80 },
    'blues-basics': { x: 200, y: 200 },
    'major-251': { x: 600, y: 200 },
    'swing-feel': { x: 400, y: 200 },
    'secondary-dominants': { x: 600, y: 350 },
    'minor-tonality': { x: 800, y: 350 },
    'rhythm-changes': { x: 300, y: 350 },
    'modal-interchange': { x: 600, y: 500 },
    'tritone-sub': { x: 800, y: 500 },
    'upper-structures': { x: 800, y: 650 }
};

const CATEGORY_ICONS: Record<string, any> = {
    'harmonic': Music,
    'melodic': BookOpen,
    'rhythmic': Rocket,
    'repertoire': Trophy
};

export const MasteryTreeView: React.FC = () => {
    const { nodes, xpByNode } = useMasteryTreeStore();
    const [selectedNodeId, setSelectedNodeId] = useState<CurriculumNodeId | null>(null);

    const connections: [string, string][] = [];
    Object.values(nodes).forEach(node => {
        node.parentIds.forEach(parentId => {
            connections.push([parentId, node.id]);
        });
    });

    return (
        <div className="relative w-full h-full bg-[#0a0a0c] overflow-auto p-12 rounded-3xl border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="absolute top-8 left-12 z-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    The Mastery Tree
                </h1>
                <p className="text-white/50 text-sm mt-1">Scale the heights of harmonic excellence.</p>
            </div>

            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 w-[1000px] h-full pointer-events-none" style={{ minHeight: '800px' }}>
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
                {connections.map(([from, to], idx) => {
                    const fromPos = NODE_POSITIONS[from];
                    const toPos = NODE_POSITIONS[to];
                    if (!fromPos || !toPos) return null;

                    const isMastered = nodes[from].unlockStatus === 'mastered';

                    return (
                        <motion.line
                            key={`${from}-${to}-${idx}`}
                            x1={fromPos.x}
                            y1={fromPos.y}
                            x2={toPos.x}
                            y2={toPos.y}
                            stroke={isMastered ? "url(#lineGrad)" : "rgba(255,255,255,0.1)"}
                            strokeWidth={isMastered ? "3" : "2"}
                            strokeDasharray={isMastered ? "0" : "5,5"}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: idx * 0.1 }}
                        />
                    );
                })}
            </svg>

            {/* Nodes Layer */}
            <div className="relative w-[1000px] min-h-[800px]">
                {Object.values(nodes).map((node) => {
                    const pos = NODE_POSITIONS[node.id];
                    if (!pos) return null;

                    const Icon = CATEGORY_ICONS[node.category] || Music;
                    const status = node.unlockStatus;
                    const xp = xpByNode[node.id] || 0;
                    const progress = Math.min(100, (xp / node.requiredPoints) * 100);

                    return (
                        <motion.div
                            key={node.id}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group`}
                            style={{ left: pos.x, top: pos.y }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedNodeId(node.id)}
                        >
                            {/* Outer Progress Ring */}
                            <svg className="absolute -inset-4 w-24 h-24 rotate-[-90deg]">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="4"
                                />
                                <motion.circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    fill="none"
                                    stroke={status === 'mastered' ? "#fbbf24" : "#8b5cf6"}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0 251" }}
                                    animate={{ strokeDasharray: `${(progress / 100) * 251} 251` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </svg>

                            {/* Node Body */}
                            <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center relative
                                transition-all duration-300
                                ${status === 'locked'
                                    ? 'bg-white/5 border border-white/10 grayscale opacity-60'
                                    : status === 'mastered'
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                                        : 'bg-[#1a1a20] border-2 border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                }
                            `}>
                                {status === 'locked' ? (
                                    <Lock size={20} className="text-white/20" />
                                ) : (
                                    <Icon size={24} className={status === 'mastered' ? 'text-white' : 'text-purple-400'} />
                                )}
                            </div>

                            {/* Label */}
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center w-32">
                                <span className={`text-xs font-bold uppercase tracking-widest ${status === 'locked' ? 'text-white/20' : 'text-white/80'}`}>
                                    {node.label}
                                </span>
                                {status === 'unlocked' && (
                                    <div className="text-[10px] text-purple-400 font-mono mt-1">
                                        {Math.round(progress)}%
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedNodeId && (
                    <MasteryNodeDetail
                        nodeId={selectedNodeId}
                        onClose={() => setSelectedNodeId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
