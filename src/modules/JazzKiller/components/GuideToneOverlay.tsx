import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { currentMeasureIndexSignal } from '../state/jazzSignals';

export function GuideToneOverlay() {
    const { guideTones, showGuideTones } = usePracticeStore();
    const currentMeasure = currentMeasureIndexSignal.value;

    if (!showGuideTones || guideTones.size === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {Array.from(guideTones.entries()).map(([index, gt]) => {
                const isActive = index === currentMeasure;
                const row = Math.floor(index / 4);
                const col = index % 4;

                return (
                    <div
                        key={index}
                        className={`absolute transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}
                        style={{
                            top: `${row * 25 + 2}%`,
                            left: `${(col / 4) * 100 + 2}%`,
                            width: '21%',
                        }}
                    >
                        <div className="flex gap-1 text-[10px] font-bold justify-center items-center">
                            <span className="text-emerald-600 bg-emerald-50/80 px-1.5 py-0.5 rounded shadow-sm border border-emerald-200/50">
                                {gt.third}
                            </span>
                            <span className="text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded shadow-sm border border-blue-200/50">
                                {gt.seventh}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
