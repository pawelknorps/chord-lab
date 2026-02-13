import { gamificationService, Achievement } from '../services/gamificationService';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export const AchievementsList: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(gamificationService.getAchievements());
  }, []);

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  if (unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Achievements Unlocked!</h4>
      <ul className="space-y-1">
        {unlockedAchievements.map(ach => (
          <li key={ach.id} className="flex items-center gap-2 text-sm text-white">
            <Trophy size={16} className="text-amber-400" />
            <span>{ach.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
