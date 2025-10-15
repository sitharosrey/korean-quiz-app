'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { initializeDemoData } from '@/lib/demo-data';
import { LessonForm } from '@/components/lesson/LessonForm';
import { LessonCard } from '@/components/lesson/LessonCard';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDemoData();
    loadLessons();
  }, []);

  const loadLessons = () => {
    const storedLessons = StorageService.getLessons();
    setLessons(storedLessons);
    setIsLoading(false);
  };

  const handleLessonCreated = (newLesson: Lesson) => {
    setLessons(prev => [...prev, newLesson]);
  };

  const handleLessonUpdated = () => {
    loadLessons();
  };

  const handleLessonDeleted = () => {
    loadLessons();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading lessons...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
          <p className="text-gray-600 mt-2">
            Manage your Korean vocabulary lessons and organize your learning
          </p>
        </div>
        <LessonForm onLessonCreated={handleLessonCreated} />
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first lesson to start organizing your Korean vocabulary
            </p>
            <LessonForm onLessonCreated={handleLessonCreated} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onLessonUpdated={handleLessonUpdated}
              onLessonDeleted={handleLessonDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
