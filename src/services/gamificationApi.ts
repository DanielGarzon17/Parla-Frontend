// Gamification API service - connects to Django backend
// Endpoints: /api/flashcards/timed/*, /api/flashcards/matching/*, /api/flashcards/practice-sessions/*

import { apiGet, apiPost, ApiError } from './api';

// ============================================
// TYPES - Based on backend serializers
// ============================================

export interface PhraseData {
  id: number;
  original_text: string;
  translated_text: string;
  source_language: { id: number; code: string; name: string };
  target_language: { id: number; code: string; name: string };
  source_type: string;
  created_at: string;
}

export interface PracticeSessionDetail {
  id: number;
  phrase: PhraseData;
  was_correct: boolean;
  response_time_seconds: number | null;
  answered_at: string;
}

export interface PracticeSession {
  id: number;
  session_type: 'flashcard' | 'timed' | 'matching' | 'quiz';
  session_type_display: string;
  phrases_practiced: number;
  correct_answers: number;
  incorrect_answers: number;
  points_earned: number;
  duration_seconds: number;
  completed: boolean;
  accuracy: number;
  started_at: string;
  completed_at: string | null;
  mode_data: Record<string, unknown>;
  details: PracticeSessionDetail[];
  user: string;
}

// ============================================
// TIME TRIAL API - /api/flashcards/timed/*
// ============================================

export interface TimedStartResponse {
  session: PracticeSession;
  questions: Array<{ id: number; original_text: string }>;
  time_limit_seconds: number;
}

export interface TimedAnswerResponse {
  detail: PracticeSessionDetail;
  correct: boolean;
  session: PracticeSession;
}

export interface TimedFinishResponse {
  session: PracticeSession;
}

/**
 * Start a new Time Trial session
 * POST /api/flashcards/timed/start/
 * @param seconds - Time limit in seconds (default 60)
 * @param count - Number of questions (default 20)
 */
export const startTimedSession = async (
  seconds: number = 60,
  count: number = 5
): Promise<TimedStartResponse> => {
  return apiPost<TimedStartResponse>('/flashcards/timed/start/', {
    seconds,
    count,
  });
};

/**
 * Submit an answer for Time Trial
 * POST /api/flashcards/timed/answer/
 */
export const submitTimedAnswer = async (
  sessionId: number,
  phraseId: number,
  userAnswer: string,
  elapsedSeconds?: number
): Promise<TimedAnswerResponse> => {
  return apiPost<TimedAnswerResponse>('/flashcards/timed/answer/', {
    session_id: sessionId,
    phrase_id: phraseId,
    user_answer: userAnswer,
    elapsed_seconds: elapsedSeconds,
  });
};

/**
 * Finish a Time Trial session
 * POST /api/flashcards/timed/finish/
 */
export const finishTimedSession = async (sessionId: number): Promise<TimedFinishResponse> => {
  return apiPost<TimedFinishResponse>('/flashcards/timed/finish/', {
    session_id: sessionId,
  });
};

// ============================================
// MATCH CARDS API - /api/flashcards/matching/*
// ============================================

export interface MatchingCard {
  id: number;
  text: string;
}

export interface MatchingStartResponse {
  session: PracticeSession;
  left: MatchingCard[];
  right: MatchingCard[];
}

export interface MatchResult {
  left_id: number;
  right_id: number;
  correct: boolean;
  error?: string;
}

export interface MatchingCheckResponse {
  results: MatchResult[];
  summary: PracticeSession;
}

export interface MatchingFinishResponse {
  session: PracticeSession;
}

/**
 * Start a new Matching game session
 * POST /api/flashcards/matching/start/
 * @param pairs - Number of pairs (default 6)
 */
export const startMatchingSession = async (pairs: number = 6): Promise<MatchingStartResponse> => {
  return apiPost<MatchingStartResponse>('/flashcards/matching/start/', {
    pairs,
  });
};

/**
 * Check matches in a Matching game
 * POST /api/flashcards/matching/check/
 */
export const checkMatches = async (
  sessionId: number,
  matches: Array<{ left_id: number; right_id: number }>
): Promise<MatchingCheckResponse> => {
  return apiPost<MatchingCheckResponse>('/flashcards/matching/check/', {
    session_id: sessionId,
    matches,
  });
};

/**
 * Finish a Matching game session
 * POST /api/flashcards/matching/finish/
 */
