// Service for managing flashcards
// Connected to backend API at /api/flashcards/
// Based on actual backend in XLR8-parla-backend

import { PhrasesApiError, getPhraseById } from './phrasesService';
import { 
  ApiFlashcardReview, 
  ApiFlashcardAnswerResponse,
  ApiPracticeSession,
  MatchingStartResponse,
  MatchingCheckResponse,
  TimedStartResponse,
  TimedAnswerResponse,
  FlashcardWithPhrase
} from '@/types/flashcards';
import { SavedPhrase } from '@/types/phrases';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const FLASHCARDS_ENDPOINT = `${API_BASE_URL}/flashcards/`;

// Type alias for backwards compatibility
export type Flashcard = ApiFlashcardReview;

/**
 * Create flashcard request body
 */
interface CreateFlashcardRequest {
  phrase: number; // Phrase ID
}

/**
 * Get CSRF token from cookies
 * Django sets this cookie and requires it for POST/PUT/PATCH/DELETE requests
 */
const getCsrfToken = (): string | null => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

/**
 * Ensure CSRF token is available by making a GET request first
 * This is a workaround for when the backend doesn't send CSRF cookie on login
 */
const ensureCsrfToken = async (): Promise<void> => {
  if (!getCsrfToken()) {
    //console.log('CSRF token not found, fetching...');
    // Make a GET request to get the CSRF cookie
    await fetch(FLASHCARDS_ENDPOINT, {
      method: 'GET',
      credentials: 'include',
    });
  }
};

/**
 * Get headers for API requests
 * Authentication is handled via JWT cookie 'session' (credentials: 'include')
 * CSRF token is required for POST/PUT/PATCH/DELETE requests
 */
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add CSRF token for Django (required for mutating requests)
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  return headers;
};

/**
 * Handle API response and throw appropriate errors
 */
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  //console.log(`Flashcards API Response: ${response.status} ${response.statusText}`, response.url);
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    let details: Record<string, unknown> | undefined;

    try {
      const errorData = await response.json();
      console.error('Flashcards API Error details:', errorData);
      errorMessage = errorData.message || errorData.detail || JSON.stringify(errorData);
      details = errorData;
    } catch {
      // Response body is not JSON, use default message
    }

    throw new PhrasesApiError(errorMessage, response.status, details);
  }

  return response.json();
};

/**
 * Create a flashcard from a phrase
 * POST /api/flashcards/
 * @param phraseId - The ID of the phrase to create a flashcard from
 */
export const createFlashcard = async (phraseId: number): Promise<Flashcard> => {
  try {
    // Validate phraseId before sending
    if (!phraseId || phraseId <= 0) {
      console.error('Invalid phraseId for flashcard creation:', phraseId);
      throw new PhrasesApiError('ID de frase inválido para crear flashcard', 400);
    }
    
    // Ensure CSRF token is available before making POST request
    await ensureCsrfToken();
    
    const requestBody: CreateFlashcardRequest = {
      phrase: phraseId,
    };

    //console.log('Creating flashcard with body:', requestBody);

    const response = await fetch(FLASHCARDS_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    const data = await handleApiResponse<Flashcard>(response);
    //console.log('Flashcard created:', data);
    return data;
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al crear la flashcard',
      undefined
    );
  }
};

/**
 * Get all flashcards for the current user
 * GET /api/flashcards/
 */
export const fetchFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const response = await fetch(FLASHCARDS_ENDPOINT, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await handleApiResponse<Flashcard[] | { results: Flashcard[] }>(response);
    
    // Handle both array and paginated response
    if (Array.isArray(data)) {
      return data;
    }
    return data.results || [];
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al obtener las flashcards',
      undefined
    );
  }
};

/**
 * Delete a flashcard
 * DELETE /api/flashcards/{id}/
 */
export const deleteFlashcard = async (id: number): Promise<boolean> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      return false;
    }

    if (response.status === 204 || response.ok) {
      return true;
    }

    await handleApiResponse(response);
    return true;
  } catch (error) {
    if (error instanceof PhrasesApiError && error.status === 404) {
      return false;
    }
    throw error;
  }
};

/**
 * Answer a flashcard and update spaced repetition schedule (SM-2)
 * POST /api/flashcards/{phrase_id}/answer/
 * 
 * @param phraseId - The ID of the phrase (NOT flashcard ID)
 * @param quality - Quality rating 0-5 for SM-2 algorithm
 */
export const answerFlashcard = async (
  phraseId: number, 
  quality: number // 0-5 quality rating for SM-2 algorithm
): Promise<ApiFlashcardAnswerResponse> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}${phraseId}/answer/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ quality }),
    });

    const data = await handleApiResponse<ApiFlashcardAnswerResponse>(response);
    return data;
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al responder la flashcard',
      undefined
    );
  }
};

/**
 * Get flashcards due for review
 * GET /api/flashcards/due/
 */
export const fetchDueFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const response = await fetch(`${FLASHCARDS_ENDPOINT}due/`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await handleApiResponse<Flashcard[]>(response);
    return data;
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al obtener flashcards pendientes',
      undefined
    );
  }
};

/**
 * Flashcard with phrase details for practice
 */
