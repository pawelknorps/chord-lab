import React, { useState, useEffect } from 'react';
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
    Layout,
    Menu,
    X
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { MidiSettings } from '../MidiSettings';
import { GlobalSettings } from '../shared/GlobalSettings';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../utils/i18n';

const Dashboard: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { isReady } = useAudio();
    const { i18n } = useTranslation();

    // Auto-collapse on small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true);
                setMobileOpen(false);
            } else {
                setCollapsed(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => setCollapsed(!collapsed);

    const navGroups = [
        {
            title: "Main",
            items: [
                { to: "/", icon: Layout, label: "Workbench" },
                { to: "/jazz-standards", icon: Music, label: "Standards" },
            ]
        },
        {
            title: "Analysis",
            items: [
                { to: "/progressions", icon: Music, label: "Progressions" },
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
            {/* Mobile Overlay Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-panel)]
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-16' : 'w-64'}
                    lg:relative lg:z-20
                    fixed z-40 h-full
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header */}
                <div className={`h-14 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} border-b border-[var(--border-subtle)]`}>
                    {!collapsed && (
                        <div className="font-bold tracking-tight text-lg">
                            Chord<span className="text-[var(--text-muted)]">Lab</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {/* Close button for mobile */}
                        {mobileOpen && (
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="lg:hidden p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                aria-label="Close menu"
                            >
                                <X size={16} />
                            </button>
                        )}
                        {/* Desktop collapse toggle */}
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:block p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
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

                    {/* Language Switcher */}
                    <div className={`mt-2 flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-2'}`}>
                        {!collapsed && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mr-1">
                                Lang:
                            </span>
                        )}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${i18n.language === 'en'
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                                title="English"
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('pl')}
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${i18n.language === 'pl'
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                                title="Polski"
                            >
                                PL
                            </button>
                        </div>
                    </div>

                    <div className={`mt-2 flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-2'} text-xs text-[var(--text-muted)]`}>
                        <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} title={isReady ? 'Audio Ready' : 'Waiting for interaction...'} />
                        {!collapsed && <span className="uppercase tracking-wider font-semibold">{isReady ? 'Engine Active' : 'Standby'}</span>}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-[var(--bg-app)] relative overflow-hidden">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg shadow-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>

                <GlobalSettings />
                <div className="flex-1 overflow-auto p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
