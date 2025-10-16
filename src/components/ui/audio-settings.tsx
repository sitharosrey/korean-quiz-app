'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Play, Settings } from 'lucide-react';
import { audioService } from '@/lib/audio';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';

interface AudioSettingsProps {
  className?: string;
}

export function AudioSettings({ className }: AudioSettingsProps) {
  const [rate, setRate] = useState(0.7);
  const [pitch, setPitch] = useState(1.1);
  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState('안녕하세요');

  useEffect(() => {
    const settings = StorageService.getSettings();
    setRate(settings.audioRate);
    setPitch(settings.audioPitch);
    setVolume(settings.audioVolume);
  }, []);

  const handleTestAudio = async () => {
    if (!audioService) {
      toast.error('Audio not supported in this browser');
      return;
    }

    setIsPlaying(true);
    try {
      // Update audio service with current settings
      audioService.updateSettings({ rate, pitch, volume });
      await audioService.speakKorean(testText);
    } catch (error) {
      console.error('Audio test error:', error);
      toast.error('Failed to play test audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSaveSettings = () => {
    const settings = StorageService.getSettings();
    const updatedSettings = {
      ...settings,
      audioRate: rate,
      audioPitch: pitch,
      audioVolume: volume,
    };
    StorageService.saveSettings(updatedSettings);
    
    if (audioService) {
      audioService.updateSettings({ rate, pitch, volume });
    }
    
    toast.success('Audio settings saved!');
  };

  const handleResetSettings = () => {
    setRate(0.7);
    setPitch(1.1);
    setVolume(1.0);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-500" />
          Audio Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Audio */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            Test Text
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter Korean text to test"
            />
            <Button
              onClick={handleTestAudio}
              disabled={isPlaying || !testText.trim()}
              size="sm"
              variant="outline"
            >
              {isPlaying ? (
                <Settings className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Rate Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Speech Rate
            </label>
            <span className="text-sm text-gray-500">{rate.toFixed(1)}x</span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={(value) => setRate(value[0])}
            min={0.3}
            max={1.5}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Pitch
            </label>
            <span className="text-sm text-gray-500">{pitch.toFixed(1)}</span>
          </div>
          <Slider
            value={[pitch]}
            onValueChange={(value) => setPitch(value[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Volume
            </label>
            <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            min={0.1}
            max={1.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSaveSettings} className="flex-1">
            Save Settings
          </Button>
          <Button onClick={handleResetSettings} variant="outline">
            Reset
          </Button>
        </div>

        {/* Tips */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Audio Tips</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Slower rate (0.5-0.8) helps with pronunciation learning</li>
            <li>• Higher pitch (1.1-1.3) can improve clarity</li>
            <li>• Test different settings to find what works best for you</li>
            <li>• Korean voices work best with these optimized settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
