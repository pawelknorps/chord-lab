import { useState, useMemo } from 'react';
import { Controls } from '../modules/ChordLab/components/Controls';
import { UnifiedPiano } from './shared/UnifiedPiano';
import { UnifiedFretboard } from './shared/UnifiedFretboard';
import { SendToMenu } from './shared/SendToMenu';
import { ProgressionBuilder } from '../modules/ChordLab/components/ProgressionBuilder';
import { ConstantStructureTool } from '../modules/ChordLab/components/ConstantStructureTool';
import { SmartLibrary } from '../modules/ChordLab/components/SoundLibrary/SmartLibrary';
import type { ChordInfo, Progression } from '../core/theory';
import type { Style } from '../core/audio/globalAudio';
import { Mixer } from '../modules/ChordLab/components/Mixer';
import { PracticeTips } from '../modules/ChordLab/components/PracticeTips';
import { useAudioCleanup } from '../hooks/useAudioManager';

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

    // Looping & Auto-Transpose
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
}

export function ChordLabDashboard({
    selectedKey, selectedScale, selectedVoicing, selectedStyle, bpm, isPlaying,
    progression, playingIndex, midiNotes, visualizedNotes, highlightedNotes,
    isLooping, onLoopToggle, transposeSettings, onTransposeSettingsChange,
    onKeyChange, onScaleChange, onVoicingChange, onStyleChange, onBpmChange, onPlay, onStop, onExportMidi,
    onChordClick, onSlotClick, onRemoveChord, onClearProgression, onAddStructureChord, onSelectPreset, onImportMidi,
    userPresets, onSaveUserPreset
}: ChordLabDashboardProps) {

    useAudioCleanup('chordlab-dashboard');
    const [showMixer, setShowMixer] = useState(false);
    const [showPracticeTips, setShowPracticeTips] = useState(false);

    // Display Logic
    const displayedNotes = [...visualizedNotes, ...midiNotes];

    // Prepare progression data for SendToMenu
    const progressionData = useMemo(() => {
        const validChords = progression.filter((c): c is ChordInfo => c !== null);
        if (validChords.length === 0) return null;

        return {
            chords: validChords.map(c => c.root + (c.quality === 'maj' ? '' : c.quality)),
            key: selectedKey,
        };
    }, [progression, selectedKey]);

    return (
        <div className="flex flex-col gap-6">
            {/* --- ROW 1: Controls --- */}
            <div className="w-full flex items-start gap-3">
                <div className="flex-1">
                    <Controls
                        selectedKey={selectedKey}
                        selectedScale={selectedScale}
                        selectedVoicing={selectedVoicing}
                        selectedStyle={selectedStyle}
                        bpm={bpm}
                        isPlaying={isPlaying}
                        onKeyChange={onKeyChange}
                        onScaleChange={onScaleChange}
                        onVoicingChange={onVoicingChange}
                        onStyleChange={onStyleChange}
                        onBpmChange={onBpmChange}
                        onPlay={onPlay}
                        onStop={onStop}
                        onExportMidi={onExportMidi}
                        isLooping={isLooping}
                        onLoopToggle={onLoopToggle}
                        transposeSettings={transposeSettings}
                        onTransposeSettingsChange={onTransposeSettingsChange}
                        showMixer={showMixer}
                        onMixerToggle={() => setShowMixer(!showMixer)}
                        showPracticeTips={showPracticeTips}
                        onPracticeTipsToggle={() => setShowPracticeTips(!showPracticeTips)}
                    />
                </div>
                {progressionData && (
                    <SendToMenu
                        progression={progressionData}
                        sourceModule="chordlab"
                    />
                )}
            </div>

            {showMixer && <Mixer onClose={() => setShowMixer(false)} />}
            {showPracticeTips && (
                <PracticeTips
                    progression={progression}
                    selectedKey={selectedKey}
                    onClose={() => setShowPracticeTips(false)}
                />
            )}

            {/* --- ROW 2: Piano --- */}
            <div className="w-full">
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6 relative overflow-x-auto flex flex-col justify-center min-h-[160px] shadow-sm">
                    <div className="absolute top-4 left-6 flex items-center gap-2 pointer-events-none z-10 sticky left-0">
                        <div className="text-[10px] font-bold bg-[var(--bg-surface)] px-2 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {selectedKey} {selectedScale}
                        </div>
                    </div>
                    <div className="min-w-max mx-auto flex flex-col gap-6">
                        <UnifiedPiano
                            mode="highlight"
                            activeNotes={displayedNotes}
                            highlightedNotes={highlightedNotes}
                            showLabels="note-name"
                        />
                        <div className="border-t border-[var(--border-subtle)] pt-6">
                            <UnifiedFretboard
                                mode="notes"
                                activeNotes={displayedNotes}
                                highlightedNotes={highlightedNotes}
                                fretRange={[0, 15]}
                                showFretNumbers={true}
                                showStringNames={true}
                                interactive={false}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ROW 3: Workspace (Builder + Library) --- */}
            <div className="flex flex-col gap-8 w-full">

                {/* Progression Builder */}
                <ProgressionBuilder
                    progression={progression}
                    playingIndex={playingIndex}
                    onRemoveChord={onRemoveChord}
                    onChordClick={onSlotClick}
                    onClear={onClearProgression}
                    onSave={onSaveUserPreset}
                />

                {/* Experimental Tool */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6">
                    <h3 className="text-cap mb-4 text-[var(--text-muted)]">Experimental Structure</h3>
                    <ConstantStructureTool
                        onAddChord={onAddStructureChord}
                    />
                </div>

                {/* Sound Library Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-cap text-[var(--text-muted)] flex items-center gap-2">
                        Sound Library
                    </h3>
                    <div className="bg-[var(--bg-panel)] rounded-lg border border-[var(--border-subtle)] overflow-hidden h-[600px]">
                        <SmartLibrary
                            onSelectPreset={onSelectPreset}
                            onImportMidi={onImportMidi}
                            userPresets={userPresets}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
