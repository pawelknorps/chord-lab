import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { currentMeasureIndexSignal } from '../state/jazzSignals';

export function GuideToneOverlay() {
    const { guideTones, showGuideTones } = usePracticeStore();
    const currentMeasure = currentMeasureIndexSignal.value;

    if (!showGuideTones || guideTones.size === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            {Array.from(guideTones.entries()).map(([index, gt]) => {
                const isActive = index === currentMeasure;
                const row = Math.floor(index / 4);
                const col = index % 4;

                return (
                    <div
                        key={index}
                        className={`absolute transition-all duration-200 ${isActive ? 'opacity-100 scale-105' : 'opacity-80'}`}
                        style={{
                            top: `${row * 25 + 16}%`,
                            left: `${(col / 4) * 100 + 1}%`,
                            width: '23%',
                        }}
                    >
                        <div className="flex gap-1.5 text-sm font-bold justify-center items-center">
                            <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md shadow-md border border-emerald-300">
                                {gt.third}
                            </span>
                            <span className="text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md shadow-md border border-blue-300">
                                {gt.seventh}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
