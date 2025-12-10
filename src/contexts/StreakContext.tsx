// Streak Context - Global state for user streak data
// Provides streak data and methods to update it across the app

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { getStreak, recordActivity, StreakData } from '@/services/gamificationApi';
import { useAuth } from '@/hooks/useAuth';

interface StreakContextType {
  streak: number;
  bestStreak: number;
  lastPracticeDate: string | null;
  isLoading: boolean;
  error: string | null;
  refreshStreak: () => Promise<void>;
  recordPractice: () => Promise<StreakData | null>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

interface StreakProviderProps {
  children: ReactNode;
}

export const StreakProvider: React.FC<StreakProviderProps> = ({ children }) => {
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Fetch streak data from backend
  const refreshStreak = useCallback(async () => {
    try {
      setError(null);
      const data = await getStreak();
      setStreak(data.streak);
      setBestStreak(data.best_streak);
      setLastPracticeDate(data.last_practice_date || null);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError('Error al cargar la racha');
      // Keep existing values on error
    }
  }, []);

  // Record practice activity and update streak
  const recordPractice = useCallback(async (): Promise<StreakData | null> => {
    try {
      setError(null);
      const data = await recordActivity();
      setStreak(data.streak);
      setBestStreak(data.best_streak);
      // Update last practice date to today
      setLastPracticeDate(new Date().toISOString().split('T')[0]);
      return data;
    } catch (err) {
      console.error('Error recording activity:', err);
      setError('Error al registrar actividad');
      return null;
    }
  }, []);

  // Load streak only when authenticated
  useEffect(() => {
    // Reset when user logs out
    if (!isAuthenticated) {
      setStreak(0);
      setBestStreak(0);
      setLastPracticeDate(null);
      setIsLoading(false);
      setError(null);
      hasLoadedRef.current = false;
      return;
    }

    // Don't reload if already loaded
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    const loadStreak = async () => {
      setIsLoading(true);
      await refreshStreak();
      setIsLoading(false);
    };
    loadStreak();
  }, [isAuthenticated, refreshStreak]);

  const value: StreakContextType = {
    streak,
    bestStreak,
    lastPracticeDate,
    isLoading,
    error,
    refreshStreak,
    recordPractice,
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = (): StreakContextType => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export default StreakContext;
