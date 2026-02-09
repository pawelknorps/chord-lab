import { useState, useMemo } from 'react';
import type { Progression } from '../../../core/theory';
import { PRESETS } from '../../../core/theory';
import { useMidiLibrary, type MidiFile } from '../../../hooks/useMidiLibrary';
import { getAllJazzStandards } from '../../../core/services/jazzLibrary';
import { Midi } from '@tonejs/midi';
import { FileMusic, BookOpen, Trash2 } from 'lucide-react';

interface PresetsPanelProps {
  onSelectPreset: (preset: Progression) => void;
  onImportMidi?: (data: any) => void;
  userPresets?: Progression[];
  onDeleteUserPreset?: (index: number) => void;
}

const GENRE_COLORS: Record<string, string> = {
  'Pop': 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  'Jazz': 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  'Jazz Standard': 'from-amber-600/20 to-orange-600/20 border-amber-600/30',
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
  'Jazz Standard': 'bg-amber-600/30 text-amber-200',
  'Blues': 'bg-blue-500/30 text-blue-200',
  'Lo-fi': 'bg-cyan-500/30 text-cyan-200',
  'R&B': 'bg-purple-500/30 text-purple-200',
  'Classical': 'bg-emerald-500/30 text-emerald-200',
  'Flamenco': 'bg-red-500/30 text-red-200',
  'J-Pop': 'bg-fuchsia-500/30 text-fuchsia-200',
  'Rock': 'bg-gray-500/30 text-gray-200',
};

export function PresetsPanel({ onSelectPreset, onImportMidi, userPresets, onDeleteUserPreset }: PresetsPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'library' | 'jazz' | 'user'>('presets');
  const [searchTerm, setSearchTerm] = useState('');

  // MIDI Library Hook
  const { files } = useMidiLibrary();

  // Jazz Standards
  const jazzStandards = useMemo(() => getAllJazzStandards(), []);

  const filteredMidiFiles = useMemo(() => {
    if (activeTab !== 'library' || !searchTerm) return files;
    return files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm, activeTab]);

  const filteredJazzStandards = useMemo(() => {
    if (activeTab !== 'jazz') return jazzStandards;
    if (!searchTerm) return jazzStandards;
    return jazzStandards.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  }, [jazzStandards, searchTerm, activeTab]);

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
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col min-h-[500px]">
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-cyan-400 w-8 h-8" />
            Sound Library
          </h2>

          {/* Quick Search for Standards (Always visible if on Jazz tab or if needed) */}
          {activeTab === 'jazz' && (
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search 1300+ Standards..."
                autoFocus
                className="w-full bg-black/40 border border-amber-500/30 rounded-full px-4 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder:text-white/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <BookOpen className="absolute right-3 top-1.5 w-4 h-4 text-amber-500/50 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Big Tabs */}
        <div className="flex p-1 bg-black/20 rounded-xl">
          <button
            onClick={() => { setActiveTab('presets'); setSearchTerm(''); }}
            className={`flex-1 py-3 hover:bg-white/5 rounded-lg text-sm font-bold transition-all ${activeTab === 'presets' ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-900/20' : 'text-white/40'}`}
          >
            Presets
          </button>
          <button
            onClick={() => { setActiveTab('jazz'); setSearchTerm(''); }}
            className={`flex-1 py-3 hover:bg-white/5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'jazz' ? 'bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-900/20' : 'text-white/40'}`}
          >
            <BookOpen size={16} />
            Real Book
          </button>
          {userPresets && (
            <button
              onClick={() => { setActiveTab('user'); setSearchTerm(''); }}
              className={`flex-1 py-3 hover:bg-white/5 rounded-lg text-sm font-bold transition-all ${activeTab === 'user' ? 'bg-green-500/20 text-green-300 shadow-lg shadow-green-900/20' : 'text-white/40'}`}
            >
              My Presets
            </button>
          )}
          <button
            onClick={() => { setActiveTab('library'); setSearchTerm(''); }}
            className={`flex-1 py-3 hover:bg-white/5 rounded-lg text-sm font-bold transition-all ${activeTab === 'library' ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-900/20' : 'text-white/40'}`}
          >
            MIDI
          </button>
        </div>
      </div>

      {/* Content Area - Grow to fill space */}
      <div className="flex-grow overflow-hidden flex flex-col relative">
        {activeTab === 'presets' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow pb-4">
            {PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => onSelectPreset(preset)}
                className={`
                group relative
                p-4 rounded-xl text-left
                border transition-all duration-300
                bg-gradient-to-br ${(preset.genre && GENRE_COLORS[preset.genre]) || 'from-gray-700/40 to-slate-700/40 border-gray-600/50'}
                hover:scale-[1.02] hover:shadow-lg hover:brightness-110
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
        ) : activeTab === 'user' && userPresets ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow pb-4">
            {userPresets.length === 0 && <div className="col-span-full text-center text-white/30 py-8">No saved presets yet. Create one!</div>}
            {userPresets.map((preset, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={() => onSelectPreset(preset)}
                  className={`
                        w-full 
                        p-4 rounded-xl text-left
                        border transition-all duration-300
                        bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50
                        hover:scale-[1.02] hover:shadow-lg hover:brightness-110
                    `}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate pr-6">
                      {preset.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-green-200 bg-green-500/30 px-1.5 py-0.5 rounded-full inline-block">
                    User
                  </div>
                  <div className="text-xs text-white/50 mt-2 truncate">
                    {preset.description}
                  </div>
                </button>
                {onDeleteUserPreset && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteUserPreset(index); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Preset"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : activeTab === 'jazz' ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 mb-4">
              <input
                type="text"
                placeholder="Search Real Book (1300+ standards)..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow pb-4">
              {filteredJazzStandards.slice(0, 100).map((standard, i) => (
                <button
                  key={i}
                  onClick={() => onSelectPreset(standard)}
                  className="group p-4 rounded-xl text-left border transition-all duration-300 bg-gradient-to-br from-amber-700/40 to-orange-700/40 border-amber-600/50 hover:scale-[1.02] hover:shadow-lg hover:brightness-110"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-white truncate w-full">{standard.name}</span>
                  </div>
                  <div className="text-xs text-white/50 truncate">
                    {standard.description}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 truncate">
                    Key: {standard.description?.split('Key of ')[1] || '?'} • {standard.chords?.length || 0} chords
                  </div>
                </button>
              ))}
              {filteredJazzStandards.length === 0 && (
                <div className="col-span-full text-center text-white/30 py-4">
                  No standards found matching "{searchTerm}"
                </div>
              )}
            </div>
            <div className="text-xs text-center text-white/30 flex-shrink-0 mt-2">
              Showing {Math.min(filteredJazzStandards.length, 100)} of {filteredJazzStandards.length} standards
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0 mb-4">
              <input
                type="text"
                placeholder="Search MIDI files..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow pb-4">
              {filteredMidiFiles.slice(0, 50).map((file, i) => (
                <button
                  key={i}
                  onClick={() => handleMidiClick(file)}
                  className="group p-4 rounded-xl text-left border transition-all duration-300 bg-gradient-to-br from-purple-700/40 to-violet-700/40 border-purple-600/50 hover:scale-[1.02] hover:shadow-lg hover:brightness-110"
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
            <div className="text-xs text-center text-white/30 flex-shrink-0 mt-2">
              {filteredMidiFiles.length} files found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
