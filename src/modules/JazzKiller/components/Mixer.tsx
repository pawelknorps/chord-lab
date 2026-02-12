import { X, Activity, Zap, Headphones, SlidersHorizontal, EyeOff, Radio, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSignals } from "@preact/signals-react/runtime";
import {
    pianoVolumeSignal,
    bassVolumeSignal,
    drumsVolumeSignal,
    pianoReverbSignal,
    reverbVolumeSignal,
    isPremiumEngineSignal,
    activityLevelSignal,
    soloistResponsiveEnabledSignal,
    soloistActivitySignal,
    proMixEnabledSignal,
    pianoMutedSignal,
    bassMutedSignal,
    drumsMutedSignal,
    pianoSoloSignal,
    bassSoloSignal,
    drumsSoloSignal
} from '../state/jazzSignals';
import { ToneSpectrumAnalyzer } from './ToneSpectrumAnalyzer';
import { AcousticFeedbackWidget } from './AcousticFeedbackWidget';

/** Set to true to show Tone Analysis (Acoustic Feedback: Warmth/Brightness) in the mixer. */
const ENABLE_TONE_ANALYSIS = false;

interface MixerProps {
    onClose: () => void;
}

export function Mixer({ onClose }: MixerProps) {
    useSignals();

    const tracks = [
        {
            id: 'piano',
            label: 'Piano',
            volume: pianoVolumeSignal,
            muted: pianoMutedSignal,
            solo: pianoSoloSignal,
            color: 'amber',
            icon: <Activity size={14} />
        },
        {
            id: 'bass',
            label: 'Double Bass',
            volume: bassVolumeSignal,
            muted: bassMutedSignal,
            solo: bassSoloSignal,
            color: 'blue',
            icon: <Headphones size={14} />
        },
        {
            id: 'drums',
            label: 'Drums',
            volume: drumsVolumeSignal,
            muted: drumsMutedSignal,
            solo: drumsSoloSignal,
            color: 'teal',
            icon: <Radio size={14} />
        }
    ];

    const toggleSolo = (trackId: string) => {
        tracks.forEach(track => {
            if (track.id === trackId) {
                track.solo.value = !track.solo.value;
            } else {
                track.solo.value = false;
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 h-full w-[380px] bg-neutral-950/90 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[200] flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                <div>
                    <h2 className="text-xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent flex items-center gap-3">
                        <SlidersHorizontal size={20} className="text-amber-500" />
                        MIXER
                    </h2>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">Per-track volume, mute, and solo</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                {/* Engine Mode Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">AI Engine</h3>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${isPremiumEngineSignal.value ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-500'}`}>
                            {isPremiumEngineSignal.value ? 'ACTIVE' : 'STANDARD'}
                        </span>
                    </div>

                    <button
                        onClick={() => isPremiumEngineSignal.value = !isPremiumEngineSignal.value}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group relative overflow-hidden ${isPremiumEngineSignal.value
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-white/5 border-white/5 grayscale'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${isPremiumEngineSignal.value ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                            <Zap size={20} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white">Full Generative Mode</h4>
                            <p className="text-[10px] text-neutral-500">Ron Carter Bass, Red Garland Phrasing, Nate Smith Drums. Multi-sampled HQ audio.</p>
                        </div>
                        {isPremiumEngineSignal.value && (
                            <motion.div
                                layoutId="active-glow"
                                className="absolute inset-0 bg-amber-500/5 -z-10"
                            />
                        )}
                    </button>
                </section>

                {/* Phase 19: Soloist-Responsive (Call-and-Response) — band listens to mic and steers density */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Soloist-Responsive</h3>
                        {soloistResponsiveEnabledSignal.value && (
                            <span className="text-[9px] font-mono text-emerald-500">{Math.round(soloistActivitySignal.value * 100)}% soloist</span>
                        )}
                    </div>
                    <button
                        onClick={() => soloistResponsiveEnabledSignal.value = !soloistResponsiveEnabledSignal.value}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group relative overflow-hidden ${soloistResponsiveEnabledSignal.value
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/5 border-white/5'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${soloistResponsiveEnabledSignal.value ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                            <Mic size={20} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white">Call-and-Response</h4>
                            <p className="text-[10px] text-neutral-500">Band leaves more space when you play, fills when you rest. Uses mic pitch.</p>
                        </div>
                    </button>
                </section>

                {/* Phase 22: Pro Mix – parallel dry/wet bus (REQ-HIFI-01, REQ-HIFI-02, REQ-HIFI-08) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Mastering</h3>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${proMixEnabledSignal.value ? 'bg-violet-500 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                            {proMixEnabledSignal.value ? 'PRO MIX' : 'FLAT'}
                        </span>
                    </div>
                    <button
                        onClick={() => proMixEnabledSignal.value = !proMixEnabledSignal.value}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group relative overflow-hidden ${proMixEnabledSignal.value
                            ? 'bg-violet-500/10 border-violet-500/30'
                            : 'bg-white/5 border-white/5'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${proMixEnabledSignal.value ? 'bg-violet-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                            <Sparkles size={20} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white">Pro Mix</h4>
                            <p className="text-[10px] text-neutral-500">Parallel dry + compressed wet. Keeps attack, adds body. Same level on/off.</p>
                        </div>
                    </button>
                </section>

                {/* Activity Level (driven by BPM 50–240 when tempo changes; slider can override) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Activity Level</h3>
                        <span className="text-xs font-mono font-bold text-amber-500">{Math.round(activityLevelSignal.value * 100)}%</span>
                    </div>

                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={activityLevelSignal.value}
                            onChange={(e) => activityLevelSignal.value = Number(e.target.value)}
                            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all hover:accent-amber-400"
                        />
                        <div className="flex justify-between text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                            <span>Mellow (Ballad)</span>
                            <span>Burning (Up-tempo)</span>
                        </div>
                    </div>
                </section>

                {/* Vertical Mixer Channels */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Live Channels</h3>

                    <div className="grid grid-cols-1 gap-4">
                        {tracks.map((track) => (
                            <div
                                key={track.id}
                                className={`p-4 rounded-2xl border transition-all ${track.solo.value ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' :
                                    track.muted.value ? 'bg-neutral-900 border-white/5 opacity-60' :
                                        'bg-white/5 border-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${track.color === 'amber' ? 'bg-amber-500/20 text-amber-500' :
                                            track.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-teal-500/20 text-teal-500'
                                            }`}>
                                            {track.icon}
                                        </div>
                                        <h4 className="font-bold text-sm">{track.label}</h4>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => toggleSolo(track.id)}
                                            className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${track.solo.value ? 'bg-indigo-500 text-white' : 'bg-white/5 text-neutral-500 hover:text-white'
                                                }`}
                                        >
                                            Solo
                                        </button>
                                        <button
                                            onClick={() => track.muted.value = !track.muted.value}
                                            className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${track.muted.value ? 'bg-red-500 text-white' : 'bg-white/5 text-neutral-500 hover:text-white'
                                                }`}
                                        >
                                            Mute
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="-60"
                                        max="0"
                                        step="1"
                                        value={track.muted.value ? -60 : track.volume.value}
                                        onChange={(e) => track.volume.value = Number(e.target.value)}
                                        className={`flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-neutral-800 ${track.color === 'amber' ? 'accent-amber-500' :
                                                track.color === 'blue' ? 'accent-blue-500' :
                                                    'accent-teal-500'
                                            }`}
                                    />
                                    <span className="text-[10px] font-mono font-bold text-neutral-500 min-w-[32px] text-right">
                                        {track.muted.value ? 'MUTE' : `${track.volume.value}dB`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FX Section */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Master Spatial / FX</h3>

                    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Piano Decay (Space)</span>
                                <span className="text-[10px] font-mono text-amber-500">{Math.round(pianoReverbSignal.value * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={pianoReverbSignal.value}
                                onChange={(e) => pianoReverbSignal.value = Number(e.target.value)}
                                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Global Wet/Dry</span>
                                <span className="text-[10px] font-mono text-amber-500">{Math.round(reverbVolumeSignal.value * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={reverbVolumeSignal.value}
                                onChange={(e) => reverbVolumeSignal.value = Number(e.target.value)}
                                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>
                    </div>
                </section>

                {ENABLE_TONE_ANALYSIS && (
                <>
                {/* Tone Analysis */}
                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Tone Analysis</h3>
                    <div className="space-y-4">
                        <ToneSpectrumAnalyzer />
                        <AcousticFeedbackWidget />
                    </div>
                </section>
                </>
                )}
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 border-t border-white/5 bg-black/40">
                <div className="flex items-center gap-3 text-neutral-600 text-[10px] font-medium leading-relaxed">
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 shrink-0">
                        <EyeOff size={14} />
                    </div>
                    <p>Track levels are visualized in real-time. Use Solo to isolate instruments for detailed study.</p>
                </div>
            </div>
        </motion.div>
    );
}
