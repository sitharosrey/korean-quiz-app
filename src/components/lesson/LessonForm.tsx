'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen } from 'lucide-react';
import { Lesson, WordPair } from '@/types';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';

interface LessonFormProps {
  onLessonCreated: (lesson: Lesson) => void;
}

export function LessonForm({ onLessonCreated }: LessonFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lessonName, setLessonName] = useState('');

  const createLesson = () => {
    if (!lessonName.trim()) {
      toast.error('Please enter a lesson name');
      return;
    }

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      name: lessonName.trim(),
      words: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    StorageService.addLesson(newLesson);
    onLessonCreated(newLesson);
    setLessonName('');
    setIsOpen(false);
    toast.success(`Created lesson "${newLesson.name}"`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
          <DialogDescription>
            Give your lesson a name to organize your Korean vocabulary
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="lesson-name" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Name
            </label>
            <Input
              id="lesson-name"
              placeholder="e.g., Basic Greetings, Food & Drinks, Family Members"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createLesson()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createLesson} disabled={!lessonName.trim()}>
              Create Lesson
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
