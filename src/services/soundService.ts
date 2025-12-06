// Sound Service for gamification effects (HU14)
// Provides audio feedback for practice activities

// Sound URLs (using free sound effects)
const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  streak: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
  timeWarning: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  timeUp: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
};

type SoundType = keyof typeof SOUNDS;

// Audio cache
const audioCache: Map<SoundType, HTMLAudioElement> = new Map();

// Settings
let soundEnabled = true;
let volume = 0.5;

// Load settings from localStorage
const loadSettings = () => {
  const saved = localStorage.getItem('parla_sound_settings');
  if (saved) {
    const settings = JSON.parse(saved);
    soundEnabled = settings.enabled ?? true;
    volume = settings.volume ?? 0.5;
  }
};

// Save settings to localStorage
const saveSettings = () => {
  localStorage.setItem('parla_sound_settings', JSON.stringify({
    enabled: soundEnabled,
    volume,
  }));
};

// Initialize
loadSettings();

/**
 * Preload a sound for faster playback
 */
export const preloadSound = (type: SoundType): void => {
  if (audioCache.has(type)) return;
  
  const audio = new Audio(SOUNDS[type]);
  audio.preload = 'auto';
  audio.volume = volume;
  audioCache.set(type, audio);
};

/**
 * Preload all sounds
 */
export const preloadAllSounds = (): void => {
  Object.keys(SOUNDS).forEach((type) => {
    preloadSound(type as SoundType);
  });
};

/**
 * Play a sound effect
 */
export const playSound = (type: SoundType): void => {
  if (!soundEnabled) return;
  
  try {
    let audio = audioCache.get(type);
    
    if (!audio) {
      audio = new Audio(SOUNDS[type]);
      audio.volume = volume;
      audioCache.set(type, audio);
    }
    
    // Reset and play
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
};

/**
 * Play correct answer sound
 */
export const playCorrect = (): void => playSound('correct');

/**
 * Play wrong answer sound
 */
export const playWrong = (): void => playSound('wrong');

/**
 * Play completion sound
 */
export const playComplete = (): void => playSound('complete');

/**
 * Play click sound
 */
export const playClick = (): void => playSound('click');

/**
 * Play level up sound
 */
export const playLevelUp = (): void => playSound('levelUp');

/**
 * Play streak sound
 */
export const playStreak = (): void => playSound('streak');

/**
 * Play time warning sound
 */
export const playTimeWarning = (): void => playSound('timeWarning');

/**
 * Play time up sound
 */
export const playTimeUp = (): void => playSound('timeUp');

/**
 * Enable or disable sounds
 */
export const setSoundEnabled = (enabled: boolean): void => {
  soundEnabled = enabled;
  saveSettings();
};

/**
 * Check if sounds are enabled
 */
export const isSoundEnabled = (): boolean => soundEnabled;

/**
 * Set volume (0-1)
 */
export const setVolume = (newVolume: number): void => {
  volume = Math.max(0, Math.min(1, newVolume));
  audioCache.forEach((audio) => {
    audio.volume = volume;
  });
  saveSettings();
};

/**
 * Get current volume
 */
export const getVolume = (): number => volume;

/**
 * Toggle sound on/off
 */
export const toggleSound = (): boolean => {
  soundEnabled = !soundEnabled;
  saveSettings();
  return soundEnabled;
};
