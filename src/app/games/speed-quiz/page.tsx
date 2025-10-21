'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { SpeedQuizSession, SpeedQuizService } from '@/lib/speed-quiz';
import { SpeedQuizGame } from '@/components/games/SpeedQuizGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Zap } from 'lucide-react';
import { toast } from 'sonner';

function SpeedQuizPageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<SpeedQuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(15);
  const [timeLimit, setTimeLimit] = useState(10);

  useEffect(() => {
    loadLessons();
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
    }
  }, [searchParams]);

  const loadLessons = () => {
    const storedLessons = StorageService.getLessons();
    setLessons(storedLessons);
    setIsLoading(false);
  };

  const startGame = () => {
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

    const session = SpeedQuizService.createSession(lesson, Math.min(questionCount, lesson.words.length), timeLimit);
    setGameSession(session);
    toast.success(`Started speed quiz with ${session.questions.length} questions`);
  };

  const handleGameComplete = (finalSession: SpeedQuizSession) => {
    const stats = SpeedQuizService.getStats(finalSession);
    
    const progress = StorageService.getProgress();
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + stats.xpEarned,
      totalQuizzesCompleted: progress.totalQuizzesCompleted + 1,
    };
    StorageService.saveProgress(newProgress);
    
    toast.success(`Speed Quiz completed! 🎉 You got ${stats.correctAnswers}/${stats.total} correct with max streak ${stats.maxStreak} and earned ${stats.xpEarned} XP!`, {
      duration: 5000,
    });
  };

  const restartGame = () => {
    if (!selectedLessonId) {
      toast.error('Please select a lesson');
      return;
    }

    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (!lesson) {
      toast.error('Lesson not found');
      return;
    }

    const session = SpeedQuizService.createSession(lesson, Math.min(questionCount, lesson.words.length), timeLimit);
    setGameSession(session);
  };

  const exitGame = () => {
    setGameSession(null);
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

  if (gameSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SpeedQuizGame
          session={gameSession}
          onGameComplete={handleGameComplete}
          onRestart={restartGame}
          onExit={exitGame}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500" />
            Speed Quiz
          </h1>
          <p className="text-gray-600 mt-1">
            Race against the clock in this rapid-fire Korean vocabulary challenge
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Game Settings
            </CardTitle>
            <CardDescription>
              Choose your lesson and difficulty
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Lesson</label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lesson" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Questions</label>
              <Select 
                value={questionCount === 999 ? "all" : questionCount.toString()} 
                onValueChange={(value) => setQuestionCount(value === "all" ? 999 : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                  <SelectItem value="25">25 questions</SelectItem>
                  <SelectItem value="all">All words</SelectItem>
                </SelectContent>
              </Select>
              {lessons.find(l => l.id === selectedLessonId) && questionCount === 999 && (
                <p className="text-sm text-green-600">Will use all {lessons.find(l => l.id === selectedLessonId)!.words.length} words</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Per Question</label>
              <Select 
                value={timeLimit.toString()} 
                onValueChange={(value) => setTimeLimit(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds (Hard)</SelectItem>
                  <SelectItem value="10">10 seconds (Normal)</SelectItem>
                  <SelectItem value="15">15 seconds (Easy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={startGame} 
                size="lg" 
                className="w-full"
                disabled={!selectedLessonId || !selectedLesson || selectedLesson.words.length === 0}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Speed Quiz
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Answer each question before time runs out</li>
                <li>• Build streaks for bonus points</li>
                <li>• Answer quickly for speed bonuses</li>
                <li>• Earn up to 15 XP per question!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SpeedQuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpeedQuizPageContent />
    </Suspense>
  );
}

