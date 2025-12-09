// Progress Page with dynamic stats and achievements (HU10.4, HU10.5, HU17)
// Connected to backend API for real stats

import { useState, useEffect, useRef } from 'react';
import { Flame, Trophy, Target, Calendar, TrendingUp, Loader2, Award, BookOpen } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, AreaChart, Area, CartesianGrid
} from "recharts";
import ParticlesBackground from '@/components/ParticlesBackground';
import ShareButton from '@/components/ShareButton';
import { useTheme } from '@/hooks/useTheme';
import { getUserStats, getAccuracy } from '@/services/gamificationService';
import { 
  fetchUserGameStats, UserGameStats, getAchievements, getPoints, UserAchievement, 
  ALL_ACHIEVEMENTS, AchievementDefinition,
  getDailyStats, getWeeklyStats, getMonthlyStats,
  DailyStatEntry, WeeklyStatEntry, MonthlyStatEntry,
  fetchDailyStatsFromSessions, DailyStatsFromSessions
} from '@/services/gamificationApi';
import { fetchPhrases } from '@/services/phrasesService';
import { SavedPhrase } from '@/types/phrases';
import { Lock } from 'lucide-react';
import { useStreak } from '@/contexts/StreakContext';
import { useAuth } from '@/hooks/useAuth';
import { generateStatsShareText } from '@/services/shareService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import logo from '@/assets/logo.png';

// Chart period type
type ChartPeriod = 'daily' | 'weekly' | 'monthly';
type ChartMetric = 'points' | 'phrases' | 'accuracy' | 'minutes';

