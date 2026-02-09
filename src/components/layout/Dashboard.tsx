import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
    AudioWaveform,
    Piano,
    Grid3X3,
    Share2,
    RefreshCw,
    Music,
    Activity,
    ChevronLeft,
    ChevronRight,
    Circle,
    Library,
    Layout
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { MidiSettings } from '../MidiSettings';
import { GlobalSettings } from '../shared/GlobalSettings';

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { isReady, startAudio } = useAudio();

    const toggleSidebar = () => setCollapsed(!collapsed);

    const navGroups = [
        {
            title: "Studio",
            items: [
                { to: "/", icon: Layout, label: "Workbench" },
                { to: "/chord-buildr", icon: Grid3X3, label: "Chord Builder" },
                { to: "/progressions", icon: Music, label: "Progressions" },
            ]
        },
        {
            title: "Analysis",
            items: [
                { to: "/bi-tonal", icon: AudioWaveform, label: "Bi-Tonal" },
                { to: "/tonnetz", icon: Share2, label: "Tonnetz" },
                { to: "/negative-harmony", icon: RefreshCw, label: "Negative Mirror" },
                { to: "/circle-chords", icon: Circle, label: "Harmonic Circles" },
            ]
        },
        {
            title: "Practice",
            items: [
                { to: "/functional-ear-training", icon: Activity, label: "Ear Training" },
                { to: "/rhythm-architect", icon: Activity, label: "Rhythm" },
                { to: "/jazz-standards", icon: Music, label: "Standards" },
                { to: "/barry-harris", icon: Piano, label: "Barry Harris" },
                { to: "/grips", icon: Grid3X3, label: "Grips" },
            ]
        },
        {
            title: "Library",
            items: [
                { to: "/midi-library", icon: Library, label: "MIDI Library" },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
                    relative z-20 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-panel)]
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-16' : 'w-64'}
                `}
            >
                {/* Header */}
                <div className={`h-14 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} border-b border-[var(--border-subtle)]`}>
                    {!collapsed && (
                        <div className="font-bold tracking-tight text-lg">
                            Chord<span className="text-[var(--text-muted)]">Lab</span>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="px-3">
                            {!collapsed && (
                                <h3 className="px-2 mb-2 text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                                    {group.title}
                                </h3>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.to;
                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            title={collapsed ? item.label : undefined}
                                            className={`
                                                flex items-center gap-3 px-2 py-1.5 rounded-md text-sm transition-colors
                                                ${isActive
                                                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                                                }
                                                ${collapsed ? 'justify-center' : ''}
                                            `}
                                        >
                                            <item.icon size={18} className={isActive ? 'text-[var(--accent)]' : ''} />
                                            {!collapsed && <span>{item.label}</span>}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Controls */}
                <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                    {!collapsed && <MidiSettings />}

                    <button
                        onClick={!isReady ? () => startAudio() : undefined}
                        className={`
                            mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all
                            ${!isReady
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'bg-transparent text-[var(--text-muted)] cursor-default'
                            }
                        `}
                    >
                        {isReady ? (
                            <div className="w-2 h-2 rounded-full bg-green-500" title="Audio Engine Ready" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        {!collapsed && <span>{isReady ? "Engine Active" : "Start Engine"}</span>}
                    </button>

                    {collapsed && (
                        <div className={`mt-2 flex justify-center ${isReady ? 'opacity-50' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-[var(--bg-app)] relative overflow-hidden">
                <GlobalSettings />
                <div className="flex-1 overflow-auto p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
