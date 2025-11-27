import { createContext } from 'react';
import { CredentialResponse } from '@react-oauth/google';

export interface User {
  credential?: string;
  clientId?: string;
  select_by?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credential: CredentialResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
