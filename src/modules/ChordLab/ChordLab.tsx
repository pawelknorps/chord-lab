import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PianoKeyboard } from './components/PianoKeyboard';
import { ProgressionBuilder } from './components/ProgressionBuilder';
import { PresetsPanel } from './components/PresetsPanel';
import { Controls } from './components/Controls';
import { EarTrainingModule } from './components/EarTrainingModule';
import { ConstantStructureTool } from './components/ConstantStructureTool';
import { LessonEngine } from './components/LessonEngine';
import type { ChordInfo, Progression } from '../../core/theory';
import { getScaleChords, applyVoicing, parseChord, getChordNotes, midiToNoteName } from '../../core/theory';
import { JAZZ_STANDARDS } from '../../utils/standards';
import { getProgress, LESSONS } from '../../core/store/session';
import type { Lesson } from '../../core/store/session';
import type { Style } from '../../core/audio/globalAudio';
import {
  initAudio,
  playChord,
  triggerAttack,
  triggerRelease,
  playProgression,
  stop
} from '../../core/audio/globalAudio';
import { exportToMidi, downloadMidi } from '../../core/midi/export';
import type { JazzStandard } from '../../utils/standards';
import { useTranslation } from 'react-i18next';
import { useMidi } from '../../context/MidiContext';
import LanguageSelector from '../../circle-chords-0.1.0/src/components/LanguageSelector';
import { setLanguage } from '../../circle-chords-0.1.0/src/i18n';
import { QuickExerciseJump } from '../../components/widgets/QuickExerciseJump';

const MAX_PROGRESSION_LENGTH = 16;

