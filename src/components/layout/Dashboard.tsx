import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    AudioWaveform,
    Piano,
    Grid3X3,
    Share2,
    RefreshCw,
    Music,
    Menu,
    X,
    Activity,
    Circle,
    Library
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { MidiSettings } from '../MidiSettings';

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { isReady, startAudio } = useAudio();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navItems = [
        { to: "/", icon: Music, label: "Chord Lab" },
        { to: "/bi-tonal", icon: AudioWaveform, label: "Bi-Tonal Sandbox" },
        { to: "/grips", icon: Grid3X3, label: "Grip Sequencer" },
        { to: "/tonnetz", icon: Share2, label: "Tonnetz Navigator" },
        { to: "/circle-chords", icon: Circle, label: "Harmonic Circles" },
        { to: "/negative-harmony", icon: RefreshCw, label: "Negative Mirror" },
        { to: "/barry-harris", icon: Piano, label: "Barry Harris" },
        { to: "/chord-buildr", icon: Grid3X3, label: "Chord Builder" },
        { to: "/midi-library", icon: Library, label: "MIDI Library" },
        { to: "/rhythm-architect", icon: Activity, label: "Rhythm Architect" },
        { to: "/functional-ear-training", icon: Activity, label: "Ear Training" },
        { to: "/progressions", icon: Music, label: "Progressions Lab" },
        { to: "/jazz-standards", icon: Music, label: "Jazz Standards" },
    ];

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={`
          fixed z-30 inset-y-0 left-0 w-64 glass-panel transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 ml-0
          border-r border-white/10
        `}
            >
                <div className="flex items-center justify-between p-6">
                    <h1 className="text-2xl font-bold tracking-tighter neon-text">
                        Poly<span className="text-[var(--color-polyaural-accent)]">Aural</span>
                    </h1>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-1 rounded-md hover:bg-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-white/10 text-[var(--color-polyaural-accent)] neon-border'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }
                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Context Status / Switch */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/20 space-y-3">
                    <MidiSettings />

                    {!isReady ? (
                        <button
                            onClick={() => startAudio()}
                            className="w-full py-2 px-4 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                        >
                            <span>Start Audio Engine</span>
                        </button>
                    ) : (
                        <div className="w-full py-2 px-4 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                            <span>Audio Active</span>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center p-4 glass-panel border-b border-white/10">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md hover:bg-white/10 mr-4"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold neon-text">
                        Poly<span className="text-[var(--color-polyaural-accent)]">Aural</span>
                    </h1>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black"></div>
        </div>
    );
};

export default Dashboard;
