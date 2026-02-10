import { ALL_KEYS, SCALES } from '../../../core/theory';
import type { Style } from '../../../core/audio/globalAudio';
import {
  Play,
  Square,
  Repeat,
  Sliders,
  Target,
  Download,
  Keyboard,
  Music
} from 'lucide-react';

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
  // Visibility Toggles
  showPiano: boolean;
  onPianoToggle: (show: boolean) => void;
  showFretboard: boolean;
  onFretboardToggle: (show: boolean) => void;
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
  onPracticeTipsToggle,
  showPiano,
  onPianoToggle,
  showFretboard,
  onFretboardToggle
}: ControlsProps) {
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-4 shadow-sm">
      <div className="flex flex-col gap-4">

        {/* Row 1: Main Transport & Settings */}
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-4">

          {/* Play/Stop - Primary Action */}
          <div className="flex-none">
            <button
              onClick={isPlaying ? onStop : onPlay}
              className={`
                      h-10 px-6 rounded-md font-medium text-sm flex items-center gap-2 transition-all
                      ${isPlaying
                  ? 'bg-red-500/10 text-red-500 border border-red-500/50'
                  : 'bg-[var(--text-primary)] text-[var(--bg-app)] hover:bg-white'}
                    `}
            >
              {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>

          <div className="w-px h-10 bg-[var(--border-subtle)] mx-2 hidden lg:block"></div>

          {/* Key Selection */}
          <div className="flex-1 min-w-[80px] max-w-[120px]">
            <label className="text-cap block mb-1">Key</label>
            <select
              value={selectedKey}
              onChange={(e) => onKeyChange(e.target.value)}
              className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {ALL_KEYS.map((note) => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>

          {/* Scale Selection */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-cap block mb-1">Scale</label>
            <select
              value={selectedScale}
              onChange={(e) => onScaleChange(e.target.value)}
              className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {Object.keys(SCALES).map((scale) => (
                <option key={scale} value={scale}>{scale}</option>
              ))}
            </select>
          </div>

          {/* Style Selection */}
          <div className="flex-1 min-w-[100px]">
            <label className="text-cap block mb-1">Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value as any)}
              className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded px-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {['None', 'Jazz', 'Swing', 'Bossa', 'Ballad', 'Guitar'].map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          {/* BPM */}
          <div className="flex-1 min-w-[120px] max-w-[150px]">
            <label className="text-cap block mb-1">Tempo ({bpm})</label>
            <input
              type="range"
              min="40"
              max="200"
              value={bpm}
              onChange={(e) => onBpmChange(parseInt(e.target.value))}
              className="w-full h-1 bg-[var(--bg-surface)] rounded-full appearance-none cursor-pointer accent-[var(--text-primary)]"
            />
          </div>

          <div className="w-px h-10 bg-[var(--border-subtle)] mx-2 hidden lg:block"></div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPianoToggle(!showPiano)}
              className={`h-9 w-9 flex items-center justify-center rounded border transition-colors ${showPiano ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title="Toggle Piano"
            >
              <Keyboard size={16} />
            </button>
            <button
              onClick={() => onFretboardToggle(!showFretboard)}
              className={`h-9 w-9 flex items-center justify-center rounded border transition-colors ${showFretboard ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title="Toggle Fretboard"
            >
              <Music size={16} />
            </button>
            <div className="w-px h-6 bg-[var(--border-subtle)] mx-1"></div>
            <button
              onClick={onPracticeTipsToggle}
              className={`h-9 w-9 flex items-center justify-center rounded border transition-colors ${showPracticeTips ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title="Guided Practice"
            >
              <Target size={16} />
            </button>
            <button
              onClick={onMixerToggle}
              className={`h-9 w-9 flex items-center justify-center rounded border transition-colors ${showMixer ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              title="Toggle Mixer"
            >
              <Sliders size={16} />
            </button>
            <button
              onClick={onExportMidi}
              className="h-9 px-3 flex items-center gap-2 rounded border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] text-sm transition-colors"
              title="Export MIDI"
            >
              <Download size={14} /> MIDI
            </button>
          </div>
        </div>

        {/* Row 2: Advanced Settings (Voicing, Looping) */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[var(--border-subtle)]">
          {/* Voicing */}
          <div className="flex items-center gap-3">
            <span className="text-cap text-[var(--text-muted)]">Voicing:</span>
            <div className="flex gap-1">
              {VOICINGS.map((v) => (
                <button
                  key={v}
                  onClick={() => onVoicingChange(v)}
                  className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors ${selectedVoicing === v ? 'bg-[var(--text-primary)] text-[var(--bg-app)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  {v.replace(' Voicing', '').replace(' Position', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-4 bg-[var(--border-subtle)] mx-2"></div>

          {/* Looping */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLoopToggle}
              className={`flex items-center gap-2 text-xs font-medium transition-colors ${isLooping ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <Repeat size={14} /> Loop
            </button>

            {/* Auto Transpose */}
            <div className={`flex items-center gap-2 ${isLooping ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transposeSettings.enabled}
                  onChange={() => onTransposeSettingsChange({ ...transposeSettings, enabled: !transposeSettings.enabled })}
                  className="w-3 h-3 accent-[var(--accent)] rounded-sm"
                />
                <span className={`text-xs ${transposeSettings.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Auto-Transpose</span>
              </label>

              {transposeSettings.enabled && (
                <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)]">EVERY</span>
                  <input
                    type="number" value={transposeSettings.interval} min="1" max="16"
                    onChange={(e) => onTransposeSettingsChange({ ...transposeSettings, interval: Math.max(1, parseInt(e.target.value)) })}
                    className="w-8 h-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-center text-[var(--text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">LOOPS SHIFT</span>
                  <select
                    value={transposeSettings.step}
                    onChange={(e) => onTransposeSettingsChange({ ...transposeSettings, step: parseInt(e.target.value) })}
                    className="h-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)]"
                  >
                    <option value="1">+1 Sem</option>
                    <option value="-1">-1 Sem</option>
                    <option value="2">+2 Tone</option>
                    <option value="5">+5 4th</option>
                    <option value="7">+7 5th</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
