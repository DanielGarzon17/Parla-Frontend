// StatsPanel with animated streak indicator (HU10.3, HU10.4)
// Connected to backend API for real stats

import { useEffect, useState } from 'react';
import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { getUserStats, getAccuracy, getUnlockedAchievementsCount } from '@/services/gamificationService';
import { fetchUserGameStats, UserGameStats } from '@/services/gamificationApi';
import { useStreak } from '@/contexts/StreakContext';
import { usePoints } from '@/contexts/PointsContext';
import cap3 from "@/assets/cap3.png";

const StatsPanel = () => {
  const { isDark } = useTheme();
  const { streak, bestStreak } = useStreak();
  const { totalPoints: backendPoints } = usePoints();
  const [localStats, setLocalStats] = useState(getUserStats());
  const [backendStats, setBackendStats] = useState<UserGameStats | null>(null);
  const [isStreakAnimating, setIsStreakAnimating] = useState(false);

  // Fetch stats from backend on mount
  useEffect(() => {
    const loadBackendStats = async () => {
      try {
        const stats = await fetchUserGameStats();
        setBackendStats(stats);
      } catch (error) {
        console.error('Error loading backend stats:', error);
      }
    };
    loadBackendStats();
  }, []);

  // Refresh local stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalStats(getUserStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Use local stats as base
  const stats = localStats;

  // Animate streak on mount or when streak changes
  useEffect(() => {
    if (streak > 0) {
      setIsStreakAnimating(true);
      const timer = setTimeout(() => setIsStreakAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  // Use backend stats when available, fallback to local
  const totalPoints = backendPoints || backendStats?.totalPoints || stats.totalPoints;
  const totalPhrasesPracticed = backendStats?.totalPhrasesPracticed || stats.totalPhrasesPracticed;
  const accuracy = backendStats?.accuracy || getAccuracy(stats);
  const unlockedAchievements = getUnlockedAchievementsCount(stats);

  // Use backend streak, fallback to local
  const currentStreak = streak || stats.currentStreak;
  const longestStreak = bestStreak || stats.longestStreak;

  return (
    <div className="space-y-4">
      {/* Streak Card - Animated (HU10.3) */}
      <div className={`relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-4 transition-all duration-300 ${
        isStreakAnimating ? 'scale-105 shadow-lg shadow-orange-500/50' : ''
      }`}>
        {/* Animated fire particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${20 + i * 15}%`,
                bottom: `${10 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-white/20 rounded-xl ${isStreakAnimating ? 'animate-bounce' : ''}`}>
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm opacity-80">Racha diaria</span>
              <p className="text-2xl font-bold">{currentStreak} días</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs opacity-70">Mejor racha</span>
            <p className="font-bold">{longestStreak} días</p>
          </div>
        </div>
      </div>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm opacity-80">Puntos totales</span>
              <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phrases Practiced */}
      <div className={`rounded-2xl p-4 flex items-center justify-between transition-colors duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-stat-bg'
      } text-stat-foreground`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <span className="font-medium">Frases practicadas</span>
        </div>
        <span className="bg-green-500 text-white px-4 py-1 rounded-lg font-bold">
          {totalPhrasesPracticed}
        </span>
      </div>

      {/* Accuracy */}
      <div className={`rounded-2xl p-4 flex items-center justify-between transition-colors duration-300 ${
        isDark ? 'bg-gray-800' : 'bg-stat-bg'
      } text-stat-foreground`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <span className="font-medium">Precisión</span>
        </div>
        <span className="bg-blue-500 text-white px-4 py-1 rounded-lg font-bold">
          {accuracy}%
        </span>
      </div>

      {/* Achievements */}
      <div className="bg-stat-bg text-stat-foreground rounded-2xl p-4 flex items-center justify-between">
        <span className="text-lg font-medium">Logros</span>
        <span className="bg-yellow-500 text-white px-4 py-1 rounded-lg font-bold">
          {unlockedAchievements}/{stats.achievements.length}
        </span>
      </div>

      <div className="flex items-center justify-center mt-8">
        <img 
          src={cap3} 
          alt="Capybara mascot" 
          className="w-full max-w-sm object-contain"
        />
      </div>
    </div>
  );
};

export default StatsPanel;
