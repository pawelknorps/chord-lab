import React from 'react';
import { motion } from 'framer-motion';

interface GripRadarProps {
    gripName: string;
    color: string;
    isActive: boolean;
}

const GripRadar: React.FC<GripRadarProps> = ({ gripName, color, isActive }) => {
    // Map grip names to "shapes" or radar data
    // For now, let's use a simple abstract shape that morphs

    const getPath = (name: string) => {
        if (!name || name === 'undefined') return "M 50 10 L 90 90 L 10 90 Z"; // Fallback Triangle
        switch (name) {
            case 'Q1': return "M 50 10 L 90 50 L 50 90 L 10 50 Z"; // Diamond
            case 'Q2': return "M 50 5 L 95 30 L 95 80 L 50 95 L 5 80 L 5 30 Z"; // Hexagon
            case 'V7alt': return "M 50 0 L 100 0 L 80 100 L 20 100 L 0 0 Z"; // Trapezoid/Aggressive
            case 'Maj7': return "M 10 10 L 90 10 L 90 90 L 10 90 Z"; // Square / Stable
            case 'Dim7': return "M 50 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0"; // Circle
            default: return "M 50 10 L 90 90 L 10 90 Z"; // Triangle
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-64 h-64">
                {/* Background Grid */}
                <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full opacity-20">
                    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.5" fill="none" />
                    <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.5" fill="none" />
                    <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="0.5" fill="none" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
                </svg>

                {/* Active Shape */}
                <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    <motion.path
                        d={getPath(gripName)}
                        fill={color}
                        fillOpacity={0.4}
                        stroke={color}
                        strokeWidth="2"
                        animate={{
                            d: getPath(gripName),
                            scale: isActive ? [1, 1.1, 1] : 1,
                            strokeWidth: isActive ? 3 : 2
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        className="text-2xl font-bold bg-black/50 px-3 py-1 rounded backdrop-blur-sm"
                        style={{ color: color }}
                        animate={{ opacity: isActive ? 1 : 0.7 }}
                    >
                        {gripName}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default GripRadar;
