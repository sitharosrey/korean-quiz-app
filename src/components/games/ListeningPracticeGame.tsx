'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ListeningPracticeSession, ListeningPracticeService } from '@/lib/listening-practice';
import { audioService } from '@/lib/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Target, 
  RotateCcw, 
  Play,
  CheckCircle,
  XCircle,
  Volume2,
  Headphones
} from 'lucide-react';

interface ListeningPracticeGameProps {
  session: ListeningPracticeSession;
  onGameComplete: (finalSession: ListeningPracticeSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function ListeningPracticeGame({ session, onGameComplete, onRestart, onExit }: ListeningPracticeGameProps) {
  const [gameSession, setGameSession] = useState<ListeningPracticeSession>(session);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [completionHandled, setCompletionHandled] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setShowResult(false);
      setHasPlayed(false);
      setCompletionHandled(false);
    }
  }, [session.id, gameSession.id]);

  // Check for completion - only call once
  useEffect(() => {
    if (gameSession.isCompleted && !completionHandled) {
      setCompletionHandled(true);
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, completionHandled, onGameComplete, gameSession]);

  // Auto-play audio when question changes
  useEffect(() => {
    if (!hasPlayed && !showResult && !gameSession.isCompleted) {
      handlePlayAudio();
      setHasPlayed(true);
    }
  }, [gameSession.currentQuestionIndex, hasPlayed, showResult, gameSession.isCompleted]);

  const handlePlayAudio = async () => {
    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    if (!currentQuestion || !audioService) return;

    setIsPlaying(true);
    try {
      await audioService.speakKorean(currentQuestion.correctAnswer);
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;

    const { isCorrect, updatedSession } = ListeningPracticeService.submitAnswer(
      gameSession,
      answer
    );

    setIsCorrect(isCorrect);
    setShowResult(true);
    setGameSession(updatedSession);

    // Auto-advance after showing result
    setTimeout(() => {
      setShowResult(false);
      setHasPlayed(false);
    }, 1500);
  };

  const progress = ((gameSession.currentQuestionIndex + 1) / gameSession.questions.length) * 100;
  const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

  if (gameSession.isCompleted) {
    const stats = ListeningPracticeService.getStats(gameSession);

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
            <CardTitle className="text-2xl text-green-600">Listening Practice Complete!</CardTitle>
            <CardDescription>
              You got {stats.correctAnswers} out of {stats.total} correct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900 text-sm">Correct</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.correctAnswers}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-sm">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.accuracy)}%
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-900 text-sm">XP</span>
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

  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Listening Practice
              </CardTitle>
              <CardDescription>
                Listen and choose the correct word
              </CardDescription>
            </div>
            <Badge variant="outline">
              {gameSession.currentQuestionIndex + 1} / {gameSession.questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* English Word Hint */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">English Meaning</p>
                  <p className="text-2xl font-bold text-gray-900">{currentQuestion.word.english}</p>
                </div>

                {/* Audio Player */}
                <div className="flex flex-col items-center gap-4 p-8 bg-blue-50 rounded-lg">
                  <Volume2 className="w-12 h-12 text-blue-600" />
                  <Button
                    onClick={handlePlayAudio}
                    disabled={isPlaying || showResult}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isPlaying ? (
                      <>
                        <Volume2 className="w-5 h-5 mr-2 animate-pulse" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play Audio
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-blue-600">
                    🎧 Listen carefully and choose the correct Korean word
                  </p>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        onClick={() => handleAnswer(option)}
                        className="w-full h-16 text-xl font-medium"
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
                      className={`p-4 rounded-lg text-center ${
                        isCorrect 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isCorrect ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">Correct!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span className="font-bold">Incorrect</span>
                          </>
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

