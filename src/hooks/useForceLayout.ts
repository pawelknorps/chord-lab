import { useState, useEffect, useCallback } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  source: string;
  target: string;
}

const SIMULATION_ITERATIONS = 100;
const REPULSION_STRENGTH = -100;
const LINK_STRENGTH = 0.1;
const CENTER_STRENGTH = 0.01;

export const useForceLayout = (
  initialNodes: { id: string }[],
  edges: Edge[],
  width: number,
  height: number
) => {
  const [nodes, setNodes] = useState<Node[]>([]);

  const runSimulation = useCallback(() => {
    let newNodes = initialNodes.map(node => ({
      id: node.id,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
    }));

    for (let i = 0; i < SIMULATION_ITERATIONS; i++) {
      // Apply forces
      newNodes.forEach(nodeA => {
        // Repulsion force
        newNodes.forEach(nodeB => {
          if (nodeA.id !== nodeB.id) {
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              const force = REPULSION_STRENGTH / (distance * distance);
              nodeA.vx += (dx / distance) * force;
              nodeA.vy += (dy / distance) * force;
            }
          }
        });

        // Centering force
        const dx = width / 2 - nodeA.x;
        const dy = height / 2 - nodeA.y;
        nodeA.vx += dx * CENTER_STRENGTH;
        nodeA.vy += dy * CENTER_STRENGTH;
      });

      // Link force
      edges.forEach(edge => {
        const source = newNodes.find(n => n.id === edge.source);
        const target = newNodes.find(n => n.id === edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          source.vx += dx * LINK_STRENGTH;
          source.vy += dy * LINK_STRENGTH;
          target.vx -= dx * LINK_STRENGTH;
          target.vy -= dy * LINK_STRENGTH;
        }
      });

      // Update positions
      newNodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.9; // Damping
        node.vy *= 0.9; // Damping
      });
    }

    setNodes(newNodes);
  }, [initialNodes, edges, width, height]);

  useEffect(() => {
    if (width > 0 && height > 0) {
      runSimulation();
    }
  }, [width, height, runSimulation]);

  return nodes;
};
