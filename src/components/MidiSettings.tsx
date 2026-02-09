import React, { useState, useEffect } from 'react';
import { Settings, Keyboard, Circle } from 'lucide-react';
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
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-between transition-all duration-300 border ${isOpen
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <Keyboard size={16} className={isActive ? 'text-purple-400 scale-110 transition-transform' : ''} />
                    <span className="text-xs font-bold uppercase tracking-wider">MIDI Input</span>
                </div>
                <div className="flex items-center gap-2">
                    {inputs.length > 0 && (
                        <Circle
                            size={8}
                            fill={isActive ? '#a855f7' : '#4b5563'}
                            className={`transition-colors duration-75 ${isActive ? 'shadow-[0_0_8px_#a855f7]' : ''}`}
                        />
                    )}
                    <Settings size={14} className={isOpen ? 'rotate-90 transition-transform' : ''} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest">Select Source</div>
                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {inputs.length === 0 ? (
                            <div className="text-[10px] text-white/20 italic p-2 text-center">No MIDI devices detected</div>
                        ) : (
                            inputs.map((input) => (
                                <button
                                    key={input.id}
                                    onClick={() => {
                                        selectInput(input.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${selectedInput === input.id
                                            ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="font-bold truncate">{input.name}</div>
                                    <div className="text-[8px] opacity-40 uppercase tracking-tighter">{input.manufacturer}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
