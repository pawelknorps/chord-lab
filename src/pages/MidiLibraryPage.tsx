import { useState, useMemo } from 'react';
import { useMidiLibrary, type MidiFile } from '../hooks/useMidiLibrary';
import { Midi } from '@tonejs/midi';
import { FileMusic, Search, Music, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MidiLibraryPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingFile, setLoadingFile] = useState<string | null>(null);

    // MIDI Library Hook
    const { files } = useMidiLibrary();

    const filteredMidiFiles = useMemo(() => {
        if (!searchTerm) return files;
        return files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [files, searchTerm]);

    const handleMidiClick = async (file: MidiFile) => {
        setLoadingFile(file.name);
        try {
            // Fetch and Parse
            const url = await file.loadUrl();
            const midi = await Midi.fromUrl(url);

            // Extract Chords logic (reused from PresetsPanel)
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

            const importData = {
                key: file.key,
                chords: file.progression?.split(' ') || [],
                detailedChords,
                name: file.name,
                style: file.style,
                mood: file.mood
            };

            // Navigate to ChordLab with state
            navigate('/', { state: { importMidi: importData } });
        } catch (e) {
            console.error("Failed to load MIDI", e);
        } finally {
            setLoadingFile(null);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Music className="w-8 h-8 text-purple-400" />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            MIDI Library
                        </span>
                    </h1>
                    <p className="text-white/50 mt-1">Explore and import chord progressions from MIDI files</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search by name, key, or style..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMidiFiles.map((file, i) => (
                    <button
                        key={i}
                        onClick={() => handleMidiClick(file)}
                        disabled={loadingFile === file.name}
                        className="group relative p-4 rounded-2xl text-left bg-gradient-to-br from-white/5 to-white/0 hover:from-purple-500/10 hover:to-pink-500/10 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                {loadingFile === file.name ? (
                                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                ) : (
                                    <FileMusic className="w-5 h-5 text-white/40 group-hover:text-purple-400 transition-colors" />
                                )}
                            </div>
                            <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
                                {file.key}
                            </div>
                        </div>

                        <h3 className="font-semibold text-lg text-white mb-1 truncate pr-8" title={file.name}>
                            {file.name}
                        </h3>

                        <div className="text-sm text-white/40 truncate mb-4 font-mono">
                            {file.progression}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/30">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                {file.style}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                {file.mood}
                            </span>
                        </div>

                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <div className="flex items-center gap-1 text-purple-400 text-sm font-medium">
                                <span>Import</span>
                                <Play className="w-3 h-3 fill-current" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="text-center text-white/20 text-sm py-8">
                Showing {filteredMidiFiles.length} of {files.length} progressions
            </div>
        </div>
    );
}