export const finishMatchingSession = async (sessionId: number): Promise<MatchingFinishResponse> => {
  return apiPost<MatchingFinishResponse>('/flashcards/matching/finish/', {
    session_id: sessionId,
  });
};

// ============================================
// PRACTICE SESSIONS API - /api/flashcards/practice-sessions/*
// ============================================

export interface PracticeSessionsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PracticeSession[];
}

/**
 * Get all practice sessions for the current user
 * GET /api/flashcards/practice-sessions/
 */
export const getPracticeSessions = async (): Promise<PracticeSession[]> => {
  try {
    const response = await apiGet<PracticeSessionsListResponse>('/flashcards/practice-sessions/');
    return response.results || [];
  } catch (error) {
    // If it's a simple array response
    if (Array.isArray(error)) {
      return error;
    }
    throw error;
  }
};

/**
 * Get a specific practice session by ID
 * GET /api/flashcards/practice-sessions/{id}/
 */
export const getPracticeSession = async (sessionId: number): Promise<PracticeSession> => {
  return apiGet<PracticeSession>(`/flashcards/practice-sessions/${sessionId}/`);
};

/**
 * Start a new practice session
 * POST /api/flashcards/practice-sessions/start/
 */
export const startPracticeSession = async (
  sessionType: 'flashcard' | 'timed' | 'matching' | 'quiz'
): Promise<PracticeSession> => {
  return apiPost<PracticeSession>('/flashcards/practice-sessions/start/', {
    session_type: sessionType,
  });
};

/**
 * Complete a practice session
 * POST /api/flashcards/practice-sessions/{session_id}/complete/
 */
export const completePracticeSession = async (sessionId: number): Promise<PracticeSession> => {
  return apiPost<PracticeSession>(`/flashcards/practice-sessions/${sessionId}/complete/`, {});
};

/**
 * Add a practice detail (record an answer)
 * POST /api/flashcards/practice-sessions/{session_id}/detail/
 */
export interface PracticeDetailRequest {
  phrase_id: number;
  was_correct: boolean;
  response_time_seconds?: number;
}

export interface PracticeDetailResponse {
  id: number;
  phrase: {
    id: number;
    original_text: string;
    translated_text: string;
  };
  was_correct: boolean;
  response_time_seconds: number | null;
  answered_at: string;
}

export const addPracticeDetail = async (
  sessionId: number,
  detail: PracticeDetailRequest
): Promise<PracticeDetailResponse> => {
  return apiPost<PracticeDetailResponse>(
    `/flashcards/practice-sessions/${sessionId}/detail/`,
    detail
  );
};

// ============================================
// STATS HELPERS - Aggregate data from sessions
// ============================================

export interface UserGameStats {
  totalSessions: number;
  totalPoints: number;
  totalPhrasesPracticed: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  accuracy: number;
  sessionsByType: {
    flashcard: number;
    timed: number;
    matching: number;
    quiz: number;
  };
  recentSessions: PracticeSession[];
}

/**
 * Calculate user stats from practice sessions
 */
export const calculateUserStats = (sessions: PracticeSession[]): UserGameStats => {
  const completedSessions = sessions.filter(s => s.completed);
  
  const totalPoints = completedSessions.reduce((sum, s) => sum + s.points_earned, 0);
  const totalPhrases = completedSessions.reduce((sum, s) => sum + s.phrases_practiced, 0);
  const totalCorrect = completedSessions.reduce((sum, s) => sum + s.correct_answers, 0);
  const totalIncorrect = completedSessions.reduce((sum, s) => sum + s.incorrect_answers, 0);
  
  const sessionsByType = {
    flashcard: completedSessions.filter(s => s.session_type === 'flashcard').length,
    timed: completedSessions.filter(s => s.session_type === 'timed').length,
    matching: completedSessions.filter(s => s.session_type === 'matching').length,
    quiz: completedSessions.filter(s => s.session_type === 'quiz').length,
  };

  return {
    totalSessions: completedSessions.length,
    totalPoints,
    totalPhrasesPracticed: totalPhrases,
    totalCorrectAnswers: totalCorrect,
    totalIncorrectAnswers: totalIncorrect,
    accuracy: totalPhrases > 0 ? Math.round((totalCorrect / totalPhrases) * 100) : 0,
    sessionsByType,
    recentSessions: completedSessions.slice(0, 10),
  };
};

