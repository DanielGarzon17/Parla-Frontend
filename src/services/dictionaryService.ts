// Dictionary Service
// Manages words separately from phrases

import { DictionaryWord, DictionaryFilters, DictionarySort, Definition, Example } from '@/types/dictionary';
import { Language, Difficulty, GrammaticalCategory } from '@/types/phrases';

// Mock data for development
const mockWords: DictionaryWord[] = [
  {
    id: 'w1',
    word: 'Run',
    translation: 'Correr',
    pronunciation: '/rʌn/',
    definitions: [
      { id: 'd1', meaning: 'To move quickly on foot', partOfSpeech: 'verb' },
      { id: 'd2', meaning: 'To operate or function', partOfSpeech: 'verb', usage: 'The machine runs smoothly' },
      { id: 'd3', meaning: 'A period of running', partOfSpeech: 'noun' },
    ],
    examples: [
      { id: 'e1', sentence: 'I run every morning.', translation: 'Corro cada mañana.' },
      { id: 'e2', sentence: 'The program runs on Windows.', translation: 'El programa funciona en Windows.' },
    ],
    synonyms: ['sprint', 'jog', 'dash'],
    antonyms: ['walk', 'stop'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'easy',
    wordType: 'verb',
    tags: ['movement', 'action', 'common'],
    isFavorite: true,
    isLearned: true,
    createdAt: new Date('2024-01-10'),
    lastReviewedAt: new Date('2024-02-15'),
    reviewCount: 12,
  },
  {
    id: 'w2',
    word: 'Beautiful',
    translation: 'Hermoso/a',
    pronunciation: '/ˈbjuːtɪfəl/',
    definitions: [
      { id: 'd4', meaning: 'Pleasing to the senses or mind aesthetically', partOfSpeech: 'adjective' },
      { id: 'd5', meaning: 'Of a very high standard; excellent', partOfSpeech: 'adjective' },
    ],
    examples: [
      { id: 'e3', sentence: 'What a beautiful sunset!', translation: '¡Qué hermoso atardecer!' },
      { id: 'e4', sentence: 'She has a beautiful voice.', translation: 'Ella tiene una voz hermosa.' },
    ],
    synonyms: ['gorgeous', 'stunning', 'lovely', 'attractive'],
    antonyms: ['ugly', 'hideous'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'easy',
    wordType: 'adjective',
    tags: ['description', 'positive', 'common'],
    isFavorite: true,
    isLearned: false,
    createdAt: new Date('2024-01-12'),
    reviewCount: 5,
  },
  {
    id: 'w3',
    word: 'Knowledge',
    translation: 'Conocimiento',
    pronunciation: '/ˈnɒlɪdʒ/',
    definitions: [
      { id: 'd6', meaning: 'Facts, information, and skills acquired through experience or education', partOfSpeech: 'noun' },
      { id: 'd7', meaning: 'Awareness or familiarity gained by experience', partOfSpeech: 'noun' },
    ],
    examples: [
      { id: 'e5', sentence: 'Knowledge is power.', translation: 'El conocimiento es poder.' },
      { id: 'e6', sentence: 'She has extensive knowledge of history.', translation: 'Ella tiene un amplio conocimiento de historia.' },
    ],
    synonyms: ['understanding', 'wisdom', 'learning'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'medium',
    wordType: 'noun',
    tags: ['education', 'abstract'],
    isFavorite: false,
    isLearned: false,
    createdAt: new Date('2024-01-15'),
    reviewCount: 3,
  },
  {
    id: 'w4',
    word: 'Quickly',
    translation: 'Rápidamente',
    pronunciation: '/ˈkwɪkli/',
    definitions: [
      { id: 'd8', meaning: 'At a fast speed; rapidly', partOfSpeech: 'adverb' },
      { id: 'd9', meaning: 'With little or no delay; promptly', partOfSpeech: 'adverb' },
    ],
    examples: [
      { id: 'e7', sentence: 'He quickly finished his homework.', translation: 'Él terminó rápidamente su tarea.' },
      { id: 'e8', sentence: 'Please respond quickly.', translation: 'Por favor responde rápidamente.' },
    ],
    synonyms: ['rapidly', 'swiftly', 'fast'],
    antonyms: ['slowly'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'easy',
    wordType: 'adverb',
    tags: ['speed', 'manner'],
    isFavorite: false,
    isLearned: true,
    createdAt: new Date('2024-01-18'),
    lastReviewedAt: new Date('2024-02-10'),
    reviewCount: 8,
  },
  {
    id: 'w5',
    word: 'Although',
    translation: 'Aunque',
    pronunciation: '/ɔːlˈðəʊ/',
    definitions: [
      { id: 'd10', meaning: 'In spite of the fact that; even though', partOfSpeech: 'conjunction' },
    ],
    examples: [
      { id: 'e9', sentence: 'Although it was raining, we went out.', translation: 'Aunque estaba lloviendo, salimos.' },
      { id: 'e10', sentence: 'I like him, although he can be annoying.', translation: 'Me cae bien, aunque puede ser molesto.' },
    ],
    synonyms: ['though', 'even though', 'despite'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'medium',
    wordType: 'conjunction',
    tags: ['connector', 'contrast'],
    isFavorite: false,
    isLearned: false,
    createdAt: new Date('2024-01-20'),
    reviewCount: 2,
  },
  {
    id: 'w6',
    word: 'Happiness',
    translation: 'Felicidad',
    pronunciation: '/ˈhæpinəs/',
    definitions: [
      { id: 'd11', meaning: 'The state of being happy', partOfSpeech: 'noun' },
      { id: 'd12', meaning: 'A feeling of pleasure and contentment', partOfSpeech: 'noun' },
    ],
    examples: [
      { id: 'e11', sentence: 'Money cannot buy happiness.', translation: 'El dinero no puede comprar la felicidad.' },
      { id: 'e12', sentence: 'Her happiness was contagious.', translation: 'Su felicidad era contagiosa.' },
    ],
    synonyms: ['joy', 'contentment', 'bliss', 'delight'],
    antonyms: ['sadness', 'misery', 'unhappiness'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'easy',
    wordType: 'noun',
    tags: ['emotion', 'positive', 'abstract'],
    isFavorite: true,
    isLearned: true,
    createdAt: new Date('2024-01-22'),
    lastReviewedAt: new Date('2024-02-18'),
    reviewCount: 15,
  },
  {
    id: 'w7',
    word: 'Serendipity',
    translation: 'Serendipia',
    pronunciation: '/ˌserənˈdɪpɪti/',
    definitions: [
      { id: 'd13', meaning: 'The occurrence of events by chance in a happy way', partOfSpeech: 'noun' },
    ],
    examples: [
      { id: 'e13', sentence: 'Finding that book was pure serendipity.', translation: 'Encontrar ese libro fue pura serendipia.' },
    ],
    synonyms: ['luck', 'fortune', 'chance'],
    language: 'en',
    targetLanguage: 'es',
    difficulty: 'hard',
    wordType: 'noun',
    tags: ['luck', 'abstract', 'rare'],
    isFavorite: false,
    isLearned: false,
    createdAt: new Date('2024-02-01'),
    reviewCount: 1,
  },
  {
    id: 'w8',
    word: 'Bonjour',
    translation: 'Buenos días / Hola',
    pronunciation: '/bɔ̃ʒuʁ/',
    definitions: [
      { id: 'd14', meaning: 'A greeting used during the day', partOfSpeech: 'interjection' },
    ],
    examples: [
      { id: 'e14', sentence: 'Bonjour, comment allez-vous?', translation: 'Buenos días, ¿cómo está?' },
    ],
    language: 'fr',
    targetLanguage: 'es',
    difficulty: 'easy',
    wordType: 'interjection',
    tags: ['greeting', 'common'],
    isFavorite: true,
    isLearned: true,
    createdAt: new Date('2024-02-05'),
    lastReviewedAt: new Date('2024-02-20'),
    reviewCount: 10,
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all dictionary words
 */
export const fetchWords = async (): Promise<DictionaryWord[]> => {
  await delay(300);
  return [...mockWords];
};

/**
 * Get a word by ID
 */
export const getWordById = async (id: string): Promise<DictionaryWord | null> => {
  await delay(100);
  return mockWords.find(w => w.id === id) || null;
};

/**
 * Search words
 */
export const searchWords = (words: DictionaryWord[], query: string): DictionaryWord[] => {
  if (!query.trim()) return words;
  
  const lowerQuery = query.toLowerCase();
  return words.filter(w =>
    w.word.toLowerCase().includes(lowerQuery) ||
    w.translation.toLowerCase().includes(lowerQuery) ||
    w.definitions.some(d => d.meaning.toLowerCase().includes(lowerQuery)) ||
    w.synonyms?.some(s => s.toLowerCase().includes(lowerQuery)) ||
    w.tags?.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Add a new word
 */
export const addWord = async (word: Omit<DictionaryWord, 'id' | 'createdAt' | 'reviewCount'>): Promise<DictionaryWord> => {
  await delay(200);
  const newWord: DictionaryWord = {
    ...word,
    id: `w${Date.now()}`,
    createdAt: new Date(),
    reviewCount: 0,
  };
  mockWords.push(newWord);
  return newWord;
};

/**
 * Update a word
 */
export const updateWord = async (id: string, updates: Partial<DictionaryWord>): Promise<DictionaryWord | null> => {
  await delay(200);
  const index = mockWords.findIndex(w => w.id === id);
  if (index === -1) return null;
  
  mockWords[index] = { ...mockWords[index], ...updates };
  return mockWords[index];
};

/**
 * Delete a word
 */
export const deleteWord = async (id: string): Promise<boolean> => {
  await delay(200);
  const index = mockWords.findIndex(w => w.id === id);
  if (index === -1) return false;
  
  mockWords.splice(index, 1);
  return true;
};

/**
 * Toggle favorite
 */
export const toggleWordFavorite = async (id: string): Promise<DictionaryWord | null> => {
  await delay(100);
  const word = mockWords.find(w => w.id === id);
  if (!word) return null;
  
  word.isFavorite = !word.isFavorite;
  return word;
};

/**
 * Toggle learned
 */
export const toggleWordLearned = async (id: string): Promise<DictionaryWord | null> => {
  await delay(100);
  const word = mockWords.find(w => w.id === id);
  if (!word) return null;
  
  word.isLearned = !word.isLearned;
  if (word.isLearned) {
    word.lastReviewedAt = new Date();
  }
  return word;
};

/**
 * Filter words
 */
export const filterWords = (words: DictionaryWord[], filters: DictionaryFilters): DictionaryWord[] => {
  let result = [...words];
  
  if (filters.language !== 'all') {
    result = result.filter(w => w.language === filters.language);
  }
  
  if (filters.wordType !== 'all') {
    result = result.filter(w => w.wordType === filters.wordType);
  }
  
  if (filters.difficulty !== 'all') {
    result = result.filter(w => w.difficulty === filters.difficulty);
  }
  
  if (filters.status !== 'all') {
    switch (filters.status) {
      case 'learned':
        result = result.filter(w => w.isLearned);
        break;
      case 'learning':
        result = result.filter(w => !w.isLearned);
        break;
      case 'favorites':
        result = result.filter(w => w.isFavorite);
        break;
    }
  }
  
  return result;
};

/**
 * Sort words
 */
export const sortWords = (words: DictionaryWord[], sort: DictionarySort): DictionaryWord[] => {
  const sorted = [...words];
  
  switch (sort) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.word.localeCompare(b.word));
    case 'recent':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'mostReviewed':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return sorted;
  }
};

/**
 * Get word statistics
 */
export const getWordStats = (words: DictionaryWord[]) => {
  return {
    total: words.length,
    learned: words.filter(w => w.isLearned).length,
    learning: words.filter(w => !w.isLearned).length,
    favorites: words.filter(w => w.isFavorite).length,
    byType: Object.entries(
      words.reduce((acc, w) => {
        acc[w.wordType] = (acc[w.wordType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
    byLanguage: Object.entries(
      words.reduce((acc, w) => {
        acc[w.language] = (acc[w.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  };
};
