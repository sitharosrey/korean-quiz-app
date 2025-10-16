'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { pronunciationService } from '@/lib/pronunciation';
import { cn } from '@/lib/utils';

interface PronunciationButtonProps {
  text: string;
  language?: 'korean' | 'english';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export function PronunciationButton({
  text,
  language = 'korean',
  size = 'sm',
  variant = 'ghost',
  className,
  disabled = false,
}: PronunciationButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const handleSpeak = async () => {
    if (!pronunciationService || !pronunciationService.isSupported()) {
      setIsSupported(false);
      return;
    }

    try {
      setIsSpeaking(true);
      if (language === 'korean') {
        await pronunciationService.speakKorean(text);
      } else {
        await pronunciationService.speakEnglish(text);
      }
    } catch (error) {
      console.error('Pronunciation error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (pronunciationService) {
      pronunciationService.stop();
    }
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-8 w-8 p-0',
    md: 'h-10 w-10 p-0',
    lg: 'h-12 w-12 p-0',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={isSpeaking ? handleStop : handleSpeak}
      disabled={disabled || !text.trim()}
      className={cn(
        sizeClasses[size],
        'transition-all duration-200',
        isSpeaking && 'animate-pulse',
        className
      )}
      title={isSpeaking ? 'Stop pronunciation' : `Pronounce "${text}"`}
    >
      {isSpeaking ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </Button>
  );
}
