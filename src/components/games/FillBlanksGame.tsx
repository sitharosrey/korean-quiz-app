'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FillBlanksSession, FillBlanksService } from '@/lib/fill-blanks';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  RotateCcw, 
  Play,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

interface FillBlanksGameProps {
  session: FillBlanksSession;
  onGameComplete: (finalSession: FillBlanksSession) => void;
  onRestart: () => void;
  onExit: () => void;
}

export function FillBlanksGame({ session, onGameComplete, onRestart, onExit }: FillBlanksGameProps) {
  const [gameSession, setGameSession] = useState<FillBlanksSession>(session);
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

  const handleAnswer = (answer: string) => {
    if (showResult) return;

    const { isCorrect, updatedSession } = FillBlanksService.submitAnswer(gameSession, answer);
    setIsCorrect(isCorrect);
    setShowResult(true);
    setGameSession(updatedSession);

    setTimeout(() => {
      setShowResult(false);
    }, 1500);
  };

  const progress = ((gameSession.currentQuestionIndex + 1) / gameSession.questions.length) * 100;
  const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];

  if (gameSession.isCompleted) {
    const stats = FillBlanksService.getStats(gameSession);

    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Fill in the Blanks Complete!</CardTitle>
            <CardDescription>You got {stats.correctAnswers} out of {stats.total} correct</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{stats.correctAnswers}</p>
                <p className="text-sm text-green-900">Correct</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{Math.round(stats.accuracy)}%</p>
                <p className="text-sm text-blue-900">Accuracy</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{stats.xpEarned}</p>
                <p className="text-sm text-yellow-900">XP</p>
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
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Fill in the Blanks</CardTitle>
              <CardDescription>Choose the correct word to complete the sentence</CardDescription>
            </div>
            <Badge variant="outline">{gameSession.currentQuestionIndex + 1} / {gameSession.questions.length}</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">English Meaning</p>
                <p className="text-xl font-semibold text-gray-900">{currentQuestion.word.english}</p>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-2">Complete the sentence:</p>
                <p className="text-2xl font-bold text-center text-gray-900 leading-relaxed">
                  {currentQuestion.sentence}
                </p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <Button key={index} onClick={() => handleAnswer(option)} className="w-full h-14 text-lg" variant="outline" disabled={showResult}>
                    {option}
                  </Button>
                ))}
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-lg text-center ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {isCorrect ? <><CheckCircle className="w-5 h-5 inline mr-2" />Correct!</> : <><XCircle className="w-5 h-5 inline mr-2" />Incorrect</>}
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

