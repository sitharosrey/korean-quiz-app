'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson, WordPair } from '@/types';
import { StorageService } from '@/lib/storage';
import { SentencePractice } from '@/components/practice/SentencePractice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  BookOpen, 
  Volume2,
  Target,
  Zap,
  Brain,
  Star
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function SentencesPageContent() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedWordId, setSelectedWordId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = () => {
    const storedLessons = StorageService.getLessons();
    setLessons(storedLessons);
    setIsLoading(false);
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const selectedWord = selectedLesson?.words.find(w => w.id === selectedWordId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-purple-600" />
              Context Sentences
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Generate AI-powered example sentences to understand word usage in context
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word Selection */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Select Word for Practice
                </CardTitle>
                <CardDescription>
                  Choose a lesson and word to generate context sentences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lesson Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Lesson</label>
                  <Select value={selectedLessonId} onValueChange={(value) => {
                    setSelectedLessonId(value);
                    setSelectedWordId(''); // Reset word selection when lesson changes
                  }}>
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
                  {lessons.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No lessons available. <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/lessons')}>Create a lesson first</Button>.
                    </p>
                  )}
                </div>

                {/* Word Selection */}
                {selectedLesson && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Word</label>
                    <Select value={selectedWordId} onValueChange={setSelectedWordId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a word" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedLesson.words.map((word) => (
                          <SelectItem key={word.id} value={word.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{word.korean}</span>
                              <span className="text-gray-500">-</span>
                              <span className="text-gray-600">{word.english}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Selected Word Display */}
                {selectedWord && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-purple-900">{selectedWord.korean}</h3>
                      <Badge variant="outline" className="text-purple-700 border-purple-300">
                        {selectedWord.english}
                      </Badge>
                    </div>
                    {selectedWord.pronunciation && (
                      <p className="text-sm text-purple-600 mb-2">
                        Pronunciation: {selectedWord.pronunciation}
                      </p>
                    )}
                    {selectedWord.notes && (
                      <p className="text-sm text-purple-700">
                        Notes: {selectedWord.notes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sentence Practice Component */}
            {selectedWord && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <SentencePractice word={selectedWord} />
              </motion.div>
            )}
          </motion.div>

          {/* Info Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Feature Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">AI-Powered Generation</p>
                      <p className="text-gray-600">Uses Groq API to create natural Korean sentences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Audio Pronunciation</p>
                      <p className="text-gray-600">Listen to sentences with Korean speech synthesis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Difficulty Levels</p>
                      <p className="text-gray-600">Easy, medium, and hard sentence examples</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Context Learning</p>
                      <p className="text-gray-600">Understand how words are used in real situations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Groq API key configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Context sentences enabled in settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Lessons with words created</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => router.push('/settings')}
                >
                  Configure Settings
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Listen to each sentence multiple times</p>
                  <p>• Try to understand the context before reading the translation</p>
                  <p>• Practice saying the sentences out loud</p>
                  <p>• Focus on how the word changes meaning in different contexts</p>
                  <p>• Use the difficulty levels to progress your learning</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SentencesPage() {
  return (
    <AuthGuard>
      <SentencesPageContent />
    </AuthGuard>
  );
}
