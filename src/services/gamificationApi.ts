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

export { ApiError };
