'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { WordPair } from '@/types';

interface WordTableProps {
  words: WordPair[];
  onUpdateWord: (id: string, korean: string, english: string) => void;
  onDeleteWord: (id: string) => void;
}

export function WordTable({ words, onUpdateWord, onDeleteWord }: WordTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ korean: '', english: '' });

  const startEdit = (word: WordPair) => {
    setEditingId(word.id);
    setEditValues({ korean: word.korean, english: word.english });
  };

  const saveEdit = () => {
    if (editingId && editValues.korean.trim() && editValues.english.trim()) {
      onUpdateWord(editingId, editValues.korean.trim(), editValues.english.trim());
      setEditingId(null);
      setEditValues({ korean: '', english: '' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ korean: '', english: '' });
  };

  if (words.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No words in this lesson yet. Add some words to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Words in Lesson ({words.length})</CardTitle>
        <CardDescription>
          Click edit to modify word pairs, or delete to remove them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {words.map((word) => (
            <div key={word.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
              {editingId === word.id ? (
                <>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Korean</label>
                      <Input
                        value={editValues.korean}
                        onChange={(e) => setEditValues(prev => ({ ...prev, korean: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">English</label>
                      <Input
                        value={editValues.english}
                        onChange={(e) => setEditValues(prev => ({ ...prev, english: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Korean</span>
                      <p className="font-medium text-lg">{word.korean}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">English</span>
                      <p className="font-medium text-lg">{word.english}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(word)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDeleteWord(word.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
