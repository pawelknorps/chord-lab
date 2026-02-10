import { useState } from 'react';
import { BookOpen, Book, FileText, Play, ExternalLink, Star, ArrowRight, Brain, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Method {
    id: string;
    title: string;
    author: string;
    description: string;
    concepts: string[];
    difficulty: 'Novice' | 'Intermediate' | 'Advanced' | 'Pro' | 'Virtuoso';
    link?: string;
}

const METHODS: Method[] = [
    {
        id: 'hindemith',
        title: 'Elementary Training for Musicians',
        author: 'Paul Hindemith',
        difficulty: 'Intermediate',
        description: 'A rigorous foundational approach to rhythmic reading, coordination, and mental subdivision.',
        concepts: ['Reading Coordination', 'Mental Subdivision', 'Syncopated Feel'],
    },
    {
        id: 'messiaen',
        title: 'The Technique of My Musical Language',
        author: 'Olivier Messiaen',
        difficulty: 'Pro',
        description: 'Advanced concepts of added values, non-retrogradable rhythms, and rhythmic cells.',
        concepts: ['Added Values', 'Non-retrogradable Rhythms', 'Augmentation'],
    },
    {
        id: 'konnakol',
        title: 'The Art of Konnakol',
        author: 'Carnatic Tradition',
        difficulty: 'Advanced',
        description: 'South Indian vocal percussion system for mastering complex subdivisions and mathematical structures.',
        concepts: ['Syllabic Rhythms', 'Tala Structures', 'Jati Permutations'],
    },
    {
        id: 'bellson',
        title: 'Modern Reading Text in 4/4',
        author: 'Louis Bellson',
        difficulty: 'Novice',
        description: 'Focuses on sight-reading and polyrhythmic independence for jazz and contemporary musicians.',
        concepts: ['Sight Reading', 'Independence', 'Bop Phrasing'],
    }
];

export default function StudyMethods() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-10 w-full max-w-6xl py-4 fade-in">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-indigo-400">
                    <BookOpen size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Resource Library</span>
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter text-white">THEORETICAL FRAMEWORKS</h2>
                <p className="text-white/40 max-w-2xl text-sm leading-relaxed">
                    Master rhythm through the lens of classical, jazz, and world traditions.
                    These methodologies provide the structural foundation for the "Golden Ear" rhythmic architecture.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {METHODS.map((method) => (
                    <motion.div
                        key={method.id}
                        layoutId={method.id}
                        onClick={() => setSelectedId(method.id)}
                        className={`
                            group cursor-pointer p-8 rounded-[40px] border transition-all duration-500 relative overflow-hidden
                            ${selectedId === method.id
                                ? 'bg-indigo-600 border-indigo-400 shadow-[0_20px_40px_rgba(99,102,241,0.2)]'
                                : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08] shadow-xl'}
                        `}
                    >
                        {selectedId !== method.id && (
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                <Book size={120} className="text-white" />
                            </div>
                        )}

                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${selectedId === method.id ? 'bg-white/20 border-white/30 text-white' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                                    {method.difficulty}
                                </div>
                                <ArrowRight size={18} className={`transition-transform duration-500 ${selectedId === method.id ? 'rotate-90 text-white' : 'text-white/20 group-hover:translate-x-2'}`} />
                            </div>

                            <div className="space-y-1">
                                <h3 className={`text-2xl font-black italic tracking-tight ${selectedId === method.id ? 'text-white' : 'text-white/90'}`}>{method.title}</h3>
                                <p className={`text-xs font-medium uppercase tracking-widest ${selectedId === method.id ? 'text-white/60' : 'text-white/20'}`}>{method.author}</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {selectedId === method.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6 pt-4 border-t border-white/10"
                                    >
                                        <p className="text-sm leading-relaxed text-white/80">{method.description}</p>

                                        <div className="flex flex-wrap gap-2">
                                            {method.concepts.map(c => (
                                                <span key={c} className="px-3 py-1.5 bg-black/20 border border-white/5 rounded-xl text-[10px] font-bold text-white/50">{c}</span>
                                            ))}
                                        </div>

                                        <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                                            <Play size={14} fill="currentColor" /> INITIATE STUDY
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-10 mt-8">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Brain size={40} className="text-indigo-400" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h4 className="text-xl font-black text-white italic">RHYTHMIC COGNITION LAB</h4>
                    <p className="text-sm text-white/40 leading-relaxed">
                        These resources are deeply integrated with the training modules.
                        As you progress in difficulty, the system will automatically unlock theoretical deep-dives
                        and guided practice routines inspired by these masters.
                    </p>
                </div>
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all whitespace-nowrap">
                    EXPLORE SYLLABUS
                </button>
            </div>
        </div>
    );
}
