"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getUserProfile } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  clearAuthData: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate user data structure - be more lenient
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          setToken(storedToken);
          setUser(parsedUser);
          // Fetch fresh user data from API
          fetchUserProfile(storedToken);
        } else {
          console.warn('Invalid user data structure, clearing auth data');
          clearAuthData();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        clearAuthData();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await getUserProfile(authToken);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('auth_user', JSON.stringify(response.data));
      } else {
        console.warn('Failed to fetch user profile, keeping existing data');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't clear auth data on API failure, just keep existing data
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    // Validate token and user data
    if (!newToken || !newUser || !newUser.id || !newUser.mobileNumber) {
      console.error('Invalid token or user data provided to login');
      return;
    }
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    
    // Set cookie for middleware authentication
    document.cookie = `auth_token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
    
    // Fetch fresh user data from API
    fetchUserProfile(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear cookie for middleware authentication
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const clearAuthData = () => {
    console.log('Clearing corrupted auth data');
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear cookie for middleware authentication
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setIsLoading(false);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await getUserProfile(token);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('auth_user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        clearAuthData,
        refreshUser,
        isAuthenticated,
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
