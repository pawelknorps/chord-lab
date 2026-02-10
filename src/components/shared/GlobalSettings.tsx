import React, { useState } from 'react';
import { useSettingsStore, InstrumentType } from '../../core/store/useSettingsStore';
import { Volume2, VolumeX, Music, Type, Sun, Moon, Settings, X } from 'lucide-react';
import { useMasteryStore } from '../../core/store/useMasteryStore';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalSettings() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        masterVolume, setMasterVolume,
        instrument, setInstrument,
        showPianoLabels, setPianoLabels,
        theme, setTheme,
        userName, userAvatar
    } = useSettingsStore();

    const { globalLevel } = useMasteryStore();

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMasterVolume(parseFloat(e.target.value));
    };

    const instruments: { id: InstrumentType; label: string }[] = [
        { id: 'piano', label: 'Grand Piano' },
        { id: 'epiano', label: 'Electric Piano' },
        { id: 'synth', label: 'Lead Synth' },
    ];

    return (
        <div className="fixed top-4 right-6 z-[100] flex flex-col items-end gap-2">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95
                    ${isOpen
                        ? 'bg-amber-500 text-black rotate-90'
                        : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border border-white/10 hover:border-amber-500/50'
                    }
                `}
            >
                {isOpen ? <X size={20} /> : <Settings size={20} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-72 bg-[var(--bg-panel)]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-5 flex flex-col gap-6"
                    >
                        {/* Profile Section */}
                        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center text-2xl shadow-inner border border-white/5">
                                {userAvatar}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-amber-500 mb-0.5">Apprentice • Level {globalLevel}</span>
                                <span className="text-lg font-black text-[var(--text-primary)] leading-none">{userName}</span>
                            </div>
                        </div>

                        {/* Volume Control */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                <span>Master Volume</span>
                                <span className="font-mono text-amber-400">{Math.round(masterVolume * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-4 h-10 px-4 bg-white/5 rounded-2xl border border-white/5">
                                {masterVolume === 0 ? <VolumeX size={16} className="text-red-500" /> : <Volume2 size={16} className="text-amber-500" />}
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={masterVolume}
                                    onChange={handleVolumeChange}
                                    className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
                                />
                            </div>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 gap-2">
                            {/* Instrument Selector */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Main Instrument</span>
                                <div className="flex items-center gap-3 h-12 px-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                                    <Music size={16} className="text-amber-500" />
                                    <select
                                        value={instrument}
                                        onChange={(e) => setInstrument(e.target.value as InstrumentType)}
                                        className="flex-1 bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-[var(--text-primary)]"
                                    >
                                        {instruments.map(inst => (
                                            <option key={inst.id} value={inst.id} className="bg-[#111]">{inst.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {/* Piano Labels Toggle */}
                                <button
                                    onClick={() => setPianoLabels(!showPianoLabels)}
                                    className={`
                                        flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border transition-all
                                        ${showPianoLabels
                                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                                            : 'bg-white/5 border-white/5 text-[var(--text-muted)] hover:border-white/20'
                                        }
                                    `}
                                >
                                    <Type size={18} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Labels</span>
                                </button>

                                {/* Theme Toggle */}
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'amoled' : 'dark')}
                                    className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/5 border border-white/5 text-[var(--text-muted)] hover:border-white/20 transition-all"
                                >
                                    {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <div className="w-4 h-4 rounded-full border border-current" />}
                                    <span className="text-[9px] font-black uppercase tracking-tighter">{theme}</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

