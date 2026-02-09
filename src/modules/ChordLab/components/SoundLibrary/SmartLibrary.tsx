import { useState, useMemo } from 'react';
import { useMidiLibrary, type MidiFile } from '../../../../hooks/useMidiLibrary';
import { getAllJazzStandards } from '../../../../core/services/jazzLibrary';
import { PRESETS, type Progression } from '../../../../core/theory';
import { Midi } from '@tonejs/midi';
import {
    Library,
    Music2,
    BookMarked,
    User,
    Search,
    Play,
    Grid2X2,
    List,
    ArrowRight
} from 'lucide-react';

interface SmartLibraryProps {
    onSelectPreset: (preset: Progression) => void;
    onImportMidi?: (data: any) => void;
    userPresets?: Progression[];
}

type LibraryTab = 'collections' | 'standards' | 'midi' | 'user';

// --- Helper Functions ---
const parseMidiFile = async (file: MidiFile): Promise<any> => {
    const url = await file.loadUrl();
    const midi = await Midi.fromUrl(url);

    // Analyze MIDI for a quick summary (tracks, duration, initial chords)
    // This mirrors the logic in PresetsPanel but cleaner
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
        return {
            time: parseFloat(time),
            notes: notes.map(n => n.midi),
            root: notes[0].name,
        };
    });

    return {
        key: file.key,
        chords: file.progression?.split(' ') || [],
        detailedChords,
        name: file.name,
        style: file.style,
        mood: file.mood
    };
};


export function SmartLibrary({
    onSelectPreset,
    onImportMidi,
    userPresets
}: SmartLibraryProps) {
    const [activeTab, setActiveTab] = useState<LibraryTab>('collections');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Data Sources
    const { files: midiFiles } = useMidiLibrary();
    const jazzStandards = useMemo(() => getAllJazzStandards(), []);

    // Filtering Logic
    const filteredData = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();

        if (activeTab === 'collections') {
            return PRESETS.filter(p =>
                p.name.toLowerCase().includes(lowerSearch) ||
                (p.genre?.toLowerCase().includes(lowerSearch))
            );
        }
        if (activeTab === 'standards') {
            return jazzStandards.filter(s =>
                s.name.toLowerCase().includes(lowerSearch) ||
                (s.description?.toLowerCase().includes(lowerSearch))
            );
        }
        if (activeTab === 'midi') {
            return midiFiles.filter(f =>
                f.name.toLowerCase().includes(lowerSearch) ||
                (f.style?.toLowerCase().includes(lowerSearch)) ||
                (f.key?.toLowerCase().includes(lowerSearch))
            );
        }
        if (activeTab === 'user') {
            return userPresets?.filter(p =>
                p.name.toLowerCase().includes(lowerSearch)
            ) || [];
        }
        return [];
    }, [activeTab, searchTerm, midiFiles, jazzStandards, userPresets]);


    // Action Handlers
    const handleMidiImport = async (file: MidiFile) => {
        if (!onImportMidi) return;
        try {
            const data = await parseMidiFile(file);
            onImportMidi(data);
        } catch (err) {
            console.error("Failed to import MIDI", err);
        }
    };

    return (
        <div className="flex h-full bg-[#0f0f1a] rounded-2xl overflow-hidden glass-panel border border-white/10">

            {/* --- Sidebar Navigation --- */}
            <div className="w-16 md:w-56 bg-black/20 flex flex-col border-r border-white/5 flex-shrink-0">
                <div className="p-4 md:p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white hidden md:flex items-center gap-2">
                        <Library className="text-cyan-400" />
                        Library
                    </h2>
                    <Library className="text-cyan-400 md:hidden w-6 h-6 mx-auto" />
                </div>

                <nav className="flex-grow p-2 space-y-2">
                    <SidebarItem
                        active={activeTab === 'collections'}
                        onClick={() => setActiveTab('collections')}
                        icon={<Grid2X2 size={20} />}
                        label="Collections"
                        count={PRESETS.length}
                    />
                    <SidebarItem
                        active={activeTab === 'standards'}
                        onClick={() => setActiveTab('standards')}
                        icon={<BookMarked size={20} />}
                        label="Real Book"
                        count={jazzStandards.length}
                    />
                    <SidebarItem
                        active={activeTab === 'midi'}
                        onClick={() => setActiveTab('midi')}
                        icon={<Music2 size={20} />}
                        label="MIDI Vault"
                        count={midiFiles.length}
                    />
                    <SidebarItem
                        active={activeTab === 'user'}
                        onClick={() => setActiveTab('user')}
                        icon={<User size={20} />}
                        label="User Saved"
                        count={userPresets?.length || 0}
                    />
                </nav>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-grow flex flex-col min-w-0">

                {/* Toolbar */}
                <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-white/5">
                    {/* Search */}
                    <div className="relative w-64 md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/20"
                        />
                    </div>

                    {/* View Toggles */}
                    <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-white/30 hover:text-white'}`}
                        >
                            <Grid2X2 size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-white/30 hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Grid/List */}
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-gradient-to-br from-black/20 to-transparent">

                    {/* Header Stats */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-white text-lg font-medium flex items-center gap-2">
                            <span className="text-cyan-400 font-bold">
                                {activeTab === 'collections' && 'Essential Progressions'}
                                {activeTab === 'standards' && 'Jazz Standards'}
                                {activeTab === 'midi' && 'MIDI Progressions'}
                                {activeTab === 'user' && 'My Saved Chords'}
                            </span>
                            <span className="text-white/30 text-sm font-normal">
                                ({filteredData.length} items)
                            </span>
                        </h3>
                    </div>

                    {/* Grid View */}
                    <div className={`
            grid gap-4 
            ${viewMode === 'grid'
                            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                            : 'grid-cols-1'}
          `}>
                        {filteredData.slice(0, 200).map((item: any, index: number) => (
                            <LibraryCard
                                key={index}
                                item={item}
                                type={activeTab}
                                viewMode={viewMode}
                                onClick={() => {
                                    if (activeTab === 'midi') {
                                        handleMidiImport(item);
                                    } else {
                                        onSelectPreset(item);
                                    }
                                }}
                            />
                        ))}
                    </div>

                    {filteredData.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-white/30">
                            <Search size={48} className="mb-4 opacity-50" />
                            <p>No results found for "{searchTerm}"</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

// --- Sub-components ---

function SidebarItem({ active, onClick, icon, label, count }: any) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        group relative overflow-hidden
        ${active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'}
      `}
        >
            <div className={`relative z-10 transition-transform group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
                {icon}
            </div>
            <span className="hidden md:block font-medium relative z-10 text-sm">{label}</span>
            {/* Count Badge */}
            <div className={`
        hidden md:flex ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full
        ${active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-white/30'}
      `}>
                {count}
            </div>

            {/* Active Glow */}
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-50" />
            )}
        </button>
    );
}

