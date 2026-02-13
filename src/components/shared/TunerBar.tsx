import { motion } from 'framer-motion';

interface TunerBarProps {
    cents: number;
    className?: string;
    /** Whether to show numeric cents value. */
    showValue?: boolean;
    /** Sensitivity: values within this range (±cents) are 'perfect'. */
    perfectThreshold?: number;
}

/**
 * TunerBar (2026): A premium, liquid-animated cents indicator for pitch precision.
 * Shows ±50 cents deviation from the nearest chromatic note.
 */
export function TunerBar({
    cents,
    className = '',
    showValue = true,
    perfectThreshold = 10
}: TunerBarProps) {
    const isPerfect = Math.abs(cents) <= perfectThreshold;
    const isNear = Math.abs(cents) <= 25;

    // Clamp cents to [-50, 50] for display
    const displayCents = Math.max(-50, Math.min(50, cents));

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden relative border border-white/5">
                {/* Center marker */}
                <div className="absolute top-0 left-1/2 -translate-x-px w-[2px] h-full bg-white/20 z-10" />

                {/* Perfect zone marker (optional subtle glow) */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full bg-emerald-500/10"
                    style={{ width: `${(perfectThreshold / 50) * 100}%` }}
                />

                {/* The "Liquid" indicator */}
                <motion.div
                    animate={{
                        x: `${50 + (displayCents / 100) * 50}%`,
                        backgroundColor: isPerfect ? '#10b981' : isNear ? '#f59e0b' : '#ef4444',
                        boxShadow: isPerfect ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        mass: 0.5
                    }}
                    className="absolute top-0 left-[-50%] w-full h-full rounded-full"
                />
            </div>

            {showValue && (
                <div className="flex justify-between w-full text-[8px] font-mono uppercase tracking-tighter tabular-nums">
                    <span className="text-zinc-600">-50c</span>
                    <span className={`transition-colors duration-200 ${isPerfect ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                        {cents > 0 ? '+' : ''}{cents.toFixed(0)}c
                    </span>
                    <span className="text-zinc-600">+50c</span>
                </div>
            )}
        </div>
    );
}
