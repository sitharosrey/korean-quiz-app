'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lightbulb,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import { QuizQuestion, TypingQuestion, DictationQuestion, MultipleChoiceQuestion } from '@/types';
import { audioService } from '@/lib/audio';
import { FuzzyMatchService } from '@/lib/fuzzy-match';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedQuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, timeSpent: number) => void;
  onNext: () => void;
  isLastQuestion?: boolean;
  lastResult?: {
    isCorrect: boolean;
    confidence: number;
  };
  onExit?: () => void;
}

export function EnhancedQuizCard({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer, 
  onNext, 
  isLastQuestion = false,
  lastResult,
  onExit
}: EnhancedQuizCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showHints, setShowHints] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTriedAgain, setHasTriedAgain] = useState(false);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [localCorrect, setLocalCorrect] = useState(false);
  const [localConfidence, setLocalConfidence] = useState(1.0);
  const [storedAnswer, setStoredAnswer] = useState('');
  const [storedTimeSpent, setStoredTimeSpent] = useState(0);
  
  // Use local evaluation for immediate feedback, fallback to lastResult
  const isCorrect = isAnswered ? localCorrect : (lastResult?.isCorrect ?? false);
  const confidence = isAnswered ? localConfidence : (lastResult?.confidence ?? 1.0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const isSubmittingRef = useRef(false);

  // Timer effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime]);

  // Reset state and focus input when question changes
  useEffect(() => {
    setUserAnswer('');
    setIsAnswered(false);
    setShowFeedback(false);
    setShowHints(false);
    setTimeSpent(0);
    setStartTime(Date.now());
    setHasTriedAgain(false);
    setHasSubmittedAnswer(false);
    setLocalCorrect(false);
    setLocalConfidence(1.0);
    setStoredAnswer('');
    setStoredTimeSpent(0);
    isSubmittingRef.current = false; // Reset the ref
    
    if ((question.type === 'typing' || question.type === 'dictation') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id, question.type]);

  // Reset showFeedback when question changes (additional safety)
  useEffect(() => {
    setShowFeedback(false);
  }, [question.id]);

  const handleSubmit = () => {
    if (!userAnswer.trim() || isAnswered || hasSubmittedAnswer) return;

    const finalTimeSpent = Date.now() - startTime;
    
    // Do local evaluation for immediate feedback
    let localCorrect = false;
    let localConfidence = 1.0;

    switch (question.type) {
      case 'typing':
      case 'dictation':
        // Use appropriate matching method based on answer type
        const answer = question.answer || '';
        const isKoreanAnswer = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(answer);
        const matchResult = isKoreanAnswer 
          ? FuzzyMatchService.matchKorean(userAnswer, answer)
          : FuzzyMatchService.matchEnglish(userAnswer, answer);
        localCorrect = matchResult.isMatch;
        localConfidence = matchResult.confidence;
        break;
      case 'multiple-choice':
        localCorrect = userAnswer === question.correctAnswer;
        break;
    }

    console.log('=== DEBUG ===');
    console.log('User Answer:', userAnswer);
    console.log('Question Answer:', question.answer);
    console.log('Question Correct Answer:', question.correctAnswer);
    console.log('Local Correct:', localCorrect);
    console.log('Question Type:', question.type);
    console.log('==============');

    // Set local state for UI feedback
    setIsAnswered(true);
    setLocalCorrect(localCorrect);
    setLocalConfidence(localConfidence);
    setHasSubmittedAnswer(true);
    
    // Show feedback immediately for incorrect answers
    if (!localCorrect) {
      setShowFeedback(true);
    }
    
    // Store the answer and time spent for when user clicks Next
    setStoredAnswer(userAnswer);
    setStoredTimeSpent(finalTimeSpent);
    
    // Clear timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMultipleChoiceSubmit = (selectedOption: string) => {
    // Use ref to prevent double submissions immediately
    if (isSubmittingRef.current || isAnswered || hasSubmittedAnswer) {
      console.log('Preventing double submission');
      return;
    }
    
    isSubmittingRef.current = true;
    const finalTimeSpent = Date.now() - startTime;
    
    // Evaluate the answer directly
    const localCorrect = selectedOption === question.correctAnswer;
    const localConfidence = 1.0;

    console.log('=== MULTIPLE CHOICE DEBUG ===');
    console.log('Selected Option:', selectedOption);
    console.log('Correct Answer:', question.correctAnswer);
    console.log('Local Correct:', localCorrect);
    console.log('==============================');

    // Set all states at once
    setUserAnswer(selectedOption);
    setIsAnswered(true);
    setLocalCorrect(localCorrect);
    setLocalConfidence(localConfidence);
    setHasSubmittedAnswer(true);
    
    // Show feedback immediately for incorrect answers
    if (!localCorrect) {
      setShowFeedback(true);
    }
    
    // Store the answer and time spent for when user clicks Next
    setStoredAnswer(selectedOption);
    setStoredTimeSpent(finalTimeSpent);
    
    // Clear timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswered) {
      handleSubmit();
    }
  };

  const handlePlayAudio = async () => {
    if (question.type === 'dictation' && audioService) {
      setIsPlaying(true);
      try {
        await audioService.speakKorean(question.audioText);
      } catch (error) {
        console.error('Audio playback error:', error);
      } finally {
        setIsPlaying(false);
      }
    }
  };

  const handleTryAgain = () => {
    setUserAnswer('');
    setIsAnswered(false);
    setShowFeedback(false);
    setHasTriedAgain(true);
    setHasSubmittedAnswer(false);
    setLocalCorrect(false);
    setLocalConfidence(1.0);
    setStoredAnswer('');
    setStoredTimeSpent(0);
    setStartTime(Date.now());
    setTimeSpent(0);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleNext = () => {
    // If incorrect and hasn't tried again, don't allow next
    if (!localCorrect && !hasTriedAgain && (question.type === 'typing' || question.type === 'dictation')) {
      return;
    }
    
    // Submit the stored answer when user clicks Next
    if (storedAnswer && storedTimeSpent > 0) {
      onAnswer(storedAnswer, storedTimeSpent);
      setHasSubmittedAnswer(true);
    }
    
    onNext();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const getQuestionTitle = () => {
    switch (question.type) {
      case 'typing':
        return 'Type the Korean word';
      case 'dictation':
        return 'Listen and type';
      case 'multiple-choice':
        return 'Choose the correct answer';
      default:
        return 'Answer the question';
    }
  };

  const getFeedbackMessage = () => {
    if (!showFeedback) return '';
    
    if (isCorrect) {
      if (confidence < 1.0) {
        return `✅ Almost perfect! (${Math.round(confidence * 100)}% match)`;
      }
      return '✅ Correct! Well done!';
    } else {
      // Show partial hint with first few characters
      const answer = question.answer || question.correctAnswer || '';
      if (!answer) {
        return '❌ Incorrect. Try again!';
      }
      const hintLength = Math.min(2, Math.floor(answer.length / 2));
      const hint = answer.substring(0, hintLength) + '...';
      return `❌ Incorrect. Hint: ${hint}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <Progress 
            value={(questionNumber / totalQuestions) * 100} 
            className="h-full"
          />
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {getQuestionTitle()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {questionNumber} / {totalQuestions}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {formatTime(timeSpent)}
              </div>
              {onExit && (
                <Button
                  onClick={onExit}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question content */}
          <div className="text-center space-y-4">
            {question.type === 'dictation' && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                >
                  {isPlaying ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <span className="text-sm text-gray-500">
                  {isPlaying ? 'Playing...' : 'Click to hear the word'}
                </span>
              </div>
            )}

            <div className="text-2xl font-semibold text-gray-900">
              {question.type === 'dictation' ? '🎧' : question.question}
            </div>

            {question.type === 'typing' && (
              <div className="text-sm text-gray-600">
                Type the Korean word for "{question.question}"
              </div>
            )}
          </div>

          {/* Answer input */}
          <div className="space-y-4">
            {question.type === 'multiple-choice' ? (
              <div className="grid gap-2">
                {question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={isAnswered && option === question.correctAnswer ? "default" : "outline"}
                    className={cn(
                      "justify-start h-auto p-4 text-left",
                      isAnswered && option === userAnswer && !isCorrect && "border-red-500 text-red-700",
                      isAnswered && option === question.correctAnswer && "border-green-500 bg-green-50 text-green-700"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isAnswered && !hasSubmittedAnswer && !isSubmittingRef.current) {
                        // Directly handle the submission without relying on state updates
                        handleMultipleChoiceSubmit(option);
                      }
                    }}
                    disabled={isAnswered || hasSubmittedAnswer || isSubmittingRef.current}
                  >
                    <span className="font-medium">{option}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={question.type === 'typing' ? 'Type Korean word...' : 'Type what you heard...'}
                  disabled={isAnswered}
                  className={cn(
                    "text-center text-lg py-3",
                    isAnswered && isCorrect && "border-green-500 bg-green-50 text-green-700",
                    isAnswered && !isCorrect && "border-red-500 bg-red-50 text-red-700"
                  )}
                />
                
                {!isAnswered && (
                  <Button
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHints(!showHints)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {showHints ? 'Hide' : 'Show'} Hints
              </Button>
              
              <AnimatePresence>
                {showHints && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    {question.hints.map((hint, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        💡 {hint}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Feedback - Only show for incorrect answers */}
          <AnimatePresence>
            {showFeedback && isAnswered && !localCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-lg text-center font-medium border-2 bg-red-50 text-red-700 border-red-300"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-lg font-bold">Incorrect</span>
                </div>
                <div className="text-sm">
                  {getFeedbackMessage()}
                </div>
                <div className="mt-3 p-3 bg-white rounded border border-red-200">
                  <span className="text-red-800 font-semibold">Use the hint above to help you remember!</span>
                </div>
                
                {/* Try Again button for incorrect answers */}
                {(question.type === 'typing' || question.type === 'dictation') && !hasTriedAgain && (
                  <div className="mt-4">
                    <Button
                      onClick={handleTryAgain}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next button */}
          {isAnswered && (
            // Show Next button only if:
            // 1. Answer is correct, OR
            // 2. It's multiple choice (no retry allowed), OR  
            // 3. Answer is incorrect but user has tried again
            (localCorrect || question.type === 'multiple-choice' || (!localCorrect && hasTriedAgain)) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4"
              >
                <Button
                  onClick={handleNext}
                  className={cn(
                    "w-full text-lg py-4 font-semibold",
                    localCorrect ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                  )}
                  size="lg"
                >
                  {localCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {isLastQuestion ? 'Finish Quiz' : 'Continue'}
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </>
                  )}
                </Button>
              </motion.div>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
