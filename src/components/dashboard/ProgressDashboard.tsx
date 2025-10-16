'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UserProgress } from '@/types';
import { StorageService } from '@/lib/storage';
import { ProgressService } from '@/lib/progress';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  Zap, 
  TrendingUp,
  Calendar,
  Star,
  Brain,
  Gamepad2
} from 'lucide-react';

interface ProgressDashboardProps {
  className?: string;
}

export function ProgressDashboard({ className }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [studyStats, setStudyStats] = useState<any>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const userProgress = StorageService.getProgress();
    const stats = ProgressService.getStudyStats();
    setProgress(userProgress);
    setStudyStats(stats);
  };

  if (!progress || !studyStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const xpProgress = ProgressService.getXPProgress(progress.currentLevel, progress.totalXP);
  const wordsForReview = ProgressService.getWordsForReview();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your Korean learning journey</p>
      </motion.div>

      {/* Level and XP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Level {progress.currentLevel}
            </CardTitle>
            <CardDescription>
              {xpProgress.current} / {xpProgress.needed} XP to next level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={xpProgress.percentage} className="mb-4" />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total XP: {progress.totalXP}</span>
              <span>{Math.round(xpProgress.percentage)}% to Level {progress.currentLevel + 1}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-orange-600">{progress.currentStreak}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Words Learned</p>
                  <p className="text-2xl font-bold text-green-600">{studyStats.totalWords}</p>
                  <p className="text-xs text-gray-500">total</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{progress.totalQuizzesCompleted}</p>
                  <p className="text-xs text-gray-500">total</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Time</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(progress.totalTimeSpent)}</p>
                  <p className="text-xs text-gray-500">minutes</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Study Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Study Overview
            </CardTitle>
            <CardDescription>
              Your vocabulary learning progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{wordsForReview.length}</div>
                <p className="text-sm text-gray-600">Words for Review</p>
                <p className="text-xs text-gray-500 mt-1">Due for spaced repetition</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{studyStats.masteredWords}</div>
                <p className="text-sm text-gray-600">Mastered Words</p>
                <p className="text-xs text-gray-500 mt-1">Difficulty level 4+</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{studyStats.newWords}</div>
                <p className="text-sm text-gray-600">New Words</p>
                <p className="text-xs text-gray-500 mt-1">Just added</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your learning milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Longest Streak</p>
                  <p className="text-sm text-yellow-700">{progress.longestStreak} days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Gamepad2 className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Games Played</p>
                  <p className="text-sm text-blue-700">{progress.totalQuizzesCompleted} completed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Start Quiz
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Play Match Game
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Review Words
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
