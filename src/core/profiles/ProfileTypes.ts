export interface StudentProfile {
    id: string;
    name: string;
    createdAt: number;
    lastActive: number;
    songProgress: Map<string, SongProgress>;
    totalPracticeTime: number;
    achievements: string[];
}

export interface SongProgress {
    songTitle: string;
    maxBpm: number;
    attempts: number;
    lastPracticed: number;
    mastered: boolean;
    hotspotScores: Map<number, number>;
}

export interface ProfileStats {
    totalSongs: number;
    masteredSongs: number;
    averageBpm: number;
    practiceStreak: number;
}
