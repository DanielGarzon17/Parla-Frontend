// FlashCard Practice Component with gamification (HU10, HU10.1)
// Uses saved phrases and awards points

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Volume2, Check, X, Sparkles } from 'lucide-react';
import { SavedPhrase } from '@/types/phrases';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useTheme } from '@/hooks/useTheme';

interface FlashCardPracticeProps {
  phrase: SavedPhrase;
  onAnswer: (correct: boolean) => void;
  currentIndex: number;
  totalCards: number;
  streak: number;
}

export const FlashCardPractice = ({
  phrase,
  onAnswer,
  currentIndex,
  totalCards,
  streak,
}: FlashCardPracticeProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [answered, setAnswered] = useState<'correct' | 'wrong' | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isDark } = useTheme();

  // Reset state when phrase changes
  useEffect(() => {
    setIsRevealed(false);
    setAnswered(null);
    setShowPoints(false);
  }, [phrase.id]);

  const handleAnswer = (knew: boolean) => {
    setAnswered(knew ? 'correct' : 'wrong');
    setShowPoints(true);
    
    // Delay before moving to next card
    setTimeout(() => {
      onAnswer(knew);
    }, 1500);
  };

  const handleSpeak = () => {
    speak(phrase.phrase);
  };

  const pointsEarned = answered === 'correct' ? 10 + Math.floor(streak * 1) : 2;

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Points popup animation */}
      {showPoints && (
        <div 
          className={`absolute -top-8 left-1/2 -translate-x-1/2 z-20 animate-bounce ${
            answered === 'correct' ? 'text-green-500' : 'text-yellow-500'
          }`}
        >
          <div className={`flex items-center gap-1 backdrop-blur px-4 py-2 rounded-full shadow-lg ${
            isDark ? 'bg-gray-800/90' : 'bg-white/90'
          }`}>
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg">+{pointsEarned} pts</span>
          </div>
        </div>
      )}

      <div className={`rounded-3xl p-8 shadow-2xl transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-purple-800 to-purple-900' 
          : 'bg-primary'
      } ${
        answered === 'correct' ? 'ring-4 ring-green-500' : 
        answered === 'wrong' ? 'ring-4 ring-orange-500' : ''
      }`}>
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-primary-foreground/70 text-sm">
            {currentIndex + 1} / {totalCards}
          </span>
          {streak > 0 && (
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              🔥 {streak} racha
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-primary-foreground/20 rounded-full h-2 mb-6">
          <div 
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>

        {/* Phrase */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold text-white">{phrase.phrase}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/20"
              onClick={handleSpeak}
            >
              <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
          {phrase.category && (
            <span className="bg-white/20 text-white/80 px-3 py-1 rounded-full text-xs">
              {phrase.category}
            </span>
          )}
        </div>

        {/* Translation reveal area */}
        <div
          className={`bg-card rounded-2xl p-8 mb-6 min-h-[160px] flex items-center justify-center cursor-pointer transition-all duration-300 ${
            !isRevealed ? 'hover:shadow-lg hover:scale-[1.02]' : ''
          } ${
            answered === 'correct' ? 'bg-green-100' : 
            answered === 'wrong' ? 'bg-orange-100' : ''
          }`}
          onClick={() => !answered && setIsRevealed(true)}
        >
          {isRevealed || answered ? (
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground mb-2">{phrase.translation}</p>
              {phrase.context && (
                <p className="text-sm text-muted-foreground italic">"{phrase.context}"</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Eye className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Toca para revelar</p>
            </div>
          )}
        </div>

        {/* Answer buttons */}
        {!answered ? (
          <div className="flex gap-4">
            <Button
              variant="flashcard"
              size="lg"
              className="flex-1 h-14 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleAnswer(true)}
              disabled={!isRevealed}
            >
              <Check className="w-5 h-5 mr-2" />
              ¡La sabía!
            </Button>
            <Button
              variant="flashcard"
              size="lg"
              className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => handleAnswer(false)}
              disabled={!isRevealed}
            >
              <X className="w-5 h-5 mr-2" />
              Aprender
            </Button>
          </div>
        ) : (
          <div className={`text-center py-4 rounded-xl ${
            answered === 'correct' ? 'bg-green-500/20 text-green-700' : 'bg-orange-500/20 text-orange-700'
          }`}>
            <p className="font-bold text-lg">
              {answered === 'correct' ? '¡Excelente! 🎉' : '¡Sigue practicando! 💪'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCardPractice;
