// Types for Dictionary (Words separate from Phrases)

import { Language, Difficulty, GrammaticalCategory } from './phrases';

// Word entry in the dictionary
export interface DictionaryWord {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string; // IPA or phonetic
  definitions: Definition[];
  examples: Example[];
  synonyms?: string[];
  antonyms?: string[];
  language: Language;
  targetLanguage: Language; // Translation target
  difficulty: Difficulty;
  wordType: GrammaticalCategory;
  tags?: string[];
  isFavorite: boolean;
  isLearned: boolean;
  createdAt: Date;
  lastReviewedAt?: Date;
  reviewCount: number;
  notes?: string;
}

// Definition with part of speech
export interface Definition {
  id: string;
  meaning: string;
  partOfSpeech: GrammaticalCategory;
  usage?: string; // Usage notes
}

// Example sentence
export interface Example {
  id: string;
  sentence: string;
  translation: string;
  source?: string;
}

// Dictionary state
export interface DictionaryState {
  words: DictionaryWord[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: DictionaryFilters;
}

// Filters for dictionary
export interface DictionaryFilters {
  language: Language | 'all';
  wordType: GrammaticalCategory | 'all';
  difficulty: Difficulty | 'all';
  status: 'all' | 'learned' | 'learning' | 'favorites';
}

// Sort options for dictionary
export type DictionarySort = 'alphabetical' | 'recent' | 'oldest' | 'mostReviewed';

// Dictionary sort display names
export const DICTIONARY_SORT_NAMES: Record<DictionarySort, string> = {
  alphabetical: 'Alfabético',
  recent: 'Más recientes',
  oldest: 'Más antiguas',
  mostReviewed: 'Más repasadas',
};
