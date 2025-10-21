'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { FillBlanksSession, FillBlanksService } from '@/lib/fill-blanks';
import { FillBlanksGame } from '@/components/games/FillBlanksGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';

function FillBlanksPageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<FillBlanksSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);

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
    const session = FillBlanksService.createSession(lesson, Math.min(questionCount, lesson.words.length));
    setGameSession(session);
    toast.success(`Started fill in the blanks with ${session.questions.length} questions`);
  };

  const handleGameComplete = (finalSession: FillBlanksSession) => {
    const stats = FillBlanksService.getStats(finalSession);
    const progress = StorageService.getProgress();
    StorageService.saveProgress({ ...progress, totalXP: progress.totalXP + stats.xpEarned, totalQuizzesCompleted: progress.totalQuizzesCompleted + 1 });
    toast.success(`Fill in the Blanks completed! 🎉 You got ${stats.correctAnswers}/${stats.total} correct and earned ${stats.xpEarned} XP!`, { duration: 5000 });
  };

  const restartGame = () => {
    if (!selectedLessonId) return;
    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (lesson) setGameSession(FillBlanksService.createSession(lesson, Math.min(questionCount, lesson.words.length)));
  };

  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div></div>;
  if (gameSession) return <div className="container mx-auto px-4 py-8"><FillBlanksGame session={gameSession} onGameComplete={handleGameComplete} onRestart={restartGame} onExit={() => setGameSession(null)} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-8 h-8" />Fill in the Blanks</h1>
          <p className="text-gray-600 mt-1">Complete Korean sentences with the correct words</p>
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
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
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
                <li>• Read the Korean sentence with a blank</li>
                <li>• Choose the correct word to fill in the blank</li>
                <li>• Learn word usage in context</li>
                <li>• Earn 20 XP for each correct answer!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FillBlanksPage() {
  return <Suspense fallback={<div>Loading...</div>}><FillBlanksPageContent /></Suspense>;
}

