'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { TypingChallengeSession, TypingChallengeService } from '@/lib/typing-challenge';
import { TypingChallengeGame } from '@/components/games/TypingChallengeGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Keyboard } from 'lucide-react';
import { toast } from 'sonner';

function TypingChallengePageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<TypingChallengeSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wordCount, setWordCount] = useState(20);
  const [mode, setMode] = useState<'korean-to-english' | 'english-to-korean'>('english-to-korean');

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

    const session = TypingChallengeService.createSession(lesson, Math.min(wordCount, lesson.words.length), mode);
    setGameSession(session);
    toast.success(`Started typing challenge with ${session.words.length} words`);
  };

  const handleGameComplete = (finalSession: TypingChallengeSession) => {
    const stats = TypingChallengeService.getStats(finalSession);
    
    const progress = StorageService.getProgress();
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + stats.xpEarned,
      totalQuizzesCompleted: progress.totalQuizzesCompleted + 1,
    };
    StorageService.saveProgress(newProgress);
    
    toast.success(`Typing Challenge completed! 🎉 You got ${stats.correctAnswers}/${stats.total} correct at ${stats.wordsPerMinute} WPM and earned ${stats.xpEarned} XP!`, {
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

    const session = TypingChallengeService.createSession(lesson, Math.min(wordCount, lesson.words.length), mode);
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
        <TypingChallengeGame
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
            <Keyboard className="w-8 h-8" />
            Typing Challenge
          </h1>
          <p className="text-gray-600 mt-1">
            Improve your typing speed and accuracy with Korean vocabulary
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Game Settings
            </CardTitle>
            <CardDescription>
              Choose your lesson and challenge mode
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
              <label className="text-sm font-medium text-gray-700">Mode</label>
              <Select 
                value={mode} 
                onValueChange={(value) => setMode(value as 'korean-to-english' | 'english-to-korean')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english-to-korean">English → Korean</SelectItem>
                  <SelectItem value="korean-to-english">Korean → English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Words</label>
              <Select 
                value={wordCount === 999 ? "all" : wordCount.toString()} 
                onValueChange={(value) => setWordCount(value === "all" ? 999 : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 words</SelectItem>
                  <SelectItem value="15">15 words</SelectItem>
                  <SelectItem value="20">20 words</SelectItem>
                  <SelectItem value="25">25 words</SelectItem>
                  <SelectItem value="30">30 words</SelectItem>
                  <SelectItem value="all">All words</SelectItem>
                </SelectContent>
              </Select>
              {selectedLesson && wordCount === 999 && (
                <p className="text-sm text-green-600">Will use all {selectedLesson.words.length} words</p>
              )}
            </div>

            <div className="pt-4">
              <Button 
                onClick={startGame} 
                size="lg" 
                className="w-full"
                disabled={!selectedLessonId || !selectedLesson || selectedLesson.words.length === 0}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Challenge
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Type each word as fast and accurately as you can</li>
                <li>• Your WPM (words per minute) is tracked in real-time</li>
                <li>• Higher speed earns bonus XP</li>
                <li>• Earn 12 XP per correct word!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TypingChallengePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TypingChallengePageContent />
    </Suspense>
  );
}

