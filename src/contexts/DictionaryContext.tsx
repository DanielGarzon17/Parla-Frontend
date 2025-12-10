// Dictionary Context - Global cache for dictionary words
// Persists dictionary data during the session to avoid repeated API calls
// Only fetches translations for new words when phrases are added

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { DictionaryWord } from '@/types/dictionary';
import { Language, Difficulty, GrammaticalCategory } from '@/types/phrases';
import { lookupWord, extractUniqueWords } from '@/services/translationService';
import { fetchPhrases } from '@/services/phrasesService';

interface DictionaryContextType {
  words: DictionaryWord[];
  isLoading: boolean;
  isImporting: boolean;
  importProgress: { current: number; total: number };
  error: string | null;
  loadDictionary: () => Promise<void>;
  refreshDictionary: () => Promise<void>;
  addWord: (word: DictionaryWord) => void;
  updateWord: (id: string, updates: Partial<DictionaryWord>) => void;
  deleteWord: (id: string) => void;
  isInitialized: boolean;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

interface DictionaryProviderProps {
  children: ReactNode;
}

// Session storage key for caching
const DICTIONARY_CACHE_KEY = 'parla_dictionary_cache';
const PHRASES_HASH_KEY = 'parla_phrases_hash';

// Helper to create a hash of phrase IDs to detect changes
const createPhrasesHash = (phrases: Array<{ id: string }>): string => {
  return phrases.map(p => p.id).sort().join(',');
};

export const DictionaryProvider: React.FC<DictionaryProviderProps> = ({ children }) => {
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoadingRef = useRef(false);

  // Load dictionary from cache or fetch from backend
  const loadDictionary = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current || isInitialized) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch current phrases from backend
      const phrases = await fetchPhrases();
      
      if (phrases.length === 0) {
        setWords([]);
        setIsInitialized(true);
        return;
      }

      // 2. Check if we have cached data and if phrases changed
      const cachedData = sessionStorage.getItem(DICTIONARY_CACHE_KEY);
      const cachedHash = sessionStorage.getItem(PHRASES_HASH_KEY);
      const currentHash = createPhrasesHash(phrases);

      let cachedWords: DictionaryWord[] = [];
      if (cachedData && cachedHash === currentHash) {
        // Cache is valid, use it directly
        cachedWords = JSON.parse(cachedData);
        setWords(cachedWords);
        setIsInitialized(true);
        //console.log('Dictionary loaded from cache:', cachedWords.length, 'words');
        return;
      }

      // 3. Extract unique words from phrases
      const phraseTexts = phrases.map(p => p.phrase);
      const uniqueWords = extractUniqueWords(phraseTexts);

      if (uniqueWords.length === 0) {
        setWords([]);
        setIsInitialized(true);
        return;
      }

      // 4. Check which words we already have cached
      if (cachedData) {
        cachedWords = JSON.parse(cachedData);
      }
      const cachedWordSet = new Set(cachedWords.map(w => w.word.toLowerCase()));
      
      // 5. Find new words that need lookup
      const newWords = uniqueWords.filter(word => !cachedWordSet.has(word.toLowerCase()));
      
      // 6. Keep existing cached words that are still in phrases
      const currentWordSet = new Set(uniqueWords.map(w => w.toLowerCase()));
      const existingWords = cachedWords.filter(w => currentWordSet.has(w.word.toLowerCase()));

      // 7. Create initial entries for new words
      const initialNewWords: DictionaryWord[] = newWords.map((word, idx) => ({
        id: `word_${Date.now()}_${idx}`,
        word: word,
        translation: '',
        pronunciation: '',
        definitions: [],
        examples: [],
        synonyms: [],
        antonyms: [],
        language: 'en' as Language,
        targetLanguage: 'es' as Language,
        difficulty: 'medium' as Difficulty,
        wordType: 'other' as GrammaticalCategory,
        isFavorite: false,
        isLearned: false,
        createdAt: new Date(),
        reviewCount: 0,
      }));

      // 8. Set initial state with existing + new words
      const allWords = [...existingWords, ...initialNewWords];
      setWords(allWords);
      setIsLoading(false);

