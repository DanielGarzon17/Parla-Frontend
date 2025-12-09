// Service for managing saved phrases (HU06, HU07, HU15, HU16)
// This service contains mock data and will be connected to the backend later

import { SavedPhrase, PhraseFilter, PhraseSort, Language, Difficulty, GrammaticalCategory } from '@/types/phrases';

// Mock data for development - Updated with language, difficulty (HU15), and wordType (HU16)
const mockPhrases: SavedPhrase[] = [
  {
    id: '1',
    phrase: 'Break a leg',
    translation: 'Buena suerte',
    context: 'Used to wish someone good luck, especially before a performance',
    sourceUrl: 'https://example.com/idioms',
    createdAt: new Date('2024-01-15'),
    lastReviewedAt: new Date('2024-01-20'),
    isFavorite: true,
    isLearned: true,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'medium',
    tags: ['idiom', 'luck'],
    wordType: 'idiom',
  },
  {
    id: '2',
    phrase: 'It\'s raining cats and dogs',
    translation: 'Está lloviendo a cántaros',
    context: 'Used to describe very heavy rain',
    createdAt: new Date('2024-01-18'),
    isFavorite: false,
    isLearned: false,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'easy',
    tags: ['weather', 'idiom'],
    wordType: 'idiom',
  },
  {
    id: '3',
    phrase: 'The early bird catches the worm',
    translation: 'Al que madruga, Dios le ayuda',
    context: 'Success comes to those who prepare well and put in effort',
    createdAt: new Date('2024-01-20'),
    isFavorite: true,
    isLearned: false,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'medium',
    tags: ['proverb', 'success'],
    wordType: 'phrase',
  },
  {
    id: '4',
    phrase: 'Piece of cake',
    translation: 'Pan comido',
    context: 'Something very easy to do',
    sourceUrl: 'https://example.com/expressions',
    createdAt: new Date('2024-01-22'),
    lastReviewedAt: new Date('2024-01-25'),
    isFavorite: false,
    isLearned: true,
    category: 'Cotidiano',
    language: 'en',
    difficulty: 'easy',
    tags: ['easy', 'idiom'],
    wordType: 'idiom',
  },
  {
    id: '5',
    phrase: 'Once in a blue moon',
    translation: 'De vez en cuando / Muy raramente',
    context: 'Something that happens very rarely',
    createdAt: new Date('2024-01-25'),
    isFavorite: false,
    isLearned: false,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'hard',
    tags: ['time', 'idiom'],
    wordType: 'adverb',
  },
  {
    id: '6',
    phrase: 'Hit the nail on the head',
    translation: 'Dar en el clavo',
    context: 'To describe exactly what is causing a situation or problem',
    createdAt: new Date('2024-01-28'),
    isFavorite: true,
    isLearned: true,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'medium',
    tags: ['accuracy', 'idiom'],
    wordType: 'idiom',
  },
  {
    id: '7',
    phrase: 'Better late than never',
    translation: 'Más vale tarde que nunca',
    context: 'It is better to do something late than not do it at all',
    createdAt: new Date('2024-02-01'),
    isFavorite: false,
    isLearned: false,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'easy',
    tags: ['proverb', 'time'],
    wordType: 'phrase',
  },
  {
    id: '8',
    phrase: 'Speak of the devil',
    translation: 'Hablando del rey de Roma',
    context: 'Said when a person appears just after being mentioned',
    createdAt: new Date('2024-02-05'),
    isFavorite: true,
    isLearned: false,
    category: 'Cotidiano',
    language: 'en',
    difficulty: 'medium',
    tags: ['surprise', 'idiom'],
    wordType: 'idiom',
  },
  {
    id: '9',
    phrase: 'To be on cloud nine',
    translation: 'Estar en las nubes / Muy feliz',
    context: 'To be extremely happy',
    createdAt: new Date('2024-02-08'),
    isFavorite: false,
    isLearned: false,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'medium',
    tags: ['happiness', 'idiom'],
    wordType: 'idiom',
  },
  {
    id: '10',
    phrase: 'A penny for your thoughts',
    translation: '¿En qué piensas?',
    context: 'Used to ask someone what they are thinking about',
    createdAt: new Date('2024-02-10'),
    isFavorite: false,
    isLearned: false,
    category: 'Cotidiano',
    language: 'en',
    difficulty: 'hard',
    tags: ['conversation', 'idiom'],
    wordType: 'phrase',
  },
  {
    id: '11',
    phrase: 'Bonjour, comment allez-vous?',
    translation: 'Buenos días, ¿cómo está usted?',
    context: 'Formal greeting in French',
    createdAt: new Date('2024-02-12'),
    isFavorite: true,
    isLearned: true,
    category: 'Cotidiano',
    language: 'fr',
    difficulty: 'easy',
    tags: ['greeting', 'formal'],
    wordType: 'phrase',
  },
  {
    id: '12',
    phrase: 'Wie geht es Ihnen?',
    translation: '¿Cómo está usted?',
    context: 'Formal way to ask how someone is in German',
    createdAt: new Date('2024-02-14'),
    isFavorite: false,
    isLearned: false,
    category: 'Cotidiano',
    language: 'de',
    difficulty: 'easy',
    tags: ['greeting', 'formal'],
    wordType: 'phrase',
  },
  // HU16 - Additional words with grammatical categories
  {
    id: '13',
    phrase: 'Run',
    translation: 'Correr',
    context: 'To move quickly on foot',
    createdAt: new Date('2024-02-16'),
    isFavorite: false,
    isLearned: true,
    category: 'Vocabulario',
    language: 'en',
    difficulty: 'easy',
    tags: ['movement', 'action'],
    wordType: 'verb',
  },
  {
    id: '14',
    phrase: 'Beautiful',
    translation: 'Hermoso/a',
    context: 'Pleasing to the senses or mind',
    createdAt: new Date('2024-02-17'),
    isFavorite: true,
    isLearned: false,
    category: 'Vocabulario',
    language: 'en',
    difficulty: 'easy',
    tags: ['description', 'positive'],
    wordType: 'adjective',
  },
  {
    id: '15',
    phrase: 'Quickly',
    translation: 'Rápidamente',
    context: 'In a fast manner',
    createdAt: new Date('2024-02-18'),
    isFavorite: false,
    isLearned: false,
    category: 'Vocabulario',
    language: 'en',
    difficulty: 'easy',
    tags: ['speed', 'manner'],
    wordType: 'adverb',
  },
  {
    id: '16',
    phrase: 'Happiness',
    translation: 'Felicidad',
    context: 'The state of being happy',
    createdAt: new Date('2024-02-19'),
    isFavorite: true,
    isLearned: true,
    category: 'Vocabulario',
    language: 'en',
    difficulty: 'medium',
    tags: ['emotion', 'positive'],
    wordType: 'noun',
  },
  {
    id: '17',
    phrase: 'Although',
    translation: 'Aunque',
    context: 'In spite of the fact that',
    createdAt: new Date('2024-02-20'),
    isFavorite: false,
    isLearned: false,
    category: 'Gramática',
    language: 'en',
    difficulty: 'medium',
    tags: ['connector', 'contrast'],
    wordType: 'conjunction',
  },
  {
    id: '18',
    phrase: 'Wow!',
    translation: '¡Guau!',
    context: 'Expression of surprise or admiration',
    createdAt: new Date('2024-02-21'),
    isFavorite: false,
    isLearned: true,
    category: 'Expresiones',
    language: 'en',
    difficulty: 'easy',
    tags: ['emotion', 'exclamation'],
    wordType: 'interjection',
  },
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all saved phrases
 * TODO: Replace with actual API call
 */
export const fetchPhrases = async (): Promise<SavedPhrase[]> => {
  await delay(500); // Simulate network delay
  return [...mockPhrases];
};

/**
 * Get a single phrase by ID
 * TODO: Replace with actual API call
 */
export const getPhraseById = async (id: string): Promise<SavedPhrase | null> => {
  await delay(200);
  return mockPhrases.find(p => p.id === id) || null;
};

/**
 * Add a new phrase
 * TODO: Replace with actual API call
 */
export const addPhrase = async (phrase: Omit<SavedPhrase, 'id' | 'createdAt'>): Promise<SavedPhrase> => {
  await delay(300);
  const newPhrase: SavedPhrase = {
    ...phrase,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  mockPhrases.push(newPhrase);
  return newPhrase;
};

/**
 * Update an existing phrase
 * TODO: Replace with actual API call
 */
export const updatePhrase = async (id: string, updates: Partial<SavedPhrase>): Promise<SavedPhrase | null> => {
  await delay(300);
  const index = mockPhrases.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  mockPhrases[index] = { ...mockPhrases[index], ...updates };
  return mockPhrases[index];
};

/**
 * Delete a phrase
 * TODO: Replace with actual API call
 */
export const deletePhrase = async (id: string): Promise<boolean> => {
  await delay(300);
  const index = mockPhrases.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  mockPhrases.splice(index, 1);
  return true;
};

/**
 * Toggle favorite status
 * TODO: Replace with actual API call
 */
export const toggleFavorite = async (id: string): Promise<SavedPhrase | null> => {
  await delay(200);
  const phrase = mockPhrases.find(p => p.id === id);
  if (!phrase) return null;
  
  phrase.isFavorite = !phrase.isFavorite;
  return phrase;
};

/**
 * Toggle learned status
 * TODO: Replace with actual API call
 */
export const toggleLearned = async (id: string): Promise<SavedPhrase | null> => {
  await delay(200);
  const phrase = mockPhrases.find(p => p.id === id);
  if (!phrase) return null;
  
  phrase.isLearned = !phrase.isLearned;
  if (phrase.isLearned) {
    phrase.lastReviewedAt = new Date();
  }
  return phrase;
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