const Progress = () => {
  const { isDark } = useTheme();
  const { streak, bestStreak } = useStreak();
  const { user } = useAuth();
  const [localStats, setLocalStats] = useState(getUserStats());
  const [backendStats, setBackendStats] = useState<UserGameStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalPhrasesSaved, setTotalPhrasesSaved] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef<boolean>(false);
  
  // Stats data
  const [dailyStats, setDailyStats] = useState<DailyStatEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatEntry[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatEntry[]>([]);
  const [sessionBasedStats, setSessionBasedStats] = useState<DailyStatsFromSessions[]>([]);
  const [useSessionStats, setUseSessionStats] = useState(false); // Fallback flag
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]); // Phrases with created_at
  
  // Chart controls
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('daily');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('points');
  const [daysRange, setDaysRange] = useState<number>(7);
  const [weeksRange, setWeeksRange] = useState<number>(4);
  const [monthsRange, setMonthsRange] = useState<number>(6);

  // Fetch stats from backend on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const loadStats = async () => {
      setIsLoading(true);
      try {
        // Load all data in parallel
        const [gameStats, achievementsData, pointsData, phrasesData, daily, weekly, monthly, sessionStats] = await Promise.all([
          fetchUserGameStats(),
          getAchievements(),
          getPoints(),
          fetchPhrases(),
          getDailyStats(7),
          getWeeklyStats(4),
          getMonthlyStats(6),
          fetchDailyStatsFromSessions(30) // Get 30 days of session-based stats
        ]);
        setBackendStats(gameStats);
        setAchievements(achievementsData);
        setTotalPoints(pointsData.total_points);
        setTotalPhrasesSaved(phrasesData.length);
        setSavedPhrases(phrasesData); // Store phrases with created_at for chart
        setDailyStats(daily.data);
        setWeeklyStats(weekly.data);
        setMonthlyStats(monthly.data);
        setSessionBasedStats(sessionStats);
        
        // Check if DailyStatistic has no phrase data but sessions do
        // If so, use session-based stats as fallback
        const dailyHasData = daily.data.some(d => d.phrases_practiced > 0);
        const sessionsHaveData = sessionStats.some(s => s.phrases_practiced > 0);
        if (!dailyHasData && sessionsHaveData) {
          setUseSessionStats(true);
          //console.log('Using session-based stats as fallback (DailyStatistic not updated by backend)');
        }
      } catch (error) {
        console.error('Error loading stats from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    setLocalStats(getUserStats());
    loadStats();
  }, []);

  // Reload stats when range changes
  const reloadPeriodStats = async (period: ChartPeriod, range: number) => {
    try {
      if (period === 'daily') {
        const data = await getDailyStats(range);
        setDailyStats(data.data);
      } else if (period === 'weekly') {
        const data = await getWeeklyStats(range);
        setWeeklyStats(data.data);
      } else {
        const data = await getMonthlyStats(range);
        setMonthlyStats(data.data);
      }
    } catch (error) {
      console.error('Error reloading stats:', error);
    }
  };

  // Merge local and backend stats
  const stats = localStats;
  const accuracy = backendStats?.accuracy || getAccuracy(stats);

  // Use backend stats when available
  const displayPoints = totalPoints || backendStats?.totalPoints || stats.totalPoints;
  const totalPhrasesPracticed = backendStats?.totalPhrasesPracticed || stats.totalPhrasesPracticed;
  const totalSessions = backendStats?.totalSessions || stats.totalSessionsCompleted;

  // Calculate totals from daily stats (or session-based stats as fallback)
  const dailyTotals = useSessionStats && sessionBasedStats.length > 0
    ? sessionBasedStats.slice(-daysRange).reduce((acc, day) => ({
        phrases: acc.phrases + day.phrases_practiced,
        correct: acc.correct + day.correct_answers,
        minutes: acc.minutes, // Not available from sessions
        points: acc.points + day.points_earned,
        daysActive: acc.daysActive + (day.phrases_practiced > 0 || day.points_earned > 0 ? 1 : 0)
      }), { phrases: 0, correct: 0, minutes: 0, points: 0, daysActive: 0 })
    : dailyStats.reduce((acc, day) => ({
        phrases: acc.phrases + day.phrases_practiced,
        correct: acc.correct + day.correct_answers,
        minutes: acc.minutes + day.practice_minutes,
        points: acc.points + day.points_earned,
        daysActive: acc.daysActive + (day.phrases_practiced > 0 || day.points_earned > 0 ? 1 : 0)
      }), { phrases: 0, correct: 0, minutes: 0, points: 0, daysActive: 0 });

  // Calculate phrases added in a date range from savedPhrases created_at
  const getPhrasesAddedInRange = (startDate: Date, endDate: Date): number => {
    return savedPhrases.filter(p => {
      if (!p.createdAt) return false;
      const phraseDate = new Date(p.createdAt);
      return phraseDate >= startDate && phraseDate <= endDate;
    }).length;
  };

  // Prepare chart data based on selected period
  const getChartData = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (chartPeriod === 'daily') {
      const dailyData = [];
      
      for (let i = daysRange - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Use local date string format YYYY-MM-DD to match backend format
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        // Calculate start and end of day
        const dayStart = new Date(dateStr);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dateStr);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Get phrases added on this day
        const phrasesAdded = getPhrasesAddedInRange(dayStart, dayEnd);
        
        // Get stats for this day - prioritize dailyStats from backend
        const dailyDay = dailyStats.find(d => d.date === dateStr);
        const sessionDay = sessionBasedStats.find(s => s.date === dateStr);
        
        // Use dailyStats if available, otherwise fallback to sessionBasedStats
        const points = dailyDay?.points_earned ?? sessionDay?.points_earned ?? 0;
        const phrasesPracticed = dailyDay?.phrases_practiced ?? sessionDay?.phrases_practiced ?? 0;
        const accuracy = dailyDay?.accuracy ?? sessionDay?.accuracy ?? 0;
        const minutes = dailyDay?.practice_minutes ?? 0;
        const correct = dailyDay?.correct_answers ?? sessionDay?.correct_answers ?? 0;
        
        dailyData.push({
          name: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
          points,
          phrases: phrasesAdded,
          phrasesPracticed,
          accuracy,
          minutes,
          correct,
        });
      }
      
      return dailyData;
    } else if (chartPeriod === 'weekly') {
      // Weekly - use weeklyStats from backend
      return weeklyStats.map(week => {
        // Calculate date range for this week to get phrases added
        const weekStart = new Date(week.week_start);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const phrasesAdded = getPhrasesAddedInRange(weekStart, weekEnd);
        
        return {
          name: `Sem ${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`,
          points: week.total_points,
          phrases: phrasesAdded,
          phrasesPracticed: week.total_phrases,
          accuracy: week.average_accuracy,
          minutes: week.total_minutes,
          days: week.days_practiced,
        };
      });
    } else {
      // Monthly - use monthlyStats from backend
      return monthlyStats.map(month => {
        // Calculate date range for this month to get phrases added
        const monthStart = new Date(month.year, month.month - 1, 1);
        const monthEnd = new Date(month.year, month.month, 0, 23, 59, 59, 999);
        const phrasesAdded = getPhrasesAddedInRange(monthStart, monthEnd);
        
        return {
          name: month.month_name.substring(0, 3).toLowerCase(),
          points: month.total_points,
          phrases: phrasesAdded,
          accuracy: month.average_accuracy,
          days: month.days_active,
        };
      });
    }
  };

  const chartData = getChartData();

  // Get metric config for chart
  const getMetricConfig = () => {
    switch (chartMetric) {
      case 'points':
        return { key: 'points', color: '#8b5cf6', label: 'Puntos', gradient: ['#a855f7', '#6366f1'] };
      case 'phrases':
        return { key: 'phrases', color: '#22c55e', label: 'Frases', gradient: ['#22c55e', '#10b981'] };
      case 'accuracy':
        return { key: 'accuracy', color: '#3b82f6', label: 'Precisión %', gradient: ['#3b82f6', '#0ea5e9'] };
      case 'minutes':
        return { key: 'minutes', color: '#f59e0b', label: 'Minutos', gradient: ['#f59e0b', '#eab308'] };
    }
  };

  const metricConfig = getMetricConfig();

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
              {/* Profile Card - Using real user data from backend */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 text-center shadow-lg">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 overflow-hidden">
                  {user?.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={user.username || 'Usuario'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img src={logo} alt="Parla mascot" className="w-20 h-20 object-contain" />
                  )}
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user?.first_name || user?.username || 'Usuario'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(user?.total_points ?? totalPoints) >= 5000 ? 'Nivel Avanzado' 
                    : (user?.total_points ?? totalPoints) >= 1000 ? 'Nivel Intermedio' 
                    : 'Nivel Principiante'}
                </p>
              </div>

              {/* Streak Card - Animated - Using real data from backend */}
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
                  <Flame className="w-12 h-20 mx-auto mb-2 animate-pulse" />
                  <p className="text-5xl font-bold mb-1">{user?.current_streak ?? streak ?? 0}</p>
                  <p className="text-sm opacity-80">días de racha</p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-center gap-2">
                      <Award className="w-4 h-4 text-yellow-300" />
                      <p className="text-sm font-semibold">Mejor racha: {user?.longest_streak ?? bestStreak ?? 0} días</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats - Using real data from backend */}
              {/* <div className="bg-card/90 backdrop-blur rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Días activos
                  </span>
                  <span className="font-bold">{isLoading ? '...' : stats.activeDays}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" /> Precisión
                  </span>
                  <span className="font-bold text-blue-500">{isLoading ? '...' : accuracy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Sesiones
                  </span>
                  <span className="font-bold">{isLoading ? '...' : totalSessions}</span>
                </div>
              </div> */}
            </div>

            {/* Center Section - Stats & Chart */}
            <div className="lg:col-span-6 space-y-6">
              {/* Main Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Points */}
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform">
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{isLoading ? '...' : displayPoints.toLocaleString()}</p>
                  <p className="text-xs opacity-80">Puntos</p>
                </div>

                {/* Saved Phrases */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{isLoading ? '...' : totalPhrasesSaved}</p>
                  <p className="text-xs opacity-80">Frases Guardadas</p>
                </div>

                {/* Sessions */}
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-2xl p-4 text-center shadow-lg transform hover:scale-105 transition-transform">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{isLoading ? '...' : totalSessions}</p>
                  <p className="text-xs opacity-80">Sesiones</p>
                </div>
              </div>

              {/* Chart 1: Points Over Time (Area Chart) */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    Puntos Ganados
                  </h2>
                  <Select value={chartPeriod} onValueChange={(v) => setChartPeriod(v as ChartPeriod)}>
                    <SelectTrigger className="w-[120px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        width={45}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.95)', 
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          color: isDark ? '#f3f4f6' : '#1f2937',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Puntos']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="points"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#colorPoints)"
                        dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Phrases & Accuracy (Bar + Line Combo) */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Número de Frases
                  </h2>
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-muted-foreground">Frases</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                        width={35}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.95)', 
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          color: isDark ? '#f3f4f6' : '#1f2937',
                          fontSize: '12px'
                        }}
                      />
                      <Bar 
                        yAxisId="left"
                        dataKey="phrases" 
                        fill="#22c55e" 
                        radius={[4, 4, 0, 0]}
                        name="Frases"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Activity Summary (Mini Stats + Bar) */}
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                    Resumen de Actividad
                  </h2>
                  {chartPeriod === 'daily' && (
                    <Select 
                      value={daysRange.toString()} 
                      onValueChange={(v) => {
                        const range = parseInt(v);
                        setDaysRange(range);
                        reloadPeriodStats('daily', range);
                      }}
                    >
                      <SelectTrigger className="w-[100px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 días</SelectItem>
                        <SelectItem value="14">14 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-purple-500/10">
                    <p className="text-lg font-bold text-purple-500">
                      {chartPeriod === 'daily' ? dailyTotals.points.toLocaleString() : 
                       chartPeriod === 'weekly' ? weeklyStats.reduce((s, w) => s + w.total_points, 0).toLocaleString() :
                       monthlyStats.reduce((s, m) => s + m.total_points, 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Puntos</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-green-500/10">
                    <p className="text-lg font-bold text-green-500">
                      {chartPeriod === 'daily' ? dailyTotals.phrases : 
                       chartPeriod === 'weekly' ? weeklyStats.reduce((s, w) => s + totalPhrasesSaved, 0) :
                       monthlyStats.reduce((s, m) => s + totalPhrasesSaved, 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Frases</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-blue-500/10">
                    <p className="text-lg font-bold text-blue-500">
                      {chartPeriod === 'daily' ? dailyTotals.daysActive : 
                       chartPeriod === 'weekly' ? weeklyStats.reduce((s, w) => s + w.days_practiced, 0) :
                       monthlyStats.reduce((s, m) => s + m.days_active, 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Días Activos</p>
                  </div>
                  {/* <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                    <p className="text-lg font-bold text-yellow-500">
                      {chartPeriod === 'daily' ? `${dailyTotals.minutes}m` : 
                       chartPeriod === 'weekly' ? `${weeklyStats.reduce((s, w) => s + w.total_minutes, 0)}m` :
                       `${Math.round(monthlyStats.reduce((s, m) => s + m.average_accuracy, 0) / Math.max(monthlyStats.length, 1))}%`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {chartPeriod === 'monthly' ? 'Precisión' : 'Minutos'}
                    </p>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Right Section - Achievements */}
            <div className="lg:col-span-3">
              <div className="bg-card/90 backdrop-blur rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Logros
                  </h2>
                  <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                    {achievements.length}/{ALL_ACHIEVEMENTS.length}
                  </span>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {/* Unlocked achievements */}
                    {achievements.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-2">Desbloqueados</p>
                        {achievements.map((achievement) => (
                          <BackendAchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                      </>
                    )}
                    
                    {/* Locked achievements */}
                    {(() => {
                      const unlockedTypes = achievements.map(a => a.achievement_type);
                      const lockedAchievements = ALL_ACHIEVEMENTS.filter(a => !unlockedTypes.includes(a.type));
                      
                      if (lockedAchievements.length === 0) return null;
                      
                      return (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">Por desbloquear</p>
                          {lockedAchievements.map((achievement) => (
                            <LockedAchievementCard key={achievement.type} achievement={achievement} />
                          ))}
                        </>
                      );
                    })()}
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

// Locked Achievement Card Component
const LockedAchievementCard = ({ achievement }: { achievement: AchievementDefinition }) => {
  return (
    <div className="rounded-xl p-4 bg-muted/30 border border-muted/50 opacity-60">
      <div className="flex items-center gap-3">
        <div className="text-3xl grayscale">
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">
            {achievement.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {achievement.description}
          </p>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default Progress;
