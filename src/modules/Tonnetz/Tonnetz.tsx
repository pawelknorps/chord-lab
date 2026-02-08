import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useAudio } from '../../context/AudioContext';
import { midiToNoteName } from '../../core/theory';
import * as TonnetzLogic from './tonnetzLogic';

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

const Node: React.FC<{ x: number; y: number; active: boolean; root: boolean }> = ({ x, y, active, root }) => {
    const pitchClass = ((x * 7 + y * 4) % 12 + 120) % 12; // Ensure positive modulo
    const noteName = midiToNoteName(pitchClass + 60).slice(0, -1);
    const pos = getPosition(x, y);

    return (
        <group position={pos}>
            <mesh>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color={root ? '#ff0055' : active ? '#00ccff' : '#444'}
                    emissive={active ? (root ? '#ff0055' : '#00ccff') : '#000'}
                    emissiveIntensity={active ? 0.5 : 0}
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

    const transform = (type: 'P' | 'L' | 'R') => {
        if (!isReady) startAudio();

        let newTriad: TonnetzLogic.Triad;
        if (type === 'P') newTriad = TonnetzLogic.transformP(currentTriad);
        else if (type === 'L') newTriad = TonnetzLogic.transformL(currentTriad);
        else newTriad = TonnetzLogic.transformR(currentTriad);

        // Updating Logic Coordinates (Tricky part)
        // We need to find the (x,y) of the new root relative to old root to keep the path continuous
        // This is complex because P/L/R moves root specific intervals.
        // Simply updating the triad pitch classes is enough for sound, 
        // but for VISUAL continuity we want to know WHICH node is the new root.
        //
        // C Major (0,0). Notes: C(0,0), G(1,0), E(0,1).
        // Transform P -> C Minor. Notes: C, G, Eb.
        // New Root C is still (0,0).
        // Transform L -> E Minor. Notes: E, G, B.
        // New Root E is (0,1).
        // Transform R -> A Minor. Notes: A, C, E.
        // New Root A. A is ... down m3 from C (-3 semis).
        // x axis = +7. y axis = +4.
        // A = C - 3.
        // 3 = 7 - 4? No.
        // 9 (A) = 3 * 3? No.
        // -3 = 1*(-7) + 1*(4) = -3? 
        // -7 + 4 = -3.
        // So A is (-1, 1) relative to C.

        // Let's implement a 'find closest node for pitch class' function?
        // Or just map P/L/R to coordinate deltas?
        // P: Root doesn't move. (0,0).
        // L: Major->Minor: Root moves +M3 (+4). Delta (0, 1).
        //    Minor->Major: Root moves -M3 (-4). Delta (0, -1).
        // R: Major->Minor: Root moves -m3 (-3 = -7+4). Delta (-1, 1).
        //    Minor->Major: Root moves +m3 (+3 = 7-4). Delta (1, -1).

        let delta: [number, number] = [0, 0];
        if (type === 'P') {
            delta = [0, 0];
        } else if (type === 'L') {
            if (currentTriad.quality === 'Major') delta = [0, 1]; // Up 3rd
            else delta = [0, -1]; // Down 3rd
        } else if (type === 'R') {
            if (currentTriad.quality === 'Major') delta = [-1, 1]; // Down m3
            else delta = [1, -1]; // Up m3
        }

        setRootCoord(prev => [prev[0] + delta[0], prev[1] + delta[1]]);
        setCurrentTriad(newTriad);
        playChord(newTriad);
    };

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

                list.push(<Node key={`${x}-${y}`} x={x} y={y} active={inTriad} root={isRoot} />);
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
                <div className="text-4xl font-bold neon-text drop-shadow-md bg-black/50 px-4 py-2 rounded-xl pointer-events-auto">
                    {midiToNoteName(currentTriad.root + 60).slice(0, -1)} {currentTriad.quality}
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
                    Neo-Riemannian Navigator
                </div>
            </div>
        </div>
    );
};

// Smooth Camera Helper
const GridCamera: React.FC<{ target: THREE.Vector3 }> = ({ target }) => {
    useFrame((state: RootState) => {
        // Smooth lerp camera to look at target
        // state.camera.position.lerp(new THREE.Vector3(target.x, target.y, 10), 0.05);
        // Let's just move x/y, keep z
        state.camera.position.lerp(new THREE.Vector3(target.x, target.y, state.camera.position.z), 0.1);
        state.camera.lookAt(target.x, target.y, 0);
    });
    return null;
};

export default Tonnetz;
