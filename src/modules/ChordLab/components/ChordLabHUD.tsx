import { ALL_KEYS, SCALES } from '../../../core/theory';
import type { Style } from '../../../core/audio/globalAudio';
import {
    Play, Square, Repeat, Sliders, Target, Download, Settings, Music, ChevronDown, Wand2
} from 'lucide-react';
import { useState } from 'react';

interface ChordLabHUDProps {
    selectedKey: string;
    selectedScale: string;
    selectedStyle: Style;
    bpm: number;
    isPlaying: boolean;
    isLooping: boolean;
    onKeyChange: (key: string) => void;
    onScaleChange: (scale: string) => void;
    onStyleChange: (style: Style) => void;
    onBpmChange: (bpm: number) => void;
    onPlay: () => void;
    onStop: () => void;
    onLoopToggle: () => void;
    onMixerToggle: () => void;
    onPracticeTipsToggle: () => void;
    onExportMidi: () => void;
    transposeSettings: { enabled: boolean; interval: number; step: number };
    onTransposeSettingsChange: (settings: { enabled: boolean; interval: number; step: number }) => void;
}

export function ChordLabHUD({
    selectedKey, selectedScale, selectedStyle, bpm, isPlaying, isLooping,
    onKeyChange, onScaleChange, onStyleChange, onBpmChange,
    onPlay, onStop, onLoopToggle, onMixerToggle, onPracticeTipsToggle, onExportMidi
}: ChordLabHUDProps) {

    return (
        <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] z-20">
            {/* Left: Global Context */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Music size={16} className="text-[var(--accent)]" />
                    <select
                        value={selectedKey}
                        onChange={(e) => onKeyChange(e.target.value)}
                        className="bg-transparent text-sm font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer hover:text-[var(--accent)] transition-colors appearance-none"
                    >
                        {ALL_KEYS.map((note) => (
                            <option key={note} value={note} className="bg-[var(--bg-panel)]">{note}</option>
                        ))}
                    </select>
                    <select
                        value={selectedScale}
                        onChange={(e) => onScaleChange(e.target.value)}
                        className="bg-transparent text-sm text-[var(--text-secondary)] focus:outline-none cursor-pointer hover:text-[var(--text-primary)] transition-colors appearance-none"
                    >
                        {Object.keys(SCALES).map((scale) => (
                            <option key={scale} value={scale} className="bg-[var(--bg-panel)]">{scale}</option>
                        ))}
                    </select>
                </div>

                <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />

                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">BPM</span>
                    <input
                        type="number"
                        value={bpm}
                        onChange={(e) => onBpmChange(Math.max(40, Math.min(200, parseInt(e.target.value))))}
                        className="w-12 bg-transparent text-sm font-mono text-[var(--text-primary)] text-center focus:outline-none border-b border-transparent focus:border-[var(--accent)]"
                    />
                </div>
            </div>

            {/* Center: Transport */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button
                    onClick={onLoopToggle}
                    className={`p-2 rounded-full transition-colors ${isLooping ? 'text-[var(--accent)] bg-[var(--accent-glow)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
                    title="Loop Playback"
                >
                    <Repeat size={16} />
                </button>

                <button
                    onClick={isPlaying ? onStop : onPlay}
                    className={`
                        flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-lg
                        ${isPlaying
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            : 'bg-[var(--text-primary)] text-[var(--bg-app)] hover:bg-white shadow-[var(--text-primary)]/20'
                        }
                    `}
                >
                    {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                </button>
            </div>

            {/* Right: Tools & Style */}
            <div className="flex items-center gap-3">
                <select
                    value={selectedStyle}
                    onChange={(e) => onStyleChange(e.target.value as Style)}
                    className="bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs px-2 py-1 rounded border border-[var(--border-subtle)] focus:outline-none hover:border-[var(--text-muted)] appearance-none cursor-pointer"
                >
                    {['None', 'Jazz', 'Swing', 'Bossa', 'Ballad', 'Guitar'].map((style) => (
                        <option key={style} value={style}>{style}</option>
                    ))}
                </select>

                <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />

                <button onClick={onPracticeTipsToggle} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" title="Practice Tips">
                    <Target size={18} />
                </button>
                <button onClick={onMixerToggle} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" title="Mixer">
                    <Sliders size={18} />
                </button>
                <button onClick={onExportMidi} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" title="Export MIDI">
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
}
