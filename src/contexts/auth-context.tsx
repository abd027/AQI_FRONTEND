'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  aqi_notifications_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, city?: string, country?: string, latitude?: number, longitude?: number) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
  getUserCity: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, try to refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        // Reload user
        await loadUser();
      } else {
        // Refresh failed, logout
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    // Load user data
    await loadUser();
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    city?: string,
    country?: string,
    latitude?: number,
    longitude?: number
  ) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
        password,
        password_confirm: password, // Backend requires this field
        city: city || null,
        country: country || null,
        latitude: latitude || null,
        longitude: longitude || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle validation errors from Django (object with field errors)
      if (error.detail && typeof error.detail === 'object' && !Array.isArray(error.detail)) {
        const errorMessages = Object.entries(error.detail)
          .map(([field, messages]: [string, any]) => {
            const fieldName = field.replace(/_/g, ' ');
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${fieldName}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        throw new Error(errorMessages);
      }
      // Handle other error formats
      const errorMessage = typeof error.detail === 'string'
        ? error.detail
        : error.message || 'Registration failed';
      throw new Error(errorMessage);
    }

    const userData = await response.json();
    // Don't auto-login after registration, user needs to verify email
    return userData;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      router.push('/login');
    }
  };

  const getUserCity = useCallback(() => {
    return user?.city || null;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshToken,
        isAuthenticated: !!user,
        getUserCity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

