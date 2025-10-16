'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import { WelcomeMessage } from '@/components/auth/WelcomeMessage';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { username: string; email: string; displayName: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<{ displayName: string; email: string; avatar: string; preferences: any }>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(credentials);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; displayName: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(userData);
      if (result.success && result.user) {
        setUser(result.user);
        setShowWelcome(true); // Show welcome message for new users
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<{ displayName: string; email: string; avatar: string; preferences: any }>) => {
    setIsLoading(true);
    try {
      const result = await AuthService.updateProfile(updates);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.deleteAccount();
      if (result.success) {
        setUser(null);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };


  const value: UserContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
      {showWelcome && (
        <WelcomeMessage onDismiss={() => setShowWelcome(false)} />
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