function LibraryCard({ item, type, viewMode, onClick }: any) {
    // Determine Stylings based on item type
    let accentColor = 'border-white/10 hover:border-white/30';
    let bgGradient = 'from-white/5 to-transparent';
    let badgeColor = 'bg-white/10 text-white/50';
    let Icon = Music2;

    if (type === 'collections') {
        accentColor = 'border-pink-500/30 hover:border-pink-400/50';
        bgGradient = 'from-pink-500/10 to-transparent';
        badgeColor = 'bg-pink-500/20 text-pink-300';
        Icon = Grid2X2;
    } else if (type === 'standards') {
        accentColor = 'border-amber-500/30 hover:border-amber-400/50';
        bgGradient = 'from-amber-500/10 to-transparent';
        badgeColor = 'bg-amber-500/20 text-amber-300';
        Icon = BookMarked;
    } else if (type === 'midi') {
        accentColor = 'border-purple-500/30 hover:border-purple-400/50';
        bgGradient = 'from-purple-500/10 to-transparent';
        badgeColor = 'bg-purple-500/20 text-purple-300';
        Icon = Music2;
    }

    const title = item.name || item.key || 'Untitled';
    const subtitle = item.description || item.style || item.genre || 'Unknown';
    const meta = item.key ? `Key: ${item.key}` : (item.chords?.length ? `${item.chords.length} Chords` : '');

    if (viewMode === 'list') {
        return (
            <button
                onClick={onClick}
                className={`
          flex items-center gap-4 w-full p-3 rounded-lg border bg-black/20 hover:bg-white/5 
          transition-all group ${accentColor}
        `}
            >
                <div className={`p-2 rounded-lg ${badgeColor}`}>
                    <Icon size={18} />
                </div>
                <div className="text-left flex-grow">
                    <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{title}</h4>
                    <p className="text-white/40 text-xs">{subtitle}</p>
                </div>
                {meta && (
                    <div className="text-white/30 text-xs px-3 py-1 rounded-full border border-white/5">
                        {meta}
                    </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={16} className="text-white/50" />
                </div>
            </button>
        )
    }

    return (
        <button
            onClick={onClick}
            className={`
        relative flex flex-col p-4 rounded-xl text-left h-32 md:h-40
        border transition-all duration-300 group overflow-hidden
        bg-gradient-to-br ${bgGradient}
        ${accentColor}
        hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-900/10
      `}
        >
            {/* Top Meta */}
            <div className="flex justify-between items-start mb-auto relative z-10 w-full">
                <div className={`p-1.5 rounded-lg ${badgeColor} backdrop-blur-sm`}>
                    <Icon size={14} />
                </div>
                {meta && (
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        {meta}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h4 className="text-white font-bold mb-1 line-clamp-2 md:text-lg leading-tight group-hover:text-cyan-400 transition-colors">
                    {title}
                </h4>
                <p className="text-white/50 text-xs line-clamp-1">
                    {subtitle}
                </p>
            </div>

            {/* Action Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                <div className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Play size={12} fill="currentColor" />
                    LOAD
                </div>
            </div>
        </button>
    );
}
