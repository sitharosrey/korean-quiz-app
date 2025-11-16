'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TypingChallengeSession } from '@/lib/typing-challenge';
import { TypingChallengeService } from '@/lib/typing-challenge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  RotateCcw, 
  Play,
  CheckCircle,
  XCircle,
  Keyboard,
  Zap
} from 'lucide-react';

interface TypingChallengeGameProps {
  session: TypingChallengeSession;
  onGameComplete: (finalSession: TypingChallengeSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function TypingChallengeGame({ session, onGameComplete, onRestart, onExit }: TypingChallengeGameProps) {
  const [gameSession, setGameSession] = useState<TypingChallengeSession>(session);
  const [userAnswer, setUserAnswer] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [completionHandled, setCompletionHandled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setUserAnswer('');
      setHasStarted(false);
      setShowResult(false);
      setLastResult(null);
      setCompletionHandled(false);
    }
  }, [session.id, gameSession.id]);

  // Start word when component mounts or word changes
  useEffect(() => {
    if (!hasStarted && !gameSession.isCompleted) {
      const startedSession = TypingChallengeService.startWord(gameSession);
      setGameSession(startedSession);
      setHasStarted(true);
    }
  }, [hasStarted, gameSession, gameSession.currentWordIndex]);

  // Focus input
  useEffect(() => {
    if (inputRef.current && !showResult && !gameSession.isCompleted) {
      inputRef.current.focus();
    }
  }, [showResult, gameSession.isCompleted, gameSession.currentWordIndex]);

  // Check for completion - only call once
  useEffect(() => {
    if (gameSession.isCompleted && !completionHandled) {
      setCompletionHandled(true);
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, completionHandled, onGameComplete, gameSession]);

  const handleSubmit = () => {
    if (!userAnswer.trim() || showResult) return;

    const { isCorrect, correctAnswer, updatedSession } = TypingChallengeService.submitAnswer(
      gameSession,
      userAnswer
    );

    setLastResult({ isCorrect, correctAnswer });
    setShowResult(true);
    setGameSession(updatedSession);

    // Auto-advance after showing result
    setTimeout(() => {
      setUserAnswer('');
      setShowResult(false);
      setHasStarted(false);
      setLastResult(null);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  const progress = ((gameSession.currentWordIndex) / gameSession.words.length) * 100;
  const currentWordData = gameSession.words[gameSession.currentWordIndex];
  const currentWord = currentWordData?.word;

  if (gameSession.isCompleted) {
    const stats = TypingChallengeService.getStats(gameSession);

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
            <CardTitle className="text-2xl text-green-600">Challenge Complete!</CardTitle>
            <CardDescription>
              You typed {stats.correctAnswers} out of {stats.total} words correctly
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

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-900">WPM</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {stats.wordsPerMinute}
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

  if (!currentWord) return null;

  const displayWord = gameSession.mode === 'korean-to-english' ? currentWord.korean : currentWord.english;
  const promptLabel = gameSession.mode === 'korean-to-english' ? 'Korean' : 'English';
  const inputLabel = gameSession.mode === 'korean-to-english' ? 'English' : 'Korean';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Typing Challenge
              </CardTitle>
              <CardDescription>
                Type as fast and accurately as you can
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-50">
                <Zap className="w-3 h-3 mr-1" />
                {gameSession.wordsPerMinute} WPM
              </Badge>
              <Badge variant="outline">
                {gameSession.currentWordIndex + 1} / {gameSession.words.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Typing Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gameSession.currentWordIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Word to type */}
                <div className="text-center p-8 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">{promptLabel}</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {displayWord}
                  </p>
                </div>

                {/* Input */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 text-center">Type the {inputLabel} translation</p>
                  <Input
                    ref={inputRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type ${inputLabel} word...`}
                    disabled={showResult}
                    className="text-center text-2xl py-6"
                  />
                  
                  {!showResult && (
                    <Button
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={!userAnswer.trim()}
                    >
                      Submit (Press Enter)
                    </Button>
                  )}
                </div>

                {/* Result Feedback */}
                <AnimatePresence>
                  {showResult && lastResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-lg text-center ${
                        lastResult.isCorrect 
                          ? 'bg-green-50 text-green-800 border-2 border-green-300' 
                          : 'bg-red-50 text-red-800 border-2 border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {lastResult.isCorrect ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <XCircle className="w-6 h-6" />
                        )}
                        <span className="text-xl font-bold">
                          {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      {!lastResult.isCorrect && (
                        <p className="mt-2">
                          Correct answer: <strong>{lastResult.correctAnswer}</strong>
                        </p>
                      )}
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

