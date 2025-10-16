'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, BookOpen, Brain, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

interface WelcomeMessageProps {
  onDismiss: () => void;
}

export function WelcomeMessage({ onDismiss }: WelcomeMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            한
          </div>
          <CardTitle className="text-2xl">Welcome to Korean Flashcard Trainer!</CardTitle>
          <CardDescription className="text-lg">
            You're all set to start your Korean learning journey
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Create Lessons</h3>
              <p className="text-sm text-blue-700">Add your Korean-English word pairs</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Brain className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Take Quizzes</h3>
              <p className="text-sm text-green-700">Practice with spaced repetition</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Gamepad2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Play Games</h3>
              <p className="text-sm text-purple-700">Learn through interactive games</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              What's Available:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Spaced repetition system for optimal learning</li>
              <li>• Multiple quiz modes (typing, dictation, multiple choice)</li>
              <li>• AI-generated context sentences</li>
              <li>• Visual memory aids with image attachments</li>
              <li>• Progress tracking with XP and achievements</li>
              <li>• Interactive games like Match the Pairs</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={onDismiss} className="flex-1">
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
            <Link href="/lessons">
              <Button variant="outline" className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                Create First Lesson
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
