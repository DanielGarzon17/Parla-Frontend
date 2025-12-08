// Progress Page with dynamic stats and achievements (HU10.4, HU10.5, HU17)
// Connected to backend API for real stats

import { useState, useEffect } from 'react';
import { Flame, Trophy, Target, Calendar, TrendingUp, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ParticlesBackground from '@/components/ParticlesBackground';
import ShareButton from '@/components/ShareButton';
import { useTheme } from '@/hooks/useTheme';
import { getUserStats, getAccuracy, getUnlockedAchievementsCount } from '@/services/gamificationService';
import { fetchUserGameStats, UserGameStats, getPracticeSessions, PracticeSession } from '@/services/gamificationApi';
import { generateStatsShareText } from '@/services/shareService';
import { Achievement } from '@/types/gamification';

const Progress = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [localStats, setLocalStats] = useState(getUserStats());
  const [backendStats, setBackendStats] = useState<UserGameStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'stats' | 'achievements'>('stats');

  // Fetch stats from backend on mount
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const [gameStats, sessions] = await Promise.all([
          fetchUserGameStats(),
          getPracticeSessions()
        ]);
        setBackendStats(gameStats);
        setRecentSessions(sessions.slice(0, 10));
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
  const unlockedCount = getUnlockedAchievementsCount(stats);

  // Use backend stats when available
  const totalPoints = backendStats?.totalPoints || stats.totalPoints;
  const totalPhrasesPracticed = backendStats?.totalPhrasesPracticed || stats.totalPhrasesPracticed;
  const totalSessions = backendStats?.totalSessions || stats.totalSessionsCompleted;
  const sessionsByType = backendStats?.sessionsByType || { flashcard: 0, timed: 0, matching: 0, quiz: 0 };

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
                  <p className="text-5xl font-bold mb-1">{stats.currentStreak}</p>
                  <p className="text-sm opacity-80">días de racha</p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs opacity-70">Mejor racha: {stats.longestStreak} días</p>
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
                  <p className="text-2xl font-bold">{isLoading ? '...' : totalPoints.toLocaleString()}</p>
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
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  🏆 Logros
                </h2>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {stats.achievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement Card Component
const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const isUnlocked = achievement.unlockedAt !== null;
  
  return (
    <div className={`rounded-xl p-3 transition-all ${
      isUnlocked 
        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
        : 'bg-muted/50 opacity-60'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
            {achievement.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {achievement.description}
          </p>
        </div>
        {isUnlocked && (
          <div className="text-green-500">
            ✓
          </div>
        )}
      </div>
      
      {/* Progress bar for locked achievements */}
      {!isUnlocked && (
        <div className="mt-2">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(achievement.progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {Math.round(achievement.progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default Progress;
