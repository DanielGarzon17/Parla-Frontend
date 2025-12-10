// Service for managing saved phrases (HU06, HU07, HU15, HU16)
// Connected to backend API at /api/phrases/phrases

import { 
  SavedPhrase, 
  PhraseFilter, 
  PhraseSort, 
  Language, 
  Difficulty, 
  GrammaticalCategory,
  ApiPhrase,
  ApiPhraseCreateResponse,
  ApiPhrasesResponse,
  ApiCategory,
  ApiCategoriesResponse,
  ApiError
} from '@/types/phrases';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const PHRASES_ENDPOINT = `${API_BASE_URL}/phrases/phrases/`;
const CATEGORIES_ENDPOINT = `${API_BASE_URL}/phrases/categories/`;

// Language code to ID mapping (based on backend)
export const LANGUAGE_CODE_TO_ID: Record<string, number> = {
  'en': 1,
  'es': 2,
  'fr': 7,
  'de': 3,
  'it': 4,
  'pt': 5,
};

// Language ID to code mapping (reverse)
export const LANGUAGE_ID_TO_CODE: Record<number, string> = {
  1: 'en',
  2: 'es',
  3: 'de',
  4: 'it',
  5: 'pt',
  7: 'fr',
};

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
    await fetch(PHRASES_ENDPOINT, {
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
 * Custom error class for API errors
 */
export class PhrasesApiError extends Error {
  status?: number;
  details?: Record<string, unknown>;

  constructor(message: string, status?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'PhrasesApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Map language code to Language type, with fallback
 */
const mapLanguageCode = (code: string): Language => {
  const validCodes: Language[] = ['en', 'es', 'fr', 'de', 'it', 'pt'];
  return validCodes.includes(code as Language) ? (code as Language) : 'en';
};

/**
 * Infer difficulty based on phrase length (since backend doesn't provide it)
 */
const inferDifficulty = (phrase: string): Difficulty => {
  const wordCount = phrase.split(/\s+/).length;
  if (wordCount <= 2) return 'easy';
  if (wordCount <= 5) return 'medium';
  return 'hard';
};

/**
 * Transform API phrase to SavedPhrase format
 */
const transformApiPhrase = (apiPhrase: ApiPhrase): SavedPhrase => {
  return {
    id: apiPhrase.id.toString(),
    phrase: apiPhrase.original_text,
    translation: apiPhrase.translated_text,
    context: apiPhrase.source_type ? `Source: ${apiPhrase.source_type}` : undefined,
    sourceUrl: undefined,
    createdAt: new Date(apiPhrase.created_at),
    lastReviewedAt: undefined,
    isFavorite: false, // Backend doesn't provide this yet
    isLearned: false,  // Backend doesn't provide this yet
    category: apiPhrase.source_type || 'Vocabulario',
    language: mapLanguageCode(apiPhrase.source_language.code),
    difficulty: inferDifficulty(apiPhrase.original_text),
    tags: [apiPhrase.source_language.name, apiPhrase.target_language.name],
    wordType: 'phrase', // Default, backend doesn't provide this yet
  };
};

/**
 * Handle API response and throw appropriate errors
 */
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  // Debug: log response status
  //console.log(`API Response: ${response.status} ${response.statusText}`, response.url);
  
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    let details: Record<string, unknown> | undefined;

    try {
      const errorData = await response.json();
      console.error('API Error details:', errorData);
      errorMessage = errorData.message || errorData.detail || errorMessage;
      details = errorData;
    } catch {
      // Response body is not JSON, try to get text
      try {
        const textError = await response.text();
        console.error('API Error text:', textError);
        errorMessage = textError || errorMessage;
      } catch {
        // Ignore
      }
    }

    throw new PhrasesApiError(errorMessage, response.status, details);
  }

  return response.json();
};

/**
 * Fetch categories from the backend API
 * GET /api/phrases/categories/
 * Soporta respuesta paginada (results) o lista directa sin paginación.
 */
export const fetchCategories = async (): Promise<ApiCategory[]> => {
  try {
    const response = await fetch(CATEGORIES_ENDPOINT, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await handleApiResponse<ApiCategoriesResponse | ApiCategory[]>(response);

    // DRF paginada: { results, next, previous }
    if (data && !Array.isArray(data) && 'results' in data) {
      // Si hay varias páginas, concatenamos iterando next
      const allCategories: ApiCategory[] = [...data.results];
      let nextUrl = data.next;
      while (nextUrl) {
        const nextResponse = await fetch(nextUrl, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const nextData = await handleApiResponse<ApiCategoriesResponse>(nextResponse);
        allCategories.push(...nextData.results);
        nextUrl = nextData.next;
      }
      return allCategories;
    }

    // Lista directa sin paginación
    if (Array.isArray(data)) {
      return data;
    }

    throw new PhrasesApiError('Formato de respuesta de categorías no esperado', undefined);
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al obtener las categorías',
      undefined
    );
  }
};

/**
 * Fetch all saved phrases from the backend API
 */
export const fetchPhrases = async (): Promise<SavedPhrase[]> => {
  try {
    const response = await fetch(PHRASES_ENDPOINT, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await handleApiResponse<ApiPhrasesResponse>(response);
    
    // Transform API response to SavedPhrase format
    return data.results.map(transformApiPhrase);
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    
    // Network or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new PhrasesApiError(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        0
      );
    }
    
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error desconocido al obtener las frases',
      undefined
    );
  }
};

/**
 * Fetch phrases with pagination support
 */
export const fetchPhrasesWithPagination = async (url?: string): Promise<{
  phrases: SavedPhrase[];
  count: number;
  next: string | null;
  previous: string | null;
}> => {
  try {
    const endpoint = url || PHRASES_ENDPOINT;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    const data = await handleApiResponse<ApiPhrasesResponse>(response);
    
    return {
      phrases: data.results.map(transformApiPhrase),
      count: data.count,
      next: data.next,
      previous: data.previous,
    };
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error desconocido al obtener las frases',
      undefined
    );
  }
};

