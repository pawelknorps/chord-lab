import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { decodeProgression } from '../../core/routing/deepLinks';
import type { ChordInfo, Progression } from '../../core/theory';
import { getScaleChords, applyVoicing, parseChord, getChordNotes, midiToNoteName, noteNameToMidi, analyzeChordFromNotes } from '../../core/theory';


import type { Style } from '../../core/audio/globalAudio';
import {
  playProgression,
  setBpm as setGlobalBpm,
  initAudio as initGlobalAudio,
  playChord as playChordGlobal
} from '../../core/audio/globalAudio';
import { bpmSignal } from '../../core/audio/audioSignals';
import { exportToMidi, downloadMidi } from '../../core/midi/export';
import { useTranslation } from 'react-i18next';
import { useMidi } from '../../context/MidiContext';
import { QuickExerciseJump } from '../../components/widgets/QuickExerciseJump';
import { ChordLabDashboard } from '../../components/ChordLabDashboard';
import { useUserPresets } from '../../hooks/useUserPresets';
import { useMusicalClipboard } from '../../core/state/musicalClipboard';
import { audioManager } from '../../core/services';
import { useAudioCleanup } from '../../hooks/useAudioManager';
import { SmartLessonPane } from './components/SmartLessonPane';
import { WorkbenchAiPanel } from '../../components/WorkbenchAiPanel';
import { useSettingsStore } from '../../core/store/useSettingsStore';
import { Sparkles } from 'lucide-react';
import * as Tone from 'tone';

const MAX_PROGRESSION_LENGTH = 16;
const DEFAULT_TRANSPOSE_SETTINGS = { enabled: false, interval: 1, step: 1 };

