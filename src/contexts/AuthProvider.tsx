import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext, User } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const authStatus = localStorage.getItem('isAuthenticated');
    const userCredential = localStorage.getItem('userCredential');
    
    if (authStatus === 'true' && userCredential) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userCredential));
    }
  }, []);

  const login = (credential: User) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userCredential', JSON.stringify(credential));
    setIsAuthenticated(true);
    setUser(credential);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userCredential');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
