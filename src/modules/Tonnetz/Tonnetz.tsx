import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useAudio } from '../../context/AudioContext';
import { midiToNoteName } from '../../core/theory';
import * as TonnetzLogic from './tonnetzLogic';
import { useMidi } from '../../context/MidiContext';
import { InteractivePiano } from '../../components/InteractivePiano';

// Constants
const GRID_SIZE = 4; // Render nodes from -4 to 4
const SPACING = 2;

// Helper to get 3D position from logical (x, y) coordinates
// x-axis: Horizontal
// y-axis: 60 degrees (Hexagonal lattice)
const getPosition = (x: number, y: number): [number, number, number] => {
    const xPos = (x + y * 0.5) * SPACING;
    const yPos = y * SPACING * 0.866; // sin(60)
    return [xPos, yPos, 0];
};

const Node: React.FC<{ x: number; y: number; active: boolean; root: boolean; isMidiActive: boolean }> = ({ x, y, active, root, isMidiActive }) => {
    const pitchClass = ((x * 7 + y * 4) % 12 + 120) % 12; // Ensure positive modulo
    const noteName = midiToNoteName(pitchClass + 60).slice(0, -1);
    const pos = getPosition(x, y);

    return (
        <group position={pos}>
            <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color={isMidiActive ? '#00ffaa' : root ? '#ff0055' : active ? '#00ccff' : '#444'}
                    emissive={isMidiActive ? '#00ffaa' : active ? (root ? '#ff0055' : '#00ccff') : '#000'}
                    emissiveIntensity={isMidiActive || active ? 0.6 : 0}
                />
            </mesh>
            <Text
                position={[0, 0, 0.5]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {noteName}
            </Text>
        </group>
    );
};

// Component to draw lines between connected nodes
const Connections: React.FC = () => {
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        // Horizontal lines (Perfect 5ths)
        for (let y = -GRID_SIZE; y <= GRID_SIZE; y++) {
            // Line strip from min x to max x
            // Actually Line segment pairs is better for drei Line
            // Let's just draw all segments
            for (let x = -GRID_SIZE; x < GRID_SIZE; x++) {
                pts.push(new THREE.Vector3(...getPosition(x, y)));
                pts.push(new THREE.Vector3(...getPosition(x + 1, y)));
            }
        }
        // Diagonal / (Major 3rds - y axis)
        for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
            for (let y = -GRID_SIZE; y < GRID_SIZE; y++) {
                pts.push(new THREE.Vector3(...getPosition(x, y)));
                pts.push(new THREE.Vector3(...getPosition(x, y + 1)));
            }
        }
        // Diagonal \ (Minor 3rds - combination)
        for (let x = -GRID_SIZE; x < GRID_SIZE; x++) {
            for (let y = -GRID_SIZE; y < GRID_SIZE; y++) {
                // Connect (x, y+1) to (x+1, y)
                pts.push(new THREE.Vector3(...getPosition(x, y + 1)));
                pts.push(new THREE.Vector3(...getPosition(x + 1, y)));
            }
        }
        return pts;
    }, []);

    return (
        <lineSegments>
            <bufferGeometry>
                <float32BufferAttribute attach="attributes-position" args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#333" transparent opacity={0.3} />
        </lineSegments>
    );
};

