import { useEffect, useRef, useState } from 'react';
import * as Note from '@tonaljs/note';
import { Mic, ChevronDown } from 'lucide-react';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { createPitchPipeline } from '../../../core/audio/pitchDetection';
import { frequencyToNote, type NoteInfo } from '../../../core/audio/frequencyToNote';
import { UnifiedPiano } from '../../../components/shared/UnifiedPiano';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { INSTRUMENT_PROFILES } from '../../../core/audio/instrumentProfiles';
import { TunerBar } from '../../../components/shared/TunerBar';

/** Show note when certainty is good (lower = more trigger for singing/guitar; avoid too low or glitches). */
const CLARITY_THRESHOLD = 0.62;
/** How long (ms) to keep the last note visible after pitch is lost — shorter = snappier, reactive. */
const RELEASE_MS = 100;
/** If no valid pitch for this long (ms), clear display — avoids notes stuck when pipeline holds last pitch. */
const STALE_MS = 500;
/** Octave range for the strip; wide enough to show most sung/played notes */
const OCTAVE_RANGE: [number, number] = [2, 6];

/**
 * Small bottom piano strip that shows the note the mic algorithm recognises in real time.
 * Uses createPitchPipeline so we get pitch from high-performance store or legacy autocorrelation.
 * Includes a microphone device selector so the user can ensure the correct input is used.
 */
