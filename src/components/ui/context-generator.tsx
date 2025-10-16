'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import { createGroqService } from '@/lib/groq';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';

interface ContextGeneratorProps {
  koreanWord: string;
  englishTranslation: string;
  onContextGenerated?: (context: string) => void;
  className?: string;
}

export function ContextGenerator({
  koreanWord,
  englishTranslation,
  onContextGenerated,
  className,
}: ContextGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextSentences, setContextSentences] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>('');

  const generateContext = async () => {
    const settings = StorageService.getSettings();
    
    if (!settings.groqApiKey) {
      toast.error('Please configure your Groq API key in settings to generate context sentences');
      return;
    }

    try {
      setIsGenerating(true);
      const groqService = createGroqService(settings.groqApiKey);
      const sentences = await groqService.generateMultipleContextSentences(koreanWord, englishTranslation, 3);
      
      setContextSentences(sentences);
      if (sentences.length > 0) {
        setSelectedContext(sentences[0]);
        onContextGenerated?.(sentences[0]);
      }
      
      toast.success('Context sentences generated successfully!');
    } catch (error) {
      console.error('Context generation error:', error);
      toast.error('Failed to generate context sentences. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContextSelect = (context: string) => {
    setSelectedContext(context);
    onContextGenerated?.(context);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          Context Sentences
        </CardTitle>
        <CardDescription>
          Generate example sentences using "{koreanWord}" to better understand its usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generateContext}
          disabled={isGenerating}
          className="w-full"
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Context Sentences
            </>
          )}
        </Button>

        {contextSentences.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Choose a context sentence:</h4>
            <div className="space-y-2">
              {contextSentences.map((sentence, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedContext === sentence
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleContextSelect(sentence)}
                >
                  <p className="text-sm font-medium text-gray-900">{sentence}</p>
                </div>
              ))}
            </div>
            
            {selectedContext && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {selectedContext}
                </p>
              </div>
            )}
          </div>
        )}

        {contextSentences.length === 0 && !isGenerating && (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click the button above to generate context sentences</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
