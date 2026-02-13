import { motion } from 'framer-motion';

interface SwingPocketVisualizationProps {
  bpm: number;
  onsets: number[];
  startTime: number | null;
  width: number;
  height: number;
}


const BARS_TO_DISPLAY = 4;

export const SwingPocketVisualization: React.FC<SwingPocketVisualizationProps> = ({ bpm, onsets, startTime, width, height }) => {
  if (!startTime) return null;

  const beatMs = 60000 / bpm;
  const totalDurationMs = BARS_TO_DISPLAY * 4 * beatMs;

  return (
    <svg width={width} height={height} className="bg-black/30 rounded-xl border border-white/5">
      {/* Grid lines */}
      {Array.from({ length: BARS_TO_DISPLAY * 4 }).map((_, i) => (
        <line
          key={i}
          x1={(i / (BARS_TO_DISPLAY * 4)) * width}
          y1="0"
          x2={(i / (BARS_TO_DISPLAY * 4)) * width}
          y2={height}
          stroke={i % 4 === 0 ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}
          strokeWidth="1"
        />
      ))}

      {/* Onset markers */}
      {onsets.map((onset, i) => {
        const elapsedTime = onset - startTime;
        const x = (elapsedTime / totalDurationMs) * width;
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={height / 2}
            r="4"
            fill="#fbbf24"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        );
      })}
    </svg>
  );
};
