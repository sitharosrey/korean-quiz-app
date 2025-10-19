'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lesson } from '@/types';
import { StorageService } from '@/lib/storage';
import { VisualMemory } from '@/components/practice/VisualMemory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  Search,
  Eye,
  Download,
  ExternalLink,
  Zap,
  Target,
  Star,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { motion } from 'framer-motion';

function ImagesPageContent() {
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

  const handleImageChange = (imageUrl: string | undefined) => {
    if (!selectedWord) return;
    
    // Update the word with the new image URL
    const updatedWord = { ...selectedWord, imageUrl };
    const updatedLesson = {
      ...selectedLesson!,
      words: selectedLesson!.words.map(w => w.id === selectedWord.id ? updatedWord : w)
    };
    
    StorageService.updateLesson(updatedLesson);
    toast.success('Image saved successfully!');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
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
              <Image className="w-10 h-10 text-cyan-600" />
              Image Attachments
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Add visual memory aids with auto-fetched or uploaded images for better learning
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
                  Select Word for Image Attachment
                </CardTitle>
                <CardDescription>
                  Choose a lesson and word to add visual memory aids
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
                              {word.imageUrl && (
                                <Badge variant="outline" className="text-xs">
                                  <Image className="w-3 h-3 mr-1" />
                                  Has Image
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Selected Word Display */}
                {selectedWord && (
                  <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-cyan-900">{selectedWord.korean}</h3>
                      <Badge variant="outline" className="text-cyan-700 border-cyan-300">
                        {selectedWord.english}
                      </Badge>
                    </div>
                    {selectedWord.pronunciation && (
                      <p className="text-sm text-cyan-600 mb-2">
                        Pronunciation: {selectedWord.pronunciation}
                      </p>
                    )}
                    {selectedWord.notes && (
                      <p className="text-sm text-cyan-700">
                        Notes: {selectedWord.notes}
                      </p>
                    )}
                    {selectedWord.imageUrl && (
                      <div className="mt-3 p-2 bg-white rounded border border-cyan-200">
                        <p className="text-xs text-cyan-600 mb-2">Current Image:</p>
                        <img 
                          src={selectedWord.imageUrl} 
                          alt={`Image for ${selectedWord.korean}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visual Memory Component */}
            {selectedWord && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <VisualMemory word={selectedWord} onImageChange={handleImageChange} />
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
                    <Upload className="w-5 h-5 text-cyan-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Upload Images</p>
                      <p className="text-gray-600">Upload your own images from your device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Auto-Fetch</p>
                      <p className="text-gray-600">Automatically fetch relevant images from Unsplash</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">URL Input</p>
                      <p className="text-gray-600">Paste image URLs directly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Visual Learning</p>
                      <p className="text-gray-600">Associate words with visual memory aids</p>
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
                    <span>Image features enabled in settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Lessons with words created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Unsplash API key for auto-fetch (optional)</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Settings
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Learning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Choose images that clearly represent the word&apos;s meaning</p>
                  <p>• Use high-quality images for better visual impact</p>
                  <p>• Try different images to find what works best for you</p>
                  <p>• Visual associations help with long-term memory</p>
                  <p>• Combine images with other learning methods</p>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>JPEG, PNG, GIF, WebP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>File upload up to 10MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Direct image URLs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Unsplash integration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ImagesPage() {
  return (
    <AuthGuard>
      <ImagesPageContent />
    </AuthGuard>
  );
}
