import { useState, useCallback, useEffect, useRef } from 'react';
import { PianoKeyboard } from './components/PianoKeyboard';
import { ProgressionBuilder } from './components/ProgressionBuilder';
import { PresetsPanel } from './components/PresetsPanel';
import { Controls } from './components/Controls';
import type { ChordInfo, Progression } from './utils/musicTheory';
import { getScaleChords, applyVoicing } from './utils/musicTheory';
import type { SynthPreset } from './utils/audioEngine';
import {
  initAudio,
  playChord,
  isAudioReady,
  setSynthPreset,
  releaseAll,
} from './utils/audioEngine';
import { exportToMidi, downloadMidi } from './utils/midiExport';

const MAX_PROGRESSION_LENGTH = 8;

function App() {
  // State
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('Major');
  const [selectedVoicing, setSelectedVoicing] = useState('Root Position');
  const [selectedSound, setSelectedSound] = useState<SynthPreset>('Piano');
  const [bpm, setBpm] = useState(120);
  const [progression, setProgression] = useState<(ChordInfo | null)[]>(
    Array(MAX_PROGRESSION_LENGTH).fill(null)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const playbackRef = useRef<(() => void) | null>(null);

  // Get available chords for current key/scale
  const availableChords = getScaleChords(selectedKey, selectedScale, 4);

  // Initialize audio on first interaction
  const ensureAudio = useCallback(async () => {
    if (!audioInitialized) {
      await initAudio();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Handle chord click from keyboard
  const handleChordClick = useCallback(
    async (chord: ChordInfo) => {
      await ensureAudio();

      // Apply voicing
      const voicedNotes = applyVoicing(chord.midiNotes, selectedVoicing);

      // Play the chord
      playChord(voicedNotes);

      // Add to first empty slot
      setProgression((prev) => {
        const firstEmpty = prev.findIndex((c) => c === null);
        if (firstEmpty === -1) {
          // All full, shift and add to end
          const newProg = [...prev.slice(1), { ...chord, midiNotes: voicedNotes }];
          return newProg;
        }
        const newProg = [...prev];
        newProg[firstEmpty] = { ...chord, midiNotes: voicedNotes };
        return newProg;
      });
    },
    [ensureAudio, selectedVoicing]
  );

  // Handle slot click (play that chord)
  const handleSlotClick = useCallback(
    async (index: number) => {
      const chord = progression[index];
      if (chord) {
        await ensureAudio();
        playChord(chord.midiNotes);
      }
    },
    [progression, ensureAudio]
  );

  // Remove chord from progression
  const handleRemoveChord = useCallback((index: number) => {
    setProgression((prev) => {
      const newProg = [...prev];
      newProg[index] = null;
      return newProg;
    });
  }, []);

  // Clear all chords
  const handleClearProgression = useCallback(() => {
    setProgression(Array(MAX_PROGRESSION_LENGTH).fill(null));
  }, []);

  // Load preset
  const handleSelectPreset = useCallback(
    (preset: Progression) => {
      const chords = getScaleChords(selectedKey, selectedScale, 4);
      const newProgression: (ChordInfo | null)[] = Array(MAX_PROGRESSION_LENGTH).fill(null);

      preset.degrees.forEach((degree, index) => {
        if (index < MAX_PROGRESSION_LENGTH && chords[degree]) {
          const chord = chords[degree];
          const voicedNotes = applyVoicing(chord.midiNotes, selectedVoicing);
          newProgression[index] = { ...chord, midiNotes: voicedNotes };
        }
      });

      setProgression(newProgression);
    },
    [selectedKey, selectedScale, selectedVoicing]
  );

  // Play progression
  const handlePlay = useCallback(async () => {
    await ensureAudio();

    const chordsToPlay = progression.filter((c): c is ChordInfo => c !== null);
    if (chordsToPlay.length === 0) return;

    setIsPlaying(true);
    
    const chordIndices = progression
      .map((c, i) => (c ? i : -1))
      .filter((i) => i !== -1);

    let currentIndex = 0;
    const beatDuration = (60 / bpm) * 2 * 1000; // 2 beats per chord in ms

    const playNext = () => {
      if (currentIndex >= chordIndices.length) {
        setIsPlaying(false);
        setPlayingIndex(null);
        return;
      }

      const progIndex = chordIndices[currentIndex];
      const chord = progression[progIndex];
      
      if (chord) {
        setPlayingIndex(progIndex);
        playChord(chord.midiNotes);
      }

      currentIndex++;
      playbackRef.current = () => clearTimeout(timeout);
      const timeout = setTimeout(playNext, beatDuration);
    };

    playNext();
  }, [progression, bpm, ensureAudio]);

  // Stop playback
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setPlayingIndex(null);
    releaseAll();
    playbackRef.current?.();
  }, []);

  // Export to MIDI
  const handleExportMidi = useCallback(() => {
    const chordsToExport = progression.filter((c): c is ChordInfo => c !== null);
    if (chordsToExport.length === 0) return;

    const midiData = chordsToExport.map((c) => c.midiNotes);
    const blob = exportToMidi(midiData, {
      name: `${selectedKey} ${selectedScale} Progression`,
      bpm,
    });
    downloadMidi(blob, `chord-progression-${selectedKey}-${selectedScale}`);
  }, [progression, selectedKey, selectedScale, bpm]);

  // Handle sound change
  const handleSoundChange = useCallback((sound: SynthPreset) => {
    setSelectedSound(sound);
    if (isAudioReady()) {
      setSynthPreset(sound);
    }
  }, []);

  // Update voicing when changed
  useEffect(() => {
    setProgression((prev) =>
      prev.map((chord) => {
        if (!chord) return null;
        const baseChords = getScaleChords(selectedKey, selectedScale, 4);
        const baseChord = baseChords.find((c) => c.degree === chord.degree);
        if (!baseChord) return chord;
        return {
          ...chord,
          midiNotes: applyVoicing(baseChord.midiNotes, selectedVoicing),
        };
      })
    );
  }, [selectedVoicing, selectedKey, selectedScale]);

  // Get highlighted notes for keyboard
  const highlightedNotes = availableChords.flatMap((c) =>
    c.midiNotes.map((n) => n % 12)
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Chord Progression Lab
          </h1>
          <p className="text-white/50 text-sm">
            Build and explore chord progressions • Click chords to add them to your progression
          </p>
        </header>

        {/* Controls */}
        <Controls
          selectedKey={selectedKey}
          selectedScale={selectedScale}
          selectedVoicing={selectedVoicing}
          selectedSound={selectedSound}
          bpm={bpm}
          isPlaying={isPlaying}
          onKeyChange={setSelectedKey}
          onScaleChange={setSelectedScale}
          onVoicingChange={setSelectedVoicing}
          onSoundChange={handleSoundChange}
          onBpmChange={setBpm}
          onPlay={handlePlay}
          onStop={handleStop}
          onExportMidi={handleExportMidi}
        />

        {/* Piano Keyboard */}
        <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-pink-400">♪</span>
            {selectedKey} {selectedScale} Scale
            <span className="text-white/40 text-sm font-normal ml-2">
              Click a chord to add it
            </span>
          </h2>
          <div className="flex justify-center">
            <PianoKeyboard
              startOctave={4}
              endOctave={5}
              highlightedNotes={highlightedNotes}
              chords={availableChords}
              onChordClick={handleChordClick}
              activeChordDegree={playingIndex !== null ? progression[playingIndex]?.degree : undefined}
            />
          </div>
        </div>

        {/* Progression Builder */}
        <ProgressionBuilder
          progression={progression}
          playingIndex={playingIndex}
          onRemoveChord={handleRemoveChord}
          onChordClick={handleSlotClick}
          onClear={handleClearProgression}
        />

        {/* Presets */}
        <PresetsPanel onSelectPreset={handleSelectPreset} />

        {/* Footer */}
        <footer className="text-center text-white/30 text-xs py-4">
          Built with React + Tone.js • Export your progressions as MIDI files
        </footer>
      </div>
    </div>
  );
}

export default App;
