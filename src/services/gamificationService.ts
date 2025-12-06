// Gamification service for points, streaks, and achievements (HU10.1 - HU10.5)
// Mock implementation - ready to connect to backend

import { UserStats, Achievement, PracticeSession, WeeklyProgress, POINTS_CONFIG } from '@/types/gamification';

// Storage keys
const STORAGE_KEYS = {
  USER_STATS: 'parla_user_stats',
  PRACTICE_SESSIONS: 'parla_practice_sessions',
};

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Primeros Pasos',
    description: 'Completa tu primera sesión de práctica',
    icon: '🎯',
    unlockedAt: null,
    progress: 0,
    requirement: 1,
    type: 'sessions',
  },
  {
    id: 'streak_3',
    title: 'En Racha',
    description: 'Mantén una racha de 3 días',
    icon: '🔥',
    unlockedAt: null,
    progress: 0,
    requirement: 3,
    type: 'streak',
  },
  {
    id: 'streak_7',
    title: 'Semana Perfecta',
    description: 'Mantén una racha de 7 días',
    icon: '⭐',
    unlockedAt: null,
    progress: 0,
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'streak_30',
    title: 'Maestro de la Constancia',
    description: 'Mantén una racha de 30 días',
    icon: '👑',
    unlockedAt: null,
    progress: 0,
    requirement: 30,
    type: 'streak',
  },
  {
    id: 'phrases_10',
    title: 'Aprendiz',
    description: 'Practica 10 frases',
    icon: '📚',
    unlockedAt: null,
    progress: 0,
    requirement: 10,
    type: 'phrases',
  },
  {
    id: 'phrases_50',
    title: 'Estudiante Dedicado',
    description: 'Practica 50 frases',
    icon: '🎓',
    unlockedAt: null,
    progress: 0,
    requirement: 50,
    type: 'phrases',
  },
  {
    id: 'phrases_100',
    title: 'Experto en Frases',
    description: 'Practica 100 frases',
    icon: '🏆',
    unlockedAt: null,
    progress: 0,
    requirement: 100,
    type: 'phrases',
  },
  {
    id: 'points_500',
    title: 'Coleccionista',
    description: 'Acumula 500 puntos',
    icon: '💎',
    unlockedAt: null,
    progress: 0,
    requirement: 500,
    type: 'points',
  },
  {
    id: 'points_1000',
    title: 'Millonario del Conocimiento',
    description: 'Acumula 1000 puntos',
    icon: '💰',
    unlockedAt: null,
    progress: 0,
    requirement: 1000,
    type: 'points',
  },
  {
    id: 'accuracy_master',
    title: 'Precisión Perfecta',
    description: 'Logra 90% de precisión en 20+ respuestas',
    icon: '🎯',
    unlockedAt: null,
    progress: 0,
    requirement: 90,
    type: 'accuracy',
  },
];

// Generate mock weekly data
const generateWeeklyProgress = (): WeeklyProgress[] => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();
  
  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    
    // Random data for demo
    const flashcards = Math.floor(Math.random() * 15);
    const timetrial = Math.floor(Math.random() * 8);
    const matchcards = Math.floor(Math.random() * 5);
    
    return {
      day,
      date: date.toISOString().split('T')[0],
      flashcards,
      timetrial,
      matchcards,
      points: flashcards * 10 + timetrial * 15 + matchcards * 20,
    };
  });
};

// Get default stats
const getDefaultStats = (): UserStats => ({
  totalPoints: 1250,
  currentStreak: 5,
  longestStreak: 12,
  lastPracticeDate: new Date().toISOString().split('T')[0],
  totalPhrasesPracticed: 87,
  totalCorrectAnswers: 72,
  totalSessionsCompleted: 23,
  activeDays: 15,
  weeklyProgress: generateWeeklyProgress(),
  achievements: DEFAULT_ACHIEVEMENTS.map(a => ({
    ...a,
    // Unlock some achievements for demo
    unlockedAt: a.id === 'first_steps' || a.id === 'streak_3' || a.id === 'phrases_10' 
      ? new Date() 
      : null,
    progress: a.id === 'first_steps' ? 100 
      : a.id === 'streak_3' ? 100 
      : a.id === 'streak_7' ? 71 
      : a.id === 'phrases_10' ? 100 
      : a.id === 'phrases_50' ? 87 * 2 
      : a.id === 'points_500' ? 100 
      : a.id === 'points_1000' ? 125 
      : Math.floor(Math.random() * 80),
  })),
});

/**
 * Get user stats from storage or return defaults
 */
export const getUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
  return getDefaultStats();
};

/**
 * Save user stats to storage
 */
export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
};

/**
 * Check and update streak based on last practice date
 */
