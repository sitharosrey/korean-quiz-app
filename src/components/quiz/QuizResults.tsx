'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Clock, 
  Target, 
  RotateCcw, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizResultsProps {
  results: Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    xpEarned: number;
    confidence?: number;
  }>;
  totalQuestions: number;
  totalXP: number;
  averageTime: number;
  onRestart: () => void;
  onBack: () => void;
}

export function QuizResults({ 
  results, 
  totalQuestions, 
  totalXP, 
  averageTime, 
  onRestart, 
  onBack 
}: QuizResultsProps) {
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  
  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { message: "Outstanding!", color: "text-green-600", icon: Trophy };
    if (accuracy >= 80) return { message: "Great job!", color: "text-blue-600", icon: Target };
    if (accuracy >= 70) return { message: "Good work!", color: "text-yellow-600", icon: CheckCircle };
    return { message: "Keep practicing!", color: "text-orange-600", icon: XCircle };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4"
        >
          <PerformanceIcon className={`w-16 h-16 mx-auto ${performance.color}`} />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz Complete!
        </h1>
        <p className={`text-xl font-semibold ${performance.color}`}>
          {performance.message}
        </p>
      </div>

      {/* Main Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Your Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accuracy */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Accuracy</span>
              <span className="text-2xl font-bold text-gray-900">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{correctAnswers} correct</span>
              <span>{totalQuestions - correctAnswers} incorrect</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalXP}</div>
              <div className="text-sm text-blue-700">XP Earned</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatTime(averageTime)}</div>
              <div className="text-sm text-green-700">Avg. Time</div>
            </div>
          </div>

          {/* Total Time */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Total time: {formatTime(totalTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Question Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={result.questionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">Question {index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formatTime(result.timeSpent)}
                  </Badge>
                  <Badge 
                    variant={result.isCorrect ? "default" : "destructive"}
                    className="text-xs"
                  >
                    +{result.xpEarned} XP
                  </Badge>
                  {result.confidence && result.confidence < 1 && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(result.confidence * 100)}% match
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quiz
        </Button>
        <Button
          onClick={onRestart}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>

      {/* XP Celebration */}
      {totalXP > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
        >
          <div className="flex items-center justify-center gap-2 text-yellow-700">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">You earned {totalXP} XP!</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            Keep learning to level up and unlock achievements!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}