import { Volume2, X } from 'lucide-react';
import { useSignals } from "@preact/signals-react/runtime";
import {
    pianoVolumeSignal,
    bassVolumeSignal,
    drumsVolumeSignal,
    pianoReverbSignal,
    reverbVolumeSignal
} from '../../../core/audio/audioSignals';

interface MixerProps {
    onClose: () => void;
}

export function Mixer({ onClose }: MixerProps) {
    useSignals();

    return (
        <div className="w-64 bg-neutral-900/80 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col gap-8 animate-in slide-in-from-right duration-300 shadow-2xl h-full fixed right-0 top-0 z-50">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <Volume2 size={16} className="text-amber-500" /> MIXER
                </h3>
                <button
                    onClick={onClose}
                    className="text-neutral-600 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2">
                {/* Piano Volume */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Piano</span>
                        <span className="text-xs font-mono text-amber-500">{pianoVolumeSignal.value}dB</span>
                    </div>
                    <input
                        type="range"
                        min="-60"
                        max="0"
                        step="1"
                        value={pianoVolumeSignal.value}
                        onChange={(e) => pianoVolumeSignal.value = Number(e.target.value)}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>

                {/* Piano Reverb */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Piano Reverb</span>
                        <span className="text-xs font-mono text-amber-500">{Math.round(pianoReverbSignal.value * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pianoReverbSignal.value}
                        onChange={(e) => pianoReverbSignal.value = Number(e.target.value)}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>

                {/* Bass Volume */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Double Bass</span>
                        <span className="text-xs font-mono text-amber-500">{bassVolumeSignal.value}dB</span>
                    </div>
                    <input
                        type="range"
                        min="-60"
                        max="0"
                        step="1"
                        value={bassVolumeSignal.value}
                        onChange={(e) => bassVolumeSignal.value = Number(e.target.value)}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>

                {/* Drums Volume */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Drums</span>
                        <span className="text-xs font-mono text-amber-500">{drumsVolumeSignal.value}dB</span>
                    </div>
                    <input
                        type="range"
                        min="-60"
                        max="0"
                        step="1"
                        value={drumsVolumeSignal.value}
                        onChange={(e) => drumsVolumeSignal.value = Number(e.target.value)}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>

                {/* Master Reverb Level */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">Master Reverb</span>
                        <span className="text-xs font-mono text-amber-500">{Math.round(reverbVolumeSignal.value * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={reverbVolumeSignal.value}
                        onChange={(e) => reverbVolumeSignal.value = Number(e.target.value)}
                        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
                <p className="text-[10px] text-neutral-600 leading-relaxed italic">
                    Pro tip: Lower the piano volume to practice your own comping.
                </p>
            </div>
        </div>
    );
}
