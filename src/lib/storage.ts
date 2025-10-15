import { Lesson, AppSettings } from '@/types';

const STORAGE_KEYS = {
  LESSONS: 'korean-flashcard-lessons',
  SETTINGS: 'korean-flashcard-settings',
} as const;

export class StorageService {
  // Lessons
  static getLessons(): Lesson[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (!stored) return [];
      
      const lessons = JSON.parse(stored);
      return lessons.map((lesson: Lesson) => ({
        ...lesson,
        createdAt: new Date(lesson.createdAt),
        updatedAt: new Date(lesson.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading lessons:', error);
      return [];
    }
  }

  static saveLessons(lessons: Lesson[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch (error) {
      console.error('Error saving lessons:', error);
    }
  }

  static addLesson(lesson: Lesson): void {
    const lessons = this.getLessons();
    lessons.push(lesson);
    this.saveLessons(lessons);
  }

  static updateLesson(updatedLesson: Lesson): void {
    const lessons = this.getLessons();
    const index = lessons.findIndex(l => l.id === updatedLesson.id);
    if (index !== -1) {
      lessons[index] = { ...updatedLesson, updatedAt: new Date() };
      this.saveLessons(lessons);
    }
  }

  static deleteLesson(lessonId: string): void {
    const lessons = this.getLessons();
    const filtered = lessons.filter(l => l.id !== lessonId);
    this.saveLessons(filtered);
  }

  // Settings
  static getSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      groqApiKey: undefined,
      defaultLanguage: 'korean' as const,
      quizMode: 'english-to-korean' as const,
      questionsPerQuiz: 10,
    };

    if (typeof window === 'undefined') {
      return defaultSettings;
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      let settings = defaultSettings;
      
      if (stored) {
        settings = { ...defaultSettings, ...JSON.parse(stored) };
      }
      
      // Check for environment variable API key if not set in localStorage
      // Prioritize NEXT_PUBLIC_GROQ_API_KEY for client-side access
      if (!settings.groqApiKey && process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        console.log('Loading API key from NEXT_PUBLIC_GROQ_API_KEY environment variable');
        settings.groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      }
      // Fallback to GROQ_API_KEY (server-side only)
      if (!settings.groqApiKey && process.env.GROQ_API_KEY) {
        console.log('Loading API key from GROQ_API_KEY environment variable');
        settings.groqApiKey = process.env.GROQ_API_KEY;
      }
      
      // Debug logging
      console.log('API Key loaded:', settings.groqApiKey ? 'Yes (length: ' + settings.groqApiKey.length + ')' : 'No');
      
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  static saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}
