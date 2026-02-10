import { useState } from 'react';
import { Eye, EyeOff, Layers, Sparkles } from 'lucide-react';

export interface AnalysisFilters {
    showMajorTwoFiveOne: boolean;
    showMinorTwoFiveOne: boolean;
    showSecondaryDominants: boolean;
    showTritoneSubstitutions: boolean;
    showColtraneChanges: boolean;
}

interface AnalysisToolbarProps {
    filters: AnalysisFilters;
    onFiltersChange: (filters: AnalysisFilters) => void;
    totalPatterns: number;
    orientation?: 'horizontal' | 'vertical';
}

// ... existing config ...

export function AnalysisToolbar({
    filters,
    onFiltersChange,
    totalPatterns,
    orientation = 'horizontal',
}: AnalysisToolbarProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleFilter = (key: keyof AnalysisFilters) => {
        onFiltersChange({
            ...filters,
            [key]: !filters[key],
        });
    };

    const toggleAll = () => {
        const allEnabled = Object.values(filters).every((v) => v);
        const newFilters = Object.keys(filters).reduce(
            (acc, key) => ({ ...acc, [key]: !allEnabled }),
            {} as AnalysisFilters
        );
        onFiltersChange(newFilters);
    };

    const activeCount = Object.values(filters).filter((v) => v).length;

    if (orientation === 'vertical') {
        return (
            <div className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 w-64 animate-in slide-in-from-left duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        Analysis
                        <span className="text-amber-500">({totalPatterns})</span>
                    </h3>

                    <button
                        onClick={toggleAll}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-colors"
                        title={activeCount === FILTER_CONFIG.length ? "Hide All" : "Show All"}
                    >
                        {activeCount === FILTER_CONFIG.length ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {FILTER_CONFIG.map((config) => {
                        const isActive = filters[config.key];
                        const colorClasses = {
                            emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
                            purple: 'bg-purple-500/20 text-purple-400 border-purple-500',
                            amber: 'bg-amber-500/20 text-amber-400 border-amber-500',
                            rose: 'bg-rose-500/20 text-rose-400 border-rose-500',
                            cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
                        }[config.color];

                        return (
                            <button
                                key={config.key}
                                onClick={() => toggleFilter(config.key)}
                                className={`
                                    w-full flex items-center justify-between
                                    px-3 py-2 rounded-lg border-2
                                    text-xs font-bold uppercase tracking-wider
                                    transition-all active:scale-95 text-left
                                    ${isActive
                                        ? `${colorClasses} opacity-100`
                                        : 'bg-neutral-800 text-neutral-600 border-neutral-700 opacity-40 hover:opacity-100'
                                    }
                                `}
                            >
                                <span>{config.label}</span>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor]" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900/60 backdrop-blur-md border-b border-white/5 px-6 py-3">
            <div className="flex items-center justify-between">
                {/* Left side - Title & toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                    >
                        <Sparkles size={16} className="text-amber-500" />
                        Theory Analysis
                        <span className="text-amber-500">({totalPatterns})</span>
                    </button>

                    {isExpanded && (
                        <button
                            onClick={toggleAll}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold"
                        >
                            {activeCount === FILTER_CONFIG.length ? (
                                <>
                                    <EyeOff size={14} />
                                    Hide All
                                </>
                            ) : (
                                <>
                                    <Eye size={14} />
                                    Show All
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Right side - Filter chips */}
                {isExpanded && (
                    <div className="flex items-center gap-2">
                        {FILTER_CONFIG.map((config) => {
                            const isActive = filters[config.key];
                            const colorClasses = {
                                emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500',
                                purple: 'bg-purple-500/20 text-purple-400 border-purple-500',
                                amber: 'bg-amber-500/20 text-amber-400 border-amber-500',
                                rose: 'bg-rose-500/20 text-rose-400 border-rose-500',
                                cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500',
                            }[config.color];

                            return (
                                <button
                                    key={config.key}
                                    onClick={() => toggleFilter(config.key)}
                                    title={config.description}
                                    className={`
                    relative group
                    px-3 py-1.5 rounded-lg border-2
                    text-xs font-black uppercase tracking-wider
                    transition-all active:scale-95
                    ${isActive
                                            ? `${colorClasses} opacity-100`
                                            : 'bg-neutral-800 text-neutral-600 border-neutral-700 opacity-40 hover:opacity-60'
                                        }
                  `}
                                >
                                    {config.label}

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-neutral-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
                                        {config.description}
                                    </div>
                                </button>
                            );
                        })}

                        <div className="h-6 w-px bg-white/10 mx-2" />

                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-500 hover:text-white transition-colors"
                            title="Collapse toolbar"
                        >
                            <Layers size={16} />
                        </button>
                    </div>
                )}

                {!isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <Layers size={14} />
                        Expand filters ({activeCount}/{FILTER_CONFIG.length})
                    </button>
                )}
            </div>
        </div>
    );
}
