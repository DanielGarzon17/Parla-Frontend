// Types for flashcards based on actual backend models in XLR8-parla-backend

import { ApiPhrase } from './phrases';

// FlashcardReview model - uses FlashcardReviewSerializer
export interface ApiFlashcardReview {
  id: number;
  phrase: number; // Phrase ID (for create/update)
  repetitions: number;
  interval: number;
  ef: number;
  next_review_date: string;
  total_reviews: number;
  correct_reviews: number;
  accuracy: number; // Calculated field
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Flashcard with phrase details for display
export interface FlashcardWithPhrase extends ApiFlashcardReview {
  phraseDetails?: ApiPhrase;
}

// Request body for POST /api/flashcards/
export interface ApiFlashcardCreateRequest {
  phrase: number; // Phrase ID
}

// Response from POST /api/flashcards/{phrase_id}/answer/
export interface ApiFlashcardAnswerResponse {
  message: string;
  interval_days: number;
  ef: number;
  repetitions: number;
  next_review: string;
}

// Request body for POST /api/flashcards/{phrase_id}/answer/
export interface ApiFlashcardAnswerRequest {
  quality: number; // 0-5
}

// PracticeSession model - uses PracticeSessionSerializer
export interface ApiPracticeSession {
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
  details: ApiPracticeSessionDetail[];
  user: string;
}

// PracticeSessionDetail model
export interface ApiPracticeSessionDetail {
  id: number;
  phrase: ApiPhrase;
  was_correct: boolean;
  response_time_seconds: number | null;
  answered_at: string;
}

// Matching game types
export interface MatchingStartResponse {
  session: ApiPracticeSession;
  left: { id: number; text: string }[];
  right: { id: number; text: string }[];
}

export interface MatchingCheckRequest {
  session_id: number;
  matches: { left_id: number; right_id: number }[];
}

export interface MatchingCheckResponse {
  results: { left_id: number; right_id: number; correct: boolean; error?: string }[];
  summary: ApiPracticeSession;
}

// Timed game types
export interface TimedStartResponse {
  session: ApiPracticeSession;
  questions: { id: number; original_text: string }[];
  time_limit_seconds: number;
}

export interface TimedAnswerRequest {
  session_id: number;
  phrase_id: number;
  user_answer: string;
  elapsed_seconds?: number;
}

export interface TimedAnswerResponse {
  detail: ApiPracticeSessionDetail;
  correct: boolean;
  session: ApiPracticeSession;
}
