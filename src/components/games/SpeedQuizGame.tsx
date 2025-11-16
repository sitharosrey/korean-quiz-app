'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpeedQuizSession } from '@/lib/speed-quiz';
import { SpeedQuizService } from '@/lib/speed-quiz';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  RotateCcw, 
  Play,
  CheckCircle,
  XCircle,
  Zap,
  Flame
} from 'lucide-react';

interface SpeedQuizGameProps {
  session: SpeedQuizSession;
  onGameComplete: (finalSession: SpeedQuizSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function SpeedQuizGame({ session, onGameComplete, onRestart, onExit }: SpeedQuizGameProps) {
  const [gameSession, setGameSession] = useState<SpeedQuizSession>(session);
  const [timeLeft, setTimeLeft] = useState(session.timeLimit);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [completionHandled, setCompletionHandled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with prop changes
  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setTimeLeft(session.timeLimit);
      setShowResult(false);
      setCompletionHandled(false);
    }
  }, [session.id, session.timeLimit, gameSession.id]);

  // Timer
  useEffect(() => {
    if (showResult || gameSession.isCompleted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up!
          handleAnswer('', gameSession.timeLimit * 1000);
          return gameSession.timeLimit;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showResult, gameSession.isCompleted, gameSession.timeLimit, gameSession]);

  // Check for completion - only call once
  useEffect(() => {
    if (gameSession.isCompleted && !completionHandled) {
      setCompletionHandled(true);
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, completionHandled, onGameComplete, gameSession]);

  const handleAnswer = (answer: string, timeSpent: number) => {
    if (showResult) return;

    const { isCorrect, updatedSession, bonusPoints } = SpeedQuizService.submitAnswer(
      gameSession,
      answer,
      timeSpent
    );

    setIsCorrect(isCorrect);
    setBonusPoints(bonusPoints);
    setShowResult(true);
    setGameSession(updatedSession);

    // Auto-advance after showing result
    setTimeout(() => {
      setShowResult(false);
      setTimeLeft(gameSession.timeLimit);
    }, 1000);
  };

  const progress = ((gameSession.currentQuestionIndex) / gameSession.questions.length) * 100;
  const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
  const timeSpent = (gameSession.timeLimit - timeLeft) * 1000;

  if (gameSession.isCompleted) {
    const stats = SpeedQuizService.getStats(gameSession);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Speed Quiz Complete!</CardTitle>
            <CardDescription>
              You answered {stats.correctAnswers} out of {stats.total} questions correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-semibold text-green-900">Correct</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {stats.correctAnswers}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {Math.round(stats.accuracy)}%
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-900">Streak</span>
                </div>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {stats.maxStreak}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-900">XP</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {stats.xpEarned}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={onExit} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={onRestart}>
                <Play className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Speed Quiz
              </CardTitle>
              <CardDescription>
                Answer as fast as you can!
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {gameSession.streak > 0 && (
                <Badge variant="default" className="bg-orange-500">
                  <Flame className="w-3 h-3 mr-1" />
                  {gameSession.streak} Streak
                </Badge>
              )}
              <Badge variant="outline">
                {gameSession.currentQuestionIndex + 1} / {gameSession.questions.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Timer */}
                <div className="flex justify-center">
                  <div className={`relative w-24 h-24 ${timeLeft < 3 ? 'animate-pulse' : ''}`}>
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeLeft / gameSession.timeLimit)}`}
                        className={timeLeft < 3 ? 'text-red-500' : 'text-blue-500'}
                        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${timeLeft < 3 ? 'text-red-500' : 'text-gray-900'}`}>
                        {Math.ceil(timeLeft)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {currentQuestion.question}
                  </p>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        onClick={() => handleAnswer(option, timeSpent)}
                        className="w-full h-16 text-lg font-medium"
                        variant="outline"
                        disabled={showResult}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Result Feedback */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`p-4 rounded-lg text-center ${
                        isCorrect 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-bold">
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                        {bonusPoints > 0 && (
                          <Badge variant="secondary">+{bonusPoints} bonus</Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

