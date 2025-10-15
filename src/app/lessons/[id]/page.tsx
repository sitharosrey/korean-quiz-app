'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lesson, WordPair } from '@/types';
import { StorageService } from '@/lib/storage';
import { WordInputForm } from '@/components/word-input/WordInputForm';
import { WordTable } from '@/components/word-input/WordTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Calendar, Users, Brain, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonEditPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({ groqApiKey: '' });

  useEffect(() => {
    loadLesson();
    loadSettings();
  }, [params.id]);

  const loadLesson = () => {
    const lessons = StorageService.getLessons();
    const foundLesson = lessons.find(l => l.id === params.id);
    
    if (foundLesson) {
      setLesson(foundLesson);
    } else {
      toast.error('Lesson not found');
      router.push('/lessons');
    }
    setIsLoading(false);
  };

  const loadSettings = () => {
    const appSettings = StorageService.getSettings();
    setSettings({ groqApiKey: appSettings.groqApiKey || '' });
  };

  const handleWordsAdded = (newWords: WordPair[]) => {
    if (!lesson) return;

    const updatedLesson = {
      ...lesson,
      words: [...lesson.words, ...newWords],
      updatedAt: new Date(),
    };

    StorageService.updateLesson(updatedLesson);
    setLesson(updatedLesson);
  };

  const handleWordUpdated = (id: string, korean: string, english: string) => {
    if (!lesson) return;

    const updatedWords = lesson.words.map(word =>
      word.id === id ? { ...word, korean, english } : word
    );

    const updatedLesson = {
      ...lesson,
      words: updatedWords,
      updatedAt: new Date(),
    };

    StorageService.updateLesson(updatedLesson);
    setLesson(updatedLesson);
  };

  const handleWordDeleted = (id: string) => {
    if (!lesson) return;

    const updatedWords = lesson.words.filter(word => word.id !== id);
    const updatedLesson = {
      ...lesson,
      words: updatedWords,
      updatedAt: new Date(),
    };

    StorageService.updateLesson(updatedLesson);
    setLesson(updatedLesson);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading lesson...</h3>
                <p className="text-gray-500">Please wait while we fetch your lesson data</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
                <p className="text-gray-500 mb-6">The lesson you&apos;re looking for doesn&apos;t exist or may have been deleted.</p>
                <Button 
                  onClick={() => router.push('/lessons')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lessons
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/lessons')}
              className="text-gray-600 hover:text-gray-900 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Lessons
            </Button>
          </div>
          
          {/* Enhanced Header Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
            <CardContent className="p-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {lesson.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {lesson.words.length} word{lesson.words.length !== 1 ? 's' : ''} in this lesson
                </p>
                
                {/* Lesson Stats */}
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Created {lesson.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Brain className="w-4 h-4" />
                    <span>Last updated {lesson.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Add Words Section */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden p-0">
            <div className="bg-blue-600 text-white px-8 py-6 flex flex-col items-start rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Plus className="w-6 h-6" />
                Add New Words
              </CardTitle>
              <CardDescription className="text-blue-100 text-base mt-2">
                Add Korean words manually or use AI translation
              </CardDescription>
            </div>
            <CardContent className="p-8">
              <WordInputForm 
                onWordsAdded={handleWordsAdded}
                groqApiKey={settings.groqApiKey}
              />
            </CardContent>
          </Card>

          {/* Words Table */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden p-0">
            <div className="bg-green-600 text-white px-8 py-6 flex flex-col items-start rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Users className="w-6 h-6" />
                Vocabulary List ({lesson.words.length} words)
              </CardTitle>
              <CardDescription className="text-green-100 text-base mt-2">
                Manage and edit your Korean vocabulary
              </CardDescription>
            </div>
            <CardContent className="p-8">
              {lesson.words.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No words yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start building your vocabulary by adding words above
                  </p>
                </div>
              ) : (
                <WordTable
                  words={lesson.words}
                  onUpdateWord={handleWordUpdated}
                  onDeleteWord={handleWordDeleted}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
