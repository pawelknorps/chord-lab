import { motion } from 'framer-motion';

interface PitchData {
  pitch: number; // in cents
  time: number;
}

interface IntonationHeatmapV2Props {
  pitchHistory: PitchData[];
  width: number;
  height: number;
}

const TIME_WINDOW = 5000; // 5 seconds

export const IntonationHeatmapV2: React.FC<IntonationHeatmapV2Props> = ({ pitchHistory, width, height }) => {
  const now = performance.now();
  const visibleHistory = pitchHistory.filter(p => now - p.time < TIME_WINDOW);

  const pitchToY = (pitch: number) => {
    // Map pitch (in cents) to y-coordinate
    return height / 2 - (pitch / 100) * (height / 2);
  };

  const timeToX = (time: number) => {
    return width - (now - time) / TIME_WINDOW * width;
  };

  const path = visibleHistory
    .map((p, i) => {
      const x = timeToX(p.time);
      const y = pitchToY(p.pitch);
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="bg-black/30 rounded-xl border border-white/5">
      {/* Center line */}
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="2 2" />

      {/* Pitch path */}
      <motion.path
        d={path}
        fill="none"
        stroke="url(#pitchGrad)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />

      <defs>
        <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
      </defs>
    </svg>
  );
};
