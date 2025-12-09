import React, { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AuthContext, User } from './AuthContext';
import { logoutUser, getUserProfile, checkAuthStatus } from '@/services/authApi';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasValidatedRef = useRef<boolean>(false);

  // Check authentication status on app load - ONLY ONCE
  useEffect(() => {
    if (hasValidatedRef.current) return;
    hasValidatedRef.current = true;
    
    const validateSession = async () => {
      setIsLoading(true);
      try {
        // First check localStorage for cached auth state
        const authStatus = localStorage.getItem('isAuthenticated');
        
        if (authStatus === 'true') {
          // Validate session with backend by fetching user profile
          const userData = await checkAuthStatus();
          
          if (userData) {
            // Session is valid, update user data from backend
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('userCredential', JSON.stringify(userData));
          } else {
            // Session expired or invalid, clear local state
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userCredential');
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error validating session:', error);
        // On error, clear auth state
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userCredential');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback((userData: User) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userCredential', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint to clear session cookie
      await logoutUser();
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with local logout even if backend fails
    } finally {
      // Always clear local state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userCredential');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const userData = await getUserProfile();
      setUser(userData);
      localStorage.setItem('userCredential', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // If profile fetch fails, session might be invalid
      await logout();
    }
  }, [isAuthenticated, logout]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