function ChordLab() {
  const { t } = useTranslation();
  const { userPresets, savePreset, deletePreset } = useUserPresets();

  const [searchParams] = useSearchParams();

  // Lab State
  useAudioCleanup('pawelsonik');
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('Major');
  const [selectedVoicing, setSelectedVoicing] = useState('Root Position');
  const [selectedStyle, setSelectedStyle] = useState<Style>('Jazz');
  const [bpm, setBpm] = useState(80);
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string | null>(null);
  const [buildingNotes, setBuildingNotes] = useState<number[]>([]);
  const [showWorkbenchAi, setShowWorkbenchAi] = useState(false);

  // Chord detection for builder (uses true root + inversion/slash when applicable, key-aware enharmonics)
  const detectChord = useCallback((notes: number[]): { root: string; quality: string; bass?: string } | null => {
    if (notes.length < 3) return null;
    const analyzed = analyzeChordFromNotes(notes, selectedKey);
    if (analyzed) return analyzed;
    // Fallback for unknown pitch sets: show lowest note as root
    const sorted = [...notes].sort((a, b) => a - b);
    const rootName = midiToNoteName(sorted[0], selectedKey).replace(/[0-9-]/g, '');
    return { root: rootName, quality: 'custom' };
  }, [selectedKey]);

  const builtChord = useMemo(() => detectChord(buildingNotes), [buildingNotes, detectChord]);


  // Sync BPM
  useEffect(() => {
    bpmSignal.value = bpm;
    setGlobalBpm(bpm);
  }, [bpm]);

  const [progression, setProgression] = useState<(ChordInfo | null)[]>(
    Array(MAX_PROGRESSION_LENGTH).fill(null)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [visualizedNotes, setVisualizedNotes] = useState<number[]>([]);

  // Looping & Auto-Transpose State
  const [isLooping, setIsLooping] = useState(false);
  const [transposeSettings, setTransposeSettings] = useState(DEFAULT_TRANSPOSE_SETTINGS);
  const [loopCount, setLoopCount] = useState(0);
  const [playbackRange, setPlaybackRange] = useState<{ start: number, end: number } | null>(null);

  useEffect(() => {

    audioManager.setVisualizationCallback((notes) => {
      setVisualizedNotes(notes);
    });
    return () => audioManager.setVisualizationCallback(null);
  }, []);

  // MIDI Input Visualization State
  const { activeNotes } = useMidi();

  const midiNotes = useMemo(() => Array.from(activeNotes), [activeNotes]);

  const availableChords = getScaleChords(selectedKey, selectedScale, 4);

  // Handle chord click from keyboard
  const handleChordClick = useCallback(
    async (chord: ChordInfo) => {
      const voicedNotes = applyVoicing(chord.midiNotes, selectedVoicing);
      audioManager.playChord(voicedNotes, '4n', 0.8);

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
    [selectedVoicing]
  );

  const handleSlotClick = useCallback(
    (index: number) => {
      const chord = progression[index];
      if (chord) {
        Tone.start();
        initGlobalAudio().then(() => {
          playChordGlobal(chord.midiNotes, '2n');
        }).catch(() => {
          audioManager.initialize().then(() => audioManager.playChord(chord.midiNotes, '2n', 0.8));
        });
      }
    },
    [progression]
  );

  const handleRemoveChord = useCallback((index: number) => {
    setProgression((prev) => {
      const newProg = [...prev];
      newProg[index] = null;
      return newProg;
    });
  }, []);

  const handleMoveChord = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setProgression((prev) => {
      const newProg = [...prev];
      const temp = newProg[fromIndex];
      newProg[fromIndex] = newProg[toIndex];
      newProg[toIndex] = temp;
      return newProg;
    });
  }, []);

  const handleClearProgression = useCallback(() => {
    setProgression(Array(MAX_PROGRESSION_LENGTH).fill(null));
    setPlayingIndex(null);
    setVisualizedNotes([]);
    audioManager.stopAll();
    setIsPlaying(false);
  }, []);

  const handleSelectPreset = useCallback(
    (preset: Progression) => {
      // Check for Key metadata first to update context
      if ((preset as any).key) {
        const newKey = (preset as any).key;
        setSelectedKey(newKey);
        // data-bind: update ref to prevent auto-transpose effect from ruining the import
        prevKeyRef.current = newKey;
      }

      // setImportedTrackInfo(null); // Clear imported info when a preset is selected
      const newProgression: (ChordInfo | null)[] = Array(MAX_PROGRESSION_LENGTH).fill(null);

      if (preset.chords && preset.chords.length > 0) {
        preset.chords.forEach((chordName, index) => {
          if (index < MAX_PROGRESSION_LENGTH) {
            const { root, quality } = parseChord(chordName);
            const midiNotes = getChordNotes(root, quality, 4, selectedVoicing);
            // Use the key from preset if available, otherwise selectedKey
            const contextKey = (preset as any).key || selectedKey;
            const notes = midiNotes.map(m => midiToNoteName(m, contextKey));

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
      }

      // Check if it's a Jazz Standard to trigger Lesson Mode
      if (preset.genre === 'Jazz Standard') {
        setSelectedLessonTitle(preset.name);
      } else {
        setSelectedLessonTitle(null);
      }

      if (preset.degrees) {
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
    },
    [selectedKey, selectedScale, selectedVoicing]
  );

  const startPlayback = useCallback((validChords: { chord: ChordInfo, index: number }[]) => {
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
      (playIndex: number) => {
        const originalIndex = validChords[playIndex].index;
        setPlayingIndex(originalIndex);
      },
      () => {
        if (isLooping) {
          setLoopCount(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setPlayingIndex(null);
          setVisualizedNotes([]);
          setLoopCount(0);
        }
      },
      (notes: number[]) => {
        setVisualizedNotes(notes);
      }
    );
  }, [selectedStyle, bpm, isLooping]);

  const handlePlay = useCallback(async () => {
    const validChords = progression
      .map((c, i) => ({ chord: c, index: i }))
      .filter((item): item is { chord: ChordInfo, index: number } => item.chord !== null)
      .filter(item => {
        if (!playbackRange) return true;
        return item.index >= playbackRange.start && item.index <= playbackRange.end;
      });

    if (validChords.length === 0) return;

    setIsPlaying(true);
    startPlayback(validChords);
  }, [progression, startPlayback, playbackRange]);


  // Handle Looping + Auto-Transpose Effect
  useEffect(() => {
    if (isLooping && isPlaying && loopCount > 0) {
      // Handle Auto-Transpose logic
      if (transposeSettings.enabled && loopCount % transposeSettings.interval === 0) {
        const shift = transposeSettings.step;
        const shiftNote = (note: string, semitones: number) => {
          const midi = noteNameToMidi(note + '4');
          const shiftedMidi = midi + semitones;
          return midiToNoteName(shiftedMidi, selectedKey).replace(/[0-9-]/g, '');
        };

        const newKey = shiftNote(selectedKey, shift);
        setSelectedKey(newKey);

        setProgression(prevProg => prevProg.map(chord => {
          if (!chord) return null;
          const newRoot = shiftNote(chord.root, shift);
          const newBass = chord.bass ? shiftNote(chord.bass, shift) : undefined;
          const newMidiNotes = chord.midiNotes.map(n => n + shift);
          const newNotes = newMidiNotes.map(n => midiToNoteName(n, newKey));
          return { ...chord, root: newRoot, bass: newBass, notes: newNotes, midiNotes: newMidiNotes };
        }));
      }

      // Restart playback with latest progression
      // The state updates above will be reflected in the next tick or via dependency
    }
  }, [loopCount, isLooping, isPlaying, transposeSettings, selectedKey]);

  // Re-start playback when progression changes during a loop
  useEffect(() => {
    if (isPlaying && isLooping && loopCount > 0) {
      const validChords = progression
        .map((c, i) => ({ chord: c, index: i }))
        .filter((item): item is { chord: ChordInfo, index: number } => item.chord !== null);
      if (validChords.length > 0) {
        startPlayback(validChords);
      }
    }
  }, [loopCount, isLooping, isPlaying, progression, startPlayback]);

  // --- Transposition Logic: Hard-link Progression to Key ---
  // Store previous key to calculate shift
  const prevKeyRef = useRef(selectedKey);

  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== selectedKey) {
      // Calculate interval between prevKey and newKey
      const prevRootMidi = noteNameToMidi(prevKey + '4');
      const newRootMidi = noteNameToMidi(selectedKey + '4');
      const semitoneShift = newRootMidi - prevRootMidi;

      // Handle wrap-around for octaves to find shortest path
      let shift = semitoneShift;
      if (shift > 6) shift -= 12;
      if (shift < -6) shift += 12;

      // Determine accidental preference for new key (Now handled by midiToNoteName context)

      if (shift !== 0) {
        setProgression(prev => prev.map(chord => {
          if (!chord) return null;
          // Shift root
          const currentRootMidi = noteNameToMidi(chord.root + '4');
          const newChordRootMidi = currentRootMidi + shift;
          // Use proper accidental spelling based on new key context
          const newRoot = midiToNoteName(newChordRootMidi, selectedKey).replace(/[0-9-]/g, '');

          // Shift MIDI notes
          const newMidiNotes = chord.midiNotes.map(n => n + shift);
          const newNotes = newMidiNotes.map(n => midiToNoteName(n, selectedKey));

          // Transpose bass note for inversions/slash chords
          const newBass = chord.bass
            ? midiToNoteName(noteNameToMidi(chord.bass + '4') + shift, selectedKey).replace(/[0-9-]/g, '')
            : undefined;

          return {
            ...chord,
            root: newRoot,
            notes: newNotes,
            midiNotes: newMidiNotes,
            bass: newBass
          };
        }));
      }
      prevKeyRef.current = selectedKey;
    }
  }, [selectedKey, selectedScale]);


  // --- MIDI Input Logic ---
  // Detect chord from activeNotes when requested
  const [detectedChord, setDetectedChord] = useState<ChordInfo | null>(null);

  // Chord detection from MIDI notes (true root + inversion/slash)
  const detectChordFromNotes = useCallback((notes: number[]): ChordInfo | null => {
    if (notes.length < 3) return null;

    const sorted = [...notes].sort((a, b) => a - b);
    const analyzed = analyzeChordFromNotes(notes, selectedKey);
    if (!analyzed) return null;

    const displayQuality = analyzed.quality === 'maj' ? '' : analyzed.quality === 'min' ? 'm' : analyzed.quality;

    return {
      root: analyzed.root,
      quality: analyzed.quality,
      roman: displayQuality,
      degree: -1,
      notes: sorted.map(n => midiToNoteName(n, selectedKey)),
      midiNotes: sorted,
      bass: analyzed.bass
    };
  }, [selectedKey]);

  useEffect(() => {
    if (midiNotes.length >= 3) {
      setDetectedChord(detectChordFromNotes(midiNotes));
    } else {
      setDetectedChord(null);
    }
  }, [midiNotes, detectChordFromNotes]);

  const handleAddDetectedChord = () => {
    if (detectedChord) {
      setProgression((prev) => {
        const firstEmpty = prev.findIndex((c) => c === null);
        if (firstEmpty === -1) {
          return [...prev.slice(1), detectedChord];
        }
        const newProg = [...prev];
        newProg[firstEmpty] = detectedChord;
        return newProg;
      });
    }
  };



  const handleSaveUserPreset = useCallback(() => {
    const validChords = progression.filter((c): c is ChordInfo => c !== null);
    if (validChords.length === 0) return;

    const name = prompt("Name your preset:", "My Jazz Tune");
    if (!name) return;

    const chords = validChords.map(c => {
      let q = c.quality;
      if (q === 'maj') q = '';
      return c.root + q;
    });

    savePreset({
      name,
      genre: 'User',
      description: `Custom User Preset • ${new Date().toLocaleDateString()}`,
      chords
    });
  }, [progression, savePreset]);

  const handleStop = useCallback(() => {
    audioManager.stopAll();
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

  // Chord Builder Handlers — use main audio engine (globalAudio piano) so Piano loads with Guitar/Bass
  const handleNoteToggle = useCallback((note: number) => {
    setBuildingNotes(prev => {
      if (prev.includes(note)) {
        return prev.filter(n => n !== note);
      }
      return [...prev, note].sort((a, b) => a - b);
    });
    Tone.start();
    initGlobalAudio().then(() => {
      playChordGlobal([note], '8n'); // same piano as progression playback
    }).catch(() => {
      audioManager.initialize().then(() => audioManager.playNote(note, '8n', 0.6));
    });
  }, []);

  const handleAddBuiltChord = useCallback(() => {
    if (!builtChord || buildingNotes.length < 3) return;

    const voicedNotes = applyVoicing(buildingNotes, selectedVoicing);

    setProgression((prev) => {
      const firstEmpty = prev.findIndex((c) => c === null);
      const chordInfo: ChordInfo = {
        root: builtChord.root,
        quality: builtChord.quality,
        midiNotes: voicedNotes,
        notes: buildingNotes.map(n => midiToNoteName(n)),
        roman: '',
        degree: 0,
        bass: builtChord.bass,
      };

      if (firstEmpty === -1) {
        return [...prev.slice(1), chordInfo];
      }
      const newProg = [...prev];
      newProg[firstEmpty] = chordInfo;
      return newProg;
    });

    Tone.start();
    initGlobalAudio().then(() => {
      playChordGlobal(voicedNotes, '4n');
    }).catch(() => {
      audioManager.initialize().then(() => audioManager.playChord(voicedNotes, '4n', 0.8));
    });
    setBuildingNotes([]);
  }, [builtChord, buildingNotes, selectedVoicing]);

  const handleClearBuilder = useCallback(() => {
    setBuildingNotes([]);
  }, []);

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

    // Determine Scale (Simple heuristic)
    let targetScale = 'Major';
    if (chords && chords.length > 0) {
      const first = chords[0];
      if (typeof first === 'string' && first.toLowerCase().startsWith('i') && (first === 'i' || first === 'im' || first === 'i7' || first === 'im7')) {
        if (first === 'im' || first === 'im7') targetScale = 'Natural Minor';
      }
    }
    setSelectedScale(targetScale);

    // Populate Progression
    const newProg = Array(MAX_PROGRESSION_LENGTH).fill(null);

    // Priority: use detailedChords (actual MIDI) if available
    if (detailedChords && detailedChords.length > 0) {
      detailedChords.forEach((item: any, index: number) => {
        if (index >= MAX_PROGRESSION_LENGTH) return;
        const notes = item.notes.map((m: number) => midiToNoteName(m, selectedKey));
        newProg[index] = {
          root: '?',
          quality: 'Custom',
          roman: item.label,
          degree: -1,
          notes: notes,
          midiNotes: item.notes
        };
      });
    } else if (chords) {
      // Robust Roman Numeral Parsing
      const ROMAN_MAP: Record<string, number> = {
        'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
        'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6
      };

      const scaleIntervals = targetScale === 'Natural Minor'
        ? [0, 2, 3, 5, 7, 8, 10]
        : [0, 2, 4, 5, 7, 9, 11]; // Major default

      const rootMidi = noteNameToMidi(key + '4');
      const rootIndex = (rootMidi % 12);

      chords.forEach((romanStr: string, index: number) => {
        if (index >= MAX_PROGRESSION_LENGTH) return;
        if (!romanStr) return;

        // 1. Separate Root (Roman) from Suffix (Quality)
        const match = romanStr.match(/^([b#]?)(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/);

        if (match) {
          const acc = match[1]; // b or #
          const numeral = match[2];
          const suffix = match[3];

          // Determine Degree
          const degree = ROMAN_MAP[numeral] !== undefined ? ROMAN_MAP[numeral] : 0;

          // Determine Chromatic Root
          let currentInterval = scaleIntervals[degree];
          if (acc === 'b') currentInterval -= 1;
          if (acc === '#') currentInterval += 1;

          const chordRootIndex = (rootIndex + currentInterval + 12) % 12;
          const chordRootName = midiToNoteName(60 + chordRootIndex).replace(/[0-9]/g, '');

          let quality = 'maj';
          const isLowerCase = numeral === numeral.toLowerCase();

          if (!suffix) {
            quality = isLowerCase ? 'min' : 'maj';
          } else {
            if (suffix === 'm' || suffix === '-') quality = 'min';
            else if (suffix === '7') quality = isLowerCase ? 'min7' : 'dom7';
            else if (suffix === 'maj7' || suffix === 'M7') quality = 'maj7';
            else if (suffix === 'm7' || suffix === '-7') quality = 'min7';
            else if (suffix === 'sus4') quality = 'sus4';
            else if (suffix === 'sus2') quality = 'sus2';
            else if (suffix === 'dim' || suffix === '°') quality = 'dim';
            else if (suffix === 'dim7' || suffix === '°7') quality = 'dim7';
            else if (suffix === 'm7b5' || suffix === 'ø') quality = 'm7b5';
            else if (suffix === '6') quality = isLowerCase ? 'm6' : '6';
            else if (suffix === '9') quality = isLowerCase ? 'min9' : '9';
            else if (suffix === 'add9') quality = 'maj9';
            else if (suffix.includes('M-5')) quality = 'maj';
            else quality = isLowerCase ? 'min' : 'maj';
          }

          const midiNotes = getChordNotes(chordRootName, quality, 4, selectedVoicing);
          const notes = midiNotes.map(m => midiToNoteName(m, selectedKey));

          newProg[index] = {
            root: chordRootName,
            quality,
            roman: romanStr,
            degree: degree,
            notes,
            midiNotes
          };
        } else {
          const scaleChords = getScaleChords(key, targetScale, 4);
          const found = scaleChords.find(c => c.roman === romanStr);
          if (found) {
            newProg[index] = { ...found, roman: romanStr };
          }
        }
      });
    }

    setProgression(newProg);
    // setImportedTrackInfo({
    //   name: data.name || 'Unknown Track',
    //   style: data.style,
    //   mood: data.mood
    // });
  }, [selectedKey, selectedVoicing, selectedScale]);

  // Handle clipboard data on mount
  const { pasteProgression, clear: clearClipboard } = useMusicalClipboard();

  useEffect(() => {
    // Check for navigation data (from musical clipboard)
    const incomingData = pasteProgression();
    if (incomingData && incomingData.source === 'navigation') {
      handleLoadExternalMidi(incomingData);
      clearClipboard();
    }
  }, [handleLoadExternalMidi, pasteProgression, clearClipboard]);

  // Handle SearchParams (Deep Linking) on mount
  useEffect(() => {
    const deepLinkData = decodeProgression(searchParams);
    if (deepLinkData) {
      handleLoadExternalMidi({
        key: deepLinkData.key,
        chords: deepLinkData.chords,
        mode: deepLinkData.mode,
        source: 'deeplink'
      });
    }
  }, [searchParams, handleLoadExternalMidi]);

  // Handle Imported Progression from Library (via Navigation state)

  const highlightedNotes = availableChords.flatMap((c) =>
    c.midiNotes.map((n) => n % 12)
  );


  // const displayedNotes = [...visualizedNotes, ...midiNotes]; // Moved to Dashboard

  // Create current chord display data
  const currentChord = playingIndex !== null ? progression[playingIndex] : null;

  return (
    <div className="min-h-screen min-w-0 w-full max-w-full p-4 md:p-8 relative">
      <div className="max-w-screen-2xl mx-auto space-y-6 pb-20 px-4 md:px-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {t('app.header')}
            </h1>
            <p className="text-[var(--text-muted)] text-sm mb-4">
              {t('progressions.descriptions.Most popular progression in pop music')}
            </p>
            {/* Integration Footer - now compact */}
            <QuickExerciseJump currentModule="ChordLab" />
          </div>
          {/* <LanguageSelector value={i18n.language} onChange={setLanguage} /> */}
        </header>

        {/* Workbench AI Assistant panel */}
        <WorkbenchAiPanel
          open={showWorkbenchAi}
          onClose={() => setShowWorkbenchAi(false)}
          progressionChords={progression.filter((c): c is ChordInfo => c !== null).map(c => `${c.root}${c.quality === 'maj' ? '' : c.quality === 'min' ? 'm' : c.quality}${c.bass ? '/' + c.bass : ''}`)}
          keySignature={selectedKey}
          scale={selectedScale}
        />
        {selectedLessonTitle && (
          <SmartLessonPane
            songTitle={selectedLessonTitle}
            onClose={() => setSelectedLessonTitle(null)}
            progressionChords={progression.filter((c): c is ChordInfo => c !== null).map(c => `${c.root}${c.quality === 'maj' ? '' : c.quality === 'min' ? 'm' : c.quality}${c.bass ? '/' + c.bass : ''}`)}
            key={selectedKey}
            scale={selectedScale}
            onSetBpm={(newBpm) => {
              setBpm(newBpm);
            }}
            onSetKey={(newKey) => {
              setSelectedKey(newKey);
            }}
            onSpotlightDrill={() => {
              // Loop last 4 bars (or last 4 chords)
              let lastIndex = -1;
              for (let i = progression.length - 1; i >= 0; i--) {
                if (progression[i] !== null) {
                  lastIndex = i;
                  break;
                }
              }
              if (lastIndex === -1) return;
              const rangeEnd = lastIndex;
              const rangeStart = Math.max(0, lastIndex - 3);
              setPlaybackRange({ start: rangeStart, end: rangeEnd });
              setIsLooping(true);
              if (!isPlaying) handlePlay();
            }}
            onBlindfoldChallenge={() => {
              useSettingsStore.getState().setPiano(false);
              useSettingsStore.getState().setFretboard(false);
            }}
          />
        )}

        {/* Workbench AI Assistant FAB - hidden when panel is open */}
        {!showWorkbenchAi && (
          <button
            onClick={() => setShowWorkbenchAi(true)}
            className="fixed bottom-6 right-6 z-30 p-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm"
            aria-label="Open AI Assistant"
            title="Ask AI about your progression"
          >
            <Sparkles size={20} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        )}

        {/* MIDI Detection UI floating or integrated */}

        {detectedChord && (
          <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 animate-bounce-in">
            <div className="glass-panel p-4 rounded-xl border border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)] flex items-center gap-4">
              <div className="text-center">
                <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest">Detected</div>
                <div className="text-2xl font-black text-white">
                  {detectedChord.root}
                  <span className="text-lg font-normal">{detectedChord.quality === 'maj' ? '' : detectedChord.quality === 'min' ? 'm' : detectedChord.quality}</span>
                  {detectedChord.bass && <span className="text-lg font-normal">/{detectedChord.bass}</span>}
                </div>
              </div>
              <button
                onClick={handleAddDetectedChord}
                className="bg-cyan-500 text-black p-2 rounded-lg font-bold hover:bg-cyan-400 transition"
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {/* --- LAB DASHBOARD --- */}
        <ChordLabDashboard
          selectedKey={selectedKey}
          selectedScale={selectedScale}
          selectedVoicing={selectedVoicing}
          selectedStyle={selectedStyle}
          bpm={bpm}
          isPlaying={isPlaying}
          progression={progression}
          playingIndex={playingIndex}
          currentChord={currentChord}
          midiNotes={midiNotes}
          visualizedNotes={visualizedNotes}
          highlightedNotes={highlightedNotes}
          availableChords={availableChords}

          isLooping={isLooping}
          onLoopToggle={() => setIsLooping(prev => !prev)}
          transposeSettings={transposeSettings}
          onTransposeSettingsChange={setTransposeSettings}

          onKeyChange={setSelectedKey}
          onScaleChange={setSelectedScale}
          onVoicingChange={setSelectedVoicing}
          onStyleChange={setSelectedStyle}
          onBpmChange={setBpm}
          onPlay={handlePlay}
          onStop={handleStop}
          onExportMidi={handleExportMidi}
          onSlotClick={handleSlotClick}
          onRemoveChord={handleRemoveChord}
          onMoveChord={handleMoveChord}
          onClearProgression={handleClearProgression}
          onAddStructureChord={(chord) => {
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
          onSelectPreset={handleSelectPreset}
          onImportMidi={handleLoadExternalMidi}
          onAddChord={handleChordClick}

          buildingNotes={buildingNotes}
          builtChord={builtChord}
          onNoteToggle={handleNoteToggle}
          onAddBuiltChord={handleAddBuiltChord}
          onClearBuilder={handleClearBuilder}

          userPresets={userPresets}

          onSaveUserPreset={handleSaveUserPreset}
          onDeleteUserPreset={deletePreset}
        />

        <footer className="text-center text-white/30 text-xs py-4">
          Built with React + Tone.js • iReal Pro Style Player + Educational Suite
        </footer>
      </div>
    </div>
  );
}

export default ChordLab;
