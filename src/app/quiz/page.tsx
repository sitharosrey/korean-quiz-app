'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lesson, QuizMode, QuizDirection } from '@/types';
import { QuizSession } from '@/lib/quiz-enhanced';
import { StorageService } from '@/lib/storage';
import { EnhancedQuizService } from '@/lib/quiz-enhanced';
import { EnhancedQuizCard } from '@/components/quiz/EnhancedQuizCard';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Play, 
  Settings, 
  Brain, 
  Keyboard, 
  Volume2, 
  Target, 
  Trophy, 
  Clock, 
  Zap,
  ArrowLeft,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [quizMode, setQuizMode] = useState<QuizMode>('multiple-choice');
  const [quizDirection, setQuizDirection] = useState<QuizDirection>('korean-to-english');
  const [questionCount, setQuestionCount] = useState(10);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    loadLessons();
    const lessonParam = searchParams.get('lesson');
    const modeParam = searchParams.get('mode') as QuizMode;
    const directionParam = searchParams.get('direction') as QuizDirection;
    
    if (lessonParam) setSelectedLessonId(lessonParam);
    if (modeParam) setQuizMode(modeParam);
    if (directionParam) setQuizDirection(directionParam);
  }, [searchParams]);

  // Auto-adjust quiz questions when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      if (lesson && lesson.words.length > 0) {
        // If current setting is higher than available words, adjust it
        if (questionCount > lesson.words.length) {
          setQuestionCount(lesson.words.length);
        }
      }
    }
  }, [selectedLessonId, lessons, questionCount]);

  const loadLessons = () => {
    const storedLessons = StorageService.getLessons();
    setLessons(storedLessons);
    setIsLoading(false);
  };

  const startQuiz = async () => {
    if (!selectedLessonId) {
      toast.error('Please select a lesson');
      return;
    }

    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (!lesson) {
      toast.error('Lesson not found');
      return;
    }

    if (lesson.words.length === 0) {
      toast.error('This lesson has no words. Please add some words first.');
      return;
    }

    try {
      const session = EnhancedQuizService.createQuizSession(
        lesson,
        Math.min(questionCount, lesson.words.length),
        quizMode,
        quizDirection
      );

      if (!session.questions || session.questions.length === 0) {
        toast.error('Failed to generate questions. Please check your lesson has words.');
        return;
      }

      setQuizSession(session);
      toast.success(`Started ${quizMode} quiz with ${session.questions.length} questions`);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      toast.error('Failed to start quiz');
    }
  };

  const handleAnswer = (answer: string, timeSpent: number) => {
    if (!quizSession) return;

    // Immediately evaluate and submit the answer
    const isLastQuestion = quizSession.currentQuestionIndex === quizSession.questions.length - 1;
    
    const { session: updatedSession } = EnhancedQuizService.submitAnswer(
      quizSession, 
      answer, 
      timeSpent
    );
    
    // If this was the last question, mark as completed
    if (isLastQuestion) {
      setQuizSession({
        ...updatedSession,
        isCompleted: true,
        endTime: new Date()
      });
    } else {
      setQuizSession(updatedSession);
    }
  };

  const handleNext = () => {
    // This is now just for navigation, actual submission happens in handleAnswer
    // This function is kept for compatibility but doesn't need to do anything
    // The answer has already been processed
  };

  const restartQuiz = () => {
    setQuizSession(null);
    startQuiz();
  };

  const handleExitQuiz = () => {
    if (!quizSession) return;
    setShowExitDialog(true);
  };

  const confirmExitQuiz = () => {
    setQuizSession(null);
    setShowExitDialog(false);
    toast.info('Quiz exited. Your progress has been lost.');
  };

  const cancelExitQuiz = () => {
    setShowExitDialog(false);
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz results
  if (quizSession?.isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizResults 
          results={quizSession.results}
          totalQuestions={quizSession.questions.length}
          totalXP={quizSession.totalXP}
          averageTime={quizSession.results.reduce((sum, r) => sum + r.timeSpent, 0) / quizSession.results.length}
          onRestart={restartQuiz}
          onBack={() => setQuizSession(null)}
        />
      </div>
    );
  }

  // Show active quiz
  if (quizSession && !quizSession.isCompleted) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
    
    // Check if current question exists
    if (!currentQuestion) {
      console.error('Current question is undefined:', {
        currentQuestionIndex: quizSession.currentQuestionIndex,
        totalQuestions: quizSession.questions.length,
        questions: quizSession.questions
      });
      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Quiz Error</CardTitle>
              <CardDescription>
                There was an error loading the current question.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setQuizSession(null)} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quiz Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <PageContainer>
        <EnhancedQuizCard
          key={currentQuestion.id} // Force re-render for each new question
          question={currentQuestion}
          questionNumber={quizSession.currentQuestionIndex + 1}
          totalQuestions={quizSession.questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          lastResult={quizSession.results.find(r => r.questionId === currentQuestion.id) ? {
            isCorrect: quizSession.results.find(r => r.questionId === currentQuestion.id)!.isCorrect,
            confidence: quizSession.results.find(r => r.questionId === currentQuestion.id)!.confidence || 1.0
          } : undefined}
          onExit={handleExitQuiz}
        />

        {/* Exit Quiz Confirmation Dialog */}
        <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                Exit Quiz
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to exit the quiz? Your progress will be lost and you'll need to start over.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={cancelExitQuiz}
                className="flex-1"
              >
                Continue Quiz
              </Button>
              <Button
                variant="destructive"
                onClick={confirmExitQuiz}
                className="flex-1"
              >
                Exit Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    );
  }

  // Show quiz setup
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="w-10 h-10 text-indigo-600" />
              Enhanced Quiz
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Advanced Korean vocabulary training with multiple modes and spaced repetition
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz Settings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quiz Configuration
                </CardTitle>
                <CardDescription>
                  Choose your lesson and customize the quiz experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lesson Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Lesson</label>
                  <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lesson to quiz on" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((lesson) => (
                        <SelectItem 
                          key={lesson.id} 
                          value={lesson.id}
                          disabled={lesson.words.length === 0}
                        >
                          {lesson.name} ({lesson.words.length} words)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {lessons.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No lessons available. <Link href="/lessons" className="text-blue-500 hover:underline">Create a lesson first</Link>.
                    </p>
                  )}
                </div>

                {/* Quiz Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quiz Mode</label>
                  <Select value={quizMode} onValueChange={(value: QuizMode) => setQuizMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Multiple Choice
                        </div>
                      </SelectItem>
                      <SelectItem value="typing">
                        <div className="flex items-center gap-2">
                          <Keyboard className="w-4 h-4" />
                          Typing Practice
                        </div>
                      </SelectItem>
                      <SelectItem value="dictation">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Listen & Write
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quiz Direction */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Direction</label>
                  <Select value={quizDirection} onValueChange={(value: QuizDirection) => setQuizDirection(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="korean-to-english">Korean → English</SelectItem>
                      <SelectItem value="english-to-korean">English → Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Number of Questions</label>
                    {selectedLesson && selectedLesson.words.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuestionCount(selectedLesson.words.length)}
                        className="text-xs"
                      >
                        Use All {selectedLesson.words.length} Words
                      </Button>
                    )}
                  </div>
                  <Select 
                    value={questionCount.toString()} 
                    onValueChange={(value) => setQuestionCount(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                      <SelectItem value="25">25 questions</SelectItem>
                      <SelectItem value="30">30 questions</SelectItem>
                      {selectedLesson && selectedLesson.words.length > 30 && (
                        <SelectItem value={selectedLesson.words.length.toString()}>
                          All {selectedLesson.words.length} questions
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {selectedLesson && (
                    <p className="text-sm text-gray-500">
                      Maximum: {selectedLesson.words.length} questions (based on lesson size)
                    </p>
                  )}
                </div>

                {/* Start Button */}
                <div className="pt-4">
                  <Button 
                    onClick={startQuiz} 
                    size="lg" 
                    className="w-full"
                    disabled={!selectedLessonId || !selectedLesson || selectedLesson.words.length === 0}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Enhanced Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quiz Info Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Mode Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quiz Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quizMode === 'multiple-choice' && (
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Multiple Choice</p>
                        <p className="text-sm text-gray-600">Choose the correct answer from options</p>
                      </div>
                    </div>
                  )}
                  {quizMode === 'typing' && (
                    <div className="flex items-start gap-3">
                      <Keyboard className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Typing Practice</p>
                        <p className="text-sm text-gray-600">Type the correct answer with fuzzy matching</p>
                      </div>
                    </div>
                  )}
                  {quizMode === 'dictation' && (
                    <div className="flex items-start gap-3">
                      <Volume2 className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Listen & Write</p>
                        <p className="text-sm text-gray-600">Listen to pronunciation and type the answer</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lesson Info */}
            {selectedLesson && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Lesson Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedLesson.name}</h3>
                      <p className="text-sm text-gray-600">{selectedLesson.words.length} words</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{selectedLesson.words.length} words available</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>Quiz will use {Math.min(questionCount, selectedLesson.words.length)} questions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Spaced Repetition System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>XP & Level Progression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Audio Pronunciation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Smart Hints & Feedback</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
