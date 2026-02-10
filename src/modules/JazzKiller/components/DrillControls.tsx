import { Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';

interface DrillControlsProps {
    onToggleChords: () => void;
    onTogglePiano: () => void;
    onToggleBass: () => void;
    chordsVisible: boolean;
    pianoMuted: boolean;
    bassMuted: boolean;
}

export function DrillControls({
    onToggleChords,
    onTogglePiano,
    onToggleBass,
    chordsVisible,
    pianoMuted,
    bassMuted
}: DrillControlsProps) {
    return (
        <div className="flex gap-2 p-2 bg-black/40 rounded-xl border border-white/10">
            <button
                onClick={onToggleChords}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chordsVisible ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400'
                    }`}
                title="Toggle Chord Visibility"
            >
                {chordsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                Chords
            </button>
            <button
                onClick={onTogglePiano}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pianoMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                    }`}
                title="Mute Piano"
            >
                {pianoMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                Piano
            </button>
            <button
                onClick={onToggleBass}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${bassMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                    }`}
                title="Mute Bass"
            >
                {bassMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                Bass
            </button>
        </div>
    );
}
