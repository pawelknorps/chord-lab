import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AudioProvider } from './context/AudioContext';
import { MidiProvider } from './context/MidiContext';
import ChordLab from './modules/ChordLab/ChordLab'; // Keep Core module eager for LCP
import Dashboard from './components/layout/Dashboard';
import { GlobalMidiHandler } from './components/GlobalMidiHandler';
import { Loader2 } from 'lucide-react';
import { SessionHUD } from './components/shared/SessionHUD';
import { PerformanceMonitor } from './components/shared/PerformanceMonitor';

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

const LoadingScreen = ({ label = "Loading Module..." }: { label?: string }) => (
    <div className="flex flex-col items-center justify-center w-full h-full text-[var(--text-muted)] p-10 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mb-4" />
        <span className="text-xs uppercase font-bold tracking-widest opacity-70">{label}</span>
    </div>
);

import { useSettingsStore } from './core/store/useSettingsStore';
import { useEffect } from 'react';

function App() {
    const theme = useSettingsStore(state => state.theme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <AudioProvider>
            <MidiProvider>
                <GlobalMidiHandler />
                <BrowserRouter>
                    <SessionHUD />
                    <div className="h-screen w-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans">
                        <Routes>
                            <Route path="/" element={<Dashboard />}>
                                <Route index element={<ChordLab />} /> {/* Default View */}
                                <Route path="bi-tonal" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Sandbox..." />}>
                                        <BiTonalSandbox />
                                    </Suspense>
                                } />
                                <Route path="grips" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Grips..." />}>
                                        <GripSequencer />
                                    </Suspense>
                                } />
                                <Route path="tonnetz" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Tonnetz..." />}>
                                        <Tonnetz />
                                    </Suspense>
                                } />
                                <Route path="negative-harmony" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Negative Harmony..." />}>
                                        <NegativeMirror />
                                    </Suspense>
                                } />
                                <Route path="barry-harris" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Barry Harris..." />}>
                                        <BarryHarris />
                                    </Suspense>
                                } />
                                <Route path="rhythm-architect" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Rhythm Architect..." />}>
                                        <RhythmArchitect />
                                    </Suspense>
                                } />
                                <Route path="functional-ear-training" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Ear Training..." />}>
                                        <FunctionalEarTraining />
                                    </Suspense>
                                } />
                                <Route path="circle-chords" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Circle Chords..." />}>
                                        <CircleChords />
                                    </Suspense>
                                } />
                                <Route path="midi-library" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Library..." />}>
                                        <MidiLibrary />
                                    </Suspense>
                                } />
                                <Route path="progressions" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Progressions..." />}>
                                        <ProgressionsPage />
                                    </Suspense>
                                } />
                                <Route path="jazz-standards" element={
                                    <Suspense fallback={<LoadingScreen label="Loading Jazz Standards..." />}>
                                        <JazzKiller />
                                    </Suspense>
                                } />
                            </Route>
                        </Routes>
                    </div>
                </BrowserRouter>
                <PerformanceMonitor />
            </MidiProvider>
        </AudioProvider>
    );
}

export default App;
