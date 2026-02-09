import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AudioProvider } from './context/AudioContext';
import { MidiProvider } from './context/MidiContext';
import ChordLab from './modules/ChordLab/ChordLab'; // Keep Core module eager for LCP
import Dashboard from './components/layout/Dashboard';
import { GlobalMidiHandler } from './components/GlobalMidiHandler';

// Lazy Load Heavy Modules
const BiTonalSandbox = lazy(() => import('./modules/BiTonalSandbox/BiTonalSandbox'));
const GripSequencer = lazy(() => import('./modules/GripSequencer/GripSequencer'));
const Tonnetz = lazy(() => import('./modules/Tonnetz/Tonnetz'));
const NegativeMirror = lazy(() => import('./modules/NegativeMirror/NegativeMirror'));
const BarryHarris = lazy(() => import('./modules/BarryHarris/BarryHarris'));
const RhythmArchitect = lazy(() => import('./modules/RhythmArchitect/RhythmArchitect'));
const FunctionalEarTraining = lazy(() => import('./modules/FunctionalEarTraining/FunctionalEarTraining').then(m => ({ default: m.FunctionalEarTraining })));
const CircleChords = lazy(() => import('./modules/CircleChords/CircleChordsModule'));
const MidiLibrary = lazy(() => import('./pages/MidiLibraryPage'));

const ChordBuildr = lazy(() => import('./modules/ChordBuildr/ChordBuildrModule'));
const ProgressionsPage = lazy(() => import('./pages/ProgressionsPage'));
const JazzKiller = lazy(() => import('./modules/JazzKiller/JazzKillerModule'));

function App() {
    return (
        <AudioProvider>
            <MidiProvider>
                <GlobalMidiHandler />
                <BrowserRouter>
                    <div className="h-screen w-screen bg-black text-white overflow-hidden font-sans">
                        <Routes>
                            <Route path="/" element={<Dashboard />}>
                                <Route index element={<ChordLab />} /> {/* Default View */}
                                <Route path="bi-tonal" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Sandbox...</div>}>
                                        <BiTonalSandbox />
                                    </Suspense>
                                } />
                                <Route path="grips" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Grips...</div>}>
                                        <GripSequencer />
                                    </Suspense>
                                } />
                                <Route path="tonnetz" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Tonnetz...</div>}>
                                        <Tonnetz />
                                    </Suspense>
                                } />
                                <Route path="negative-harmony" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Negative Harmony...</div>}>
                                        <NegativeMirror />
                                    </Suspense>
                                } />
                                <Route path="barry-harris" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Barry Harris...</div>}>
                                        <BarryHarris />
                                    </Suspense>
                                } />
                                <Route path="rhythm-architect" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Rhythm Architect...</div>}>
                                        <RhythmArchitect />
                                    </Suspense>
                                } />
                                <Route path="functional-ear-training" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Ear Training...</div>}>
                                        <FunctionalEarTraining />
                                    </Suspense>
                                } />
                                <Route path="circle-chords" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Circle Chords...</div>}>
                                        <CircleChords />
                                    </Suspense>
                                } />
                                <Route path="midi-library" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading MIDI Library...</div>}>
                                        <MidiLibrary />
                                    </Suspense>
                                } />
                                <Route path="chord-buildr" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Chord Builder...</div>}>
                                        <ChordBuildr />
                                    </Suspense>
                                } />
                                <Route path="progressions" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Progressions...</div>}>
                                        <ProgressionsPage />
                                    </Suspense>
                                } />
                                <Route path="jazz-standards" element={
                                    <Suspense fallback={<div className="p-10 text-white/50">Loading Jazz Standards...</div>}>
                                        <JazzKiller />
                                    </Suspense>
                                } />
                            </Route>
                        </Routes>
                    </div>
                </BrowserRouter>
            </MidiProvider>
        </AudioProvider>
    );
}

export default App;
