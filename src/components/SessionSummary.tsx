// Session Summary Component (HU10.1, HU10.5)
// Shows points earned, achievements unlocked after practice

import { Button } from '@/components/ui/button';
import { Trophy, Flame, Target, Star, ArrowRight, Home } from 'lucide-react';
import { Achievement } from '@/types/gamification';
import { useTheme } from '@/hooks/useTheme';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface SessionSummaryProps {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: {
    basePoints: number;
    streakBonus: number;
    perfectBonus: number;
    total: number;
  };
  currentStreak: number;
  newAchievements: Achievement[];
  onContinue: () => void;
  onGoHome: () => void;
}

const SessionSummary = ({
  correctAnswers,
  totalQuestions,
  pointsEarned,
  currentStreak,
  newAchievements,
  onContinue,
  onGoHome,
}: SessionSummaryProps) => {
  const { isDark } = useTheme();
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPerfect = correctAnswers === totalQuestions && totalQuestions > 0;

  // Trigger confetti on mount if good performance
  useEffect(() => {
    if (accuracy >= 70) {
      const duration = isPerfect ? 3000 : 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: isPerfect ? 5 : 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#a855f7', '#fbbf24', '#22c55e'],
        });
        confetti({
          particleCount: isPerfect ? 5 : 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#a855f7', '#fbbf24', '#22c55e'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [accuracy, isPerfect]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className={`rounded-3xl p-8 shadow-2xl text-center transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800/90 backdrop-blur' 
          : 'bg-card'
      }`}>
        {/* Header */}
        <div className="mb-8">
          {isPerfect ? (
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
          ) : accuracy >= 70 ? (
            <div className="text-6xl mb-4">🎉</div>
          ) : (
            <div className="text-6xl mb-4">💪</div>
          )}
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-foreground'}`}>
            {isPerfect ? '¡Perfecto!' : accuracy >= 70 ? '¡Muy bien!' : '¡Buen intento!'}
          </h2>
          <p className={isDark ? 'text-gray-300' : 'text-muted-foreground'}>
            Sesión completada
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Accuracy */}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-purple-500/20' : 'bg-primary/10'}`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-purple-400' : 'text-primary'}`} />
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>{accuracy}%</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Precisión</p>
          </div>

          {/* Streak */}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
            <Flame className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>{currentStreak}</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Días de racha</p>
          </div>

          {/* Correct */}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
            <Star className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>{correctAnswers}/{totalQuestions}</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Correctas</p>
          </div>

          {/* Points */}
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
            <Trophy className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>+{pointsEarned.total}</p>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Puntos</p>
          </div>
        </div>

        {/* Points breakdown */}
        <div className={`rounded-xl p-4 mb-6 text-left ${isDark ? 'bg-gray-700/50' : 'bg-muted/50'}`}>
          <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-foreground'}`}>Desglose de puntos</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-300' : 'text-muted-foreground'}>Puntos base</span>
              <span className={`font-medium ${isDark ? 'text-white' : ''}`}>+{pointsEarned.basePoints}</span>
            </div>
            {pointsEarned.streakBonus > 0 && (
              <div className={`flex justify-between ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                <span>Bonus de racha</span>
                <span className="font-medium">+{pointsEarned.streakBonus}</span>
              </div>
            )}
            {pointsEarned.perfectBonus > 0 && (
              <div className={`flex justify-between ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <span>Sesión perfecta</span>
                <span className="font-medium">+{pointsEarned.perfectBonus}</span>
              </div>
            )}
            <div className={`border-t pt-2 flex justify-between font-bold ${isDark ? 'border-gray-600' : ''}`}>
              <span className={isDark ? 'text-white' : ''}>Total</span>
              <span className={isDark ? 'text-purple-400' : 'text-primary'}>+{pointsEarned.total}</span>
            </div>
          </div>
        </div>

        {/* New Achievements */}
        {newAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-foreground'}`}>¡Nuevos logros!</h3>
            <div className="space-y-2">
              {newAchievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`rounded-xl p-3 flex items-center gap-3 animate-pulse ${
                    isDark 
                      ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' 
                      : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="text-left">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>{achievement.title}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className={`flex-1 ${isDark ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
            onClick={onGoHome}
          >
            <Home className="w-4 h-4 mr-2" />
            Inicio
          </Button>
          <Button
            className={`flex-1 ${isDark ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            onClick={onContinue}
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
