// Share Service (HU17)
// Allows sharing phrases and achievements on social media

import { SavedPhrase } from '@/types/phrases';
import { UserStats, Achievement } from '@/types/gamification';

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
}

/**
 * Check if Web Share API is supported
 */
export const isShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};

/**
 * Share content using Web Share API or fallback
 */
export const shareContent = async (content: ShareContent): Promise<boolean> => {
  if (isShareSupported()) {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url || window.location.href,
      });
      return true;
    } catch (error) {
      // User cancelled or error
      console.log('Share cancelled or failed:', error);
      return false;
    }
  }
  return false;
};

/**
 * Generate share text for a phrase
 */
export const generatePhraseShareText = (phrase: SavedPhrase): ShareContent => {
  return {
    title: '¡Aprendí una nueva frase con Parla!',
    text: `📚 "${phrase.phrase}" significa "${phrase.translation}"${phrase.context ? ` - ${phrase.context}` : ''}\n\n¡Aprende idiomas con Parla! 🎓`,
    url: window.location.origin,
  };
};

/**
 * Generate share text for an achievement
 */
export const generateAchievementShareText = (achievement: Achievement): ShareContent => {
  return {
    title: '¡Logro desbloqueado en Parla!',
    text: `🏆 ¡Acabo de desbloquear "${achievement.title}"!\n${achievement.description}\n\n¡Aprende idiomas con Parla! 🎓`,
    url: window.location.origin,
  };
};

/**
 * Generate share text for stats/progress
 */
export const generateStatsShareText = (stats: UserStats): ShareContent => {
  return {
    title: '¡Mi progreso en Parla!',
    text: `📊 Mi progreso en Parla:\n🔥 ${stats.currentStreak} días de racha\n⭐ ${stats.totalPoints} puntos\n📚 ${stats.totalPhrasesPracticed} frases practicadas\n🏆 ${stats.achievements.filter(a => a.unlockedAt).length} logros\n\n¡Aprende idiomas con Parla! 🎓`,
    url: window.location.origin,
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Share on Twitter/X
 */
export const shareOnTwitter = (content: ShareContent): void => {
  const text = encodeURIComponent(content.text);
  const url = encodeURIComponent(content.url || window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
};

/**
 * Share on Facebook
 */
export const shareOnFacebook = (content: ShareContent): void => {
  const url = encodeURIComponent(content.url || window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

/**
 * Share on WhatsApp
 */
export const shareOnWhatsApp = (content: ShareContent): void => {
  const text = encodeURIComponent(`${content.text}\n${content.url || window.location.href}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
};

/**
 * Share on LinkedIn
 */
export const shareOnLinkedIn = (content: ShareContent): void => {
  const url = encodeURIComponent(content.url || window.location.href);
  const title = encodeURIComponent(content.title);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
};

/**
 * Share on Telegram
 */
export const shareOnTelegram = (content: ShareContent): void => {
  const text = encodeURIComponent(content.text);
  const url = encodeURIComponent(content.url || window.location.href);
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
};
