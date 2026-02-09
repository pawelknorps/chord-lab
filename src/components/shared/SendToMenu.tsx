import { useState, useRef, useEffect } from 'react';
import { Share2, Music, Ear, Layers, Library, Link, Check } from 'lucide-react';
import { useModuleNavigation } from '../../hooks/useModuleNavigation';
import { createDeepLink } from '../../core/routing/deepLinks';

import { ProgressionData, ChordData } from './types';

interface SendToMenuProps {
    progression?: ProgressionData;
    chord?: ChordData;
    sourceModule: string;
    className?: string;
}

export function SendToMenu({ progression, chord, sourceModule, className = '' }: SendToMenuProps) {
    const { navigateToEarTraining, navigateToChordLab, navigateToChordBuilder, navigateToJazzStandards } = useModuleNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const hasData = !!(progression || chord);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleCopyLink = () => {
        const data = progression || chord;
        if (!data) return;

        const targetModule = sourceModule === 'chordlab' ? 'chordlab' :
            sourceModule === 'ear-training' ? 'ear-training' :
                sourceModule === 'chord-builder' ? 'chord-builder' : sourceModule;

        const relativePath = createDeepLink(targetModule, data as any);
        const fullUrl = `${window.location.origin}${relativePath}`;

        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!hasData) return null;

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition"
            >
                <Share2 size={16} />
                Send to...
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                        {progression && sourceModule !== 'ear-training' && (
                            <button
                                className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-purple-600 transition"
                                onClick={() => {
                                    navigateToEarTraining(progression, { mode: 'progressions' });
                                    setIsOpen(false);
                                }}
                            >
                                <Ear size={16} />
                                Practice by Ear
                            </button>
                        )}

                        {progression && sourceModule !== 'chordlab' && (
                            <button
                                className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-purple-600 transition"
                                onClick={() => {
                                    navigateToChordLab(progression);
                                    setIsOpen(false);
                                }}
                            >
                                <Music size={16} />
                                Build in ChordLab
                            </button>
                        )}

                        {chord && sourceModule !== 'chord-builder' && (
                            <button
                                className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-purple-600 transition"
                                onClick={() => {
                                    navigateToChordBuilder(chord);
                                    setIsOpen(false);
                                }}
                            >
                                <Layers size={16} />
                                Analyze Chord
                            </button>
                        )}

                        {progression && sourceModule !== 'jazzkiller' && (
                            <button
                                className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-purple-600 transition"
                                onClick={() => {
                                    navigateToJazzStandards();
                                    setIsOpen(false);
                                }}
                            >
                                <Library size={16} />
                                Find in Standards
                            </button>
                        )}

                        <div className="my-1 border-t border-gray-700"></div>

                        <button
                            className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-purple-600 transition"
                            onClick={handleCopyLink}
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Link size={16} />}
                            {copied ? 'Copied!' : 'Copy Share Link'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
