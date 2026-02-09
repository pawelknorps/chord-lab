import { useState } from 'react';
import { PianoKeyboard } from '../modules/ChordLab/components/PianoKeyboard';
import { ProgressionBuilder } from '../modules/ChordLab/components/ProgressionBuilder';
import { ConstantStructureTool } from '../modules/ChordLab/components/ConstantStructureTool';
import type { ChordInfo, Progression } from '../core/theory';
import type { Style } from '../core/audio/globalAudio';
import { Mixer } from '../modules/ChordLab/components/Mixer';
import { PracticeTips } from '../modules/ChordLab/components/PracticeTips';

interface ChordLabDashboardProps {
    selectedKey: string;
    selectedScale: string;
    selectedVoicing: string;
    selectedStyle: Style;
    bpm: number;
    isPlaying: boolean;
    progression: (ChordInfo | null)[];
    playingIndex: number | null;
    currentChord: ChordInfo | null;
    midiNotes: number[];
    visualizedNotes: number[];
    highlightedNotes: number[];
    availableChords: ChordInfo[];

    // Looping & Auto-Transpose (Passed down for context if needed, but controlled by HUD)
    isLooping: boolean;
    onLoopToggle: () => void;
    transposeSettings: { enabled: boolean; interval: number; step: number };
    onTransposeSettingsChange: (settings: { enabled: boolean; interval: number; step: number }) => void;

    // Actions
    onKeyChange: (key: string) => void;
    onScaleChange: (scale: string) => void;
    onVoicingChange: (voicing: string) => void;
    onStyleChange: (style: Style) => void;
    onBpmChange: (bpm: number) => void;
    onPlay: () => void;
    onStop: () => void;
    onExportMidi: () => void;
    onChordClick: (chord: ChordInfo) => void;
    onSlotClick: (index: number) => void;
    onRemoveChord: (index: number) => void;
    onClearProgression: () => void;
    onAddStructureChord: (chord: ChordInfo) => void;
    onSelectPreset: (preset: Progression) => void;
    onImportMidi: (data: any) => void;

    // User Presets
    userPresets: Progression[];
    onSaveUserPreset: () => void;
    onDeleteUserPreset: (index: number) => void;

    // View Toggles (Passed from parent)
    showMixer: boolean;
    onMixerToggle: () => void;
    showPracticeTips: boolean;
    onPracticeTipsToggle: () => void;
}

export function ChordLabDashboard({
    selectedKey, selectedScale, selectedVoicing, selectedStyle, bpm, isPlaying,
    progression, playingIndex, midiNotes, visualizedNotes, highlightedNotes,
    isLooping, onLoopToggle, transposeSettings, onTransposeSettingsChange,
    onKeyChange, onScaleChange, onVoicingChange, onStyleChange, onBpmChange, onPlay, onStop, onExportMidi,
    onChordClick, onSlotClick, onRemoveChord, onClearProgression, onAddStructureChord, onSelectPreset, onImportMidi,
    userPresets, onSaveUserPreset,
    showMixer, onMixerToggle, showPracticeTips, onPracticeTipsToggle
}: ChordLabDashboardProps) {

    // Display Logic
    const displayedNotes = [...visualizedNotes, ...midiNotes];

    return (
        <div className="flex flex-col h-full relative">
            {/* Overlays */}
            {showMixer && <Mixer onClose={onMixerToggle} />}
            {showPracticeTips && (
                <PracticeTips
                    progression={progression}
                    selectedKey={selectedKey}
                    onClose={onPracticeTipsToggle}
                />
            )}

            {/* Main Workspace: Builder */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Progression Builder */}
                    <div className="bg-[var(--bg-app)]">
                        <ProgressionBuilder
                            progression={progression}
                            playingIndex={playingIndex}
                            onRemoveChord={onRemoveChord}
                            onChordClick={onSlotClick}
                            onClear={onClearProgression}
                            onSave={onSaveUserPreset}
                        />
                    </div>

                    {/* Experimental Tool */}
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6">
                        <h3 className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-4">Experimental Structure</h3>
                        <ConstantStructureTool
                            onAddChord={onAddStructureChord}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Panel: Piano */}
            <div className="h-48 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] relative flex-none">
                <div className="absolute top-2 left-4 z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Active: </span>
                        <span className="text-xs font-mono text-[var(--text-primary)]">{selectedKey} {selectedScale}</span>
                    </div>
                </div>

                <div className="w-full h-full flex items-center justify-center overflow-x-auto px-4">
                    <PianoKeyboard
                        activeNotes={displayedNotes}
                        onChordClick={onChordClick}
                        highlightedNotes={highlightedNotes}
                        keySignature={selectedKey}
                    />
                </div>
            </div>
        </div>
    );
}
