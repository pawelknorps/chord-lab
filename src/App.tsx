import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AudioProvider } from './context/AudioContext';
import { MidiProvider } from './context/MidiContext';
import { AuthProvider } from './context/AuthContext';
import ChordLab from './modules/ChordLab/ChordLab'; // Keep Core module eager for LCP
import Dashboard from './components/layout/Dashboard';
import { GlobalMidiHandler } from './components/GlobalMidiHandler';
import { SessionHUD } from './components/shared/SessionHUD';
import { PerformanceMonitor } from './components/shared/PerformanceMonitor';
import { ModuleSkeleton } from './components/shared/ModuleSkeleton';

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

const ProgressionsPage = lazy(() => import('./pages/ProgressionsPage'));
const JazzKiller = lazy(() => import('./modules/JazzKiller/JazzKillerModule'));

import { useSettingsStore } from './core/store/useSettingsStore';
import { useEffect } from 'react';

function App() {
    const theme = useSettingsStore(state => state.theme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <AuthProvider>
        <AudioProvider>
            <MidiProvider>
                <GlobalMidiHandler />
                <BrowserRouter>
                    <div className="h-screen w-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans">
                        <SessionHUD />

                        <div className="flex-1 min-h-0 overflow-hidden">
                            <Routes>
                                <Route path="/" element={<Dashboard />}>
                                    <Route index element={<ChordLab />} /> {/* Default View */}
                                    <Route path="bi-tonal" element={
                                        <Suspense fallback={<ModuleSkeleton label="Bi-Tonal Sandbox" />}>
                                            <BiTonalSandbox />
                                        </Suspense>
                                    } />
                                    <Route path="grips" element={
                                        <Suspense fallback={<ModuleSkeleton label="Grips" />}>
                                            <GripSequencer />
                                        </Suspense>
                                    } />
                                    <Route path="tonnetz" element={
                                        <Suspense fallback={<ModuleSkeleton label="Tonnetz" />}>
                                            <Tonnetz />
                                        </Suspense>
                                    } />
                                    <Route path="negative-harmony" element={
                                        <Suspense fallback={<ModuleSkeleton label="Negative Harmony" />}>
                                            <NegativeMirror />
                                        </Suspense>
                                    } />
                                    <Route path="barry-harris" element={
                                        <Suspense fallback={<ModuleSkeleton label="Barry Harris" />}>
                                            <BarryHarris />
                                        </Suspense>
                                    } />
                                    <Route path="rhythm-architect" element={
                                        <Suspense fallback={<ModuleSkeleton label="Rhythm Architect" />}>
                                            <RhythmArchitect />
                                        </Suspense>
                                    } />
                                    <Route path="functional-ear-training" element={
                                        <Suspense fallback={<ModuleSkeleton label="Ear Training" />}>
                                            <FunctionalEarTraining />
                                        </Suspense>
                                    } />
                                    <Route path="circle-chords" element={
                                        <Suspense fallback={<ModuleSkeleton label="Circle Chords" />}>
                                            <CircleChords />
                                        </Suspense>
                                    } />
                                    <Route path="midi-library" element={
                                        <Suspense fallback={<ModuleSkeleton label="MIDI Library" />}>
                                            <MidiLibrary />
                                        </Suspense>
                                    } />
                                    <Route path="progressions" element={
                                        <Suspense fallback={<ModuleSkeleton label="Progressions" />}>
                                            <ProgressionsPage />
                                        </Suspense>
                                    } />
                                    <Route path="jazz-standards" element={
                                        <Suspense fallback={<ModuleSkeleton label="Jazz Standards" />}>
                                            <JazzKiller />
                                        </Suspense>
                                    } />
                                </Route>
                            </Routes>
                        </div>
                    </div>
                </BrowserRouter>
                <PerformanceMonitor />
            </MidiProvider>
        </AudioProvider>
        </AuthProvider>
    );
}

export default App;
