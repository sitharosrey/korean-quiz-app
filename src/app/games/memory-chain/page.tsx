'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { MemoryChainSession, MemoryChainService } from '@/lib/memory-chain';
import { MemoryChainGame } from '@/components/games/MemoryChainGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Brain } from 'lucide-react';
import { toast } from 'sonner';

function MemoryChainPageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<MemoryChainSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rounds, setRounds] = useState(8);
  const [startLength, setStartLength] = useState(3);

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
    const session = MemoryChainService.createSession(lesson, startLength, rounds);
    setGameSession(session);
    toast.success(`Started memory chain with ${session.rounds.length} rounds`);
  };

  const handleGameComplete = (finalSession: MemoryChainSession) => {
    const stats = MemoryChainService.getStats(finalSession);
    const progress = StorageService.getProgress();
    StorageService.saveProgress({ ...progress, totalXP: progress.totalXP + stats.xpEarned, totalQuizzesCompleted: progress.totalQuizzesCompleted + 1 });
    toast.success(`Memory Chain completed! 🎉 You got ${stats.correctRounds}/${stats.total} correct with max sequence ${stats.maxSequenceLength} and earned ${stats.xpEarned} XP!`, { duration: 5000 });
  };

  const restartGame = () => {
    if (!selectedLessonId) return;
    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (lesson) setGameSession(MemoryChainService.createSession(lesson, startLength, rounds));
  };

  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div></div>;
  if (gameSession) return <div className="container mx-auto px-4 py-8"><MemoryChainGame session={gameSession} onGameComplete={handleGameComplete} onRestart={restartGame} onExit={() => setGameSession(null)} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Brain className="w-8 h-8" />Memory Chain</h1>
          <p className="text-gray-600 mt-1">Remember sequences of Korean words</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Game Settings</CardTitle>
            <CardDescription>Choose a lesson and difficulty</CardDescription>
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
              <label className="text-sm font-medium text-gray-700">Starting Sequence Length</label>
              <Select value={startLength.toString()} onValueChange={(value) => setStartLength(parseInt(value))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 words (Easy)</SelectItem>
                  <SelectItem value="3">3 words (Normal)</SelectItem>
                  <SelectItem value="4">4 words (Hard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Rounds</label>
              <Select value={rounds === 999 ? "all" : rounds.toString()} onValueChange={(value) => setRounds(value === "all" ? 999 : parseInt(value))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rounds</SelectItem>
                  <SelectItem value="8">8 rounds</SelectItem>
                  <SelectItem value="10">10 rounds</SelectItem>
                  <SelectItem value="15">15 rounds</SelectItem>
                  <SelectItem value="all">Maximum rounds</SelectItem>
                </SelectContent>
              </Select>
              {lessons.find(l => l.id === selectedLessonId) && rounds === 999 && (
                <p className="text-sm text-green-600">Will use maximum rounds based on available words</p>
              )}
            </div>
            <Button onClick={startGame} size="lg" className="w-full" disabled={!selectedLessonId}><Play className="w-5 h-5 mr-2" />Start Game</Button>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Words flash on screen for 5 seconds</li>
                <li>• Memorize the sequence</li>
                <li>• Type them back in correct order</li>
                <li>• Sequences get longer as you progress</li>
                <li>• Earn 25 XP per round!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MemoryChainPage() {
  return <Suspense fallback={<div>Loading...</div>}><MemoryChainPageContent /></Suspense>;
}