function ChordLab() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'lab' | 'ear-training' | 'lessons'>('lab');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Lab State
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('Major');
  const [selectedVoicing, setSelectedVoicing] = useState('Root Position');
  const [selectedStyle, setSelectedStyle] = useState<Style>('None');
  const [bpm, setBpm] = useState(120);
  const [progression, setProgression] = useState<(ChordInfo | null)[]>(
    Array(MAX_PROGRESSION_LENGTH).fill(null)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [importedTrackInfo, setImportedTrackInfo] = useState<{ name: string; style?: string; mood?: string } | null>(null);
  const [visualizedNotes, setVisualizedNotes] = useState<number[]>([]);

  const ensureAudio = useCallback(async () => {
    if (!audioInitialized) {
      await initAudio();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // MIDI Input Visualization State
  const { lastNote } = useMidi();
  const [midiNotes, setMidiNotes] = useState<number[]>([]);

  useEffect(() => {
    if (!lastNote) return;
    ensureAudio();
    if (lastNote.type === 'noteon') {
      setMidiNotes(prev => prev.includes(lastNote.note) ? prev : [...prev, lastNote.note]);
      triggerAttack(lastNote.note, lastNote.velocity / 127);
    } else {
      setMidiNotes(prev => prev.filter(n => n !== lastNote.note));
      triggerRelease(lastNote.note);
    }
  }, [lastNote, ensureAudio]);

  const availableChords = getScaleChords(selectedKey, selectedScale, 4);

  // Handle chord click from keyboard
  const handleChordClick = useCallback(
    async (chord: ChordInfo) => {
      await ensureAudio();
      const voicedNotes = applyVoicing(chord.midiNotes, selectedVoicing);
      playChord(voicedNotes, '4n', selectedStyle);

      setProgression((prev) => {
        const firstEmpty = prev.findIndex((c) => c === null);
        if (firstEmpty === -1) {
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

  const handleSlotClick = useCallback(
    async (index: number) => {
      const chord = progression[index];
      if (chord) {
        await ensureAudio();
        playChord(chord.midiNotes, '2n', selectedStyle);
      }
    },
    [progression, ensureAudio]
  );

  const handleRemoveChord = useCallback((index: number) => {
    setProgression((prev) => {
      const newProg = [...prev];
      newProg[index] = null;
      return newProg;
    });
  }, []);

  const handleClearProgression = useCallback(() => {
    setProgression(Array(MAX_PROGRESSION_LENGTH).fill(null));
    setPlayingIndex(null);
    setImportedTrackInfo(null); // Clear track info
    setVisualizedNotes([]);
    stop();
    setIsPlaying(false);
  }, []);

  const handleSelectPreset = useCallback(
    (preset: Progression) => {
      setImportedTrackInfo(null); // Clear imported info when a preset is selected
      let newProgression: (ChordInfo | null)[] = Array(MAX_PROGRESSION_LENGTH).fill(null);

      if (preset.chords && preset.chords.length > 0) {
        preset.chords.forEach((chordName, index) => {
          if (index < MAX_PROGRESSION_LENGTH) {
            const { root, quality } = parseChord(chordName);
            const midiNotes = getChordNotes(root, quality, 4, selectedVoicing);
            const notes = midiNotes.map(m => midiToNoteName(m));
            newProgression[index] = {
              root,
              quality,
              roman: chordName,
              degree: -1,
              notes,
              midiNotes
            };
          }
        });
      }

      // Check for style metadata on the preset object
      if ((preset as any).style) {
        setSelectedStyle((preset as any).style);
        setBpm((preset as any).tempo || 120);
      } else if (preset.degrees) {
        // Degree based (Diatonic)
        const keyRoot = 'C'; // Default to C major for degrees if not specified, or use preset.key?
        const scale = getScaleChords(keyRoot, 'Major');
        preset.degrees.forEach((degree, index) => {
          if (index < MAX_PROGRESSION_LENGTH && scale[degree]) {
            const chord = scale[degree];
            const voicedNotes = applyVoicing(chord.midiNotes, selectedVoicing);
            newProgression[index] = { ...chord, midiNotes: voicedNotes };
          }
        });
      }
      setProgression(newProgression);
      setActiveTab('lab'); // Switch back to lab on preset select
    },
    [selectedKey, selectedScale, selectedVoicing]
  );

  const handlePlay = useCallback(async () => {
    await ensureAudio();
    const validChords = progression
      .map((c, i) => ({ chord: c, index: i }))
      .filter((item): item is { chord: ChordInfo, index: number } => item.chord !== null);

    if (validChords.length === 0) return;

    setIsPlaying(true);
    const playData = validChords.map(({ chord }) => ({
      root: chord.root,
      quality: chord.quality,
      duration: 4,
      notes: chord.midiNotes
    }));

    playProgression(
      playData,
      selectedStyle,
      bpm,
      (playIndex) => {
        const originalIndex = validChords[playIndex].index;
        setPlayingIndex(originalIndex);
      },
      () => {
        setIsPlaying(false);
        setPlayingIndex(null);
        setVisualizedNotes([]);
      },
      (activeNotes) => {
        setVisualizedNotes(activeNotes);
      }
    );
  }, [progression, bpm, selectedStyle, ensureAudio]);

  const handleStop = useCallback(() => {
    stop();
    setIsPlaying(false);
    setPlayingIndex(null);
    setVisualizedNotes([]);
  }, []);

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

  useEffect(() => {
    setProgression((prev) =>
      prev.map((chord) => {
        if (!chord) return null;

        // Skip re-voicing for custom imported MIDI chords
        if (chord.quality === 'Custom') return chord;

        if (chord.degree !== -1) {
          const baseChords = getScaleChords(selectedKey, selectedScale, 4);
          const baseChord = baseChords.find((c) => c.degree === chord.degree);
          if (!baseChord) return chord;
          return {
            ...chord,
            midiNotes: applyVoicing(baseChord.midiNotes, selectedVoicing),
          };
        } else {
          const newNotes = getChordNotes(chord.root, chord.quality, 4, selectedVoicing);
          return { ...chord, midiNotes: newNotes };
        }
      })
    );
  }, [selectedVoicing, selectedKey, selectedScale]);

  // Reusable function to load MIDI data
  const handleLoadExternalMidi = useCallback((data: any) => {
    const { key, chords, detailedChords, style } = data;

    if (key) setSelectedKey(key);
    if (style) setSelectedStyle(style);

    // Determine Scale
    let targetScale = 'Major';
    if (chords && chords.length > 0) {
      const first = chords[0];
      if (first === 'i' || first === 'im' || first === 'i7') {
        targetScale = 'Natural Minor';
      }
    }
    setSelectedScale(targetScale);

    // Populate Progression
    const newProg = Array(MAX_PROGRESSION_LENGTH).fill(null);

    // Priority: use detailedChords (actual MIDI) if available
    if (detailedChords && detailedChords.length > 0) {
      detailedChords.forEach((item: any, index: number) => {
        if (index >= MAX_PROGRESSION_LENGTH) return;

        // Map MIDI notes to string names
        const notes = item.notes.map((m: number) => midiToNoteName(m));

        newProg[index] = {
          root: '?',
          quality: 'Custom', // Flag to prevent auto-revoicing
          roman: item.label,
          degree: -1,
          notes: notes,
          midiNotes: item.notes
        };
      });
    } else if (chords) {
      // Fallback to old logic (Roman Numeral matching)
      const scaleChords = getScaleChords(key, targetScale, 4);
      chords.forEach((roman: string, index: number) => {
        if (index >= MAX_PROGRESSION_LENGTH) return;
        const found = scaleChords.find(c => c.roman === roman || roman.startsWith(c.roman));
        if (found) {
          newProg[index] = { ...found, roman: roman };
        }
      });
    }

    setProgression(newProg);
    setImportedTrackInfo({
      name: data.name || 'Unknown Track',
      style: data.style,
      mood: data.mood
    });
  }, [selectedKey]); // Dependencies might need tuning if logic uses others, but mostly it sets them.

  // Handle Imported Progression from Library (via Navigation)
  useEffect(() => {
    if (location.state && location.state.importedProgression) {
      handleLoadExternalMidi(location.state.importedProgression);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, handleLoadExternalMidi]);

  const highlightedNotes = availableChords.flatMap((c) =>
    c.midiNotes.map((n) => n % 12)
  );

  const displayedNotes = [...visualizedNotes, ...midiNotes];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {t('app.header')}
            </h1>
            <p className="text-white/50 text-sm">
              {t('progressions.descriptions.Most popular progression in pop music')}
            </p>
            {/* Integration Footer */}
            <QuickExerciseJump currentModule="ChordLab" />
          </div>
          <LanguageSelector value={i18n.language} onChange={setLanguage} />
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'lab'
              ? 'bg-white text-black shadow-neon'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            🎹 {t('ui.tabs.chords')}
          </button>
          <button
            onClick={() => setActiveTab('ear-training')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'ear-training'
              ? 'bg-cyan-400 text-black shadow-neon-cyan'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            👂 {t('earTraining.title')}
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'lessons'
              ? 'bg-amber-400 text-black shadow-neon-amber'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            📚 {t('ui.tabs.progressions')}
          </button>
        </div>

        {/* --- LAB VIEW --- */}
        {activeTab === 'lab' && (
          <div className="space-y-6 fade-in">
            <Controls
              selectedKey={selectedKey}
              selectedScale={selectedScale}
              selectedVoicing={selectedVoicing}
              selectedStyle={selectedStyle}
              bpm={bpm}
              isPlaying={isPlaying}
              onKeyChange={setSelectedKey}
              onScaleChange={setSelectedScale}
              onVoicingChange={setSelectedVoicing}
              onStyleChange={setSelectedStyle}
              onBpmChange={setBpm}
              onPlay={handlePlay}
              onStop={handleStop}
              onExportMidi={handleExportMidi}
            />

            <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-pink-400">♪</span>
                {selectedKey} {selectedScale} Scale
              </h2>
              <div className="flex justify-center">
                <PianoKeyboard
                  startOctave={4}
                  endOctave={5}
                  highlightedNotes={isPlaying || midiNotes.length > 0 ? displayedNotes : highlightedNotes}
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

            {/* Non-Functional Harmony Tool */}
            <ConstantStructureTool
              onAddChord={(chord) => {
                setProgression((prev) => {
                  const firstEmpty = prev.findIndex((c) => c === null);
                  if (firstEmpty === -1) {
                    const newProg = [...prev.slice(1), chord];
                    return newProg;
                  }
                  const newProg = [...prev];
                  newProg[firstEmpty] = chord;
                  return newProg;
                });
              }}
            />

            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-amber-400">🎷</span>
                Jazz Standards
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {JAZZ_STANDARDS.map((std: JazzStandard, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPreset(std)}
                    className="bg-amber-900/20 hover:bg-amber-800/40 border border-amber-500/20 rounded-xl p-3 text-left transition-colors"
                  >
                    <div className="font-medium text-amber-200">{std.name}</div>
                    <div className="text-xs text-white/40">{std.style} • {std.key}</div>
                  </button>
                ))}
              </div>
            </div>

            <PresetsPanel
              onSelectPreset={handleSelectPreset}
              onImportMidi={handleLoadExternalMidi}
            />
          </div>
        )}

        {/* --- EAR TRAINING VIEW --- */}
        {activeTab === 'ear-training' && (
          <div className="fade-in">
            <EarTrainingModule />
          </div>
        )}

        {/* --- LESSONS VIEW --- */}
        {activeTab === 'lessons' && (
          <div className="fade-in pb-20">
            {activeLesson ? (
              <LessonEngine
                lesson={activeLesson}
                onBack={() => setActiveLesson(null)}
                onComplete={() => setActiveLesson(null)}
              />
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6">The Architectonics of Advanced Jazz</h2>
                {/* Active Track Info */}
                {importedTrackInfo && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                    <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Now Playing</div>
                    <div className="text-xl font-bold text-white">{importedTrackInfo.name}</div>
                    {importedTrackInfo.style && <div className="text-sm text-cyan-400">{importedTrackInfo.style} • {importedTrackInfo.mood || 'Custom'}</div>}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LESSONS.map((lesson: Lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className="text-left p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:scale-110 transition transform">
                        {lesson.concept.split(' ')[1]}
                      </div>
                      <div className="relative z-10">
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                          {lesson.concept}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                        <p className="text-sm text-white/50 mb-4 line-clamp-3">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${lesson.difficulty === 'Expert' ? 'bg-purple-500/20 text-purple-300' :
                            lesson.difficulty === 'Advanced' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-emerald-500/20 text-emerald-300'
                            }`}>
                            {lesson.difficulty}
                          </span>
                          {getProgress().includes(lesson.id) && (
                            <span className="text-emerald-400 text-xs">✓ Completed</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="text-center text-white/30 text-xs py-4">
          Built with React + Tone.js • iReal Pro Style Player + Educational Suite
        </footer>
      </div>
    </div>
  );
}

export default ChordLab;
