'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FlashcardSession, FlashcardService } from '@/lib/flashcard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Play,
  Volume2,
  Image as ImageIcon,
  ChevronRight,
  Target,
  Clock,
  Layers
} from 'lucide-react';
import { PronunciationButton } from '@/components/ui/pronunciation-button';

interface FlashcardGameProps {
  session: FlashcardSession;
  onGameComplete: (finalSession: FlashcardSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function FlashcardGame({ session, onGameComplete, onRestart, onExit }: FlashcardGameProps) {
  const [gameSession, setGameSession] = useState<FlashcardSession>(session);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setIsFlipped(false);
      setShowButtons(false);
      setCardStartTime(Date.now());
    }
  }, [session.id, gameSession.id]);

  // Check for completion
  useEffect(() => {
    if (gameSession.isCompleted) {
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, onGameComplete, gameSession]);

  const currentCard = gameSession.cards[gameSession.currentCardIndex];
  const progress = FlashcardService.getProgress(gameSession);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setShowButtons(true);
    }
  };

  const handleCorrect = () => {
    const timeSpent = Date.now() - cardStartTime;
    const updatedSession = FlashcardService.markCorrect(gameSession, timeSpent);
    setGameSession(updatedSession);
    
    // Reset for next card
    setIsFlipped(false);
    setShowButtons(false);
    setShowHint(false);
    setCardStartTime(Date.now());
  };

  const handleIncorrect = () => {
    const timeSpent = Date.now() - cardStartTime;
    const updatedSession = FlashcardService.markIncorrect(gameSession, timeSpent);
    setGameSession(updatedSession);
    
    // Reset for next card
    setIsFlipped(false);
    setShowButtons(false);
    setShowHint(false);
    setCardStartTime(Date.now());
  };

  if (gameSession.isCompleted) {
    const stats = FlashcardService.getStats(gameSession);

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
            <CardTitle className="text-2xl text-green-600">Flashcard Session Complete! 🎉</CardTitle>
            <CardDescription>
              You reviewed {stats.total} cards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-semibold text-green-900">Correct</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {stats.correct}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-xs font-semibold text-red-900">Incorrect</span>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {stats.incorrect}
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

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-900">XP Earned</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {stats.xpEarned}
                </p>
              </div>
            </div>

            {/* Performance Message */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                {stats.accuracy >= 90 
                  ? '🌟 Excellent work! You have mastered these words!'
                  : stats.accuracy >= 75
                  ? '👍 Good job! Keep practicing to improve!'
                  : stats.accuracy >= 50
                  ? '📚 Keep studying! Review these cards again.'
                  : '💪 Don\'t give up! Practice makes perfect!'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={onExit} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <Button onClick={onRestart}>
                <Play className="w-4 h-4 mr-2" />
                Study Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                Flashcard Study
              </CardTitle>
              <CardDescription>
                {gameSession.direction === 'korean-to-english' 
                  ? 'Korean → English'
                  : 'English → Korean'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                {gameSession.correctCount}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-600" />
                {gameSession.incorrectCount}
              </Badge>
              <Badge variant="default">
                {gameSession.currentCardIndex + 1} / {gameSession.cards.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="relative h-96 cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front of Card */}
              <Card 
                className="absolute inset-0 backface-hidden shadow-xl hover:shadow-2xl transition-shadow"
                style={{ backfaceVisibility: "hidden" }}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8">
                  <div className="text-center space-y-6 w-full">
                    {/* Image if available */}
                    {currentCard.imageUrl && (
                      <div className="flex justify-center mb-4">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={currentCard.imageUrl} 
                            alt={currentCard.front}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Front Text */}
                    <div>
                      <p className="text-5xl font-bold text-gray-900 mb-4">
                        {currentCard.front}
                      </p>
                      
                      {/* Pronunciation button for Korean text */}
                      {gameSession.direction === 'korean-to-english' && (
                        <div className="flex justify-center">
                          <PronunciationButton text={currentCard.front} />
                        </div>
                      )}
                    </div>

                    {/* Flip hint */}
                    <div className="mt-8">
                      <p className="text-sm text-gray-500">
                        Click card to reveal answer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Back of Card */}
              <Card 
                className="absolute inset-0 backface-hidden shadow-xl bg-blue-50"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8">
                  <div className="text-center space-y-6">
                    {/* Image if available */}
                    {currentCard.imageUrl && (
                      <div className="flex justify-center mb-4">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={currentCard.imageUrl} 
                            alt={currentCard.back}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Original text (smaller) */}
                    <p className="text-2xl text-gray-600">
                      {currentCard.front}
                    </p>

                    {/* Answer text (large) */}
                    <div>
                      <p className="text-5xl font-bold text-blue-600">
                        {currentCard.back}
                      </p>
                      
                      {/* Pronunciation button for Korean text */}
                      {gameSession.direction === 'english-to-korean' && (
                        <div className="flex justify-center mt-4">
                          <PronunciationButton text={currentCard.back} />
                        </div>
                      )}
                    </div>

                    {/* Context sentence if available */}
                    {currentCard.wordPair.contextSentence && (
                      <div className="mt-6 p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 italic">
                          {currentCard.wordPair.contextSentence}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Answer Buttons */}
          <AnimatePresence>
            {showButtons && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex gap-4 mt-6"
              >
                <Button
                  onClick={handleIncorrect}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-16 text-lg border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  <XCircle className="w-6 h-6 mr-2 text-red-600" />
                  Incorrect
                </Button>
                <Button
                  onClick={handleCorrect}
                  variant="default"
                  size="lg"
                  className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Correct
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions when not flipped */}
          {!isFlipped && (
            <div className="text-center mt-4">
              <p className="text-gray-600 text-sm">
                💭 Think of the answer, then click the card to check
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

