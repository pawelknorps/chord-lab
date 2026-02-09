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
                        className={`absolute transition-all duration-200 ${isActive ? 'opacity-100 scale-110' : 'opacity-60'}`}
                        style={{
                            top: `${row * 25 + 18}%`,
                            left: `${(col / 4) * 100 + 2}%`,
                            width: '22%',
                        }}
                    >
                        <div className="flex gap-2 text-xs font-bold justify-center">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shadow-sm">
                                {gt.third}
                            </span>
                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded shadow-sm">
                                {gt.seventh}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
