'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Play, Edit2, Trash2, Calendar } from 'lucide-react';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';

interface LessonCardProps {
  lesson: Lesson;
  onLessonUpdated: () => void;
  onLessonDeleted: () => void;
}

export function LessonCard({ lesson, onLessonUpdated, onLessonDeleted }: LessonCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteLesson = () => {
    StorageService.deleteLesson(lesson.id);
    onLessonDeleted();
    setIsDeleteDialogOpen(false);
    toast.success(`Deleted lesson "${lesson.name}"`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              {lesson.name}
            </CardTitle>
            <CardDescription className="mt-2">
              {lesson.words.length} word{lesson.words.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href={`/lessons/${lesson.id}`}>
              <Button size="sm" variant="outline">
                <Edit2 className="w-4 h-4" />
              </Button>
            </Link>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Lesson</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete &ldquo;{lesson.name}&rdquo;? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={deleteLesson}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Created {formatDate(lesson.createdAt)}
          </div>
          
          {lesson.words.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Sample words:</p>
              <div className="flex flex-wrap gap-2">
                {lesson.words.slice(0, 3).map((word) => (
                  <span key={word.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {word.korean} - {word.english}
                  </span>
                ))}
                {lesson.words.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{lesson.words.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link href={`/lessons/${lesson.id}`} className="flex-1">
              <Button className="w-full" variant="outline">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Lesson
              </Button>
            </Link>
            <Link href={`/quiz?lesson=${lesson.id}`} className="flex-1">
              <Button className="w-full" disabled={lesson.words.length === 0}>
                <Play className="w-4 h-4 mr-2" />
                Start Quiz
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
