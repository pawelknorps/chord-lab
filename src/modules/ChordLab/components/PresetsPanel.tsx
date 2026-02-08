import { useState, useMemo } from 'react';
import type { Progression } from '../../../core/theory';
import { PRESETS } from '../../../core/theory';
import { useMidiLibrary, type MidiFile } from '../../../hooks/useMidiLibrary';
import { Midi } from '@tonejs/midi';
import { FileMusic } from 'lucide-react';

interface PresetsPanelProps {
  onSelectPreset: (preset: Progression) => void;
  onImportMidi?: (data: any) => void;
}

const GENRE_COLORS: Record<string, string> = {
  'Pop': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  'Jazz': 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  'Blues': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  'Lo-fi': 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
  'R&B': 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
  'Classical': 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  'Flamenco': 'from-red-500/20 to-orange-500/20 border-red-500/30',
  'J-Pop': 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30',
  'Rock': 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
};

const GENRE_BADGES: Record<string, string> = {
  'Pop': 'bg-pink-500/30 text-pink-200',
  'Jazz': 'bg-amber-500/30 text-amber-200',
  'Blues': 'bg-blue-500/30 text-blue-200',
  'Lo-fi': 'bg-cyan-500/30 text-cyan-200',
  'R&B': 'bg-purple-500/30 text-purple-200',
  'Classical': 'bg-emerald-500/30 text-emerald-200',
  'Flamenco': 'bg-red-500/30 text-red-200',
  'J-Pop': 'bg-fuchsia-500/30 text-fuchsia-200',
  'Rock': 'bg-gray-500/30 text-gray-200',
};

export function PresetsPanel({ onSelectPreset, onImportMidi }: PresetsPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'library'>('presets');
  const [searchTerm, setSearchTerm] = useState('');

  // MIDI Library Hook
  const { files } = useMidiLibrary();

  const filteredMidiFiles = useMemo(() => {
    if (!searchTerm) return files;
    return files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm]);

  const handleMidiClick = async (file: MidiFile) => {
    // Fetch and Parse
    const url = await file.loadUrl();
    const midi = await Midi.fromUrl(url);

    // Extract Chords logic
    const timeSlots: { [time: string]: any[] } = {};
    midi.tracks.forEach(track => {
      track.notes.forEach(note => {
        const time = note.time.toFixed(2);
        if (!timeSlots[time]) timeSlots[time] = [];
        timeSlots[time].push(note);
      });
    });

    const times = Object.keys(timeSlots).sort((a, b) => parseFloat(a) - parseFloat(b));

    const detailedChords = times.map(time => {
      const notes = timeSlots[time];
      notes.sort((a, b) => a.midi - b.midi);
      const root = notes[0];
      return {
        time: parseFloat(time),
        notes: notes.map(n => n.midi),
        root: root.name,
        label: '?'
      };
    });

    onImportMidi?.({
      key: file.key,
      chords: file.progression?.split(' ') || [],
      detailedChords,
      name: file.name,
      style: file.style,
      mood: file.mood
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-cyan-400">◆</span>
          Library
        </h2>
        <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeTab === 'presets' ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/40 hover:text-white'}`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeTab === 'library' ? 'bg-purple-500/20 text-purple-300' : 'text-white/40 hover:text-white'}`}
          >
            MIDI Files
          </button>
        </div>
      </div>

      {activeTab === 'presets' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => onSelectPreset(preset)}
              className={`
                preset-card
                p-3 rounded-xl text-left
                bg-gradient-to-br ${(preset.genre && GENRE_COLORS[preset.genre]) || 'from-gray-500/20 to-slate-500/20 border-gray-500/30'}
              `}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-medium text-white truncate">
                  {preset.name}
                </span>
              </div>
              <span className={`
                text-[10px] px-1.5 py-0.5 rounded-full
                ${(preset.genre && GENRE_BADGES[preset.genre]) || 'bg-gray-500/30 text-gray-200'}
              `}>
                {preset.genre || 'Custom'}
              </span>
              <div className="text-xs text-white/50 mt-2 truncate">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search MIDI files..."
            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
            {filteredMidiFiles.slice(0, 50).map((file, i) => (
              <button
                key={i}
                onClick={() => handleMidiClick(file)}
                className="group p-3 rounded-xl text-left bg-gray-800/50 hover:bg-purple-900/20 border border-white/5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileMusic className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white truncate w-full">{file.key} Play</span>
                </div>
                <div className="text-xs text-white/60 truncate" title={file.progression}>
                  {file.progression}
                </div>
                <div className="text-[10px] text-white/30 mt-1 truncate">
                  {file.style} • {file.mood}
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-center text-white/30">
            {filteredMidiFiles.length} files found
          </div>
        </div>
      )}
    </div>
  );
}
