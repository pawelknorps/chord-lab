import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PerformanceSegment } from '../types/PerformanceSegment';

interface ProgressTrendChartProps {
    sessions: PerformanceSegment[];
    height?: number;
}

/**
 * Premium SVG-based trend chart for performance analytics (REQ-AN-01).
 * Visualizes Accuracy and Consistency over time with smooth animations.
 */
export const ProgressTrendChart: React.FC<ProgressTrendChartProps> = ({ sessions, height = 200 }) => {
    // Sort sessions by timestamp (oldest to newest)
    const sortedData = useMemo(() => {
        return [...sessions].sort((a, b) => a.timestamp - b.timestamp);
    }, [sessions]);

    const points = useMemo(() => {
        if (sortedData.length < 2) return "";

        const width = 1000; // Fixed internal coordinate system
        const padding = 40;
        const availableWidth = width - (padding * 2);
        const availableHeight = height - (padding * 2);

        return sortedData.map((s, i) => {
            const x = padding + (i * (availableWidth / (sortedData.length - 1 || 1)));
            const y = height - padding - (s.overallScore * (availableHeight / 100));
            return `${x},${y}`;
        }).join(" ");
    }, [sortedData, height]);

    if (sessions.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 p-12 text-neutral-500 font-bold text-sm uppercase tracking-widest">
                No session data recorded yet
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col gap-1 mb-8">
                <h3 className="text-xl font-black text-white tracking-tighter">Performance Growth</h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Accuracy over last {sessions.length} sessions</p>
            </div>

            <div className="relative">
                <svg
                    viewBox={`0 0 1000 ${height}`}
                    className="w-full h-auto overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map((level) => {
                        const y = height - 40 - (level * (height - 80) / 100);
                        return (
                            <React.Fragment key={level}>
                                <line
                                    x1="40" y1={y} x2="960" y2={y}
                                    stroke="white" strokeOpacity="0.05" strokeWidth="1"
                                />
                                <text x="10" y={y + 4} fill="white" fillOpacity="0.2" fontSize="12" fontWeight="800">
                                    {level}
                                </text>
                            </React.Fragment>
                        );
                    })}

                    {/* The Path */}
                    <motion.polyline
                        fill="none"
                        stroke="url(#gradient-line)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Area fill */}
                    <motion.polygon
                        points={`${points} 960,160 40,160`} // Approximation, should be dynamic based on points
                        fill="url(#gradient-area)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    />

                    {/* Data Points */}
                    {sortedData.map((s, i) => {
                        const width = 1000;
                        const padding = 40;
                        const availableWidth = width - (padding * 2);
                        const availableHeight = height - (padding * 2);
                        const x = padding + (i * (availableWidth / (sortedData.length - 1 || 1)));
                        const y = height - padding - (s.overallScore * (availableHeight / 100));

                        return (
                            <motion.circle
                                key={i}
                                cx={x} cy={y} r="4"
                                fill="white"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1 + i * 0.05 }}
                                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                            />
                        );
                    })}

                    {/* Definitions */}
                    <defs>
                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <linearGradient id="gradient-area" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Stats Overlay */}
            <div className="grid grid-cols-3 gap-8 mt-8 border-t border-white/5 pt-8">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Average Accuracy</span>
                    <span className="text-2xl font-black text-white">
                        {Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / sessions.length)}%
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Recent Trend</span>
                    <span className={`text-2xl font-black ${sortedData.length > 1 && sortedData[sortedData.length - 1].overallScore >= sortedData[sortedData.length - 2].overallScore
                            ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                        {sortedData.length > 1 ? (sortedData[sortedData.length - 1].overallScore - sortedData[0].overallScore > 0 ? '+' : '') : ''}
                        {sortedData.length > 1 ? Math.round(sortedData[sortedData.length - 1].overallScore - sortedData[0].overallScore) : '0'}%
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Best Score</span>
                    <span className="text-2xl font-black text-amber-400">
                        {Math.max(...sessions.map(s => s.overallScore))}%
                    </span>
                </div>
            </div>
        </div>
    );
};
