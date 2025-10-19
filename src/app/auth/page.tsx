'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function AuthPage() {
  return (
    <AuthGuard requireAuth={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Korean Learner
            </h1>
            <p className="text-gray-600 mb-4">
              Sign in to your account or create a new one
            </p>
            <div className="text-sm text-gray-500 bg-white p-3 rounded-lg border">
              <p className="font-medium mb-2">Get Started:</p>
              <p>Create your account to start learning Korean with flashcards!</p>
              <div className="mt-2 space-x-2">
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as unknown as { debugUsers?: () => void }).debugUsers) {
                      (window as unknown as { debugUsers: () => void }).debugUsers();
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Debug: Show All Users
                </button>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as unknown as { clearAllUsers?: () => void }).clearAllUsers) {
                      (window as unknown as { clearAllUsers: () => void }).clearAllUsers();
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Clear All Users
                </button>
              </div>
            </div>
          </div>
          <LoginForm />
        </div>
      </motion.div>
    </AuthGuard>
  );
}
