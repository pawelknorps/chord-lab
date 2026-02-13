import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurriculumNodeId = string;

export interface CurriculumNode {
    id: CurriculumNodeId;
    label: string;
    description: string;
    parentIds: CurriculumNodeId[];
    requiredPoints: number; // XP needed to "master" this node
    unlockStatus: 'locked' | 'unlocked' | 'mastered';
    category: 'harmonic' | 'melodic' | 'rhythmic' | 'repertoire';
    standards: string[]; // List of song titles associated with this node
}

interface MasteryTreeState {
    nodes: Record<CurriculumNodeId, CurriculumNode>;
    xpByNode: Record<CurriculumNodeId, number>;

    // Actions
    addNodeXP: (nodeId: CurriculumNodeId, amount: number) => void;
    unlockNode: (nodeId: CurriculumNodeId) => void;
    getNodeStatus: (nodeId: CurriculumNodeId) => 'locked' | 'unlocked' | 'mastered';
    resetProgress: () => void;
}

/**
 * INITIAL CURRICULUM DATA: 10 Foundational Nodes
 */
const INITIAL_NODES: Record<CurriculumNodeId, CurriculumNode> = {
    'foundations': {
        id: 'foundations',
        label: 'Jazz Foundations',
        description: 'Basic triads, major scales, and simple interval recognition.',
        parentIds: [],
        requiredPoints: 300,
        unlockStatus: 'unlocked',
        category: 'harmonic',
        standards: []
    },
    'blues-basics': {
        id: 'blues-basics',
        label: 'The Blues',
        description: 'Dominant 7th chords and the basic 12-bar blues form.',
        parentIds: ['foundations'],
        requiredPoints: 500,
        unlockStatus: 'locked',
        category: 'harmonic',
        standards: ['C Jam Blues', 'Bag\'s Groove']
    },
    'major-251': {
        id: 'major-251',
        label: 'Major ii-V-I',
        description: 'The most important motor in jazz harmony.',
        parentIds: ['foundations'],
        requiredPoints: 600,
        unlockStatus: 'unlocked',
        category: 'harmonic',
        standards: ['Autumn Leaves', 'Tune Up']
    },
    'swing-feel': {
        id: 'swing-feel',
        label: 'Swing & Syncopation',
        description: 'Mastering the jazz 8th note and off-beat accents.',
        parentIds: ['foundations'],
        requiredPoints: 400,
        unlockStatus: 'locked',
        category: 'rhythmic',
        standards: []
    },
    'secondary-dominants': {
        id: 'secondary-dominants',
        label: 'Secondary Dominants',
        description: 'V7 chords that resolve to non-tonic diatonic chords.',
        parentIds: ['major-251'],
        requiredPoints: 800,
        unlockStatus: 'locked',
        category: 'harmonic',
        standards: ['All Of Me', 'Take The A Train']
    },
    'minor-tonality': {
        id: 'minor-tonality',
        label: 'Minor ii-V-i',
        description: 'Handling the b5 on the ii chord and the altered dominant.',
        parentIds: ['major-251'],
        requiredPoints: 1000,
        unlockStatus: 'locked',
        category: 'harmonic',
        standards: ['Blue Bossa', 'Black Orpheus']
    },
    'rhythm-changes': {
        id: 'rhythm-changes',
        label: 'Rhythm Changes',
        description: 'The "I Got Rhythm" progression and its variations.',
        parentIds: ['blues-basics', 'major-251'],
        requiredPoints: 1200,
        unlockStatus: 'locked',
        category: 'repertoire',
        standards: ['Oleo', 'Moose The Mooche']
    },
    'modal-interchange': {
        id: 'modal-interchange',
        label: 'Modal Interchange',
        description: 'Borrowing chords from parallel minor (e.g., the minor iv).',
        parentIds: ['secondary-dominants'],
        requiredPoints: 900,
        unlockStatus: 'locked',
        category: 'harmonic',
        standards: ['There Will Never Be Another You', 'All The Things You Are']
    },
    'tritone-sub': {
        id: 'tritone-sub',
        label: 'Tritone Substitution',
        description: 'Replacing V7 with subV7 for chromatic resolution.',
        parentIds: ['secondary-dominants', 'minor-tonality'],
        requiredPoints: 1100,
        unlockStatus: 'locked',
        category: 'harmonic',
        standards: ['Girl From Ipanema', 'Desafinado']
    },
    'upper-structures': {
        id: 'upper-structures',
        label: 'Upper Structures',
        description: 'Advanced triads over bass notes for rich 13th colors.',
        parentIds: ['minor-tonality', 'tritone-sub'],
        requiredPoints: 1500,
        unlockStatus: 'locked',
        category: 'harmonic',
        standards: ['Stella By Starlight', 'Dolphin Dance']
    }
};

export const useMasteryTreeStore = create<MasteryTreeState>()(
    persist(
        (set, get) => ({
            nodes: INITIAL_NODES,
            xpByNode: {},

            addNodeXP: (nodeId, amount) => {
                set(state => {
                    const currentXP = (state.xpByNode[nodeId] || 0);
                    const newXP = currentXP + amount;
                    const node = state.nodes[nodeId];

                    if (!node) return state;

                    let newNodes = { ...state.nodes };
                    let wasJustMastered = false;

                    // If node reaches required points, mark as mastered
                    if (newXP >= node.requiredPoints && node.unlockStatus !== 'mastered') {
                        newNodes[nodeId] = { ...node, unlockStatus: 'mastered' };
                        wasJustMastered = true;
                    }

                    // If something was mastered, check which children can now be unlocked
                    if (wasJustMastered) {
                        Object.values(newNodes).forEach(child => {
                            if (child.parentIds.includes(nodeId) && child.unlockStatus === 'locked') {
                                // A child unlocks if ALL its parents are mastered
                                const allParentsMastered = child.parentIds.every(
                                    pid => newNodes[pid]?.unlockStatus === 'mastered'
                                );

                                if (allParentsMastered) {
                                    newNodes[child.id] = { ...child, unlockStatus: 'unlocked' };
                                }
                            }
                        });
                    }

                    return {
                        xpByNode: { ...state.xpByNode, [nodeId]: newXP },
                        nodes: newNodes
                    };
                });
            },

            unlockNode: (nodeId) => {
                set(state => ({
                    nodes: {
                        ...state.nodes,
                        [nodeId]: { ...state.nodes[nodeId], unlockStatus: 'unlocked' }
                    }
                }));
            },

            getNodeStatus: (nodeId) => {
                return get().nodes[nodeId]?.unlockStatus || 'locked';
            },

            resetProgress: () => {
                set({
                    nodes: INITIAL_NODES,
                    xpByNode: {}
                });
            }
        }),
        {
            name: 'itm-mastery-tree'
        }
    )
);
