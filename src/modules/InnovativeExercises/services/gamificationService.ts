export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  'swing-master-1': { id: 'swing-master-1', name: 'Swing Master I', description: 'Achieve a swing ratio between 1.9 and 2.1.', unlocked: false },
  'pocket-protector': { id: 'pocket-protector', name: 'Pocket Protector', description: 'Achieve an offset of less than 10ms.', unlocked: false },
  'guide-tone-guru': { id: 'guide-tone-guru', name: 'Guide Tone Guru', description: 'Complete the Voice-Leading Maze without any mistakes.', unlocked: false },
  'pitch-perfect': { id: 'pitch-perfect', name: 'Pitch Perfect', description: 'Score over 95% on the Intonation Heatmap.', unlocked: false },
  'rhythm-robot': { id: 'rhythm-robot', name: 'Rhythm Robot', description: 'Perfectly mimic a rhythm in Call and Response.', unlocked: false },
};

const STORAGE_KEY = 'itm-achievements';

export class GamificationService {
  private achievements: Record<string, Achievement>;

  constructor() {
    this.achievements = this.loadAchievements();
  }

  private loadAchievements(): Record<string, Achievement> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...ACHIEVEMENTS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Could not load achievements.", e);
    }
    return { ...ACHIEVEMENTS };
  }

  private saveAchievements() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.achievements));
    } catch (e) {
      console.error("Could not save achievements.", e);
    }
  }

  getAchievements(): Achievement[] {
    return Object.values(this.achievements);
  }

  unlockAchievement(id: string) {
    if (this.achievements[id] && !this.achievements[id].unlocked) {
      this.achievements[id].unlocked = true;
      this.saveAchievements();
      // Optionally, trigger a notification to the user
    }
  }

  // Example scoring function
  calculateSwingPocketScore(result: { ratio: number; offsetMs: number }): number {
    const ratioScore = 100 - Math.abs(result.ratio - 2.0) * 50;
    const offsetScore = 100 - Math.abs(result.offsetMs);
    const totalScore = (ratioScore + offsetScore) / 2;

    if (result.ratio >= 1.9 && result.ratio <= 2.1) {
      this.unlockAchievement('swing-master-1');
    }
    if (Math.abs(result.offsetMs) < 10) {
      this.unlockAchievement('pocket-protector');
    }

    return Math.max(0, Math.min(100, totalScore));
  }
}

export const gamificationService = new GamificationService();
