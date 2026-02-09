import React from 'react';
import { useSettingsStore, InstrumentType } from '../../core/store/useSettingsStore';
import { Volume2, VolumeX, Music, Type, Sun, Moon } from 'lucide-react';
import { useMasteryStore } from '../../core/store/useMasteryStore';

export function GlobalSettings() {
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
        <div className="flex items-center gap-6 px-4 py-2 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] shadow-sm">
            {/* Profile Section */}
            <div className="flex items-center gap-3 pr-4 border-r border-[var(--border-subtle)]">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-lg shadow-inner">
                    {userAvatar}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-tighter text-[var(--text-muted)] leading-none">Level {globalLevel}</span>
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[100px]">{userName}</span>
                </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 min-w-[120px]">
                {masterVolume === 0 ? <VolumeX size={14} className="text-[var(--text-muted)]" /> : <Volume2 size={14} />}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-[var(--bg-surface)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
                />
            </div>

            <div className="w-px h-4 bg-[var(--border-subtle)]"></div>

            {/* Instrument Selector */}
            <div className="flex items-center gap-2 group">
                <Music size={14} className="group-hover:text-[var(--text-primary)] transition-colors" />
                <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value as InstrumentType)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                    {instruments.map(inst => (
                        <option key={inst.id} value={inst.id} className="bg-[var(--bg-panel)] text-[var(--text-primary)]">{inst.label}</option>
                    ))}
                </select>
            </div>

            <div className="w-px h-4 bg-[var(--border-subtle)]"></div>

            {/* Piano Labels Toggle */}
            <button
                onClick={() => setPianoLabels(!showPianoLabels)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${showPianoLabels ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
                <Type size={14} />
                {showPianoLabels ? 'Labels ON' : 'Labels OFF'}
            </button>

            <div className="ml-auto flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'amoled' : 'dark')}
                    className="p-1.5 hover:bg-[var(--bg-surface)] rounded-md transition-all active:scale-90"
                    title={`Switch Theme: ${theme}`}
                >
                    {theme === 'dark' ? <Moon size={16} /> : theme === 'light' ? <Sun size={16} /> : <div className="w-4 h-4 rounded-full border border-current" />}
                </button>
            </div>
        </div>
    );
}
