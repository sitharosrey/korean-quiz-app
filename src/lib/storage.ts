import { Lesson, AppSettings, UserProgress, MatchGameSession, WordPair, SPACED_REPETITION_INTERVALS } from '@/types';

const STORAGE_KEYS = {
  LESSONS: 'korean-flashcard-lessons',
  SETTINGS: 'korean-flashcard-settings',
  PROGRESS: 'korean-flashcard-progress',
  MATCH_GAMES: 'korean-flashcard-match-games',
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
        words: lesson.words.map((word: WordPair) => ({
          ...word,
          nextReviewDate: new Date(word.nextReviewDate),
          lastReviewed: word.lastReviewed ? new Date(word.lastReviewed) : undefined,
        })),
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
      quizMode: 'multiple-choice' as const,
      quizDirection: 'korean-to-english' as const,
      questionsPerQuiz: 10,
      enableSpacedRepetition: true,
      enablePronunciation: true,
      enableContextSentences: true,
      enableImages: true,
      autoFetchImages: false,
      audioRate: 0.8,
      audioPitch: 1.0,
      audioVolume: 1.0,
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

  // Progress tracking
  static getProgress(): UserProgress {
    const defaultProgress: UserProgress = {
      totalXP: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalWordsLearned: 0,
      totalQuizzesCompleted: 0,
      totalTimeSpent: 0,
      // Enhanced progress tracking
      wordsMastered: 0,
      dailyGoal: 10,
      weeklyGoal: 50,
      achievements: [],
    };

    if (typeof window === 'undefined') return defaultProgress;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!stored) return defaultProgress;
      
      const progress = JSON.parse(stored);
      
      return {
        ...defaultProgress,
        ...progress,
        lastStudyDate: progress.lastStudyDate ? new Date(progress.lastStudyDate) : undefined,
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      return defaultProgress;
    }
  }

  static saveProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  // Match game sessions
  static getMatchGameSessions(): MatchGameSession[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MATCH_GAMES);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: MatchGameSession) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
    } catch (error) {
      console.error('Error loading match game sessions:', error);
      return [];
    }
  }

  static saveMatchGameSessions(sessions: MatchGameSession[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.MATCH_GAMES, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving match game sessions:', error);
    }
  }

  static addMatchGameSession(session: MatchGameSession): void {
    const sessions = this.getMatchGameSessions();
    sessions.push(session);
    this.saveMatchGameSessions(sessions);
  }

  // Utility methods for spaced repetition
  static createNewWordPair(korean: string, english: string, imageUrl?: string): WordPair {
    return {
      id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      korean,
      english,
      imageUrl,
      difficulty: 0,
      nextReviewDate: new Date(), // Review immediately for new words
      reviewCount: 0,
      correctStreak: 0,
      // Enhanced SRS fields
      level: 0,
      nextReview: new Date(),
      totalXP: 0,
    };
  }

  static updateWordDifficulty(word: WordPair, isCorrect: boolean): WordPair {
    const updatedWord = { ...word };
    
    if (isCorrect) {
      updatedWord.correctStreak += 1;
      updatedWord.difficulty = Math.min(5, updatedWord.difficulty + 1);
    } else {
      updatedWord.correctStreak = 0;
      updatedWord.difficulty = Math.max(0, updatedWord.difficulty - 1);
    }
    
    updatedWord.reviewCount += 1;
    updatedWord.lastReviewed = new Date();
    
    // Calculate next review date based on difficulty
    const intervalIndex = Math.min(updatedWord.difficulty, SPACED_REPETITION_INTERVALS.length - 1);
    const daysToAdd = SPACED_REPETITION_INTERVALS[intervalIndex];
    updatedWord.nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    
    return updatedWord;
  }

  static getWordsForReview(lessons: Lesson[]): WordPair[] {
    const now = new Date();
    const wordsForReview: WordPair[] = [];
    
    lessons.forEach(lesson => {
      lesson.words.forEach(word => {
        if (word.nextReviewDate <= now) {
          wordsForReview.push(word);
        }
      });
    });
    
    return wordsForReview;
  }
}
