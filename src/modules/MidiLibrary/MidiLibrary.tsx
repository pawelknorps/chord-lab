import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileMusic } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useMidiLibrary, type MidiFile } from '../../hooks/useMidiLibrary';

const MidiLibrary: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const { files, categories, styles, keys } = useMidiLibrary();

    const filteredFiles = useMemo(() => {
        return files.filter(f => {
            if (selectedCategory && f.category !== selectedCategory) return false;
            if (selectedStyle && f.style !== selectedStyle) return false;
            if (selectedKey && f.key !== selectedKey) return false;
            if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });
    }, [files, selectedCategory, selectedStyle, selectedKey, searchTerm]);

    const handleLoadProgression = async (file: MidiFile) => {
        if (!isReady) await startAudio();

        // Parse progression string "I IV V" -> ["I", "IV", "V"]
        const chords = file.progression?.split(' ') || [];

        console.log("Loading Progression:", file.key, chords);

        navigate('/', {
            state: {
                importedProgression: {
                    key: file.key,
                    chords: chords,
                    // Convert metadata to what ChordLab might expect or purely display
                    name: file.name,
                    style: file.style,
                    mood: file.mood
                }
            }
        });
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white p-6">
            <h2 className="text-3xl font-bold neon-text mb-6">MIDI Library</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search progressions..."
                    className="bg-gray-800 p-2 rounded text-white border border-gray-700 w-64"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                <select
                    className="bg-gray-800 p-2 rounded text-white border border-gray-700"
                    onChange={e => setSelectedCategory(e.target.value || null)}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    className="bg-gray-800 p-2 rounded text-white border border-gray-700"
                    onChange={e => setSelectedStyle(e.target.value || null)}
                >
                    <option value="">All Styles</option>
                    {styles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    className="bg-gray-800 p-2 rounded text-white border border-gray-700"
                    onChange={e => setSelectedKey(e.target.value || null)}
                >
                    <option value="">All Keys</option>
                    {keys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.slice(0, 100).map((file, i) => (
                    <div
                        key={i}
                        className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group"
                        onClick={() => handleLoadProgression(file)}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <FileMusic className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                            <span className="font-bold text-lg">{file.key}</span>
                        </div>
                        <div className="text-sm text-gray-300 truncate font-mono" title={file.progression}>{file.progression}</div>
                        <div className="text-xs text-gray-500 truncate mt-1">{file.mood}</div>

                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-purple-200 border border-purple-500/30">{file.category}</span>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-blue-200 border border-blue-500/30">{file.style}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-xs text-center text-gray-500">
                Showing {Math.min(filteredFiles.length, 100)} of {filteredFiles.length} files
            </div>
        </div>
    );
};

export default MidiLibrary;