/**
 * Get a single phrase by ID from the API
 */
export const getPhraseById = async (id: string): Promise<SavedPhrase | null> => {
  try {
    const response = await fetch(`${PHRASES_ENDPOINT}${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (response.status === 404) {
      return null;
    }

    const data = await handleApiResponse<ApiPhrase>(response);
    return transformApiPhrase(data);
  } catch (error) {
    if (error instanceof PhrasesApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create phrase request body interface
 * Matches backend PhraseCreateSerializer fields
 */
interface CreatePhraseRequest {
  original_text: string;
  translated_text: string;
  source_language: number;
  target_language: number;
  pronunciation?: string | null;
  source_url?: string | null;
  source_type?: 'youtube' | 'netflix' | 'web' | 'pdf' | null;
  context?: string | null;
  category_ids?: number[];
}

/**
 * Result of creating a phrase, includes both the SavedPhrase and the numeric ID
 */
export interface CreatePhraseResult {
  phrase: SavedPhrase;
  phraseId: number; // Numeric ID from backend, needed for creating flashcards
}

/**
 * Options for creating a phrase
 */
export interface CreatePhraseOptions {
  pronunciation?: string;
  sourceUrl?: string;
  sourceType?: 'youtube' | 'netflix' | 'web' | 'pdf';
  context?: string;
  categoryIds?: number[];
}

/**
 * Create a new phrase with raw parameters
 * POST /api/phrases/phrases/
 * 
 * IMPORTANT: Backend PhraseCreateSerializer does NOT return 'id' in response.
 * We need to fetch the phrases list to get the newly created phrase with its ID.
 * 
 * @param originalText - The original text/phrase
 * @param translatedText - The translated text
 * @param sourceLanguageId - Source language ID (1=en, 2=es, 3=de, 4=it, 5=pt, 7=fr)
 * @param targetLanguageId - Target language ID
 * @param options - Additional options (pronunciation, sourceUrl, sourceType, context, categoryIds)
 * @returns CreatePhraseResult with both SavedPhrase and numeric phraseId
 */
export const createPhrase = async (
  originalText: string,
  translatedText: string,
  sourceLanguageId: number = 1,
  targetLanguageId: number = 2,
  options?: CreatePhraseOptions
): Promise<CreatePhraseResult> => {
  try {
    // Ensure CSRF token is available before making POST request
    await ensureCsrfToken();
    
    const requestBody: CreatePhraseRequest = {
      original_text: originalText,
      translated_text: translatedText,
      source_language: sourceLanguageId,
      target_language: targetLanguageId,
    };

    // Add optional fields if provided
    if (options?.pronunciation) requestBody.pronunciation = options.pronunciation;
    if (options?.sourceUrl) requestBody.source_url = options.sourceUrl;
    if (options?.sourceType) requestBody.source_type = options.sourceType;
    if (options?.context) requestBody.context = options.context;
    if (options?.categoryIds && options.categoryIds.length > 0) {
      requestBody.category_ids = options.categoryIds;
    }

    const response = await fetch(PHRASES_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    // Backend PhraseCreateSerializer returns the created phrase but WITHOUT id
    const createData = await handleApiResponse<ApiPhraseCreateResponse>(response);
    
    //console.log('Create phrase response:', createData);
    
    // Since backend doesn't return ID, we need to fetch the latest phrase
    // The list is ordered by -created_at, so the first one should be our new phrase
    const listResponse = await fetch(`${PHRASES_ENDPOINT}?ordering=-created_at&page_size=1`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    const listData = await handleApiResponse<ApiPhrasesResponse>(listResponse);
    
    // Find the phrase we just created by matching text
    const createdPhrase = listData.results.find(
      p => p.original_text === originalText && p.translated_text === translatedText
    );
    
    if (!createdPhrase) {
      console.warn('Could not find created phrase in list, using temporary ID');
      // Fallback: create a temporary SavedPhrase without real ID
      const sourceLanguageCode = LANGUAGE_ID_TO_CODE[sourceLanguageId] || 'en';
      const savedPhrase: SavedPhrase = {
        id: `temp-${Date.now()}`,
        phrase: originalText,
        translation: translatedText,
        context: createData.context || undefined,
        sourceUrl: createData.source_url || undefined,
        createdAt: new Date(),
        isFavorite: false,
        isLearned: false,
        category: createData.source_type || 'Vocabulario',
        language: mapLanguageCode(sourceLanguageCode),
        difficulty: inferDifficulty(originalText),
        tags: [],
        wordType: 'phrase',
      };
      
      return {
        phrase: savedPhrase,
        phraseId: 0, // No real ID available
      };
    }
    
    // Transform the found phrase to SavedPhrase format
    const savedPhrase = transformApiPhrase(createdPhrase);
    
    return {
      phrase: savedPhrase,
      phraseId: createdPhrase.id,
    };
  } catch (error) {
    if (error instanceof PhrasesApiError) {
      throw error;
    }
    throw new PhrasesApiError(
      error instanceof Error ? error.message : 'Error al crear la frase',
      undefined
    );
  }
};

/**
 * Extended phrase input for creating phrases with category IDs
 */
export interface AddPhraseInput extends Omit<SavedPhrase, 'id' | 'createdAt'> {
  categoryIds?: number[];
  sourceType?: 'youtube' | 'netflix' | 'web' | 'pdf';
}

/**
 * Add a new phrase via API (using SavedPhrase format)
 * POST /api/phrases/phrases/
 * Body: { original_text, translated_text, source_language (id), target_language (id), category_ids, etc. }
 * @returns CreatePhraseResult with both SavedPhrase and numeric phraseId
 */
export const addPhrase = async (phrase: AddPhraseInput): Promise<CreatePhraseResult> => {
  // Get language IDs from codes
  const sourceLanguageId = LANGUAGE_CODE_TO_ID[phrase.language] || 1; // Default to English
  const targetLanguageId = 2; // Default to Spanish (es) as target
  
  const options: CreatePhraseOptions = {};
  if (phrase.context) options.context = phrase.context;
  if (phrase.sourceUrl) options.sourceUrl = phrase.sourceUrl;
  if (phrase.sourceType) options.sourceType = phrase.sourceType;
  if (phrase.categoryIds && phrase.categoryIds.length > 0) {
    options.categoryIds = phrase.categoryIds;
  }
  
  return createPhrase(
    phrase.phrase,
    phrase.translation,
    sourceLanguageId,
    targetLanguageId,
    Object.keys(options).length > 0 ? options : undefined
  );
};

/**
 * Update an existing phrase via API
 * PATCH /api/phrases/phrases/{id}/
 */
export const updatePhrase = async (id: string, updates: Partial<SavedPhrase>): Promise<SavedPhrase | null> => {
  try {
    // Ensure CSRF token is available before making PATCH request
    await ensureCsrfToken();
    
    // Build update body - only include fields that are provided
    const updateBody: Partial<CreatePhraseRequest> = {};
    if (updates.phrase) updateBody.original_text = updates.phrase;
    if (updates.translation) updateBody.translated_text = updates.translation;
    if (updates.language) updateBody.source_language = LANGUAGE_CODE_TO_ID[updates.language] || 1;

    const response = await fetch(`${PHRASES_ENDPOINT}${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updateBody),
    });

    if (response.status === 404) {
      return null;
    }

    const data = await handleApiResponse<ApiPhrase>(response);
    return transformApiPhrase(data);
  } catch (error) {
    if (error instanceof PhrasesApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Delete a phrase via API
 * DELETE /api/phrases/phrases/{id}/
 */
export const deletePhrase = async (id: string): Promise<boolean> => {
  try {
    // Ensure CSRF token is available before making DELETE request
    await ensureCsrfToken();
    
    const response = await fetch(`${PHRASES_ENDPOINT}${id}/`, {
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

// Local state for favorite/learned status (until backend supports it)
const localPhraseState: Map<string, { isFavorite: boolean; isLearned: boolean; lastReviewedAt?: Date }> = new Map();

/**
 * Toggle favorite status
 * Note: Currently stored locally until backend supports this feature
 */
export const toggleFavorite = async (id: string): Promise<SavedPhrase | null> => {
  try {
    const phrase = await getPhraseById(id);
    if (!phrase) return null;
    
    const currentState = localPhraseState.get(id) || { isFavorite: false, isLearned: false };
    currentState.isFavorite = !currentState.isFavorite;
    localPhraseState.set(id, currentState);
    
    return { ...phrase, ...currentState };
  } catch {
    return null;
  }
};

/**
 * Toggle learned status
 * Note: Currently stored locally until backend supports this feature
 */
export const toggleLearned = async (id: string): Promise<SavedPhrase | null> => {
  try {
    const phrase = await getPhraseById(id);
    if (!phrase) return null;
    
    const currentState = localPhraseState.get(id) || { isFavorite: false, isLearned: false };
    currentState.isLearned = !currentState.isLearned;
    if (currentState.isLearned) {
      currentState.lastReviewedAt = new Date();
    }
    localPhraseState.set(id, currentState);
    
    return { ...phrase, ...currentState };
  } catch {
    return null;
  }
};

/**
 * Filter phrases based on criteria
 */
export const filterPhrases = (phrases: SavedPhrase[], filter: PhraseFilter): SavedPhrase[] => {
  switch (filter) {
    case 'favorites':
      return phrases.filter(p => p.isFavorite);
    case 'learned':
      return phrases.filter(p => p.isLearned);
    case 'new':
      return phrases.filter(p => !p.isLearned);
    default:
      return phrases;
  }
};

/**
 * Sort phrases
 */
export const sortPhrases = (phrases: SavedPhrase[], sort: PhraseSort): SavedPhrase[] => {
  const sorted = [...phrases];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'alphabetical':
      return sorted.sort((a, b) => a.phrase.localeCompare(b.phrase));
    default:
      return sorted;
  }
};

/**
 * Search phrases by text
 */
export const searchPhrases = (phrases: SavedPhrase[], query: string): SavedPhrase[] => {
  const lowerQuery = query.toLowerCase();
  return phrases.filter(p => 
    p.phrase.toLowerCase().includes(lowerQuery) ||
    p.translation.toLowerCase().includes(lowerQuery) ||
    p.context?.toLowerCase().includes(lowerQuery) ||
    p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Filter by language (HU15)
 */
export const filterByLanguage = (phrases: SavedPhrase[], language: Language | 'all'): SavedPhrase[] => {
  if (language === 'all') return phrases;
  return phrases.filter(p => p.language === language);
};

/**
 * Filter by difficulty (HU15)
 */
export const filterByDifficulty = (phrases: SavedPhrase[], difficulty: Difficulty | 'all'): SavedPhrase[] => {
  if (difficulty === 'all') return phrases;
  return phrases.filter(p => p.difficulty === difficulty);
};

/**
 * Filter by category (HU15)
 */
export const filterByCategory = (phrases: SavedPhrase[], category: string | 'all'): SavedPhrase[] => {
  if (category === 'all') return phrases;
  return phrases.filter(p => p.category === category);
};

/**
 * Get unique categories from phrases
 */
export const getUniqueCategories = (phrases: SavedPhrase[]): string[] => {
  const categories = new Set(phrases.map(p => p.category).filter(Boolean) as string[]);
  return Array.from(categories).sort();
};

/**
 * Filter by word type / grammatical category (HU16)
 */
export const filterByWordType = (phrases: SavedPhrase[], wordType: GrammaticalCategory | 'all'): SavedPhrase[] => {
  if (wordType === 'all') return phrases;
  return phrases.filter(p => p.wordType === wordType);
};

/**
 * Get unique word types from phrases (HU16)
 */
export const getUniqueWordTypes = (phrases: SavedPhrase[]): GrammaticalCategory[] => {
  const types = new Set(phrases.map(p => p.wordType).filter(Boolean) as GrammaticalCategory[]);
  return Array.from(types).sort();
};

/**
 * Group phrases by word type (HU16)
 */
export const groupByWordType = (phrases: SavedPhrase[]): Record<GrammaticalCategory, SavedPhrase[]> => {
  const groups: Partial<Record<GrammaticalCategory, SavedPhrase[]>> = {};
  
  phrases.forEach(phrase => {
    const type = phrase.wordType || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type]!.push(phrase);
  });
  
  return groups as Record<GrammaticalCategory, SavedPhrase[]>;
};

/**
 * Get random phrases for practice (HU12.1, HU12.2)
 */
export const getRandomPhrases = (phrases: SavedPhrase[], count: number): SavedPhrase[] => {
  const shuffled = [...phrases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
