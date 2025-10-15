'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizQuestion } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, timeSpent: number) => void;
  onNext: () => void;
}

export function QuizCard({ question, questionNumber, totalQuestions, onAnswer, onNext }: QuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const progress = (questionNumber / totalQuestions) * 100;

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setStartTime(Date.now());
  }, [question.id]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple selections

    const timeSpent = Date.now() - startTime;
    const correct = answer === question.correctAnswer;
    
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
    
    onAnswer(answer, timeSpent);

    // Auto-advance after showing result
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  const getButtonVariant = (option: string) => {
    if (!showResult) return 'outline';
    if (option === question.correctAnswer) return 'default';
    if (option === selectedAnswer && !isCorrect) return 'destructive';
    return 'outline';
  };

  const getButtonClassName = (option: string) => {
    if (!showResult) return '';
    if (option === question.correctAnswer) return 'bg-green-500 hover:bg-green-600 text-white';
    if (option === selectedAnswer && !isCorrect) return 'bg-red-500 hover:bg-red-600 text-white';
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {Math.round((Date.now() - startTime) / 1000)}s
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardDescription className="text-lg">
            What is the Korean word for:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {question.english}
            </h2>
            <p className="text-gray-600">Choose the correct Korean translation</p>
          </div>

          {/* Answer Options */}
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <motion.div
                key={`${question.id}-option-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={getButtonVariant(option)}
                  className={`w-full h-16 text-lg font-medium transition-all duration-200 ${getButtonClassName(option)}`}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option}</span>
                    {showResult && option === question.correctAnswer && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {showResult && option === selectedAnswer && !isCorrect && (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Result Feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-center p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Incorrect</span>
                    </>
                  )}
                </div>
                {!isCorrect && (
                  <p className="mt-2">
                    The correct answer is: <strong>{question.correctAnswer}</strong>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
