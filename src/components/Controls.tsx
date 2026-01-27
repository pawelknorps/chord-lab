import { NOTE_NAMES, SCALES } from '../utils/musicTheory';
import type { SynthPreset } from '../utils/audioEngine';
import { SYNTH_PRESETS } from '../utils/audioEngine';

interface ControlsProps {
  selectedKey: string;
  selectedScale: string;
  selectedVoicing: string;
  selectedSound: SynthPreset;
  bpm: number;
  isPlaying: boolean;
  onKeyChange: (key: string) => void;
  onScaleChange: (scale: string) => void;
  onVoicingChange: (voicing: string) => void;
  onSoundChange: (sound: SynthPreset) => void;
  onBpmChange: (bpm: number) => void;
  onPlay: () => void;
  onStop: () => void;
  onExportMidi: () => void;
}

const VOICINGS = ['Root Position', '1st Inversion', '2nd Inversion', 'Open Voicing', 'Drop 2'];

export function Controls({
  selectedKey,
  selectedScale,
  selectedVoicing,
  selectedSound,
  bpm,
  isPlaying,
  onKeyChange,
  onScaleChange,
  onVoicingChange,
  onSoundChange,
  onBpmChange,
  onPlay,
  onStop,
  onExportMidi,
}: ControlsProps) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Key Selection */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">Key</label>
          <select
            value={selectedKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            {NOTE_NAMES.map((note) => (
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

        {/* Sound Selection */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5">Sound</label>
          <select
            value={selectedSound}
            onChange={(e) => onSoundChange(e.target.value as SynthPreset)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          >
            {Object.keys(SYNTH_PRESETS).map((preset) => (
              <option key={preset} value={preset} className="bg-gray-900">
                {preset}
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
            onClick={onExportMidi}
            className="btn-glow px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
            title="Export MIDI"
          >
            ↓ MIDI
          </button>
        </div>
      </div>
    </div>
  );
}