export const updateStreak = (stats: UserStats): UserStats => {
  const today = new Date().toISOString().split('T')[0];
  const lastPractice = stats.lastPracticeDate;
  
  if (!lastPractice) {
    // First time practicing
    return {
      ...stats,
      currentStreak: 1,
      lastPracticeDate: today,
    };
  }
  
  const lastDate = new Date(lastPractice);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Already practiced today
    return stats;
  } else if (diffDays === 1) {
    // Consecutive day - increase streak
    const newStreak = stats.currentStreak + 1;
    return {
      ...stats,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastPracticeDate: today,
    };
  } else {
    // Streak broken
    return {
      ...stats,
      currentStreak: 1,
      lastPracticeDate: today,
    };
  }
};

/**
 * Calculate points for a practice session
 */
export const calculateSessionPoints = (
  correctAnswers: number,
  totalQuestions: number,
  currentStreak: number
): { basePoints: number; streakBonus: number; perfectBonus: number; total: number } => {
  const wrongAnswers = totalQuestions - correctAnswers;
  
  const basePoints = 
    correctAnswers * POINTS_CONFIG.CORRECT_ANSWER + 
    wrongAnswers * POINTS_CONFIG.WRONG_ANSWER +
    POINTS_CONFIG.SESSION_COMPLETE_BONUS;
  
  const streakBonus = Math.floor(basePoints * (currentStreak * POINTS_CONFIG.STREAK_BONUS_MULTIPLIER));
  
  const perfectBonus = correctAnswers === totalQuestions && totalQuestions > 0 
    ? POINTS_CONFIG.PERFECT_SESSION_BONUS 
    : 0;
  
  return {
    basePoints,
    streakBonus,
    perfectBonus,
    total: basePoints + streakBonus + perfectBonus,
  };
};

/**
 * Complete a practice session and update stats
 */
export const completePracticeSession = (
  type: 'flashcards' | 'timetrial' | 'matchcards',
  phrasesReviewed: number,
  correctAnswers: number
): { stats: UserStats; pointsEarned: ReturnType<typeof calculateSessionPoints>; newAchievements: Achievement[] } => {
  let stats = getUserStats();
  
  // Update streak
  stats = updateStreak(stats);
  
  // Calculate points
  const pointsEarned = calculateSessionPoints(correctAnswers, phrasesReviewed, stats.currentStreak);
  
  // Update stats
  stats = {
    ...stats,
    totalPoints: stats.totalPoints + pointsEarned.total,
    totalPhrasesPracticed: stats.totalPhrasesPracticed + phrasesReviewed,
    totalCorrectAnswers: stats.totalCorrectAnswers + correctAnswers,
    totalSessionsCompleted: stats.totalSessionsCompleted + 1,
  };
  
  // Check for new achievements
  const newAchievements: Achievement[] = [];
  stats.achievements = stats.achievements.map(achievement => {
    if (achievement.unlockedAt) return achievement; // Already unlocked
    
    let newProgress = achievement.progress;
    let shouldUnlock = false;
    
    switch (achievement.type) {
      case 'streak':
        newProgress = (stats.currentStreak / achievement.requirement) * 100;
        shouldUnlock = stats.currentStreak >= achievement.requirement;
        break;
      case 'points':
        newProgress = (stats.totalPoints / achievement.requirement) * 100;
        shouldUnlock = stats.totalPoints >= achievement.requirement;
        break;
      case 'phrases':
        newProgress = (stats.totalPhrasesPracticed / achievement.requirement) * 100;
        shouldUnlock = stats.totalPhrasesPracticed >= achievement.requirement;
        break;
      case 'sessions':
        newProgress = (stats.totalSessionsCompleted / achievement.requirement) * 100;
        shouldUnlock = stats.totalSessionsCompleted >= achievement.requirement;
        break;
      case 'accuracy':
        if (stats.totalPhrasesPracticed >= 20) {
          const accuracy = (stats.totalCorrectAnswers / stats.totalPhrasesPracticed) * 100;
          newProgress = accuracy;
          shouldUnlock = accuracy >= achievement.requirement;
        }
        break;
    }
    
    const updated = {
      ...achievement,
      progress: Math.min(newProgress, 100),
      unlockedAt: shouldUnlock ? new Date() : null,
    };
    
    if (shouldUnlock && !achievement.unlockedAt) {
      newAchievements.push(updated);
    }
    
    return updated;
  });
  
  // Save updated stats
  saveUserStats(stats);
  
  return { stats, pointsEarned, newAchievements };
};

/**
 * Get accuracy percentage
 */
export const getAccuracy = (stats: UserStats): number => {
  if (stats.totalPhrasesPracticed === 0) return 0;
  return Math.round((stats.totalCorrectAnswers / stats.totalPhrasesPracticed) * 100);
};

/**
 * Get unlocked achievements count
 */
export const getUnlockedAchievementsCount = (stats: UserStats): number => {
  return stats.achievements.filter(a => a.unlockedAt !== null).length;
};

/**
 * Reset stats (for testing)
 */
export const resetStats = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_STATS);
};
