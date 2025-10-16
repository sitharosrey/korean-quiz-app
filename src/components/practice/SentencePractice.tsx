'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  Loader2,
  RefreshCw,
  BookOpen,
  Star
} from 'lucide-react';
import { WordPair } from '@/types';
import { GroqService } from '@/lib/groq';
import { audioService } from '@/lib/audio';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface SentencePracticeProps {
  word: WordPair;
  onSentenceGenerated?: (sentences: Array<{korean: string, english: string, difficulty: 'easy' | 'medium' | 'hard'}>) => void;
}

export function SentencePractice({ word, onSentenceGenerated }: SentencePracticeProps) {
  const [sentences, setSentences] = useState<Array<{korean: string, english: string, difficulty: 'easy' | 'medium' | 'hard'}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const settings = StorageService.getSettings();

  const handleGenerateSentences = async () => {
    if (!settings.enableContextSentences) {
      toast.info("Context sentence generation is disabled in settings.");
      return;
    }
    
    if (!settings.groqApiKey || settings.groqApiKey === 'your_groq_api_key_here') {
      toast.error("Groq API key is not configured. Please set it in settings to generate context sentences.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const groqService = new GroqService(settings.groqApiKey);
      const generated = await groqService.generateKoreanSentencesWithTranslations(
        word.korean, 
        word.english, 
        3
      );
      
      setSentences(generated);
      setIsOpen(true);
      
      if (onSentenceGenerated) {
        onSentenceGenerated(generated);
      }
      
      toast.success("Context sentences generated!");
    } catch (err) {
      console.error("Failed to generate context sentences:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      toast.error("Failed to generate context sentences.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySentence = async (sentence: string) => {
    if (!audioService) {
      toast.error('Audio not supported in this browser');
      return;
    }
    
    setIsPlaying(sentence);
    try {
      await audioService.speakKorean(sentence);
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('Failed to play audio');
    } finally {
      setIsPlaying(null);
    }
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Sentence Practice
          </CardTitle>
          <Button
            onClick={handleGenerateSentences}
            disabled={isLoading || !settings.enableContextSentences || !settings.groqApiKey || settings.groqApiKey === 'your_groq_api_key_here'}
            size="sm"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Practice using "{word.korean}" in different contexts
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {sentences.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <span className="text-sm font-medium">
                  {sentences.length} example sentence{sentences.length > 1 ? 's' : ''} generated
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-4">
              <AnimatePresence>
                {sentences.map((sentence, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {/* Korean sentence */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-lg font-medium text-gray-900">
                                {sentence.korean}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={getDifficultyColor(sentence.difficulty)}
                              >
                                {getDifficultyIcon(sentence.difficulty)} {sentence.difficulty}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlaySentence(sentence.korean)}
                                disabled={isPlaying === sentence.korean}
                                className="p-2"
                              >
                                {isPlaying === sentence.korean ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* English translation */}
                          <div className="pl-4 border-l-2 border-gray-200">
                            <p className="text-sm text-gray-600 italic">
                              {sentence.english}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        )}

        {!settings.enableContextSentences && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">
              Context sentence generation is currently disabled in settings.
            </p>
          </div>
        )}

        {(!settings.groqApiKey || settings.groqApiKey === 'your_groq_api_key_here') && settings.enableContextSentences && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Please set your Groq API key in the settings to enable this feature.
            </p>
          </div>
        )}

        {sentences.length === 0 && !isLoading && settings.enableContextSentences && settings.groqApiKey && settings.groqApiKey !== 'your_groq_api_key_here' && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Click "Generate" to create example sentences for this word
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
