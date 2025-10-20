'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lesson, MatchGameSession } from '@/types';
import { StorageService } from '@/lib/storage';
import { MatchGameService } from '@/lib/match-game';
import { MatchPairsGame } from '@/components/games/MatchPairsGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, Gamepad2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function MatchPairsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [gameSession, setGameSession] = useState<MatchGameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [maxPairs, setMaxPairs] = useState(8);

  useEffect(() => {
    loadLessons();
    const lessonParam = searchParams.get('lesson');
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
    }
  }, [searchParams]);

  // Update maxPairs when lesson changes
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      if (lesson) {
        const maxPossiblePairs = Math.min(Math.floor(lesson.words.length / 2), 16);
        // Set to maximum possible pairs for this lesson
        setMaxPairs(maxPossiblePairs);
      }
    }
  }, [selectedLessonId, lessons]);

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

    const session = MatchGameService.createGameSession(lesson, maxPairs);
    setGameSession(session);
    toast.success(`Started match game with ${session.totalPairs} pairs`);
  };

  const handleGameComplete = (finalSession: MatchGameSession) => {
    // Save the game session for progress tracking
    StorageService.addMatchGameSession(finalSession);
    
    // Update user progress
    const progress = StorageService.getProgress();
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + (finalSession.totalPairs * 10), // 10 XP per pair
      totalQuizzesCompleted: progress.totalQuizzesCompleted + 1,
      totalTimeSpent: progress.totalTimeSpent + (finalSession.timeSpent || 0) / 60, // Convert to minutes
    };
    StorageService.saveProgress(newProgress);
    
    toast.success('Game completed! Great job!');
  };

  const restartGame = () => {
    setGameSession(null);
    startGame();
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
        <MatchPairsGame
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
          <div className="flex items-center gap-3 mb-4">
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Gamepad2 className="w-8 h-8" />
              Match the Pairs
            </h1>
            <p className="text-gray-600 mt-1">
              Test your memory by matching Korean words with their English translations
            </p>
          </div>
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

            {/* Number of Pairs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Number of Pairs</label>
                {selectedLesson && selectedLesson.words.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMaxPairs(Math.min(Math.floor(selectedLesson.words.length / 2), 12))}
                    className="text-xs"
                  >
                    Use All {Math.min(Math.floor(selectedLesson.words.length / 2), 12)} Pairs
                  </Button>
                )}
              </div>
              <Select 
                value={maxPairs.toString()} 
                onValueChange={(value) => setMaxPairs(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 pairs (8 cards)</SelectItem>
                  <SelectItem value="6">6 pairs (12 cards)</SelectItem>
                  <SelectItem value="8">8 pairs (16 cards)</SelectItem>
                  <SelectItem value="10">10 pairs (20 cards)</SelectItem>
                  <SelectItem value="12">12 pairs (24 cards)</SelectItem>
                  {selectedLesson && Math.floor(selectedLesson.words.length / 2) > 12 && (
                    <SelectItem value={Math.min(Math.floor(selectedLesson.words.length / 2), 16).toString()}>
                      All {Math.min(Math.floor(selectedLesson.words.length / 2), 16)} pairs
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedLesson && (
                <p className="text-sm text-gray-500">
                  Maximum: {Math.min(Math.floor(selectedLesson.words.length / 2), 16)} pairs (based on lesson size)
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

            {/* Lesson Info */}
            {selectedLesson && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">{selectedLesson.name}</h3>
                  <p className="text-blue-700 text-sm">
                    {selectedLesson.words.length} words available • 
                    Game will use {Math.min(maxPairs, Math.floor(selectedLesson.words.length / 2))} pairs
                  </p>
                </div>
                
                {/* Odd Number Warning */}
                {selectedLesson.words.length % 2 === 1 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-yellow-800 font-medium">
                          Odd number of words detected
                        </p>
                        <p className="text-yellow-700 mt-1">
                          You have {selectedLesson.words.length} words, but the game needs pairs. 
                          One word will be excluded from the game.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Game Instructions */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Click on cards to flip them and reveal Korean words or English translations</li>
                <li>• Match each Korean word with its corresponding English translation</li>
                <li>• Complete all pairs as quickly as possible</li>
                <li>• Earn XP based on your performance!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MatchPairsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchPairsPageContent />
    </Suspense>
  );
}
