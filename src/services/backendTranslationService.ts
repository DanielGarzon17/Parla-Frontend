// Backend Translation Service
// Uses Django backend /api/phrases/translate/ endpoint

import { apiPost, ApiError } from './api';

// Types based on backend TranslateRequestSerializer and TranslateResponseSerializer
export interface TranslateRequest {
  text: string;
  source_language: string; // e.g., 'en'
  target_language: string; // e.g., 'es'
}

export interface TranslateResponse {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  detected_language?: string;
}

/**
 * Translate text using the backend API
 * POST /api/phrases/translate/
 */
export const translateText = async (
  text: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'es'
): Promise<TranslateResponse> => {
  const request: TranslateRequest = {
    text,
    source_language: sourceLanguage,
    target_language: targetLanguage,
  };

  return apiPost<TranslateResponse>('/phrases/translate/', request);
};

/**
 * Translate multiple texts in batch
 * Note: This makes sequential calls to avoid overwhelming the backend
 */
export const translateBatch = async (
  texts: string[],
  sourceLanguage: string = 'en',
  targetLanguage: string = 'es',
  onProgress?: (current: number, total: number) => void
): Promise<TranslateResponse[]> => {
  const results: TranslateResponse[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      const result = await translateText(texts[i], sourceLanguage, targetLanguage);
      results.push(result);
    } catch (error) {
      console.error(`Error translating "${texts[i]}":`, error);
      // Add a placeholder for failed translations
      results.push({
        original_text: texts[i],
        translated_text: '',
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });
    }
    
    if (onProgress) {
      onProgress(i + 1, texts.length);
    }
    
    // Small delay between requests
    if (i < texts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
};

export { ApiError };