/**
 * Fetch and calculate user stats
 */
export const fetchUserGameStats = async (): Promise<UserGameStats> => {
  try {
    const sessions = await getPracticeSessions();
    return calculateUserStats(sessions);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return empty stats on error
    return {
      totalSessions: 0,
      totalPoints: 0,
      totalPhrasesPracticed: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      accuracy: 0,
      sessionsByType: { flashcard: 0, timed: 0, matching: 0, quiz: 0 },
      recentSessions: [],
    };
  }
};

/**
 * Calculate daily stats from PracticeSession data
 * This is a frontend alternative when DailyStatistic is not being updated by backend
 */
export interface DailyStatsFromSessions {
  date: string;
  phrases_practiced: number;
  correct_answers: number;
  points_earned: number;
  sessions_count: number;
  accuracy: number;
}

export const calculateDailyStatsFromSessions = (sessions: PracticeSession[], days: number = 7): DailyStatsFromSessions[] => {
  const today = new Date();
  const result: DailyStatsFromSessions[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter sessions for this date
    const daySessions = sessions.filter(s => {
      if (!s.started_at) return false;
      const sessionDate = new Date(s.started_at).toISOString().split('T')[0];
      return sessionDate === dateStr && s.completed;
    });
    
    const phrases = daySessions.reduce((sum, s) => sum + s.phrases_practiced, 0);
    const correct = daySessions.reduce((sum, s) => sum + s.correct_answers, 0);
    const points = daySessions.reduce((sum, s) => sum + s.points_earned, 0);
    
    result.push({
      date: dateStr,
      phrases_practiced: phrases,
      correct_answers: correct,
      points_earned: points,
      sessions_count: daySessions.length,
      accuracy: phrases > 0 ? Math.round((correct / phrases) * 100) : 0,
    });
  }
  
  return result;
};

/**
 * Fetch daily stats calculated from practice sessions
 * Use this as fallback when DailyStatistic endpoint returns zeros
 */
export const fetchDailyStatsFromSessions = async (days: number = 7): Promise<DailyStatsFromSessions[]> => {
  try {
    const sessions = await getPracticeSessions();
    return calculateDailyStatsFromSessions(sessions, days);
  } catch (error) {
    console.error('Error calculating daily stats from sessions:', error);
    return [];
  }
};

// ============================================
// STREAK API - /api/gamification/*
// ============================================

export interface StreakData {
  streak: number;
  best_streak: number;
  last_practice_date?: string;
}

/**
 * Get current user's streak data
 * GET /api/gamification/streak/
 */
export const getStreak = async (): Promise<StreakData> => {
  return apiGet<StreakData>('/gamification/streak/');
};

/**
 * Record activity and update streak
 * POST /api/gamification/activity/
 * Call this when user completes a practice session
 */
export const recordActivity = async (): Promise<StreakData> => {
  return apiPost<StreakData>('/gamification/activity/', {});
};

// ============================================
// ACHIEVEMENTS API - /api/gamification/achievements/
// ============================================

export interface UserAchievement {
  id: number;
  achievement_type: string;
  achievement_name: string;
  achieved_at: string;
}

/**
 * All possible achievements from backend (gamification/models.py ACHIEVEMENT_TYPES)
 */
