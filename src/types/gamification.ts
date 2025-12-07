// Types for gamification system (HU10.1 - HU10.5)

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  totalPhrasesPracticed: number;
  totalCorrectAnswers: number;
  totalSessionsCompleted: number;
  activeDays: number;
  weeklyProgress: WeeklyProgress[];
  achievements: Achievement[];
}

export interface WeeklyProgress {
  day: string;
  date: string;
  flashcards: number;
  timetrial: number;
  matchcards: number;
  points: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress: number; // 0-100
  requirement: number;
  type: 'streak' | 'points' | 'phrases' | 'sessions' | 'accuracy';
}

export interface PracticeSession {
  id: string;
  type: 'flashcards' | 'timetrial' | 'matchcards';
  startedAt: Date;
  completedAt: Date | null;
  phrasesReviewed: number;
  correctAnswers: number;
  pointsEarned: number;
}

// Points configuration
export const POINTS_CONFIG = {
  CORRECT_ANSWER: 10,
  WRONG_ANSWER: 2, // Still get some points for trying
  SESSION_COMPLETE_BONUS: 50,
  STREAK_BONUS_MULTIPLIER: 0.1, // 10% bonus per day of streak
  PERFECT_SESSION_BONUS: 100,
};
