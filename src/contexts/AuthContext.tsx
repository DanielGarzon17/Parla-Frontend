import { createContext } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  // Legacy fields for backwards compatibility
  credential?: string;
  clientId?: string;
  select_by?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
