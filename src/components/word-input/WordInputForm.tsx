'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Plus, X, Loader2, Languages, Edit2, Check, X as XIcon } from 'lucide-react';
import { WordPair } from '@/types';
import { createGroqService } from '@/lib/groq';
import { toast } from 'sonner';

interface WordInputFormProps {
  onWordsAdded: (words: WordPair[]) => void;
  groqApiKey?: string;
}

export function WordInputForm({ onWordsAdded, groqApiKey }: WordInputFormProps) {
  const [words, setWords] = useState<WordPair[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newWord, setNewWord] = useState({ korean: '', english: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [koreanText, setKoreanText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{
    current: number;
    total: number;
    currentWord: string;
    translatedWords: WordPair[];
  }>({
    current: 0,
    total: 0,
    currentWord: '',
    translatedWords: []
  });
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ korean: string; english: string }>({ korean: '', english: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addWord = () => {
    if (newWord.korean.trim() && newWord.english.trim()) {
      const word: WordPair = {
        id: `word-${Date.now()}`,
        korean: newWord.korean.trim(),
        english: newWord.english.trim(),
        difficulty: 0,
        nextReviewDate: new Date(),
        reviewCount: 0,
        correctStreak: 0,
        level: 0,
        nextReview: new Date(),
        totalXP: 0,
      };
      setWords(prev => [...prev, word]);
      setNewWord({ korean: '', english: '' });
    }
  };

  const removeWord = (id: string) => {
    setWords(prev => prev.filter(word => word.id !== id));
  };

  const startEditing = (word: WordPair) => {
    setEditingWord(word.id);
    setEditValues({ korean: word.korean, english: word.english });
  };

  const cancelEditing = () => {
    setEditingWord(null);
    setEditValues({ korean: '', english: '' });
  };

  const saveEditing = () => {
    if (!editingWord || !editValues.korean.trim() || !editValues.english.trim()) {
      toast.error('Both Korean and English fields are required');
      return;
    }

    setWords(prev => prev.map(word => 
      word.id === editingWord 
        ? { ...word, korean: editValues.korean.trim(), english: editValues.english.trim() }
        : word
    ));
    
    setEditingWord(null);
    setEditValues({ korean: '', english: '' });
    toast.success('Word updated successfully');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const groqService = createGroqService(groqApiKey);
      const result = await groqService.extractTextAndTranslate(selectedFile);
      
      if (result.koreanText) {
        // Split Korean text by common separators
        const koreanWords = result.koreanText
          .split(/[,，、\n\r\t]+/)
          .map(word => word.trim())
          .filter(word => word.length > 0);

        // If we have English translation, try to match it
        let englishWords: string[] = [];
        if (result.englishTranslation) {
          englishWords = result.englishTranslation
            .split(/[,，、\n\r\t]+/)
            .map(word => word.trim())
            .filter(word => word.length > 0);
        }

        // Create word pairs
        const extractedWords: WordPair[] = koreanWords.map((korean, index) => ({
          id: `extracted-${Date.now()}-${index}`,
          korean,
          english: englishWords[index] || '', // Use corresponding English or empty
          difficulty: 0,
          nextReviewDate: new Date(),
          reviewCount: 0,
          correctStreak: 0,
          level: 0,
          nextReview: new Date(),
          totalXP: 0,
        }));

        setWords(prev => [...prev, ...extractedWords]);
        toast.success(`Extracted ${extractedWords.length} words from image`);
        
        // Clear the selected file and preview after successful processing
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error('No Korean text found in the image');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract text from image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTranslateKoreanText = async () => {
    if (!koreanText.trim() || !groqApiKey) return;

    setIsTranslating(true);
    
    // Split Korean text by commas and clean up
    const koreanWords = koreanText
      .split(/[,，、\n\r\t]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);

    if (koreanWords.length === 0) {
      toast.error('Please enter Korean words separated by commas');
      setIsTranslating(false);
      return;
    }

    // Initialize progress
    setTranslationProgress({
      current: 0,
      total: koreanWords.length,
      currentWord: '',
      translatedWords: []
    });

    try {
      const groqService = createGroqService(groqApiKey);
      const translatedWords: WordPair[] = [];

      // Translate each word one by one
      for (let i = 0; i < koreanWords.length; i++) {
        const koreanWord = koreanWords[i];
        
        // Update progress
        setTranslationProgress({
          current: i + 1,
          total: koreanWords.length,
          currentWord: koreanWord,
          translatedWords: [...translatedWords]
        });

        try {
          // Create a simple prompt for single word translation
            const englishTranslation = await groqService.translateText(koreanWord, 'ko', 'en');

          // Create word pair
          const wordPair: WordPair = {
            id: `translated-${Date.now()}-${i}`,
            korean: koreanWord,
            english: englishTranslation,
            difficulty: 0,
            nextReviewDate: new Date(),
            reviewCount: 0,
            correctStreak: 0,
            level: 0,
            nextReview: new Date(),
            totalXP: 0,
          };

          translatedWords.push(wordPair);

          // Update progress with the new word
          setTranslationProgress({
            current: i + 1,
            total: koreanWords.length,
            currentWord: koreanWord,
            translatedWords: [...translatedWords]
          });

          // Add a small delay to make the progress visible
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (wordError) {
          console.error(`Error translating word "${koreanWord}":`, wordError);
          // Add word with empty translation if API fails
          const wordPair: WordPair = {
            id: `translated-${Date.now()}-${i}`,
            korean: koreanWord,
            english: '', // User can fill this in manually
            difficulty: 0,
            nextReviewDate: new Date(),
            reviewCount: 0,
            correctStreak: 0,
            level: 0,
            nextReview: new Date(),
            totalXP: 0,
          };
          translatedWords.push(wordPair);
        }
      }

      // Add all translated words to the main words list
      setWords(prev => [...prev, ...translatedWords]);
      setKoreanText(''); // Clear the text area
      
      // Clear progress
      setTranslationProgress({
        current: 0,
        total: 0,
        currentWord: '',
        translatedWords: []
      });
      
      toast.success(`Translated ${translatedWords.length} Korean words`);
      
    } catch (error) {
      console.error('Translation Error:', error);
      toast.error('Failed to translate Korean text. Please try again.');
      
      // Clear progress on error
      setTranslationProgress({
        current: 0,
        total: 0,
        currentWord: '',
        translatedWords: []
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = () => {
    if (words.length > 0) {
      onWordsAdded(words);
      setWords([]);
      toast.success(`Added ${words.length} words to lesson`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add Words to Lesson</CardTitle>
        <CardDescription>
          Add Korean-English word pairs manually (Image OCR not available with Groq API)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section - Disabled for Groq API */}
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-800">Image OCR Not Available</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Groq API doesn&apos;t support image analysis. Please use the manual entry feature below to add Korean words.
                </p>
              </div>
            </div>
          </div>

          {/* Image Preview Section */}
          {imagePreview && selectedFile && (
            <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Image Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <img
                    src={imagePreview}
                    alt="Selected image"
                    className="max-w-full h-auto max-h-64 object-contain rounded-lg border"
                  />
                </div>
                
                <div className="flex flex-col justify-center space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  
                  <Button
                    onClick={handleProcessImage}
                    disabled={isUploading || !groqApiKey}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading ? 'Processing...' : 'Process Image'}
                  </Button>
                  
                  {!groqApiKey && (
                    <p className="text-xs text-red-500">
                      Please set your Groq API key in settings first
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Korean Text Translation Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Korean Text Translation
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="korean-text" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Korean words separated by commas
              </label>
              <textarea
                id="korean-text"
                value={koreanText}
                onChange={(e) => setKoreanText(e.target.value)}
                placeholder="안녕하세요, 감사합니다, 사과, 바나나, 우유"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                disabled={isTranslating}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple Korean words with commas (,), semicolons (;), or line breaks
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleTranslateKoreanText}
                disabled={!koreanText.trim() || !groqApiKey || isTranslating}
                className="flex items-center gap-2"
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
                {isTranslating ? 'Translating...' : 'Translate to English'}
              </Button>
              
              {!groqApiKey && (
                <p className="text-sm text-red-500">
                  Please set your Groq API key in settings first
                </p>
              )}
            </div>

            {/* Translation Progress */}
            {isTranslating && translationProgress.total > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-800">Translation Progress</h4>
                    <span className="text-sm text-blue-600">
                      {translationProgress.current} / {translationProgress.total}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(translationProgress.current / translationProgress.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  {/* Current Word */}
                  {translationProgress.currentWord && (
                    <div className="text-center">
                      <p className="text-sm text-blue-700">
                        Currently translating: <span className="font-semibold">{translationProgress.currentWord}</span>
                      </p>
                    </div>
                  )}
                  
                  {/* Completed Translations Preview */}
                  {translationProgress.translatedWords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-800">Completed translations:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {translationProgress.translatedWords.map((word, index) => (
                          <div key={word.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded border">
                            <span className="font-medium text-gray-800">{word.korean}</span>
                            <span className="text-gray-500">→</span>
                            <span className="text-green-600">{word.english || 'Translating...'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manual Input Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Manual Entry</h3>
          <div className="flex gap-4">
            <Input
              placeholder="Korean word"
              value={newWord.korean}
              onChange={(e) => setNewWord(prev => ({ ...prev, korean: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
            />
            <Input
              placeholder="English translation"
              value={newWord.english}
              onChange={(e) => setNewWord(prev => ({ ...prev, english: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
            />
            <Button onClick={addWord} disabled={!newWord.korean.trim() || !newWord.english.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Words List */}
        {words.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Words to Add ({words.length})</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {words.map((word) => (
                <div key={word.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  {editingWord === word.id ? (
                    // Editing Mode
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Korean:</span>
                        <Input
                          value={editValues.korean}
                          onChange={(e) => setEditValues(prev => ({ ...prev, korean: e.target.value }))}
                          className="mt-1"
                          placeholder="Korean word"
                        />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">English:</span>
                        <Input
                          value={editValues.english}
                          onChange={(e) => setEditValues(prev => ({ ...prev, english: e.target.value }))}
                          className="mt-1"
                          placeholder="English translation"
                        />
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Korean:</span>
                        <p className="font-medium">{word.korean}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">English:</span>
                        <p className="font-medium">{word.english}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {editingWord === word.id ? (
                      // Edit Mode Buttons
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveEditing}
                          className="text-green-600 hover:text-green-700"
                          disabled={!editValues.korean.trim() || !editValues.english.trim()}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      // Display Mode Buttons
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(word)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWord(word.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {words.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSubmit} size="lg">
              Add {words.length} Words to Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
