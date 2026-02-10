import { useState, useEffect } from 'react';
import { Lightbulb, Target, Sparkles, AlertTriangle } from 'lucide-react';
import { sampleLessons, LessonData } from '../data/lessonDatabase';

export function SmartLessonPane({ songId }: { songId: string }) {
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!songId) return;
        setLoading(true);

        // Try local database first
        if (sampleLessons[songId]) {
            setLesson(sampleLessons[songId]);
            setLoading(false);
            return;
        }

        // Fallback to JSON import
        import(`../../../public/lessons/${songId}.json`)
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
                            <div className="font-bold">{h.type} @ m.{h.measures.join('-')}</div>
                            <div className="text-[10px] text-white/60 mt-1">{h.analysis}</div>
                        </div>
                    ))}
                </div>
            )}

            {lesson.avoidNotes.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-red-400">
                        <AlertTriangle size={10} />
                        Avoid Notes
                    </div>
                    {lesson.avoidNotes.map((a, i) => (
                        <div key={i} className="text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
                            <span className="font-bold">{a.chord}</span>: Avoid {a.avoid.join(', ')}
                            {a.reason && <div className="text-[10px] text-white/60 mt-1">{a.reason}</div>}
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

            {lesson.practicePoints && lesson.practicePoints.length > 0 && (
                <div className="space-y-1">
                    <div className="text-[10px] text-white/40">Practice Points</div>
                    <ul className="text-xs text-white/70 space-y-1">
                        {lesson.practicePoints.map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-emerald-400">•</span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
