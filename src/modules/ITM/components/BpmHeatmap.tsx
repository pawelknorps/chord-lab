/**
 * BPM Heatmap: Stability vs Speed (Phase 14.4).
 * High-density SVG grid mapping Tempo (X) vs Accuracy (Y) with a "thermal trail"
 * of the student's progress (green = high accuracy, red = low).
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface DrillDataPoint {
  bpm: number;
  accuracy: number;
  timestamp: number;
}

const BPM_MAX = 300;

function generatePath(data: DrillDataPoint[]): string {
  if (data.length < 2) return '';
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
  const points = sorted.map((p, i) => {
    const x = (p.bpm / BPM_MAX) * 100;
    const y = 100 - p.accuracy * 100;
    return `${x},${y}`;
  });
  return `M ${points[0]} L ${points.slice(1).join(' L ')}`;
}

export interface BpmHeatmapProps {
  data: DrillDataPoint[];
  className?: string;
}

export const BpmHeatmap: React.FC<BpmHeatmapProps> = ({ data, className }) => {
  const pathD = useMemo(() => generatePath(data), [data]);

  return (
    <div
      className={
        className ??
        'relative h-64 w-full bg-slate-900 rounded-lg p-4 overflow-hidden border border-slate-700'
      }
    >
      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
        Stability vs. Speed
      </h4>
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {data.map((point, idx) => {
          const x = (point.bpm / BPM_MAX) * 100;
          const y = 100 - point.accuracy * 100;
          const isSuccess = point.accuracy > 0.9;
          return (
            <motion.circle
              key={`${point.timestamp}-${idx}`}
              cx={x}
              cy={y}
              r={0.8}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isSuccess ? 1 : 0.4,
                scale: 1,
              }}
              style={{
                fill: isSuccess ? '#10b981' : '#ef4444',
                filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))',
              }}
            />
          );
        })}
        {pathD && (
          <path
            d={pathD}
            className="stroke-slate-500 fill-none stroke-[0.5] opacity-30"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
};
