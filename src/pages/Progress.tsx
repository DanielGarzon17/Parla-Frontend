// Progress Page with dynamic stats and achievements (HU10.4, HU10.5, HU17)
// Connected to backend API for real stats

import { useState, useEffect, useRef } from 'react';
import { Flame, Trophy, Target, Calendar, TrendingUp, Star, Loader2, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ParticlesBackground from '@/components/ParticlesBackground';
import ShareButton from '@/components/ShareButton';
import { useTheme } from '@/hooks/useTheme';
import { getUserStats, getAccuracy } from '@/services/gamificationService';
import { fetchUserGameStats, UserGameStats, getAchievements, getPoints, UserAchievement } from '@/services/gamificationApi';
import { useStreak } from '@/contexts/StreakContext';
import { generateStatsShareText } from '@/services/shareService';

const Progress = () => {
  const { isDark } = useTheme();
  const { streak, bestStreak } = useStreak();
  const [localStats, setLocalStats] = useState(getUserStats());
  const [backendStats, setBackendStats] = useState<UserGameStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef<boolean>(false);

  // Fetch stats from backend on mount - SINGLE API CALL
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const loadStats = async () => {
      setIsLoading(true);
      try {
        // Load all data in parallel - single call per endpoint
        const [gameStats, achievementsData, pointsData] = await Promise.all([
          fetchUserGameStats(),
          getAchievements(),
          getPoints()
        ]);
        setBackendStats(gameStats);
        setAchievements(achievementsData);
        setTotalPoints(pointsData.total_points);
      } catch (error) {
        console.error('Error loading stats from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    setLocalStats(getUserStats());
    loadStats();
  }, []);

  // Merge local and backend stats
  const stats = localStats;

  const accuracy = backendStats?.accuracy || getAccuracy(stats);

  // Use backend stats when available
  const displayPoints = totalPoints || backendStats?.totalPoints || stats.totalPoints;
  const totalPhrasesPracticed = backendStats?.totalPhrasesPracticed || stats.totalPhrasesPracticed;
  const totalSessions = backendStats?.totalSessions || stats.totalSessionsCompleted;

  // Prepare chart data from weekly progress
  const chartData = stats.weeklyProgress.map(day => ({
    name: day.day,
    flashcards: day.flashcards,
    timetrial: day.timetrial,
    matchcards: day.matchcards,
    points: day.points,
  }));

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-yellow-900/10 to-gray-900' 
        : 'bg-gradient-to-br from-yellow-50 via-orange-50 to-purple-100'
    }`}>
      {/* Animated particles */}
      <ParticlesBackground 
        particleCount={30}
        colors={['#a855f7', '#8b5cf6', '#fbbf24', '#22c55e', '#3b82f6']}
        darkColors={['#c084fc', '#a78bfa', '#fcd34d', '#4ade80', '#60a5fa']}
      />

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pl-14 lg:pl-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary">
              ¡Tu Progreso!
            </h1>
            {/* HU17 - Share button */}
            <ShareButton 
              content={generateStatsShareText(stats)} 
              variant="outline"
              size="default"
              className="gap-2"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section - User Profile & Streak */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Card */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 text-center shadow-lg">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                  <span className="text-4xl">🐹</span>
                </div>
                <h3 className="font-bold text-lg text-foreground">Pepito Perez</h3>
                <p className="text-sm text-muted-foreground">Nivel Intermedio</p>
              </div>

              {/* Streak Card - Animated */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
                {/* Fire particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-pulse"
                      style={{
                        left: `${10 + i * 12}%`,
                        bottom: `${5 + (i % 4) * 15}%`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative text-center">
                  <Flame className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-5xl font-bold mb-1">{streak || stats.currentStreak}</p>
                  <p className="text-sm opacity-80">días de racha</p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="w-4 h-4 text-yellow-300" />
                      <p className="text-sm font-semibold">Mejor racha: {bestStreak || stats.longestStreak} días</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Días activos
                  </span>
                  <span className="font-bold">{stats.activeDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" /> Precisión
                  </span>
                  <span className="font-bold text-blue-500">{accuracy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Sesiones
                  </span>
                  <span className="font-bold">{stats.totalSessionsCompleted}</span>
                </div>
              </div>
            </div>

            {/* Center Section - Stats & Chart */}
            <div className="lg:col-span-6 space-y-6">
              {/* Main Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Points */}
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-4 text-center shadow-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{isLoading ? '...' : displayPoints.toLocaleString()}</p>
                  <p className="text-xs opacity-80">Puntos</p>
                </div>

                {/* Phrases */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 text-center shadow-lg">
                  <Star className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{isLoading ? '...' : totalPhrasesPracticed}</p>
                  <p className="text-xs opacity-80">Frases</p>
                </div>

                {/* Sessions */}
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl p-4 text-center shadow-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{isLoading ? '...' : totalSessions}</p>
                  <p className="text-xs opacity-80">Sesiones</p>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Progreso Semanal
                </h2>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#888' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="flashcards" 
                        name="FlashCards"
                        stroke="#fbbf24" 
                        strokeWidth={3}
                        dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="timetrial" 
                        name="Time Trial"
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="matchcards" 
                        name="Match Cards"
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-muted-foreground">FlashCards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-muted-foreground">Time Trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-muted-foreground">Match Cards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Achievements */}
            <div className="lg:col-span-3">
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    🏆 Logros
                  </h2>
                  <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                    {achievements.length} desbloqueados
                  </span>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">¡Sigue practicando para desbloquear logros!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {achievements.map((achievement) => (
                      <BackendAchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement configuration for icons and colors
const ACHIEVEMENT_CONFIG: Record<string, { icon: string; color: string; gradient: string }> = {
  // Streak achievements
  streak_7: { icon: '🔥', color: 'text-orange-500', gradient: 'from-orange-500/20 to-red-500/20' },
  streak_30: { icon: '🔥', color: 'text-orange-500', gradient: 'from-orange-500/20 to-red-500/20' },
  streak_100: { icon: '🔥', color: 'text-orange-500', gradient: 'from-orange-500/20 to-red-500/20' },
  // Points achievements
  points_1000: { icon: '⭐', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-amber-500/20' },
  points_5000: { icon: '🌟', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-amber-500/20' },
  points_10000: { icon: '💫', color: 'text-yellow-500', gradient: 'from-yellow-500/20 to-amber-500/20' },
  // Phrases achievements
  phrases_50: { icon: '📚', color: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/20' },
  phrases_100: { icon: '📖', color: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/20' },
  phrases_500: { icon: '🎓', color: 'text-blue-500', gradient: 'from-blue-500/20 to-indigo-500/20' },
  // Special achievements
  perfect_10: { icon: '🎯', color: 'text-green-500', gradient: 'from-green-500/20 to-emerald-500/20' },
  speed_demon: { icon: '⚡', color: 'text-purple-500', gradient: 'from-purple-500/20 to-violet-500/20' },
  polyglot: { icon: '🌍', color: 'text-cyan-500', gradient: 'from-cyan-500/20 to-teal-500/20' },
};

// Backend Achievement Card Component
const BackendAchievementCard = ({ achievement }: { achievement: UserAchievement }) => {
  const config = ACHIEVEMENT_CONFIG[achievement.achievement_type] || {
    icon: '🏆',
    color: 'text-primary',
    gradient: 'from-primary/20 to-primary/10'
  };
  
  // Format date nicely
  const achievedDate = new Date(achievement.achieved_at);
  const formattedDate = achievedDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  return (
    <div className={`rounded-xl p-4 transition-all hover:scale-[1.02] bg-gradient-to-r ${config.gradient} border border-primary/20 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="text-3xl animate-bounce-slow">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">
            {achievement.achievement_name}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
          <span className="text-green-500 text-lg">✓</span>
        </div>
      </div>
    </div>
  );
};

export default Progress;
