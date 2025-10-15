'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lesson, QuizSession } from '@/types';
import { StorageService } from '@/lib/storage';
import { QuizService } from '@/lib/quiz';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import { toast } from 'sonner';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    questionsPerQuiz: 10,
    reverseMode: false,
  });

  useEffect(() => {
    loadLessons();
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
    }
  }, [searchParams]);

  // Auto-adjust quiz questions when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      if (lesson && lesson.words.length > 0) {
        // If current setting is higher than available words, adjust it
        if (settings.questionsPerQuiz > lesson.words.length) {
          setSettings(prev => ({ ...prev, questionsPerQuiz: lesson.words.length }));
        }
      }
    }
  }, [selectedLessonId, lessons, settings.questionsPerQuiz]);

  const loadLessons = () => {
    const storedLessons = StorageService.getLessons();
    setLessons(storedLessons);
    setIsLoading(false);
  };

  const startQuiz = () => {
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

    const session = QuizService.createQuizSession(
      lesson,
      Math.min(settings.questionsPerQuiz, lesson.words.length),
      settings.reverseMode
    );

    setQuizSession(session);
    toast.success(`Started quiz with ${session.questions.length} questions`);
  };

  const handleAnswer = (answer: string, timeSpent: number) => {
    if (!quizSession) return;

    const updatedSession = QuizService.submitAnswer(quizSession, answer, timeSpent);
    setQuizSession(updatedSession);
  };

  const handleNext = () => {
    if (!quizSession) return;

    if (quizSession.isCompleted) {
      // Quiz is complete, results will be shown
      return;
    }

    // Move to next question (this is handled by the QuizCard component)
  };

  const restartQuiz = () => {
    setQuizSession(null);
    startQuiz();
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
        <QuizResults session={quizSession} onRestart={restartQuiz} />
      </div>
    );
  }

  // Show active quiz
  if (quizSession && !quizSession.isCompleted) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizCard
          key={currentQuestion.id} // Force re-render for each new question
          question={currentQuestion}
          questionNumber={quizSession.currentQuestionIndex + 1}
          totalQuestions={quizSession.questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </div>
    );
  }

  // Show quiz setup
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Start Quiz</h1>
            <p className="text-gray-600 mt-1">
              Test your Korean vocabulary knowledge
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quiz Settings
            </CardTitle>
            <CardDescription>
              Choose a lesson and configure your quiz preferences
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
              <Select 
                value={settings.reverseMode ? 'reverse' : 'normal'} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, reverseMode: value === 'reverse' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">English → Korean</SelectItem>
                  <SelectItem value="reverse">Korean → English</SelectItem>
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
                    onClick={() => setSettings(prev => ({ ...prev, questionsPerQuiz: selectedLesson.words.length }))}
                    className="text-xs"
                  >
                    Use All {selectedLesson.words.length} Words
                  </Button>
                )}
              </div>
              <Select 
                value={settings.questionsPerQuiz.toString()} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, questionsPerQuiz: parseInt(value) }))}
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
                Start Quiz
              </Button>
            </div>

            {/* Lesson Info */}
            {selectedLesson && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedLesson.name}</h3>
                <p className="text-blue-700 text-sm">
                  {selectedLesson.words.length} words available • 
                  Quiz will use {Math.min(settings.questionsPerQuiz, selectedLesson.words.length)} questions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
