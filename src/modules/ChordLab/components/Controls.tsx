import { ALL_KEYS, SCALES } from '../../../core/theory';
import type { Style } from '../../../core/audio/globalAudio';
import { Sliders, Target } from 'lucide-react';

interface ControlsProps {
  selectedKey: string;
  selectedScale: string;
  selectedVoicing: string;
  selectedStyle: Style;
  bpm: number;
  isPlaying: boolean;
  onKeyChange: (key: string) => void;
  onScaleChange: (scale: string) => void;
  onVoicingChange: (voicing: string) => void;
  onStyleChange: (style: Style) => void;
  onBpmChange: (bpm: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onExportMidi: () => void;
  // Looping & Transpose
  isLooping: boolean;
  onLoopToggle: () => void;
  transposeSettings: { enabled: boolean; interval: number; step: number };
  onTransposeSettingsChange: (settings: { enabled: boolean; interval: number; step: number }) => void;
  // Mixer & Tips
  showMixer: boolean;
  onMixerToggle: () => void;
  showPracticeTips: boolean;
  onPracticeTipsToggle: () => void;
}

const VOICINGS = ['Root Position', '1st Inversion', '2nd Inversion', 'Open Voicing', 'Drop 2'];

export function Controls({
  selectedKey,
  selectedScale,
  selectedVoicing,
  selectedStyle,
  bpm,
  isPlaying,
  onKeyChange,
  onScaleChange,
  onVoicingChange,
  onStyleChange,
  onBpmChange,
  onPlay,
  onStop,
  onExportMidi,
  isLooping,
  onLoopToggle,
  transposeSettings,
  onTransposeSettingsChange,
  showMixer,
  onMixerToggle,
  showPracticeTips,
  onPracticeTipsToggle
}: ControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* ... (rest of the selectors) ... */}
        {/* Key Selection */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">Key</label>
          <select
            value={selectedKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            {ALL_KEYS.map((note) => (
              <option key={note} value={note} className="bg-gray-900">
                {note}
              </option>
            ))}
          </select>
        </div>

        {/* Scale Selection */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">Scale</label>
          <select
            value={selectedScale}
            onChange={(e) => onScaleChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            {Object.keys(SCALES).map((scale) => (
              <option key={scale} value={scale} className="bg-gray-900">
                {scale}
              </option>
            ))}
          </select>
        </div>

        {/* Voicing Selection */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">Voicing</label>
          <select
            value={selectedVoicing}
            onChange={(e) => onVoicingChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            {VOICINGS.map((voicing) => (
              <option key={voicing} value={voicing} className="bg-gray-900">
                {voicing}
              </option>
            ))}
          </select>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">Style</label>
          <select
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value as any)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            {['None', 'Jazz', 'Swing', 'Bossa', 'Ballad', 'Guitar'].map((style) => (
              <option key={style} value={style} className="bg-gray-900">
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* BPM */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">BPM</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="40"
              max="200"
              value={bpm}
              onChange={(e) => onBpmChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
            <span className="text-white text-sm w-10 text-right">{bpm}</span>
          </div>
        </div>


        {/* Playback Controls */}
        <div className="flex items-end gap-2">
          <button
            onClick={isPlaying ? onStop : onPlay}
            className={`
              btn-glow flex-1 py-2 rounded-lg font-semibold text-sm
              transition-all duration-200
              ${isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'}
            `}
          >
            {isPlaying ? '■ Stop' : '▶ Play'}
          </button>
          <button
            onClick={onPracticeTipsToggle}
            className={`btn-glow p-2 rounded-lg transition-colors ${showPracticeTips ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            title="Guided Practice"
          >
            <Target size={18} />
          </button>
          <button
            onClick={onMixerToggle}
            className={`btn-glow p-2 rounded-lg transition-colors ${showMixer ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            title="Toggle Mixer"
          >
            <Sliders size={18} />
          </button>
          <button
            onClick={onExportMidi}
            className="btn-glow px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
            title="Export MIDI"
          >
            ↓ MIDI
          </button>
        </div>
      </div>

      {/* Expanded Controls: Looping & Auto-Transpose */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Looping Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isLooping ? 'bg-purple-500' : 'bg-white/10 group-hover:bg-white/20'}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isLooping ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" checked={isLooping} onChange={onLoopToggle} className="hidden" />
            <span className={`text-sm font-medium ${isLooping ? 'text-white' : 'text-white/50'}`}>Loop</span>
          </label>
        </div>

        {/* Auto Transpose Settings */}
        <div className={`flex items-center gap-4 transition-opacity ${isLooping ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${transposeSettings.enabled ? 'bg-cyan-500 border-cyan-500' : 'border-white/30 bg-transparent'}`}>
              {transposeSettings.enabled && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input
              type="checkbox"
              checked={transposeSettings.enabled}
              onChange={() => onTransposeSettingsChange({ ...transposeSettings, enabled: !transposeSettings.enabled })}
              className="hidden"
            />
            <span className={`text-sm font-medium ${transposeSettings.enabled ? 'text-cyan-400' : 'text-white/50'}`}>Auto-Transpose</span>
          </label>

          {transposeSettings.enabled && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Every</span>
              <input
                type="number"
                min="1"
                max="16"
                value={transposeSettings.interval}
                onChange={(e) => onTransposeSettingsChange({ ...transposeSettings, interval: Math.max(1, parseInt(e.target.value)) })}
                className="w-10 bg-white/10 border border-white/20 rounded px-1 py-0.5 text-center text-white focus:outline-none focus:border-cyan-500"
              />
              <span>loops, shift</span>
              <select
                value={transposeSettings.step}
                onChange={(e) => onTransposeSettingsChange({ ...transposeSettings, step: parseInt(e.target.value) })}
                className="bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="1">+1 (Sem)</option>
                <option value="-1">-1 (Sem)</option>
                <option value="2">+2 (Tone)</option>
                <option value="-2">-2 (Tone)</option>
                <option value="5">+5 (4th)</option>
                <option value="7">+7 (5th)</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
