import type { Progression } from '../utils/musicTheory';
import { PRESETS } from '../utils/musicTheory';

interface PresetsPanelProps {
  onSelectPreset: (preset: Progression) => void;
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

export function PresetsPanel({ onSelectPreset }: PresetsPanelProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-cyan-400">◆</span>
        Presets
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
        {PRESETS.map((preset, index) => (
          <button
            key={index}
            onClick={() => onSelectPreset(preset)}
            className={`
              preset-card
              p-3 rounded-xl text-left
              bg-gradient-to-br ${GENRE_COLORS[preset.genre] || 'from-gray-500/20 to-slate-500/20 border-gray-500/30'}
            `}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-medium text-white truncate">
                {preset.name}
              </span>
            </div>
            <span className={`
              text-[10px] px-1.5 py-0.5 rounded-full
              ${GENRE_BADGES[preset.genre] || 'bg-gray-500/30 text-gray-200'}
            `}>
              {preset.genre}
            </span>
            <div className="text-xs text-white/50 mt-2 truncate">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
