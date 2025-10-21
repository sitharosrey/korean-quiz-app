'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { TrueFalseSession, TrueFalseService } from '@/lib/true-false';
import { TrueFalseGame } from '@/components/games/TrueFalseGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

function TrueFalsePageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<TrueFalseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);

  useEffect(() => {
    const storedLessons = StorageService.getLessons();
    setLessons(storedLessons);
    setIsLoading(false);
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) setSelectedLessonId(lessonParam);
  }, [searchParams]);

  const startGame = () => {
    if (!selectedLessonId) {
      toast.error('Please select a lesson');
      return;
    }
    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (!lesson || lesson.words.length === 0) {
      toast.error('This lesson has no words.');
      return;
    }
    const session = TrueFalseService.createSession(lesson, Math.min(questionCount, lesson.words.length));
    setGameSession(session);
    toast.success(`Started true or false with ${session.questions.length} questions`);
  };

  const handleGameComplete = (finalSession: TrueFalseSession) => {
    const stats = TrueFalseService.getStats(finalSession);
    const progress = StorageService.getProgress();
    StorageService.saveProgress({ ...progress, totalXP: progress.totalXP + stats.xpEarned, totalQuizzesCompleted: progress.totalQuizzesCompleted + 1 });
    toast.success(`True or False completed! 🎉 You got ${stats.correctAnswers}/${stats.total} correct with max streak ${stats.maxStreak} and earned ${stats.xpEarned} XP!`, { duration: 5000 });
  };

  const restartGame = () => {
    if (!selectedLessonId) return;
    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (lesson) setGameSession(TrueFalseService.createSession(lesson, Math.min(questionCount, lesson.words.length)));
  };

  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div></div>;
  if (gameSession) return <div className="container mx-auto px-4 py-8"><TrueFalseGame session={gameSession} onGameComplete={handleGameComplete} onRestart={restartGame} onExit={() => setGameSession(null)} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <XCircle className="w-8 h-8 text-red-500" />
            True or False
          </h1>
          <p className="text-gray-600 mt-1">Quick-fire Korean translation quiz</p>
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
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                  <SelectItem value="25">25 questions</SelectItem>
                  <SelectItem value="30">30 questions</SelectItem>
                  <SelectItem value="all">All words</SelectItem>
                </SelectContent>
              </Select>
              {lessons.find(l => l.id === selectedLessonId) && questionCount === 999 && (
                <p className="text-sm text-green-600">Will use all {lessons.find(l => l.id === selectedLessonId)!.words.length} words</p>
              )}
            </div>
            <Button onClick={startGame} size="lg" className="w-full" disabled={!selectedLessonId}><Play className="w-5 h-5 mr-2" />Start Game</Button>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• See a Korean word and its translation</li>
                <li>• Decide if the translation is TRUE or FALSE</li>
                <li>• Build streaks for bonus XP</li>
                <li>• Fast-paced confidence builder</li>
                <li>• Earn 8 XP per correct answer + streak bonuses!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TrueFalsePage() {
  return <Suspense fallback={<div>Loading...</div>}><TrueFalsePageContent /></Suspense>;
}