      // 9. If there are new words, lookup their translations
      if (newWords.length > 0) {
        setIsImporting(true);
        setImportProgress({ current: 0, total: newWords.length });
        //console.log('Looking up', newWords.length, 'new words...');

        const updatedNewWords: DictionaryWord[] = [];

        for (let i = 0; i < initialNewWords.length; i++) {
          const wordEntry = initialNewWords[i];
          setImportProgress({ current: i + 1, total: newWords.length });

          try {
            const result = await lookupWord(wordEntry.word, 'en', 'es');

            if (result && !result.error) {
              const updatedWord: DictionaryWord = {
                ...wordEntry,
                translation: result.translation || wordEntry.word,
                pronunciation: result.pronunciation || '',
                definitions: result.definitions.map((d, idx) => ({
                  id: `d${Date.now()}_${idx}`,
                  meaning: d.meaning,
                  partOfSpeech: d.partOfSpeech,
                })),
                examples: result.examples.slice(0, 2).map((e, idx) => ({
                  id: `e${Date.now()}_${idx}`,
                  sentence: e.sentence,
                  translation: e.translation,
                })),
                synonyms: result.synonyms || [],
                antonyms: result.antonyms || [],
                wordType: result.definitions[0]?.partOfSpeech || 'other',
                reviewCount: 0,
              };
              updatedNewWords.push(updatedWord);
            } else {
              updatedNewWords.push({ ...wordEntry, translation: wordEntry.word, reviewCount: 0 });
            }
          } catch (err) {
            console.error(`Error looking up word "${wordEntry.word}":`, err);
            updatedNewWords.push({ ...wordEntry, translation: wordEntry.word, reviewCount: 0 });
          }

          // Small delay to avoid rate limiting
          if (i < newWords.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // 10. Update state with fully loaded words
        const finalWords = [...existingWords, ...updatedNewWords];
        setWords(finalWords);

        // 11. Save to session cache
        sessionStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(finalWords));
        sessionStorage.setItem(PHRASES_HASH_KEY, currentHash);
        //console.log('Dictionary cached:', finalWords.length, 'words');
      } else {
        // No new words, just update cache with current hash
        sessionStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(allWords));
        sessionStorage.setItem(PHRASES_HASH_KEY, currentHash);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading dictionary:', err);
      setError('No se pudo cargar el diccionario');
    } finally {
      setIsLoading(false);
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
      isLoadingRef.current = false;
    }
  }, [isInitialized]);

  // Force refresh dictionary (clear cache and reload)
  const refreshDictionary = useCallback(async () => {
    sessionStorage.removeItem(DICTIONARY_CACHE_KEY);
    sessionStorage.removeItem(PHRASES_HASH_KEY);
    setIsInitialized(false);
    isLoadingRef.current = false;
    await loadDictionary();
  }, [loadDictionary]);

  // Add a word manually
  const addWord = useCallback((word: DictionaryWord) => {
    setWords(prev => {
      const updated = [word, ...prev];
      // Update cache
      const currentHash = sessionStorage.getItem(PHRASES_HASH_KEY);
      if (currentHash) {
        sessionStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Update a word
  const updateWord = useCallback((id: string, updates: Partial<DictionaryWord>) => {
    setWords(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, ...updates } : w);
      // Update cache
      const currentHash = sessionStorage.getItem(PHRASES_HASH_KEY);
      if (currentHash) {
        sessionStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Delete a word
  const deleteWord = useCallback((id: string) => {
    setWords(prev => {
      const updated = prev.filter(w => w.id !== id);
      // Update cache
      const currentHash = sessionStorage.getItem(PHRASES_HASH_KEY);
      if (currentHash) {
        sessionStorage.setItem(DICTIONARY_CACHE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const value: DictionaryContextType = {
    words,
    isLoading,
    isImporting,
    importProgress,
    error,
    loadDictionary,
    refreshDictionary,
    addWord,
    updateWord,
    deleteWord,
    isInitialized,
  };

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = (): DictionaryContextType => {
  const context = useContext(DictionaryContext);
  if (context === undefined) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};

export default DictionaryContext;
