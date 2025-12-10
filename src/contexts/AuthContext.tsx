import { createContext } from 'react';

// User interface matching Django UserSerializer
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  total_points?: number;
  current_streak?: number;
  longest_streak?: number;
  last_practice_date?: string;
  date_joined?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
