// Authentication API service - connects to Django backend
// Endpoints: /api/users/google/login/, /api/users/profile/, /api/users/logout/

import { apiGet, apiPost, API_BASE_URL } from './api';
import { User } from '@/contexts/AuthContext';

// ============================================
// TYPES - Based on backend views
// ============================================

export interface GoogleLoginRequest {
  credential: string;
  userInfo?: {
    email: string;
    sub: string;
    name?: string;
    picture?: string;
  };
}

export interface GoogleLoginResponse {
  success: boolean;
  user: {
    id: number;
    email: string;
    username: string;
    profile_picture?: string;
  };
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * Login with Google OAuth
 * POST /api/users/google/login/
 * Sets parla_session cookie on success
 */
export const googleLogin = async (
  accessToken: string,
  userInfo?: GoogleLoginRequest['userInfo']
): Promise<GoogleLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/google/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      credential: accessToken,
      userInfo: userInfo,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
};

/**
 * Get current user profile
 * GET /api/users/profile/
 * Requires valid session cookie
 */
export const getUserProfile = async (): Promise<User> => {
  return apiGet<User>('/users/profile/');
};

/**
 * Logout current user
 * POST /api/users/logout/
 * Deletes parla_session cookie
 */
export const logoutUser = async (): Promise<LogoutResponse> => {
  return apiPost<LogoutResponse>('/users/logout/', {});
};

/**
 * Check if user has valid session by trying to get profile
 * Returns user data if authenticated, null otherwise
 */
export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const user = await getUserProfile();
    return user;
  } catch (error) {
    // Session invalid or expired
    return null;
  }
};
