'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WordScrambleSession } from '@/lib/word-scramble';
import { WordScrambleService } from '@/lib/word-scramble';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  RotateCcw, 
  Play,
  CheckCircle,
  XCircle,
  Lightbulb,
  Shuffle
} from 'lucide-react';

interface WordScrambleGameProps {
  session: WordScrambleSession;
  onGameComplete: (finalSession: WordScrambleSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function WordScrambleGame({ session, onGameComplete, onRestart, onExit }: WordScrambleGameProps) {
  const [gameSession, setGameSession] = useState<WordScrambleSession>(session);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setUserAnswer('');
      setShowResult(false);
      setShowHint(false);
      setHintIndex(0);
    }
  }, [session.id, gameSession.id]);

  // Focus input on mount and when moving to next word
  useEffect(() => {
    if (inputRef.current && !showResult) {
      inputRef.current.focus();
    }
  }, [showResult, gameSession.currentWordIndex]);

  // Check for completion
  useEffect(() => {
    if (gameSession.isCompleted) {
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, onGameComplete, gameSession]);

  const handleSubmit = () => {
    if (!userAnswer.trim() || showResult) return;

    const { isCorrect, updatedSession } = WordScrambleService.checkAnswer(
      gameSession,
      userAnswer
    );

    setIsCorrect(isCorrect);
    setShowResult(true);
    
    // Move to next word or complete
    const nextSession = WordScrambleService.nextWord(updatedSession);
    
    // Set the session immediately so stats are preserved
    setGameSession(nextSession);
    
    // Auto-advance UI after showing result
    setTimeout(() => {
      setUserAnswer('');
      setShowResult(false);
      setShowHint(false);
      setHintIndex(0);
    }, 1500);
  };

  const handleShowHint = () => {
    setShowHint(true);
    if (hintIndex < gameSession.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  const handleReshuffle = () => {
    const newScramble = WordScrambleService.scrambleWord(gameSession.originalWord);
    setGameSession({
      ...gameSession,
      scrambledWord: newScramble,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  const progress = ((gameSession.currentWordIndex + 1) / gameSession.words.length) * 100;
  const currentWord = gameSession.words[gameSession.currentWordIndex];

  if (gameSession.isCompleted) {
    const stats = WordScrambleService.getStats(gameSession);

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
            <CardTitle className="text-2xl text-green-600">Game Complete!</CardTitle>
            <CardDescription>
              You unscrambled {stats.correctAnswers} out of {stats.total} words
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Correct</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.correctAnswers}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.accuracy)}%
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">XP Earned</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Word Scramble</CardTitle>
              <CardDescription>
                Unscramble the Korean word
              </CardDescription>
            </div>
            <Badge variant="outline">
              {gameSession.currentWordIndex + 1} / {gameSession.words.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Game Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Game Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-center text-sm text-gray-700">
                <strong>How to Play:</strong> The Korean letters below are mixed up! 
                Rearrange them in your head and type the correct word in order.
              </p>
            </div>

            {/* English Word */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">🇬🇧 English Word</p>
              <p className="text-2xl font-bold text-gray-900">{currentWord.english}</p>
              <p className="text-xs text-gray-400 mt-1">👇 Find the Korean translation below</p>
            </div>

            {/* Scrambled Word */}
            <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-300">
              <p className="text-sm text-gray-500 mb-2">🔀 Scrambled Korean Letters</p>
              <div className="flex justify-center items-center gap-2 mb-3">
                {gameSession.scrambledWord.split('').map((char, index) => (
                  <div 
                    key={index}
                    className="w-12 h-12 bg-white border-2 border-blue-400 rounded-lg flex items-center justify-center shadow-sm"
                  >
                    <span className="text-2xl font-bold text-blue-600">{char}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mb-3">
                ↕️ These letters are in the wrong order - rearrange them!
              </p>
              <Button
                onClick={handleReshuffle}
                variant="ghost"
                size="sm"
                className="mt-2"
                disabled={showResult}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Reshuffle Letters
              </Button>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600 font-medium">
                ✍️ Type the Korean word with letters in the correct order:
              </p>
              <Input
                ref={inputRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type the unscrambled Korean word here..."
                disabled={showResult}
                className="text-center text-2xl py-6 font-bold"
              />
              
              {!showResult && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={!userAnswer.trim()}
                  >
                    Submit Answer
                  </Button>
                  <Button
                    onClick={handleShowHint}
                    variant="outline"
                    disabled={showHint && hintIndex >= gameSession.hints.length - 1}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint
                  </Button>
                </div>
              )}
            </div>

            {/* Hints */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Hint:</p>
                      <p className="text-yellow-800">{gameSession.hints[hintIndex]}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Feedback */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-6 rounded-lg text-center ${
                    isCorrect 
                      ? 'bg-green-50 text-green-800 border-2 border-green-300' 
                      : 'bg-red-50 text-red-800 border-2 border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                    <span className="text-xl font-bold">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="mt-2">
                      The correct answer is: <strong>{gameSession.originalWord}</strong>
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

