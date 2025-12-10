// Types for saved phrases (HU06, HU07, HU15, HU16)
// Based on actual backend models in XLR8-parla-backend

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

// Backend API response types
export interface ApiLanguage {
  id: number;
  code: string;
  name: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  type: 'grammar' | 'theme';
  type_display?: string;
  description?: string;
}

// Response from GET /api/phrases/phrases/ (list) - uses PhraseListSerializer
export interface ApiPhrase {
  id: number;
  original_text: string;
  translated_text: string;
  source_language: ApiLanguage;
  target_language: ApiLanguage;
  source_type: string | null;
  created_at: string;
}

// Response from GET /api/phrases/phrases/{id}/ (detail) - uses PhraseDetailSerializer
export interface ApiPhraseDetail {
  id: number;
  user: string;
  original_text: string;
  translated_text: string;
  pronunciation: string | null;
  source_language: ApiLanguage;
  target_language: ApiLanguage;
  source_url: string | null;
  source_type: string | null;
  context: string | null;
  categories: ApiCategory[];
  created_at: string;
  updated_at: string;
}

// Response from POST /api/phrases/phrases/ (create) - uses PhraseCreateSerializer
// IMPORTANT: Backend PhraseCreateSerializer does NOT return 'id' in response!
// It only returns the fields defined in the serializer
export interface ApiPhraseCreateResponse {
  original_text: string;
  translated_text: string;
  pronunciation: string | null;
  source_language: number; // Returns the ID, not the object
  target_language: number; // Returns the ID, not the object
  source_url: string | null;
  source_type: string | null;
  context: string | null;
  category_ids?: number[];
}

// Request body for POST /api/phrases/phrases/
export interface ApiPhraseCreateRequest {
  original_text: string;
  translated_text: string;
  source_language: number; // Language ID
  target_language: number; // Language ID
  pronunciation?: string | null;
  source_url?: string | null;
  source_type?: string | null;
  context?: string | null;
  category_ids?: number[];
}

export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ApiPhrasesResponse = ApiPaginatedResponse<ApiPhrase>;
export type ApiCategoriesResponse = ApiPaginatedResponse<ApiCategory>;

// Legacy type alias for backwards compatibility
export type Language = LanguageCode;
export type Difficulty = 'easy' | 'medium' | 'hard';

// HU16 - Grammatical categories for words
export type GrammaticalCategory = 
  | 'verb'        // Verbo
  | 'noun'        // Sustantivo
  | 'adjective'   // Adjetivo
  | 'adverb'      // Adverbio
  | 'pronoun'     // Pronombre
  | 'preposition' // Preposición
  | 'conjunction' // Conjunción
  | 'interjection'// Interjección
  | 'phrase'      // Frase/Expresión
  | 'idiom'       // Modismo
  | 'other';      // Otro

export interface SavedPhrase {
  id: string;
  phrase: string;
  translation: string;
  context?: string; // Optional context where the phrase was found
  sourceUrl?: string; // URL where the phrase was captured (from extension)
  createdAt: Date;
  lastReviewedAt?: Date;
  isFavorite: boolean;
  isLearned: boolean;
  category?: string;
  notes?: string;
  // HU15 - New fields for filtering
  language: Language;
  difficulty: Difficulty;
  tags?: string[];
  // HU16 - Grammatical category
  wordType?: GrammaticalCategory;
}

export interface PhrasesState {
  phrases: SavedPhrase[];
  isLoading: boolean;
  error: string | null;
  // Pagination info from API
  totalCount?: number;
  nextPage?: string | null;
  previousPage?: string | null;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Filter options for the phrases list (HU15)
export type PhraseFilter = 'all' | 'favorites' | 'learned' | 'new';

// Sort options
export type PhraseSort = 'newest' | 'oldest' | 'alphabetical';

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'Inglés',
  es: 'Español',
  fr: 'Francés',
  de: 'Alemán',
  it: 'Italiano',
  pt: 'Portugués',
};

// Difficulty display names
export const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

// Category options
export const CATEGORIES = [
  'Vocabulario',
  'Gramática',
  'Expresiones',
  'Negocios',
  'Viajes',
  'Cotidiano',
  'Académico',
  'Otro',
] as const;

// HU16 - Grammatical category display names
export const GRAMMATICAL_CATEGORY_NAMES: Record<GrammaticalCategory, string> = {
  verb: 'Verbo',
  noun: 'Sustantivo',
  adjective: 'Adjetivo',
  adverb: 'Adverbio',
  pronoun: 'Pronombre',
  preposition: 'Preposición',
  conjunction: 'Conjunción',
  interjection: 'Interjección',
  phrase: 'Frase',
  idiom: 'Modismo',
  other: 'Otro',
};

// HU16 - Grammatical category colors for UI
export const GRAMMATICAL_CATEGORY_COLORS: Record<GrammaticalCategory, string> = {
  verb: 'bg-red-500/20 text-red-600',
  noun: 'bg-blue-500/20 text-blue-600',
  adjective: 'bg-green-500/20 text-green-600',
  adverb: 'bg-yellow-500/20 text-yellow-600',
  pronoun: 'bg-purple-500/20 text-purple-600',
  preposition: 'bg-pink-500/20 text-pink-600',
  conjunction: 'bg-indigo-500/20 text-indigo-600',
  interjection: 'bg-orange-500/20 text-orange-600',
  phrase: 'bg-cyan-500/20 text-cyan-600',
  idiom: 'bg-teal-500/20 text-teal-600',
  other: 'bg-gray-500/20 text-gray-600',
};