const Tonnetz: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const [currentTriad, setCurrentTriad] = useState<TonnetzLogic.Triad>({
        root: 0, // C
        quality: 'Major', // C Major
        notes: [0, 4, 7],
        center: [0, 0]
    });

    const { lastNote } = useMidi();
    const [midiActiveNotes, setMidiActiveNotes] = useState<Set<number>>(new Set());
    const [steerEnabled, setSteerEnabled] = useState(true);

    // Track the 'logical center' (x,y) of the current root note for rendering context
    // This avoids the 'infinite grid' problem by shifting the view or the grid logic
    // For simplicity, let's keep the root at logic (0,0) visually, OR 
    // track the logical coordinates of the root.
    // C (0,0). G (1,0). E (0,1).
    // If we move to G Major. Root G is (1,0).
    const [rootCoord, setRootCoord] = useState<[number, number]>([0, 0]);

    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (isReady && !synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -5,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1 }
            }).toDestination();
        }

        return () => {
            synthRef.current?.dispose();
            synthRef.current = null;
        };
    }, [isReady]);

    const playChord = (chord: TonnetzLogic.Triad) => {
        if (!synthRef.current) return;
        const notes = chord.notes.map(n => midiToNoteName(n + 60)); // Middle C octave
        synthRef.current.releaseAll();
        synthRef.current.triggerAttackRelease(notes, '1n');
    };

    const transform = useCallback((type: 'P' | 'L' | 'R') => {
        if (!isReady) startAudio();

        setCurrentTriad(prev => {
            let newTriad: TonnetzLogic.Triad;
            if (type === 'P') newTriad = TonnetzLogic.transformP(prev);
            else if (type === 'L') newTriad = TonnetzLogic.transformL(prev);
            else newTriad = TonnetzLogic.transformR(prev);

            let delta: [number, number] = [0, 0];
            if (type === 'P') {
                delta = [0, 0];
            } else if (type === 'L') {
                if (prev.quality === 'Major') delta = [0, 1]; // Up 3rd
                else delta = [0, -1]; // Down 3rd
            } else if (type === 'R') {
                if (prev.quality === 'Major') delta = [-1, 1]; // Down m3
                else delta = [1, -1]; // Up m3
            }

            setRootCoord(old => [old[0] + delta[0], old[1] + delta[1]]);
            playChord(newTriad);
            return newTriad;
        });
    }, [isReady, startAudio]);

    // MIDI Input Processing
    useEffect(() => {
        if (!lastNote) return;

        const pitchClass = lastNote.note % 12;

        if (lastNote.type === 'noteon') {
            setMidiActiveNotes(prev => new Set(prev).add(pitchClass));

            if (steerEnabled) {
                // Logic to detect "Steer" note
                // Based on parsominious voice leading (the one note that changes)
                const { root, quality } = currentTriad;

                let steerType: 'P' | 'L' | 'R' | null = null;

                if (quality === 'Major') {
                    if (pitchClass === (root + 3) % 12) steerType = 'P'; // Eb in C Maj
                    else if (pitchClass === (root + 11) % 12) steerType = 'L'; // B in C Maj
                    else if (pitchClass === (root + 9) % 12) steerType = 'R'; // A in C Maj
                } else {
                    if (pitchClass === (root + 4) % 12) steerType = 'P'; // E in C Min
                    else if (pitchClass === (root + 8) % 12) steerType = 'L'; // Ab in C Min
                    else if (pitchClass === (root + 10) % 12) steerType = 'R'; // Bb in C Min
                }

                if (steerType) {
                    transform(steerType);
                }
            }
        } else {
            setMidiActiveNotes(prev => {
                const updated = new Set(prev);
                updated.delete(pitchClass);
                return updated;
            });
        }
    }, [lastNote, steerEnabled, currentTriad, transform]);

    // Generate grid nodes based on current root center
    const nodes = useMemo(() => {
        const list = [];
        // We render a window around [0,0] but map the note values based on rootCoord offset
        // Actually, we want to SCROLL the camera or the grid.
        // Let's keep the grid static in memory logic but shift the "Pitch Class Calculation"
        // No, Tonnetz is absolute. C is always (0,0) (and (12, -something)...).
        // Let's just generate a large enough fixed grid and pan the CAMERA to the current root.

        // Better: Render nodes around the CURRENT root coordinate.
        const [cx, cy] = rootCoord;
        for (let x = cx - GRID_SIZE; x <= cx + GRID_SIZE; x++) {
            for (let y = cy - GRID_SIZE; y <= cy + GRID_SIZE; y++) {
                // Check if this node is part of the current triad
                // Note value of this node
                const pc = ((x * 7 + y * 4) % 12 + 120) % 12;
                const inTriad = currentTriad.notes.includes(pc);
                const isRoot = currentTriad.root === pc;
                const isMidiActive = midiActiveNotes.has(pc);

                list.push(<Node key={`${x}-${y}`} x={x} y={y} active={inTriad} root={isRoot} isMidiActive={isMidiActive} />);
            }
        }
        return list;
    }, [rootCoord, currentTriad]);

    // Camera Target
    const targetPos = useMemo(() => {
        // Centroid of current triad?
        // Root at logic (cx, cy).
        // Major: Root, M3(0,1), P5(1,0). Center approx (0.33, 0.33) relative to root.
        // Minor: Root, m3(-1, 1... no wait), P5(1,0).
        // We moved the ROOT.
        // Let's just focus on the Root.
        const [rx, ry] = rootCoord;
        const pos = getPosition(rx, ry);
        return new THREE.Vector3(pos[0], pos[1], 5);
    }, [rootCoord]);

    return (
        <div className="h-full w-full flex flex-col bg-gray-900 text-white relative">
            {/* 3D Scene */}
            <div className="flex-1">
                <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />

                    <Connections />
                    {nodes}
                    <GridCamera target={targetPos} />

                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={false} />
                </Canvas>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
                <div className="text-4xl font-bold neon-text drop-shadow-md bg-black/50 px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-4">
                    {midiToNoteName(currentTriad.root + 60).slice(0, -1)} {currentTriad.quality}
                    <div className="h-4 w-px bg-white/20"></div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={steerEnabled}
                            onChange={(e) => setSteerEnabled(e.target.checked)}
                            className="w-4 h-4 accent-green-500"
                        />
                        <span className="text-xs uppercase tracking-widest text-gray-400">MIDI Steering</span>
                    </label>
                </div>

                <div className="flex gap-4 pointer-events-auto">
                    <button
                        onClick={() => transform('P')}
                        className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-bold text-xl shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
                    >
                        P
                    </button>
                    <button
                        onClick={() => transform('L')}
                        className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center font-bold text-xl shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
                    >
                        L
                    </button>
                    <button
                        onClick={() => transform('R')}
                        className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center font-bold text-xl shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
                    >
                        R
                    </button>
                </div>

                <div className="text-sm bg-black/60 px-3 py-1 rounded text-gray-300 pointer-events-auto">
                    Play the "target notes" on your MIDI keyboard to steer the harmony.
                </div>
            </div>

            {/* Keyboard for Interaction */}
            <div className="bg-black/80 border-t border-white/10 p-4">
                <InteractivePiano
                    startOctave={3}
                    endOctave={5}
                    showInput={true}
                    enableSound={false} // Don't double sound
                />
            </div>
        </div>
    );
};

// Smooth Camera Helper
const GridCamera: React.FC<{ target: THREE.Vector3 }> = ({ target }) => {
    const tempVec = useRef(new THREE.Vector3());

    useFrame((state: RootState) => {
        // Smooth lerp camera to look at target
        // We use a persistent vector to avoid GC pressure
        tempVec.current.set(target.x, target.y, state.camera.position.z);
        state.camera.position.lerp(tempVec.current, 0.1);
        state.camera.lookAt(target.x, target.y, 0);
    });
    return null;
};

export default Tonnetz;
