'use client';

import React, { ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import { LoginForm } from './LoginForm';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Korean Flashcard Trainer
            </h1>
            <p className="text-gray-600 mb-4">
              Create an account or sign in to start learning Korean
            </p>
            <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border">
              <p className="font-medium mb-2">Demo Accounts Available:</p>
              <p><strong>Username:</strong> demo | <strong>Password:</strong> demo123</p>
              <p><strong>Username:</strong> student | <strong>Password:</strong> student123</p>
            </div>
          </div>
          <LoginForm />
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}
