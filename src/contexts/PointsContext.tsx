import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getPoints, addPoints as addPointsApi } from '@/services/gamificationApi';
import { useAuth } from '@/hooks/useAuth';

interface PointsContextType {
  totalPoints: number;
  isLoading: boolean;
  refreshPoints: () => Promise<void>;
  addPoints: (amount: number) => Promise<number>; // Returns new total
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const PointsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const hasLoadedRef = useRef<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Load points only when authenticated
  useEffect(() => {
    // Reset when user logs out
    if (!isAuthenticated) {
      setTotalPoints(0);
      setIsLoading(false);
      hasLoadedRef.current = false;
      return;
    }

    // Don't reload if already loaded
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadPoints = async () => {
      setIsLoading(true);
      try {
        const data = await getPoints();
        setTotalPoints(data.total_points);
      } catch (error) {
        console.error('Error loading points:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoints();
  }, [isAuthenticated]);

  const refreshPoints = useCallback(async () => {
    try {
      const data = await getPoints();
      setTotalPoints(data.total_points);
    } catch (error) {
      console.error('Error refreshing points:', error);
    }
  }, []);

  const addPoints = useCallback(async (amount: number): Promise<number> => {
    try {
      const data = await addPointsApi(amount);
      setTotalPoints(data.total_points);
      return data.total_points;
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }, []);

  return (
    <PointsContext.Provider value={{ totalPoints, isLoading, refreshPoints, addPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = (): PointsContextType => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};
