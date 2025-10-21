'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { WordScrambleSession, WordScrambleService } from '@/lib/word-scramble';
import { WordScrambleGame } from '@/components/games/WordScrambleGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Shuffle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function WordScramblePageContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<WordScrambleSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wordCount, setWordCount] = useState(10);

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

    const session = WordScrambleService.createSession(lesson, Math.min(wordCount, lesson.words.length));
    setGameSession(session);
    toast.success(`Started word scramble with ${session.words.length} words`);
  };

  const handleGameComplete = (finalSession: WordScrambleSession) => {
    const stats = WordScrambleService.getStats(finalSession);
    
    console.log('Word Scramble Stats:', stats);
    
    // Update user progress
    const progress = StorageService.getProgress();
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + stats.xpEarned,
      totalQuizzesCompleted: progress.totalQuizzesCompleted + 1,
    };
    StorageService.saveProgress(newProgress);
    
    toast.success(`Game completed! 🎉 You got ${stats.correctAnswers}/${stats.total} correct and earned ${stats.xpEarned} XP!`, {
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

    const session = WordScrambleService.createSession(lesson, Math.min(wordCount, lesson.words.length));
    setGameSession(session);
    toast.success(`Started new game with ${session.words.length} words`);
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

  // Show active game
  if (gameSession) {
    return (
      <div className="container mx-auto px-4 py-8">
        <WordScrambleGame
          session={gameSession}
          onGameComplete={handleGameComplete}
          onRestart={restartGame}
          onExit={exitGame}
        />
      </div>
    );
  }

  // Show game setup
  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shuffle className="w-8 h-8" />
            Word Scramble
          </h1>
          <p className="text-gray-600 mt-1">
            Unscramble Korean words to test your spelling and recognition
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Game Settings
            </CardTitle>
            <CardDescription>
              Choose a lesson and configure your game preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lesson Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Lesson</label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lesson to play with" />
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

            {/* Number of Words */}
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
                  <SelectItem value="5">5 words</SelectItem>
                  <SelectItem value="10">10 words</SelectItem>
                  <SelectItem value="15">15 words</SelectItem>
                  <SelectItem value="20">20 words</SelectItem>
                  <SelectItem value="25">25 words</SelectItem>
                  <SelectItem value="all">All words</SelectItem>
                </SelectContent>
              </Select>
              {selectedLesson && wordCount === 999 && (
                <p className="text-sm text-green-600">Will use all {selectedLesson.words.length} words</p>
              )}
              {selectedLesson && (
                <p className="text-sm text-gray-500">
                  Maximum: {selectedLesson.words.length} words available
                </p>
              )}
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button 
                onClick={startGame} 
                size="lg" 
                className="w-full"
                disabled={!selectedLessonId || !selectedLesson || selectedLesson.words.length === 0}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>

            {/* Game Instructions */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">📚 How to Play Word Scramble</h3>
              <ul className="text-gray-700 text-sm space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>You'll see an <strong>English word</strong> (e.g., "hello")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Below it, the <strong>Korean letters are scrambled</strong> (mixed up) - e.g., if the word is "안녕" it might show as "녕안"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span><strong>Rearrange the letters mentally</strong> and type the correct Korean word in proper order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Use hints or reshuffle if you get stuck</span>
                </li>
              </ul>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">💡 Example:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">English: <strong>"Hello"</strong></p>
                  <p className="text-gray-600">Scrambled: <strong className="text-blue-600">"녕안하세요"</strong> (wrong order)</p>
                  <p className="text-gray-600">You type: <strong className="text-green-600">"안녕하세요"</strong> (correct order!) ✓</p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  🏆 Earn 15 XP per correct word!
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WordScramblePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WordScramblePageContent />
    </Suspense>
  );
}

