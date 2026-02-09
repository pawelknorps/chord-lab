import React, { useState, useEffect } from 'react';
import { Settings, Keyboard, Circle, Check } from 'lucide-react';
import { useMidi } from '../context/MidiContext';

export const MidiSettings: React.FC = () => {
    const { inputs, selectedInput, selectInput, lastNote } = useMidi();
    const [isOpen, setIsOpen] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Flash activity indicator when a note is received
    useEffect(() => {
        if (lastNote) {
            setIsActive(true);
            const timer = setTimeout(() => setIsActive(false), 100);
            return () => clearTimeout(timer);
        }
    }, [lastNote]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full py-2 px-3 rounded-md flex items-center justify-between transition-all duration-200 border text-xs
                    ${isOpen
                        ? 'bg-[var(--bg-surface)] border-[var(--border-active)] text-[var(--text-primary)]'
                        : 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Keyboard
                        size={14}
                        className={isActive ? 'text-[var(--accent)] transition-transform scale-110' : ''}
                    />
                    <span className="font-bold tracking-wider uppercase">MIDI Input</span>
                </div>
                <div className="flex items-center gap-2">
                    {inputs.length > 0 && selectedInput && (
                        <Circle
                            size={6}
                            fill={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                            className={`transition-colors duration-100 ${isActive ? 'shadow-[0_0_8px_var(--accent-glow)]' : ''}`}
                        />
                    )}
                    <Settings
                        size={12}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-[var(--text-primary)]' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg shadow-2xl z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="flex items-center justify-between px-2 py-1 mb-1">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Select Source</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{inputs.length} Found</span>
                    </div>

                    <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {inputs.length === 0 ? (
                            <div className="text-[10px] text-[var(--text-muted)] italic p-3 text-center border border-dashed border-[var(--border-subtle)] rounded">
                                No MIDI devices detected
                            </div>
                        ) : (
                            inputs.map((input) => {
                                const isSelected = selectedInput === input.id;
                                return (
                                    <button
                                        key={input.id}
                                        onClick={() => {
                                            selectInput(input.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between group
                                            ${isSelected
                                                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                                            }`}
                                    >
                                        <div className="truncate pr-2">
                                            <div className="truncate">{input.name}</div>
                                            <div className="text-[9px] opacity-40 uppercase tracking-wider font-mono mt-0.5">{input.manufacturer || 'Generic'}</div>
                                        </div>
                                        {isSelected && <Check size={12} className="text-[var(--accent)] flex-none" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
