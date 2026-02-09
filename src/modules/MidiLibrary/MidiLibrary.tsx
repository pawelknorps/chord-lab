import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileMusic, Music2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useMidiLibrary, type GroupedProgression } from '../../hooks/useMidiLibrary';

const MidiLibrary: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [globalKey, setGlobalKey] = useState<string>('C');

    const { groupedProgressions, categories, styles, keys } = useMidiLibrary();

    const filteredProgressions = useMemo(() => {
        return groupedProgressions.filter(p => {
            if (selectedCategory && p.category !== selectedCategory) return false;
            if (selectedStyle && p.style !== selectedStyle) return false;
            if (searchTerm && !p.progression.toLowerCase().includes(searchTerm.toLowerCase()) && !p.mood.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });
    }, [groupedProgressions, selectedCategory, selectedStyle, searchTerm]);

    const handleLoadProgression = async (group: GroupedProgression) => {
        if (!isReady) await startAudio();

        // Use the selected global key if available in this group, otherwise fallback to first available
        const keyToUse = group.availableKeys.includes(globalKey) ? globalKey : group.availableKeys[0];
        const file = group.keyMap[keyToUse];

        if (!file) return;

        // Parse progression string "I IV V" -> ["I", "IV", "V"]
        const chords = (file.progression || '').split(' ').filter(c => c.trim().length > 0);

        navigate('/', {
            state: {
                importedProgression: {
                    key: file.key,
                    chords: chords,
                    name: file.name,
                    style: file.style,
                    mood: file.mood
                }
            }
        });
    };

    return (
        <div className="h-full flex flex-col bg-black text-white p-6 md:p-10 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">MIDI Library</h2>
                        <p className="text-white/40">Explore unique harmonic structures across all keys.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-xs uppercase tracking-widest text-white/50 font-bold">Transpose All To</span>
                        <select
                            className="bg-purple-600 text-white font-bold px-4 py-2 rounded-xl border-none focus:ring-2 ring-purple-400 transition-all cursor-pointer"
                            value={globalKey}
                            onChange={e => setGlobalKey(e.target.value)}
                        >
                            {keys.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="flex-1 min-w-[300px] relative">
                        <input
                            type="text"
                            placeholder="Search progressions or moods..."
                            className="bg-black/40 p-4 pl-12 rounded-2xl text-white border border-white/10 w-full focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <FileMusic className="absolute left-4 top-4.5 text-white/20" size={20} />
                    </div>

                    <select
                        className="bg-black/40 p-4 rounded-2xl text-white border border-white/10 focus:border-purple-500 outline-none transition-all cursor-pointer min-w-[160px]"
                        onChange={e => setSelectedCategory(e.target.value || null)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        className="bg-black/40 p-4 rounded-2xl text-white border border-white/10 focus:border-purple-500 outline-none transition-all cursor-pointer min-w-[160px]"
                        onChange={e => setSelectedStyle(e.target.value || null)}
                    >
                        <option value="">All Styles</option>
                        {styles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProgressions.map((prog) => (
                            <div
                                key={prog.id}
                                className="bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                                onClick={() => handleLoadProgression(prog)}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Music2 size={80} />
                                </div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] uppercase tracking-tighter bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 border border-purple-500/30 font-bold">{prog.category}</span>
                                        <span className="text-[10px] uppercase tracking-tighter bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 border border-blue-500/30 font-bold">{prog.style}</span>
                                    </div>
                                    <div className="text-xs text-white/40 font-mono">{globalKey}</div>
                                </div>

                                <div className="text-2xl font-black mb-2 text-white group-hover:text-purple-300 transition-colors uppercase tracking-tight">
                                    {prog.progression}
                                </div>

                                <div className="text-sm text-white/50 mb-6 italic">
                                    {prog.mood || 'Pure Harmony'}
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-white/30">
                                    <span>{prog.availableKeys.length} Keys available</span>
                                    <span className="group-hover:text-purple-400 transition-colors font-bold uppercase tracking-widest flex items-center gap-1">
                                        Load <span className="text-lg">→</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredProgressions.length === 0 && (
                        <div className="text-center py-20 text-white/20">
                            <FileMusic size={60} className="mx-auto mb-4 opacity-20" />
                            <p className="text-xl">No progressions found matching your search.</p>
                        </div>
                    )}
                </div>
                <div className="mt-8 py-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-center text-white/20 font-bold flex justify-between">
                    <span>Library Manifest v2.0</span>
                    <span>Showing {filteredProgressions.length} Unique Structures</span>
                    <span>Powered by Harmonic Intelligence</span>
                </div>
            </div>
        </div>
    );
};

export default MidiLibrary;
