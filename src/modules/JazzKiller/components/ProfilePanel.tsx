import { User, TrendingUp, Award } from 'lucide-react';
import { useProfileStore } from '../../../core/profiles/useProfileStore';

export function ProfilePanel() {
    const { currentProfile, profiles, createProfile, switchProfile, getStats } = useProfileStore();
    const stats = getStats();

    if (!currentProfile) {
        return (
            <div className="fixed top-20 right-6 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl z-40 w-80">
                <h3 className="text-lg font-bold text-white mb-4">Create Profile</h3>
                <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-neutral-800 border border-white/10 rounded-lg text-white mb-3"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                            createProfile(e.currentTarget.value);
                        }
                    }}
                />
                <p className="text-xs text-neutral-500">Press Enter to create</p>
            </div>
        );
    }

    return (
        <div className="fixed top-20 right-6 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl z-40 w-80">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{currentProfile.name}</h3>
                    <p className="text-xs text-neutral-500">Student Profile</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-400" />
                        <span className="text-sm text-neutral-400">Avg BPM</span>
                    </div>
                    <span className="text-lg font-bold text-white">{Math.round(stats.averageBpm)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-emerald-400" />
                        <span className="text-sm text-neutral-400">Mastered</span>
                    </div>
                    <span className="text-lg font-bold text-white">{stats.masteredSongs}/{stats.totalSongs}</span>
                </div>
            </div>

            {profiles.length > 1 && (
                <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-neutral-500 mb-2">Switch Profile</p>
                    <div className="space-y-1">
                        {profiles.filter(p => p.id !== currentProfile.id).map(p => (
                            <button
                                key={p.id}
                                onClick={() => switchProfile(p.id)}
                                className="w-full text-left px-3 py-2 bg-neutral-800/30 hover:bg-neutral-800 rounded-lg text-sm text-neutral-300 transition-all"
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
