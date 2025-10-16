'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MatchGameSession, MatchGameCard } from '@/types';
import { MatchGameService } from '@/lib/match-game';
import { StorageService } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target, 
  Play,
  CheckCircle,
  XCircle,
  Timer,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

interface MatchPairsGameProps {
  session: MatchGameSession;
  onGameComplete: (finalSession: MatchGameSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function MatchPairsGame({ session, onGameComplete, onRestart, onExit }: MatchPairsGameProps) {
  const [gameSession, setGameSession] = useState<MatchGameSession>(session);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);

  // Timer effect
  useEffect(() => {
    if (!isGameActive || gameSession.isCompleted) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, gameSession.isCompleted]);

  // Check for game completion
  useEffect(() => {
    if (gameSession.isCompleted) {
      setIsGameActive(false);
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, onGameComplete]);

  const handleCardClick = (cardId: string) => {
    if (!isGameActive || gameSession.isCompleted) return;
    
    const updatedSession = MatchGameService.flipCard(gameSession, cardId);
    setGameSession(updatedSession);
    
    // Check if we have two flipped cards that don't match
    const flippedCards = updatedSession.cards.filter(c => c.isFlipped && !c.isMatched);
    
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      
      if (card1.wordId !== card2.wordId) {
        // No match - flip them back after a delay
        setTimeout(() => {
          const resetSession = MatchGameService.resetFlippedCards(updatedSession);
          setGameSession(resetSession);
        }, 1000);
      }
    }
  };

  const handleRestart = () => {
    const resetSession = MatchGameService.resetGame(gameSession);
    setGameSession(resetSession);
    setTimeElapsed(0);
    setIsGameActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (gameSession.matchedPairs / gameSession.totalPairs) * 100;

  if (gameSession.isCompleted) {
    const stats = MatchGameService.getGameStats(gameSession);
    
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
              Congratulations! You matched all {gameSession.totalPairs} pairs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Time</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(stats.timeSpent)}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(stats.accuracy * 100)}%
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onRestart}>
                <Play className="w-4 h-4 mr-2" />
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Game Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Match the Pairs
              </CardTitle>
              <CardDescription>
                Find matching Korean-English word pairs
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(timeElapsed)}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {gameSession.matchedPairs}/{gameSession.totalPairs}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                title="Exit game"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
          
          {/* Excluded Word Notice */}
          {gameSession.excludedWord && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">
                    Note: One word couldn't be paired
                  </p>
                  <p className="text-yellow-700 mt-1">
                    "{gameSession.excludedWord.korean}" ({gameSession.excludedWord.english}) was excluded because you have an odd number of words.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Game Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {gameSession.cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  card.isMatched
                    ? 'bg-green-100 border-green-300'
                    : card.isFlipped
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-4 h-20 flex items-center justify-center">
                  {card.isFlipped || card.isMatched ? (
                    <motion.div
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <p className={`font-medium ${
                        card.type === 'korean' ? 'text-blue-700' : 'text-green-700'
                      }`}>
                        {card.content}
                      </p>
                      {card.isMatched && (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-1" />
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto"></div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Controls */}
      <div className="mt-6 flex justify-center">
        <Button onClick={handleRestart} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Game
        </Button>
      </div>
    </div>
  );
}
