'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { FlashcardSession, FlashcardService } from '@/lib/flashcard';
import { FlashcardGame } from '@/components/games/FlashcardGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Layers, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

function FlashcardPageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<FlashcardSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardCount, setCardCount] = useState<number | 'all'>(10);
  const [direction, setDirection] = useState<'korean-to-english' | 'english-to-korean'>('korean-to-english');

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

    const finalCardCount = cardCount === 'all' ? undefined : cardCount;
    const session = FlashcardService.createSession(lesson, direction, finalCardCount);
    setGameSession(session);
    toast.success(`Started flashcard session with ${session.cards.length} cards`);
  };

  const handleGameComplete = (finalSession: FlashcardSession) => {
    const stats = FlashcardService.getStats(finalSession);
    
    // Update progress
    const progress = StorageService.getProgress();
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + stats.xpEarned,
      totalQuizzesCompleted: progress.totalQuizzesCompleted + 1,
      totalTimeSpent: progress.totalTimeSpent + Math.round(stats.timeSpent / 60),
    };
    StorageService.saveProgress(newProgress);
    
    // Update word difficulties based on results
    const lesson = lessons.find(l => l.id === finalSession.lessonId);
    if (lesson) {
      const updatedWords = lesson.words.map(word => {
        const reviewed = finalSession.reviewedCards.find(
          r => finalSession.cards.find(c => c.id === r.cardId)?.wordPair.id === word.id
        );
        
        if (reviewed) {
          return StorageService.updateWordDifficulty(word, reviewed.isCorrect);
        }
        return word;
      });
      
      const updatedLesson = { ...lesson, words: updatedWords };
      StorageService.updateLesson(updatedLesson);
      loadLessons(); // Reload lessons to reflect changes
    }
    
    toast.success(
      `Flashcard session completed! 🎉 You got ${stats.correct}/${stats.total} correct (${Math.round(stats.accuracy)}%) and earned ${stats.xpEarned} XP!`,
      { duration: 5000 }
    );
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

    const finalCardCount = cardCount === 'all' ? undefined : cardCount;
    const session = FlashcardService.createSession(lesson, direction, finalCardCount);
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
        <FlashcardGame
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
            <Layers className="w-8 h-8 text-blue-500" />
            Flashcard Study
          </h1>
          <p className="text-gray-600 mt-1">
            Master Korean vocabulary with classic flashcard memorization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Study Settings
            </CardTitle>
            <CardDescription>
              Configure your flashcard session
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
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Study Direction
              </label>
              <Select 
                value={direction} 
                onValueChange={(value) => setDirection(value as 'korean-to-english' | 'english-to-korean')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="korean-to-english">Korean → English</SelectItem>
                  <SelectItem value="english-to-korean">English → Korean</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {direction === 'korean-to-english' 
                  ? 'You will see Korean words and recall their English meanings'
                  : 'You will see English words and recall their Korean translations'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Number of Cards</label>
              <Select 
                value={cardCount === 'all' ? 'all' : cardCount.toString()} 
                onValueChange={(value) => setCardCount(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 cards</SelectItem>
                  <SelectItem value="10">10 cards</SelectItem>
                  <SelectItem value="15">15 cards</SelectItem>
                  <SelectItem value="20">20 cards</SelectItem>
                  <SelectItem value="25">25 cards</SelectItem>
                  <SelectItem value="all">All cards</SelectItem>
                </SelectContent>
              </Select>
              {selectedLesson && cardCount === 'all' && (
                <p className="text-sm text-green-600">
                  Will study all {selectedLesson.words.length} cards
                </p>
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
                Start Studying
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                How to Study
              </h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Look at the word on the front of the card</li>
                <li>• Think of the answer in your mind</li>
                <li>• Click the card to flip and reveal the answer</li>
                <li>• Mark whether you got it correct or incorrect</li>
                <li>• Earn 10 XP per correct answer + accuracy bonuses!</li>
              </ul>
            </div>

            {lessons.length === 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  You haven't created any lessons yet.{' '}
                  <Link href="/lessons" className="font-semibold underline">
                    Create your first lesson
                  </Link>{' '}
                  to start studying!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FlashcardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlashcardPageContent />
    </Suspense>
  );
}