export interface AchievementDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  // Streak achievements
  { type: 'streak_7', name: '7 días consecutivos', description: 'Practica 7 días seguidos', icon: '🔥', color: 'text-orange-500', gradient: 'from-orange-500/20 to-red-500/20' },
  { type: 'streak_30', name: '30 días consecutivos', description: 'Practica 30 días seguidos', icon: '🔥', color: 'text-orange-500', gradient: 'from-orange-500/20 to-red-500/20' },
  { type: 'streak_100', name: '100 días consecutivos', description: 'Practica 100 días seguidos', icon: '🔥', color: 'text-orange-500', gradient: 'from-orange-500/20 to-red-500/20' },
  // Phrases achievements
  { type: 'phrases_50', name: '50 frases guardadas', description: 'Guarda 50 frases', icon: '📚', color: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/20' },
  { type: 'phrases_100', name: '100 frases guardadas', description: 'Guarda 100 frases', icon: '📖', color: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/20' },
  { type: 'phrases_500', name: '500 frases guardadas', description: 'Guarda 500 frases', icon: '🎓', color: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/20' },
  // Special achievements
  { type: 'perfect_10', name: '10 sesiones perfectas', description: 'Completa 10 sesiones sin errores', icon: '🎯', color: 'text-green-500', gradient: 'from-green-500/20 to-emerald-500/20' },
  { type: 'speed_demon', name: 'Contrarreloj < 2 min', description: 'Completa contrarreloj en menos de 2 minutos', icon: '⚡', color: 'text-purple-500', gradient: 'from-purple-500/20 to-violet-500/20' },
  { type: 'polyglot', name: '3+ idiomas', description: 'Practica en 3 o más idiomas', icon: '🌍', color: 'text-cyan-500', gradient: 'from-cyan-500/20 to-teal-500/20' },
  // Points achievements
  { type: 'points_1000', name: '1,000 puntos', description: 'Alcanza 1,000 puntos', icon: '⭐', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-amber-500/20' },
  { type: 'points_5000', name: '5,000 puntos', description: 'Alcanza 5,000 puntos', icon: '🌟', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-amber-500/20' },
  { type: 'points_10000', name: '10,000 puntos', description: 'Alcanza 10,000 puntos', icon: '💫', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-amber-500/20' },
];

/**
 * Get all achievements unlocked by the user
 * GET /api/gamification/achievements/
 */
export const getAchievements = async (): Promise<UserAchievement[]> => {
  return apiGet<UserAchievement[]>('/gamification/achievements/');
};

/**
 * Get achievement definition by type
 */
export const getAchievementDefinition = (type: string): AchievementDefinition | undefined => {
  return ALL_ACHIEVEMENTS.find(a => a.type === type);
};

// ============================================
// POINTS API - /api/gamification/points/
// ============================================

export interface PointsData {
  total_points: number;
}

/**
 * Get user's total points
 * GET /api/gamification/points/
 */
export const getPoints = async (): Promise<PointsData> => {
  return apiGet<PointsData>('/gamification/points/');
};

/**
 * Add points after completing a game
 * POST /api/gamification/points/add/
 * @param amount - Total points to add from the current game
 * @returns Updated total points
 */
export const addPoints = async (amount: number): Promise<PointsData> => {
  return apiPost<PointsData>('/gamification/points/add/', { amount });
};

// ============================================
// STATS API - /api/gamification/daily-stats/, weekly-stats/, monthly-stats/
// ============================================

export interface DailyStatEntry {
  id: number;
  user: string;
  date: string;
  phrases_practiced: number;
  correct_answers: number;
  practice_minutes: number;
  points_earned: number;
  streak_maintained: boolean;
  accuracy: number;
}

export interface DailyStatsResponse {
  start_date: string;
  end_date: string;
  total_days: number;
  data: DailyStatEntry[];
}

export interface WeeklyStatEntry {
  week_start: string;
  week_end: string;
  total_phrases: number;
  total_correct: number;
  total_minutes: number;
  total_points: number;
  days_practiced: number;
  average_accuracy: number;
}

export interface WeeklyStatsResponse {
  weeks: number;
  data: WeeklyStatEntry[];
}

export interface MonthlyStatEntry {
  month: number;
  year: number;
  month_name: string;
  total_phrases: number;
  total_correct: number;
  total_points: number;
  days_active: number;
  average_accuracy: number;
}

export interface MonthlyStatsResponse {
  months: number;
  data: MonthlyStatEntry[];
}

/**
 * Get daily stats for the last N days
 * GET /api/gamification/daily-stats/?days=7
 */
export const getDailyStats = async (days: number = 7): Promise<DailyStatsResponse> => {
  return apiGet<DailyStatsResponse>(`/gamification/daily-stats/?days=${days}`);
};

/**
 * Get weekly stats for the last N weeks
 * GET /api/gamification/weekly-stats/?weeks=4
 */
export const getWeeklyStats = async (weeks: number = 4): Promise<WeeklyStatsResponse> => {
  return apiGet<WeeklyStatsResponse>(`/gamification/weekly-stats/?weeks=${weeks}`);
};

/**
 * Get monthly stats for the last N months
 * GET /api/gamification/monthly-stats/?months=6
 */
export const getMonthlyStats = async (months: number = 6): Promise<MonthlyStatsResponse> => {
  return apiGet<MonthlyStatsResponse>(`/gamification/monthly-stats/?months=${months}`);
};

export { ApiError };
