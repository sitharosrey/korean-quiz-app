'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MemoryChainSession, MemoryChainService } from '@/lib/memory-chain';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, RotateCcw, Play, CheckCircle, XCircle, Brain, Eye, EyeOff } from 'lucide-react';

interface MemoryChainGameProps {
  session: MemoryChainSession;
  onGameComplete: (finalSession: MemoryChainSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function MemoryChainGame({ session, onGameComplete, onRestart, onExit }: MemoryChainGameProps) {
  const [gameSession, setGameSession] = useState<MemoryChainSession>(session);
  const [phase, setPhase] = useState<'memorize' | 'input' | 'result'>('memorize');
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentRound = gameSession.rounds[gameSession.currentRoundIndex];

  useEffect(() => {
    if (gameSession.id !== session.id) {
      setGameSession(session);
      setPhase('memorize');
      setUserInputs([]);
      setShowResult(false);
      setTimeLeft(5);
    }
  }, [session.id, gameSession.id]);

  useEffect(() => {
    if (gameSession.isCompleted) {
      onGameComplete(gameSession);
    }
  }, [gameSession.isCompleted, onGameComplete, gameSession]);

  useEffect(() => {
    if (phase === 'memorize' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'memorize' && timeLeft === 0) {
      setPhase('input');
      setUserInputs(new Array(currentRound.sequence.length).fill(''));
    }
  }, [phase, timeLeft, currentRound.sequence.length]);

  useEffect(() => {
    if (phase === 'input' && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [phase]);

  const handleSubmit = () => {
    const { isCorrect, updatedSession } = MemoryChainService.submitAnswer(gameSession, userInputs);
    setIsCorrect(isCorrect);
    setShowResult(true);
    setPhase('result');
    setGameSession(updatedSession);

    setTimeout(() => {
      setShowResult(false);
      setPhase('memorize');
      setUserInputs([]);
      setTimeLeft(5);
    }, 3000);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);

    if (value && index < userInputs.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const progress = ((gameSession.currentRoundIndex + 1) / gameSession.rounds.length) * 100;

  if (gameSession.isCompleted) {
    const stats = MemoryChainService.getStats(gameSession);

    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Memory Chain Complete!</CardTitle>
            <CardDescription>You completed {stats.correctRounds} out of {stats.total} rounds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.correctRounds}</p>
                <p className="text-xs text-green-900">Correct</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{Math.round(stats.accuracy)}%</p>
                <p className="text-xs text-blue-900">Accuracy</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{stats.maxSequenceLength}</p>
                <p className="text-xs text-purple-900">Max Length</p>
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

  if (!currentRound) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />Memory Chain</CardTitle>
              <CardDescription>Remember the sequence of words</CardDescription>
            </div>
            <Badge variant="outline">Round {gameSession.currentRoundIndex + 1} / {gameSession.rounds.length}</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={`${currentRound.id}-${phase}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              {phase === 'memorize' && (
                <>
                  <div className="text-center">
                    <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-gray-900 mb-2">Memorize these words!</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                      <span className="text-3xl font-bold text-blue-600">{timeLeft}</span>
                      <span className="text-sm text-blue-600">seconds</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 p-8 bg-blue-50 rounded-lg">
                    {currentRound.sequence.map((word, index) => (
                      <motion.div key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.2 }} className="px-6 py-3 bg-white rounded-lg shadow-md border-2 border-blue-300">
                        <span className="text-2xl font-bold text-gray-900">{word}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {phase === 'input' && (
                <>
                  <div className="text-center">
                    <EyeOff className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <p className="text-2xl font-bold text-gray-900">Type the words in order!</p>
                    <p className="text-sm text-gray-500 mt-2">{currentRound.sequence.length} words</p>
                  </div>

                  <div className="space-y-3">
                    {userInputs.map((input, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">{index + 1}</Badge>
                        <Input ref={el => { inputRefs.current[index] = el; }} value={input} onChange={(e) => handleInputChange(index, e.target.value)} placeholder={`Word ${index + 1}`} className="text-xl py-6" onKeyPress={(e) => {if (e.key === 'Enter' && index === userInputs.length - 1) handleSubmit();}} />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSubmit} className="w-full" size="lg" disabled={userInputs.some(input => !input.trim())}>
                    Submit Sequence
                  </Button>
                </>
              )}

              {phase === 'result' && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`p-8 rounded-lg text-center ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-green-800">Perfect!</p>
                      <p className="text-green-600 mt-2">You remembered all {currentRound.sequence.length} words correctly!</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-red-800">Not quite!</p>
                      <div className="mt-4 p-4 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Correct sequence:</p>
                        <p className="text-lg font-semibold text-gray-900">{currentRound.sequence.join(' → ')}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

