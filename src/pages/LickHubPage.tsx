import { useState, useEffect } from 'react';
import { ItmSyncService } from '../core/services/itmSyncService';
import { motion } from 'framer-motion';
import { Music, Play, User, Calendar, Quote, ChevronRight, PlusCircle } from 'lucide-react';
import { useSoloStore } from '../core/store/useSoloStore';

export default function LickHubPage() {
    const [publicSolos, setPublicSolos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addSolo } = useSoloStore();

    useEffect(() => {
        loadSolos();
    }, []);

    const loadSolos = async () => {
        setLoading(true);
        const solos = await ItmSyncService.getPublicSolos();
        setPublicSolos(solos);
        setLoading(false);
    };

    const auditionLick = (text: string) => {
        // Mock MIDI playback - in a real app this would trigger the browser synth
        console.log('Auditioning lick:', text);
        alert(`Auditioning: ${text}\n(MIDI Engine triggered)`);
    };

    const saveToPractice = (solo: any) => {
        addSolo({
            id: crypto.randomUUID(),
            standardId: solo.standard_id,
            timestamp: Date.now(),
            notes: solo.notes_json,
            bpm: solo.bpm,
            musicalizedText: solo.musicalized_text
        });
        alert('Lick added to your Solo Vault for practice!');
    };

    return (
        <div className="h-full w-full bg-[#050505] overflow-y-auto px-8 py-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                            <Music className="text-white" size={24} />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">The Lick Hub</h1>
                    </div>
                    <p className="text-neutral-500 font-medium max-w-2xl text-lg leading-relaxed">
                        Discover and learn from the collective community. High-fidelity transcriptions and musicalized solos, refined by AI and shared by students worldwide.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-xs font-black text-neutral-600 uppercase tracking-widest">Scanning the hub...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {publicSolos.map((solo, idx) => (
                            <motion.div
                                key={solo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 hover:border-indigo-500/50 transition-all overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-all" />

                                <div className="flex justify-between items-start relative z-10 mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Standard</span>
                                            <ChevronRight size={10} />
                                        </div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">{solo.standard_id}</h2>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2 text-neutral-500">
                                            <User size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {solo.profiles?.display_name || 'Anonymous Player'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-neutral-600">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold">
                                                {new Date(solo.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/5 relative group-hover:border-indigo-500/20 transition-all">
                                    <Quote size={16} className="text-indigo-500/30 mb-2" />
                                    <p className="text-indigo-100 font-mono text-lg leading-relaxed tracking-tight italic">
                                        {solo.musicalized_text || "| No refined transcription available |"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Tempo</span>
                                            <span className="text-sm font-black text-white">{solo.bpm} <span className="text-neutral-700 text-[10px]">BPM</span></span>
                                        </div>
                                        <div className="h-8 w-[1px] bg-white/5" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Length</span>
                                            <span className="text-sm font-black text-white">{solo.notes_json?.length || 0} <span className="text-neutral-700 text-[10px]">Notes</span></span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => auditionLick(solo.musicalized_text)}
                                            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white text-neutral-400 hover:text-black flex items-center justify-center transition-all border border-white/5"
                                        >
                                            <Play size={20} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={() => saveToPractice(solo)}
                                            className="px-6 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95"
                                        >
                                            <PlusCircle size={18} />
                                            Save to Vault
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
