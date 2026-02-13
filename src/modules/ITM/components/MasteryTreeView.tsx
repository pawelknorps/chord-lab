import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryTreeStore } from '../../../core/store/useMasteryTreeStore';
import { MasteryNode } from './MasteryNode';
import { X, Play, Info } from 'lucide-react';

/**
 * Visual curriculum map for the Incredible Teaching Machine (REQ-MT-04).
 * Uses a category-based lane layout for readability.
 */
export const MasteryTreeView: React.FC = () => {
    const { nodes, xpByNode } = useMasteryTreeStore();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const categories = ['harmonic', 'melodic', 'rhythmic', 'repertoire'];
    const nodesArray = Object.values(nodes);

    const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

    return (
        <div className="w-full h-full overflow-y-auto px-8 py-12 bg-[#050505]">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter">Your Mastery Journey</h2>
                    <p className="text-neutral-500 max-w-xl font-medium">
                        Master foundational jazz concepts to unlock advanced standards and elite improvisation techniques.
                    </p>
                </div>

                {/* Tree Lanes */}
                <div className="flex flex-col gap-20">
                    {categories.map((cat) => {
                        const catNodes = nodesArray.filter(n => n.category === cat);
                        if (catNodes.length === 0) return null;

                        return (
                            <div key={cat} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">
                                        {cat} Path
                                    </span>
                                    <div className="h-[1px] flex-1 bg-white/5" />
                                </div>

                                <div className="flex flex-wrap gap-8 justify-center">
                                    {catNodes.map(node => (
                                        <MasteryNode
                                            key={node.id}
                                            node={node}
                                            xp={xpByNode[node.id] || 0}
                                            onClick={() => setSelectedNodeId(node.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Node Detail Modal */}
            <AnimatePresence>
                {selectedNode && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={() => setSelectedNodeId(null)}
                        />

                        <motion.div
                            layoutId={selectedNode.id}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-8 flex flex-col gap-8"
                        >
                            <button
                                onClick={() => setSelectedNodeId(null)}
                                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedNode.unlockStatus === 'mastered' ? 'bg-amber-500 text-black' : 'bg-indigo-500 text-white'
                                        }`}>
                                        {selectedNode.unlockStatus}
                                    </span>
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                        {selectedNode.category}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight">{selectedNode.label}</h3>
                                <p className="text-neutral-400 font-medium leading-relaxed">
                                    {selectedNode.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                        <Info size={20} className="text-indigo-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Requirement</span>
                                        <span className="text-sm font-bold text-white">{selectedNode.requiredPoints} XP to Master</span>
                                    </div>
                                </div>

                                {selectedNode.standards.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Associated Standards</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNode.standards.map((s, idx) => (
                                                <button key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-bold text-neutral-300 transition-all group">
                                                    <Play size={10} className="text-indigo-400 group-hover:scale-125 transition-transform" />
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedNodeId(null)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                            >
                                Continue Training
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
