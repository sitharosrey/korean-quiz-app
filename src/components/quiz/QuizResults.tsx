'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizSession, QuizQuestion } from '@/types';
import { QuizService } from '@/lib/quiz';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface QuizResultsProps {
  session: QuizSession;
  onRestart: () => void;
}

export function QuizResults({ session, onRestart }: QuizResultsProps) {
  const score = QuizService.getQuizScore(session);
  const wrongAnswers = QuizService.getWrongAnswers(session);
  const totalTime = session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = Math.floor((totalTime % 60000) / 1000);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Excellent work! 🎉';
    if (percentage >= 80) return 'Great job! 👍';
    if (percentage >= 70) return 'Good effort! 💪';
    if (percentage >= 60) return 'Not bad, keep practicing! 📚';
    return 'Keep studying, you\'ll get there! 🌟';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Main Results Card */}
      <Card className="text-center">
        <CardHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg">
            {getScoreMessage(score.percentage)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(score.percentage)}`}>
              {score.percentage}%
            </div>
            <div className="text-xl text-gray-600">
              {score.correct} out of {score.total} correct
            </div>
            <Progress value={score.percentage} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{minutes}:{seconds.toString().padStart(2, '0')}</div>
              <div className="text-sm text-gray-600">Time taken</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(totalTime / session.questions.length / 1000)}s
              </div>
              <div className="text-sm text-gray-600">Avg per question</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onRestart} size="lg" className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Try Again
            </Button>
            <Link href="/lessons">
              <Button variant="outline" size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                <BookOpen className="w-5 h-5" />
                Back to Lessons
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="flex items-center gap-2 w-full sm:w-auto">
                <Home className="w-5 h-5" />
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Wrong Answers Review */}
      {wrongAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Review Wrong Answers
            </CardTitle>
            <CardDescription>
              Study these words to improve your score next time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wrongAnswers.map((question, index) => {
                const result = session.results.find(r => r.questionId === question.id);
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-red-200 bg-red-50 rounded-lg"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Question</div>
                        <div className="font-semibold text-lg">{question.english}</div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Your answer</div>
                          <div className="text-red-600 font-medium">{result?.selectedAnswer}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Correct answer</div>
                          <div className="text-green-600 font-medium">{question.correctAnswer}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Questions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            All Questions
          </CardTitle>
          <CardDescription>
            Complete breakdown of your quiz performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.questions.map((question, index) => {
              const result = session.results.find(r => r.questionId === question.id);
              const isCorrect = result?.isCorrect;
              
              return (
                <div
                  key={question.id}
                  className={`p-3 rounded-lg border ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{question.english}</div>
                      <div className="text-sm text-gray-600">
                        Correct: {question.correctAnswer}
                        {!isCorrect && ` | Your answer: ${result?.selectedAnswer}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm text-gray-500">
                        {Math.round((result?.timeSpent || 0) / 1000)}s
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
