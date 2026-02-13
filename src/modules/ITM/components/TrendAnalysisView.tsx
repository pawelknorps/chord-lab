import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { TrendAnalysisService } from '../../../core/services/TrendAnalysisService';
import { useSessionHistoryStore } from '../../../core/store/useSessionHistoryStore';

/**
 * AI-powered trend analysis view for the progress dashboard (REQ-AN-02).
 */
export const TrendAnalysisView: React.FC = () => {
    const { sessions } = useSessionHistoryStore();
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const performAnalysis = async () => {
        if (sessions.length < 2) return;
        setIsLoading(true);
        const result = await TrendAnalysisService.analyzeGrowth(sessions);
        setAnalysis(result);
        setIsLoading(false);
    };

    useEffect(() => {
        performAnalysis();
    }, [sessions.length]);

    if (sessions.length < 2) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 bg-indigo-500/10 rounded-full">
                    <TrendingUp size={32} className="text-indigo-400 opacity-50" />
                </div>
                <div className="max-w-xs">
                    <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Growth Analysis Locked</h4>
                    <p className="text-neutral-500 text-xs font-medium leading-relaxed">
                        Play at least 2 sessions to unlock long-term growth insights from your AI Sensei.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-[40px] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-white font-black tracking-tighter text-lg">Sensei's Observation</h4>
                        <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest">Growth Pattern Analysis</span>
                    </div>
                </div>
                <button
                    onClick={performAnalysis}
                    disabled={isLoading}
                    className="p-2 hover:bg-white/5 rounded-full text-indigo-400 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2 py-4">
                    <div className="h-4 w-full bg-white/5 rounded-full animate-pulse" />
                    <div className="h-4 w-3/4 bg-white/5 rounded-full animate-pulse" />
                </div>
            ) : (
                <p className="text-indigo-100/90 font-medium leading-relaxed relative z-10 italic">
                    "{analysis || "Analyzing your trajectory through the jazz idiom..."}"
                </p>
            )}

            {/* Target Stats Summary */}
            <div className="flex gap-6 mt-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Trajectory</span>
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-tighter">Ascending</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-white/5 pl-6">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Engagement</span>
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-tighter">Consistent</span>
                </div>
            </div>
        </div>
    );
};
