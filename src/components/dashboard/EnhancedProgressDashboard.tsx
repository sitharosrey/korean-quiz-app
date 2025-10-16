'use client';

import { useState, useEffect } from 'react';
import { Lesson, UserProgress } from '@/types';
import { StorageService } from '@/lib/storage';
import { SRSService } from '@/lib/srs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Award, 
  Flame, 
  BookOpen, 
  Brain, 
  Clock, 
  Zap, 
  TrendingUp, 
  Target,
  Star,
  Trophy,
  Calendar,
  CheckCircle,
  PlayCircle,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function EnhancedProgressDashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgressAndLessons();
  }, []);

  const loadProgressAndLessons = () => {
    const storedProgress = StorageService.getProgress();
    const storedLessons = StorageService.getLessons();
    setProgress(storedProgress);
    setLessons(storedLessons);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return <p className="text-center text-gray-500">No progress data available.</p>;
  }

  // Calculate enhanced statistics
  const allWords = lessons.flatMap(lesson => lesson.words);
  const srsWords = allWords as any[]; // Type assertion for SRS words
  const masteryStats = SRSService.getMasteryStats(srsWords);
  const wordsForReview = SRSService.getWordsForReview(srsWords);
  const totalXP = SRSService.getTotalXP(srsWords);
  const userLevel = SRSService.getLevelFromXP(progress.totalXP);
  const xpProgress = SRSService.getXPProgress(progress.totalXP);

  // Chart data for mastery levels
  const masteryChartData = [
    { name: 'New', value: masteryStats.newWords, color: '#ef4444' },
    { name: 'Learning', value: masteryStats.learning, color: '#f59e0b' },
    { name: 'Reviewing', value: masteryStats.reviewing, color: '#3b82f6' },
    { name: 'Mastered', value: masteryStats.mastered, color: '#10b981' },
  ];

  // Weekly progress data (mock data for now)
  const weeklyProgressData = [
    { day: 'Mon', words: 5, xp: 50 },
    { day: 'Tue', words: 8, xp: 80 },
    { day: 'Wed', words: 3, xp: 30 },
    { day: 'Thu', words: 12, xp: 120 },
    { day: 'Fri', words: 7, xp: 70 },
    { day: 'Sat', words: 15, xp: 150 },
    { day: 'Sun', words: 10, xp: 100 },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-600" />
            Learning Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Track your progress and celebrate your achievements!
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total XP */}
          <motion.div variants={cardVariants} transition={{ delay: 0.1 }}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.totalXP} XP</div>
                <p className="text-xs text-gray-500">Level {userLevel}</p>
                <Progress value={xpProgress.percentage} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {xpProgress.needed - xpProgress.current} XP to next level
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Streak */}
          <motion.div variants={cardVariants} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progress.currentStreak} days</div>
                <p className="text-xs text-gray-500">Longest: {progress.longestStreak} days</p>
                {progress.lastStudyDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last studied: {progress.lastStudyDate.toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Words Mastered */}
          <motion.div variants={cardVariants} transition={{ delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Words Mastered</CardTitle>
                <Star className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{masteryStats.mastered}</div>
                <p className="text-xs text-gray-500">
                  {masteryStats.masteryPercentage}% mastery rate
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Words for Review */}
          <motion.div variants={cardVariants} transition={{ delay: 0.4 }}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Words for Review</CardTitle>
                <Target className="h-4 w-4 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wordsForReview.length}</div>
                <p className="text-xs text-gray-500">Ready for spaced repetition</p>
                <Link href="/quiz">
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <PlayCircle className="w-3 h-3 mr-1" />
                    Start Review
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mastery Distribution */}
          <motion.div variants={cardVariants} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Mastery Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={masteryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {masteryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {masteryChartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div variants={cardVariants} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="words" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Words Learned"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="XP Earned"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Learning Stats */}
          <motion.div variants={cardVariants} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Words</span>
                  <span className="font-semibold">{masteryStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New Words</span>
                  <span className="font-semibold text-red-600">{masteryStats.newWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Learning</span>
                  <span className="font-semibold text-yellow-600">{masteryStats.learning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reviewing</span>
                  <span className="font-semibold text-blue-600">{masteryStats.reviewing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mastered</span>
                  <span className="font-semibold text-green-600">{masteryStats.mastered}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Stats */}
          <motion.div variants={cardVariants} transition={{ delay: 0.8 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Activity Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quizzes Completed</span>
                  <span className="font-semibold">{progress.totalQuizzesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Study Time</span>
                  <span className="font-semibold">{progress.totalTimeSpent} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Words Learned</span>
                  <span className="font-semibold">{progress.totalWordsLearned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Level</span>
                  <Badge variant="outline" className="font-semibold">
                    Level {userLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={cardVariants} transition={{ delay: 0.9 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {progress.achievements.length > 0 ? (
                  progress.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No achievements yet. Keep learning!</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={cardVariants} transition={{ delay: 1.0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/quiz">
                <Button className="w-full">
                  <Brain className="mr-2 h-4 w-4" />
                  Start Quiz
                </Button>
              </Link>
              <Link href="/games/match-pairs">
                <Button variant="outline" className="w-full">
                  <Target className="mr-2 h-4 w-4" />
                  Match Game
                </Button>
              </Link>
              <Link href="/lessons">
                <Button variant="outline" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Lessons
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
