'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrueFalseSession, TrueFalseService } from '@/lib/true-false';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, RotateCcw, Play, CheckCircle, XCircle, Check, X, Flame } from 'lucide-react';

interface TrueFalseGameProps {
  session: TrueFalseSession;
  onGameComplete: (finalSession: TrueFalseSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function TrueFalseGame({ session, onGameComplete, onRestart, onExit }: TrueFalseGameProps) {
  const [gameSession, setGameSession] = useState<TrueFalseSession>(session);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completionHandled, setCompletionHandled] = useState(false);

  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setShowResult(false);
      setCompletionHandled(false);
    }
  }, [session.id, gameSession.id]);

  useEffect(() => {
    if (gameSession.isCompleted && !completionHandled) {
      setCompletionHandled(true);
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, completionHandled, onGameComplete, gameSession]);

  const handleAnswer = (answer: boolean) => {
    if (showResult) return;

    const { isCorrect, updatedSession } = TrueFalseService.submitAnswer(gameSession, answer);
    setIsCorrect(isCorrect);
    setShowResult(true);
    setGameSession(updatedSession);

    setTimeout(() => {
      setShowResult(false);
    }, 1000);
  };

  const progress = ((gameSession.currentQuestionIndex + 1) / gameSession.questions.length) * 100;
  const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

  if (gameSession.isCompleted) {
    const stats = TrueFalseService.getStats(gameSession);

    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">True or False Complete!</CardTitle>
            <CardDescription>You got {stats.correctAnswers} out of {stats.total} correct</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.correctAnswers}</p>
                <p className="text-xs text-green-900">Correct</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{Math.round(stats.accuracy)}%</p>
                <p className="text-xs text-blue-900">Accuracy</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{stats.maxStreak}</p>
                <p className="text-xs text-orange-900">Max Streak</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{stats.xpEarned}</p>
                <p className="text-xs text-yellow-900">XP</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={onExit} variant="outline"><RotateCcw className="w-4 h-4 mr-2" />Back</Button>
              <Button onClick={onRestart}><Play className="w-4 h-4 mr-2" />Play Again</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">True or False</CardTitle>
              <CardDescription>Is this translation correct?</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {gameSession.streak > 0 && (
                <Badge variant="default" className="bg-orange-500">
                  <Flame className="w-3 h-3 mr-1" />{gameSession.streak} Streak
                </Badge>
              )}
              <Badge variant="outline">{gameSession.currentQuestionIndex + 1} / {gameSession.questions.length}</Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Korean</p>
                    <p className="text-4xl font-bold text-gray-900">{currentQuestion.displayedWord}</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-400">=</div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">English</p>
                    <p className="text-4xl font-bold text-blue-600">{currentQuestion.displayedTranslation}</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-lg font-medium text-gray-700">
                Is this translation correct?
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleAnswer(true)} size="lg" className="h-20 bg-green-600 hover:bg-green-700" disabled={showResult}>
                  <Check className="w-8 h-8 mr-2" />TRUE
                </Button>
                <Button onClick={() => handleAnswer(false)} size="lg" className="h-20 bg-red-600 hover:bg-red-700" disabled={showResult}>
                  <X className="w-8 h-8 mr-2" />FALSE
                </Button>
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-lg text-center ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {isCorrect ? <><CheckCircle className="w-5 h-5 inline mr-2" />Correct!</> : <><XCircle className="w-5 h-5 inline mr-2" />Incorrect! Correct: {currentQuestion.correctTranslation}</>}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