export interface FlashcardForPractice {
  flashcard: Flashcard;
  phrase: SavedPhrase;
}

/**
 * Get flashcards due for review WITH phrase details
 * This fetches /due/ and then gets phrase details for each
 * If no due flashcards, falls back to ALL flashcards
 * GET /api/flashcards/due/
 */
export const fetchDueFlashcardsWithPhrases = async (): Promise<FlashcardForPractice[]> => {
  try {
    // First try to get due flashcards
    let flashcards = await fetchDueFlashcards();
    //console.log(`Due flashcards from /due/: ${flashcards.length}`, flashcards);
    
    // If no due flashcards, get ALL flashcards as fallback
    if (flashcards.length === 0) {
      //console.log('No due flashcards, fetching all flashcards...');
      flashcards = await fetchFlashcards();
      //console.log(`All flashcards from /: ${flashcards.length}`, flashcards);
    }
    
    if (flashcards.length === 0) {
      //console.log('No flashcards found at all');
      return [];
    }
    
    // Fetch phrase details for each flashcard in parallel
    const flashcardsWithPhrases = await Promise.all(
      flashcards.map(async (flashcard) => {
        try {
          //console.log(`Fetching phrase ${flashcard.phrase} for flashcard ${flashcard.id}`);
          const phrase = await getPhraseById(flashcard.phrase.toString());
          if (phrase) {
            return { flashcard, phrase };
          }
          console.warn(`Phrase ${flashcard.phrase} not found`);
          return null;
        } catch (error) {
          console.warn(`Could not fetch phrase ${flashcard.phrase}:`, error);
          return null;
        }
      })
    );
    
    // Filter out nulls (phrases that couldn't be fetched)
    const result = flashcardsWithPhrases.filter((item): item is FlashcardForPractice => item !== null);
    //console.log(`Flashcards with phrases: ${result.length}`, result);
    return result;
  } catch (error) {
    console.error('Error in fetchDueFlashcardsWithPhrases:', error);
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al obtener flashcards para práctica',
      undefined
    );
  }
};

// ========================
// MATCHING GAME
// ========================

/**
 * Start a matching game session
 * POST /api/flashcards/matching/start/
 */
export const startMatchingGame = async (pairs: number = 8): Promise<MatchingStartResponse> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}matching/start/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ pairs }),
    });

    return await handleApiResponse<MatchingStartResponse>(response);
  } catch (error) {
    if (error instanceof PhrasesApiError) throw error;
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al iniciar juego de matching',
      undefined
    );
  }
};

/**
 * Check matches in a matching game
 * POST /api/flashcards/matching/check/
 */
export const checkMatches = async (
  sessionId: number, 
  matches: { left_id: number; right_id: number }[]
): Promise<MatchingCheckResponse> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}matching/check/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId, matches }),
    });

    return await handleApiResponse<MatchingCheckResponse>(response);
  } catch (error) {
    if (error instanceof PhrasesApiError) throw error;
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al verificar matches',
      undefined
    );
  }
};

/**
 * Finish a matching game session
 * POST /api/flashcards/matching/finish/
 */
export const finishMatchingGame = async (sessionId: number): Promise<{ session: ApiPracticeSession }> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}matching/finish/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId }),
    });

    return await handleApiResponse<{ session: ApiPracticeSession }>(response);
  } catch (error) {
    if (error instanceof PhrasesApiError) throw error;
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al finalizar juego de matching',
      undefined
    );
  }
};

// ========================
// TIMED GAME
// ========================

/**
 * Start a timed game session
 * POST /api/flashcards/timed/start/
 */
export const startTimedGame = async (seconds: number = 60, count: number = 20): Promise<TimedStartResponse> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}timed/start/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ seconds, count }),
    });

    return await handleApiResponse<TimedStartResponse>(response);
  } catch (error) {
    if (error instanceof PhrasesApiError) throw error;
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al iniciar juego contrarreloj',
      undefined
    );
  }
};

/**
 * Submit an answer in timed game
 * POST /api/flashcards/timed/answer/
 */
export const submitTimedAnswer = async (
  sessionId: number,
  phraseId: number,
  userAnswer: string,
  elapsedSeconds?: number
): Promise<TimedAnswerResponse> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}timed/answer/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ 
        session_id: sessionId, 
        phrase_id: phraseId, 
        user_answer: userAnswer,
        elapsed_seconds: elapsedSeconds 
      }),
    });

    return await handleApiResponse<TimedAnswerResponse>(response);
  } catch (error) {
    if (error instanceof PhrasesApiError) throw error;
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al enviar respuesta',
      undefined
    );
  }
};

/**
 * Finish a timed game session
 * POST /api/flashcards/timed/finish/
 */
export const finishTimedGame = async (sessionId: number): Promise<{ session: ApiPracticeSession }> => {
  try {
    await ensureCsrfToken();
    const response = await fetch(`${FLASHCARDS_ENDPOINT}timed/finish/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId }),
    });

    return await handleApiResponse<{ session: ApiPracticeSession }>(response);
  } catch (error) {
    if (error instanceof PhrasesApiError) throw error;
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al finalizar juego contrarreloj',
      undefined
    );
  }
};
