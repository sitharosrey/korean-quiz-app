'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppSettings } from '@/types';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';
import { Save, Key, Globe, Brain, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    groqApiKey: '',
    defaultLanguage: 'korean',
    quizMode: 'english-to-korean',
    questionsPerQuiz: 10,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const storedSettings = StorageService.getSettings();
    setSettings(storedSettings);
    setIsLoading(false);
  };

  const saveSettings = () => {
    StorageService.saveSettings(settings);
    toast.success('Settings saved successfully');
  };

  const handleApiKeyChange = (value: string) => {
    setSettings(prev => ({ ...prev, groqApiKey: value }));
  };

  const handleDefaultLanguageChange = (value: 'korean' | 'english') => {
    setSettings(prev => ({ ...prev, defaultLanguage: value }));
  };

  const handleQuizModeChange = (value: 'korean-to-english' | 'english-to-korean') => {
    setSettings(prev => ({ ...prev, quizMode: value }));
  };

  const handleQuestionsPerQuizChange = (value: string) => {
    setSettings(prev => ({ ...prev, questionsPerQuiz: parseInt(value) }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-blue-500" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure your Korean Flashcard Trainer preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Groq API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                Groq API Configuration
              </CardTitle>
              <CardDescription>
                Set up your Groq API key for OCR and translation features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium text-gray-700">
                  Groq API Key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Groq API key"
                  value={settings.groqApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Get your API key from{' '}
                  <a 
                    href="https://console.groq.com/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Groq Console
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Language Preferences
              </CardTitle>
              <CardDescription>
                Set your default language and quiz preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Default Language</label>
                <Select 
                  value={settings.defaultLanguage} 
                  onValueChange={handleDefaultLanguageChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="korean">Korean</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Default Quiz Mode</label>
                <Select 
                  value={settings.quizMode} 
                  onValueChange={handleQuizModeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english-to-korean">English → Korean</SelectItem>
                    <SelectItem value="korean-to-english">Korean → English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Quiz Configuration
              </CardTitle>
              <CardDescription>
                Customize your quiz experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Default Questions per Quiz</label>
                <Select 
                  value={settings.questionsPerQuiz.toString()} 
                  onValueChange={handleQuestionsPerQuizChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                    <SelectItem value="15">15 questions</SelectItem>
                    <SelectItem value="20">20 questions</SelectItem>
                    <SelectItem value="25">25 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} size="lg" className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Settings
            </Button>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">About Groq API</h3>
              <p className="text-blue-700 text-sm mb-3">
                The Groq API is used for OCR (Optical Character Recognition) to extract Korean text from images 
                and for automatic translation. This feature allows you to upload images containing Korean text 
                and automatically create flashcards.
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Free tier available with generous limits</li>
                <li>• Fast and accurate Korean text recognition</li>
                <li>• Automatic translation to English</li>
                <li>• Secure - API key stored locally in your browser</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