export function MicPianoVisualizer() {
    const { stream, isActive, currentDeviceLabel, getAudioInputDevices, setPreferredDeviceId, start, stop } = useMicrophone();
    const selectedInstrumentId = useITMPitchStore((s) => s.selectedInstrumentId);
    const setInstrumentProfile = useITMPitchStore((s) => s.setInstrumentProfile);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [showDeviceList, setShowDeviceList] = useState(false);
    const [deviceError, setDeviceError] = useState<string | null>(null);
    const [liveNoteInfo, setLiveNoteInfo] = useState<NoteInfo | null>(null);
    const [liveMidi, setLiveMidi] = useState<number | null>(null);
    const pipelineRef = useRef<ReturnType<typeof createPitchPipeline> | null>(null);
    const releaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const staleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastValidPitchTimeRef = useRef<number>(0);
    const hasDisplayedNoteRef = useRef<boolean>(false);
    const lastDetectedRef = useRef<{ note: string; midi: number } | null>(null);

    const clearDisplayRef = useRef(() => {
        if (releaseTimeoutRef.current) {
            clearTimeout(releaseTimeoutRef.current);
            releaseTimeoutRef.current = null;
        }
        lastDetectedRef.current = null;
        hasDisplayedNoteRef.current = false;
        setLiveNoteInfo(null);
        setLiveMidi(null);
    });

    const loadDevices = async () => {
        const list = await getAudioInputDevices();
        setDevices(list);
    };

    const selectDevice = async (deviceId: string | null) => {
        setDeviceError(null);
        setPreferredDeviceId(deviceId ?? null);
        setShowDeviceList(false);
        stop();
        try {
            await start();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Could not use that microphone';
            setDeviceError(msg);
        }
    };

    useEffect(() => {
        if (showDeviceList && devices.length === 0) void loadDevices();
    }, [showDeviceList]);

    useEffect(() => {
        if (!stream || !stream.active) {
            if (releaseTimeoutRef.current) {
                clearTimeout(releaseTimeoutRef.current);
                releaseTimeoutRef.current = null;
            }
            if (staleCheckRef.current) {
                clearInterval(staleCheckRef.current);
                staleCheckRef.current = null;
            }
            if (pipelineRef.current) {
                pipelineRef.current.stop();
                pipelineRef.current = null;
            }
            hasDisplayedNoteRef.current = false;
            lastDetectedRef.current = null;
            setLiveNoteInfo(null);
            setLiveMidi(null);
            return;
        }

        let pipeline: ReturnType<typeof createPitchPipeline>;
        try {
            pipeline = createPitchPipeline(stream);
        } catch (err) {
            console.error('[Mic] piano visualizer: createPitchPipeline failed', err);
            return;
        }
        pipelineRef.current = pipeline;
        pipeline.start((result) => {
            if (releaseTimeoutRef.current) {
                clearTimeout(releaseTimeoutRef.current);
                releaseTimeoutRef.current = null;
            }
            if (result && result.frequency > 0 && result.clarity >= CLARITY_THRESHOLD) {
                const info = frequencyToNote(result.frequency);
                if (!info) {
                    scheduleRelease();
                    return;
                }
                const midi = Note.midi(info.noteName);
                if (midi != null) {
                    lastValidPitchTimeRef.current = Date.now();
                    lastDetectedRef.current = { note: info.pitchClass, midi };
                    hasDisplayedNoteRef.current = true;
                    setLiveNoteInfo(info);
                    setLiveMidi(midi);
                } else {
                    scheduleRelease();
                }
            } else {
                scheduleRelease();
            }
        });

        function scheduleRelease() {
            if (releaseTimeoutRef.current) return;
            releaseTimeoutRef.current = setTimeout(() => clearDisplayRef.current(), RELEASE_MS);
        }

        staleCheckRef.current = setInterval(() => {
            if (!hasDisplayedNoteRef.current) return;
            if (Date.now() - lastValidPitchTimeRef.current > STALE_MS) {
                clearDisplayRef.current();
            }
        }, 200);

        return () => {
            if (releaseTimeoutRef.current) {
                clearTimeout(releaseTimeoutRef.current);
                releaseTimeoutRef.current = null;
            }
            if (staleCheckRef.current) {
                clearInterval(staleCheckRef.current);
                staleCheckRef.current = null;
            }
            pipeline.stop();
            pipelineRef.current = null;
            clearDisplayRef.current();
        };
    }, [stream]);

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-2 bg-neutral-900/95 border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
            aria-live="polite"
            aria-label={liveNoteInfo ? `Live pitched note: ${liveNoteInfo.pitchClass}${liveNoteInfo.octave}` : 'Microphone listening'}
        >
            <div className="flex flex-col gap-1 shrink-0 min-w-[120px]">
                <div className="flex items-center gap-2">
                    <Mic className={`h-5 w-5 shrink-0 ${isActive ? 'text-red-400' : 'text-neutral-500'}`} aria-hidden />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Live Pitched Note</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-emerald-400 font-mono tabular-nums min-h-7">
                        {liveNoteInfo ? (
                            <>
                                <span>{liveNoteInfo.pitchClass}</span>
                                <span className="text-emerald-600 font-bold ml-0.5">{liveNoteInfo.octave}</span>
                            </>
                        ) : (
                            isActive && stream ? '…' : '—'
                        )}
                    </span>
                    {liveNoteInfo && (
                        <span className={`text-[10px] font-mono ${Math.abs(liveNoteInfo.centsDeviation) < 10 ? 'text-emerald-500' : 'text-amber-400'}`}>
                            {liveNoteInfo.centsDeviation > 0 ? '+' : ''}{liveNoteInfo.centsDeviation.toFixed(0)}c
                        </span>
                    )}
                </div>
                {liveNoteInfo && (
                    <TunerBar
                        cents={liveNoteInfo.centsDeviation}
                        className="w-16 md:w-24"
                        showValue={false}
                    />
                )}
            </div>
            <div className="relative shrink-0 flex flex-col items-end gap-0.5">
                <label htmlFor="instrument-select" className="sr-only">Target source</label>
                <select
                    id="instrument-select"
                    value={selectedInstrumentId}
                    onChange={(e) => setInstrumentProfile(e.target.value)}
                    className="text-[10px] font-medium text-neutral-400 bg-white/5 border border-white/10 rounded px-2 py-1 uppercase tracking-wider cursor-pointer hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 max-w-[160px]"
                    title="Instrument profile: constrains fmin/fmax and confidence for best pitch detection"
                >
                    {Object.entries(INSTRUMENT_PROFILES).map(([key, profile]) => (
                        <option key={key} value={key}>
                            {profile.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => { setShowDeviceList((v) => !v); setDeviceError(null); if (!showDeviceList) void loadDevices(); }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs border border-white/10"
                    title="Select microphone (use default or pick one to avoid MIDI/playback)"
                >
                    <span className="max-w-[140px] truncate">{currentDeviceLabel || 'Select mic…'}</span>
                    <ChevronDown size={12} className={showDeviceList ? 'rotate-180' : ''} />
                </button>
                {deviceError && (
                    <span className="text-[10px] text-amber-400 max-w-[160px] truncate" title={deviceError}>{deviceError}</span>
                )}
                {showDeviceList && (
                    <>
                        <div className="absolute left-0 top-full mt-1 py-1 rounded-lg bg-neutral-800 border border-white/10 shadow-xl z-50 min-w-[200px] max-h-48 overflow-y-auto">
                            <p className="px-3 py-1.5 text-[10px] text-neutral-500 uppercase tracking-wider">Microphone (avoid system/playback)</p>
                            <button
                                type="button"
                                onClick={() => selectDevice(null)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white"
                            >
                                Use default
                            </button>
                            {devices.length === 0 && <p className="px-3 py-2 text-xs text-neutral-500">Loading… Grant mic access if needed.</p>}
                            {devices.map((d) => (
                                <button
                                    key={d.deviceId}
                                    type="button"
                                    onClick={() => selectDevice(d.deviceId)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white truncate"
                                    title={d.label || d.deviceId}
                                >
                                    {d.label || `Device ${d.deviceId.slice(0, 8)}`}
                                </button>
                            ))}
                        </div>
                        <div className="fixed inset-0 z-40" aria-hidden onClick={() => setShowDeviceList(false)} />
                    </>
                )}
            </div>
            <div className="flex-1 min-w-0 h-[72px] md:h-[80px] overflow-hidden relative shrink-0">
                <div className="absolute bottom-0 left-0 right-0 h-[200px] origin-bottom scale-y-[0.36] md:scale-y-[0.4]">
                    <UnifiedPiano
                        mode="display"
                        octaveRange={OCTAVE_RANGE}
                        activeNotes={liveMidi != null ? [liveMidi] : []}
                        showLabels="none"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}
