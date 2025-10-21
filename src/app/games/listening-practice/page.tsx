'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { ListeningPracticeSession, ListeningPracticeService } from '@/lib/listening-practice';
import { ListeningPracticeGame } from '@/components/games/ListeningPracticeGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Headphones } from 'lucide-react';
import { toast } from 'sonner';

function ListeningPracticePageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<ListeningPracticeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(15);

  useEffect(() => {
    loadLessons();
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) setSelectedLessonId(lessonParam);
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
    if (!lesson || lesson.words.length === 0) {
      toast.error('This lesson has no words. Please add some words first.');
      return;
    }

    const session = ListeningPracticeService.createSession(lesson, Math.min(questionCount, lesson.words.length));
    setGameSession(session);
    toast.success(`Started listening practice with ${session.questions.length} questions`);
  };

  const handleGameComplete = (finalSession: ListeningPracticeSession) => {
    const stats = ListeningPracticeService.getStats(finalSession);
    const progress = StorageService.getProgress();
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + stats.xpEarned,
      totalQuizzesCompleted: progress.totalQuizzesCompleted + 1,
    };
    StorageService.saveProgress(newProgress);
    toast.success(`Listening Practice completed! 🎉 You got ${stats.correctAnswers}/${stats.total} correct and earned ${stats.xpEarned} XP!`, { duration: 5000 });
  };

  const restartGame = () => {
    if (!selectedLessonId) return;
    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (!lesson) return;
    const session = ListeningPracticeService.createSession(lesson, Math.min(questionCount, lesson.words.length));
    setGameSession(session);
  };

  const exitGame = () => setGameSession(null);
  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (gameSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ListeningPracticeGame session={gameSession} onGameComplete={handleGameComplete} onRestart={restartGame} onExit={exitGame} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Headphones className="w-8 h-8" />Listening Practice</h1>
          <p className="text-gray-600 mt-1">Listen to Korean pronunciation and choose the correct word</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Game Settings</CardTitle>
            <CardDescription>Choose a lesson and configure your game</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Lesson</label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                <SelectTrigger><SelectValue placeholder="Choose a lesson" /></SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id} disabled={lesson.words.length === 0}>{lesson.name} ({lesson.words.length} words)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Questions</label>
              <Select value={questionCount === 999 ? "all" : questionCount.toString()} onValueChange={(value) => setQuestionCount(value === "all" ? 999 : parseInt(value))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                  <SelectItem value="25">25 questions</SelectItem>
                  <SelectItem value="all">All words</SelectItem>
                </SelectContent>
              </Select>
              {selectedLesson && questionCount === 999 && (
                <p className="text-sm text-green-600">Will use all {selectedLesson.words.length} words</p>
              )}
            </div>

            <Button onClick={startGame} size="lg" className="w-full" disabled={!selectedLessonId}><Play className="w-5 h-5 mr-2" />Start Game</Button>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Listen to the Korean word pronunciation</li>
                <li>• Choose the correct written word from 4 options</li>
                <li>• Perfect for improving listening comprehension</li>
                <li>• Earn 15 XP for each correct answer!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ListeningPracticePage() {
  return <Suspense fallback={<div>Loading...</div>}><ListeningPracticePageContent /></Suspense>;
}

