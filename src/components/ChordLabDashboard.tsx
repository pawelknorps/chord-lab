import { useState, useMemo } from 'react';
import { Controls } from '../modules/ChordLab/components/Controls';
import { UnifiedPiano } from './shared/UnifiedPiano';
import { UnifiedFretboard } from './shared/UnifiedFretboard';
import { SendToMenu } from './shared/SendToMenu';
import { ProgressionBuilder } from '../modules/ChordLab/components/ProgressionBuilder';
import { ConstantStructureTool } from '../modules/ChordLab/components/ConstantStructureTool';
import { SmartLibrary } from '../modules/ChordLab/components/SoundLibrary/SmartLibrary';
import type { ChordInfo, Progression } from '../core/theory';
import { midiToNoteName } from '../core/theory';
import type { Style } from '../core/audio/globalAudio';
import { Mixer } from '../modules/ChordLab/components/Mixer';
import { PracticeTips } from '../modules/ChordLab/components/PracticeTips';
import { useAudioCleanup } from '../hooks/useAudioManager';
import { useSettingsStore } from '../core/store/useSettingsStore';

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
    onSlotClick: (index: number) => void;
    onRemoveChord: (index: number) => void;
    onClearProgression: () => void;
    onAddStructureChord: (chord: ChordInfo) => void;
    onSelectPreset: (preset: Progression) => void;
    onImportMidi: (data: any) => void;
    onAddChord: (chord: ChordInfo) => void;

    // Chord Builder
    buildingNotes: number[];
    builtChord: { root: string; quality: string } | null;
    onNoteToggle: (note: number) => void;
    onAddBuiltChord: () => void;
    onClearBuilder: () => void;

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
    onSlotClick, onRemoveChord, onClearProgression, onAddStructureChord, onSelectPreset, onImportMidi, onAddChord,
    buildingNotes, builtChord, onNoteToggle, onAddBuiltChord, onClearBuilder,
    availableChords, userPresets, onSaveUserPreset
}: ChordLabDashboardProps) {

    useAudioCleanup('chordlab-dashboard');
    const [showMixer, setShowMixer] = useState(false);
    const [showPracticeTips, setShowPracticeTips] = useState(false);

    const {
        showPiano,
        showFretboard,
        setPiano,
        setFretboard
    } = useSettingsStore();

    // Display Logic: Progression-driven visuals + MIDI Input + Real-time engine triggers
    const displayedNotes = useMemo(() => {
        const notes = new Set<number>();

        // 1. Progression-driven: Show what slot is currently active in the builder
        // This makes the visuals "legato" - they stay until the next slot starts
        if (playingIndex !== null && progression[playingIndex]) {
            progression[playingIndex]?.midiNotes.forEach(n => notes.add(n));
        }

        // 2. Real-time engine: Show notes currently being triggered (includes comping rhythms)
        visualizedNotes.forEach(n => notes.add(n));

        // 3. MIDI Input: Show what user is playing locally
        midiNotes.forEach(n => notes.add(n));

        return Array.from(notes);
    }, [playingIndex, progression, visualizedNotes, midiNotes]);

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
                        showPiano={showPiano}
                        onPianoToggle={setPiano}
                        showFretboard={showFretboard}
                        onFretboardToggle={setFretboard}
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

            {/* --- ROW 2: Visualization (Piano / Fretboard) --- */}
            {(showPiano || showFretboard) && (
                <div className="w-full">
                    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-6 relative overflow-x-auto flex flex-col justify-center min-h-[160px] shadow-sm">
                        {/* Chord Builder Panel */}
                        {buildingNotes.length > 0 && (
                            <div className="absolute top-4 right-6 z-20 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-lg min-w-[200px]">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-widest">Building ({buildingNotes.length})</h3>
                                    <button
                                        onClick={onClearBuilder}
                                        className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {buildingNotes.map(note => (
                                        <div
                                            key={note}
                                            className="px-2 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded text-xs font-bold text-[var(--accent)]"
                                        >
                                            {midiToNoteName(note).replace(/[0-9-]/g, '')}
                                        </div>
                                    ))}
                                </div>
                                {builtChord && buildingNotes.length >= 3 && (
                                    <>
                                        <div className="text-2xl font-bold text-white mb-3">
                                            {builtChord.root}{builtChord.quality === 'maj' ? '' : builtChord.quality}
                                        </div>
                                        <button
                                            onClick={onAddBuiltChord}
                                            className="w-full px-4 py-2 bg-[var(--accent)] text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-[var(--accent)]/90 transition-colors"
                                        >
                                            Add to Progression
                                        </button>
                                    </>
                                )}
                                {buildingNotes.length > 0 && buildingNotes.length < 3 && (
                                    <p className="text-xs text-[var(--text-muted)] italic">Select {3 - buildingNotes.length} more note{3 - buildingNotes.length > 1 ? 's' : ''}</p>
                                )}
                            </div>
                        )}

                        <div className="absolute top-4 left-6 flex items-center gap-2 pointer-events-none z-10 sticky left-0">
                            <div className="text-[10px] font-bold bg-[var(--bg-surface)] px-2 py-0.5 rounded text-[var(--text-muted)] border border-[var(--border-subtle)]">
                                {selectedKey} {selectedScale}
                            </div>
                        </div>
                        <div className="min-w-max mx-auto flex flex-col gap-6 w-full">
                            {showPiano && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <UnifiedPiano
                                        mode="input"
                                        activeNotes={displayedNotes}
                                        highlightedNotes={[...highlightedNotes, ...buildingNotes]}
                                        showLabels="chord-tone"
                                        rootNote={buildingNotes.length > 0 ? Math.min(...buildingNotes) : (displayedNotes.length > 0 ? Math.min(...displayedNotes) : undefined)}
                                        onNoteClick={onNoteToggle}
                                    />
                                </div>
                            )}
                            {showPiano && showFretboard && <div className="border-t border-[var(--border-subtle)] w-full"></div>}
                            {showFretboard && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <UnifiedFretboard
                                        mode="chord-tones"
                                        activeNotes={displayedNotes}
                                        highlightedNotes={[...highlightedNotes, ...buildingNotes]}
                                        fretRange={[0, 15]}
                                        showFretNumbers={true}
                                        showStringNames={true}
                                        interactive={true}
                                        rootNote={buildingNotes.length > 0 ? Math.min(...buildingNotes) : (displayedNotes.length > 0 ? Math.min(...displayedNotes) : undefined)}
                                        onNoteClick={onNoteToggle}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- ROW 3: Workspace (Builder + Library) --- */}
            <div className="flex flex-col gap-8 w-full">

                {/* Diatonic Chords Section (Guided Practice) */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-cap text-[var(--text-muted)] flex items-center gap-2">
                        Diatonic Chords ({selectedKey} {selectedScale})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {availableChords.map((chord, i) => (
                            <button
                                key={i}
                                onClick={() => onAddChord(chord)}
                                className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-3 min-w-[80px] hover:border-[var(--accent)] hover:shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)] transition-all group text-left relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-transparent opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity"></div>
                                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1 opacity-70 group-hover:text-[var(--accent)] group-hover:opacity-100 transition-all">{chord.roman || `Deg ${i + 1}`}</div>
                                <div className="text-xl font-bold flex items-baseline gap-0.5">
                                    {chord.root}
                                    <span className="text-xs font-normal text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                        {chord.quality === 'maj' ? '' : chord.quality}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

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
