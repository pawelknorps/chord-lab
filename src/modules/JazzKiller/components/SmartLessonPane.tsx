import { useState, useEffect } from 'react';
import { Lightbulb, Target, Sparkles } from 'lucide-react';

interface Lesson {
    hotspots: Array<{ type: string; measures: number[]; analysis: string }>;
    avoidNotes: Array<{ measure: number; chord: string; avoid: string[] }>;
    substitutions: Array<{ original: string; sub: string; measures: number[] }>;
    goldenLick: string;
}

export function SmartLessonPane({ songId }: { songId: string }) {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!songId) return;
        setLoading(true);
        import(`../../public/lessons/${songId}.json`)
            .then(m => setLesson(m.default))
            .catch(() => setLesson(null))
            .finally(() => setLoading(false));
    }, [songId]);

    if (loading) return <div className="text-white/40 text-xs">Loading lesson...</div>;
    if (!lesson) return null;

    return (
        <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
            <div className="flex items-center gap-2 text-xs uppercase font-black text-purple-400">
                <Sparkles size={14} />
                AI Analysis
            </div>

            {lesson.hotspots.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                        <Target size={10} />
                        Hotspots
                    </div>
                    {lesson.hotspots.map((h, i) => (
                        <div key={i} className="text-xs text-white/80 bg-white/5 p-2 rounded">
                            {h.type} @ m.{h.measures.join('-')}
                        </div>
                    ))}
                </div>
            )}

            {lesson.goldenLick && (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                        <Lightbulb size={10} />
                        Golden Lick
                    </div>
                    <p className="text-xs text-amber-400">{lesson.goldenLick}</p>
                </div>
            )}
        </div>
    );
}
