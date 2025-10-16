export interface WordPair {
  id: string;
  korean: string;
  english: string;
  imageUrl?: string;
  contextSentence?: string;
  // Spaced repetition data
  difficulty: number; // 0-5 scale (0 = new, 5 = mastered)
  nextReviewDate: Date;
  reviewCount: number;
  correctStreak: number;
  lastReviewed?: Date;
  // Enhanced SRS fields
  level: number; // 0-7 (0 = new, 7 = mastered)
  nextReview: Date;
  totalXP: number;
}

export interface Lesson {
  id: string;
  userId: string; // Link to user account
  name: string;
  words: WordPair[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  english: string;
  correctKorean: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizSession {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  currentQuestionIndex: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

export interface GroqOCRResponse {
  koreanText: string;
  englishTranslation?: string;
  confidence: number;
}

export type QuizMode = 'multiple-choice' | 'typing' | 'dictation';
export type QuizDirection = 'korean-to-english' | 'english-to-korean';

export interface AppSettings {
  groqApiKey?: string;
  defaultLanguage: 'korean' | 'english';
  quizMode: QuizMode;
  quizDirection: QuizDirection;
  questionsPerQuiz: number;
  // New settings for enhanced features
  enableSpacedRepetition: boolean;
  enablePronunciation: boolean;
  enableContextSentences: boolean;
  enableImages: boolean;
  autoFetchImages: boolean;
  // Audio settings
  audioRate: number;
  audioPitch: number;
  audioVolume: number;
}

// User Account System
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  password: string; // Store password for demo purposes
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ko';
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    studyReminders: boolean;
  };
}

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: Date;
  isActive: boolean;
}

// Progress tracking
export interface UserProgress {
  userId: string; // Link to user account
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  totalWordsLearned: number;
  totalQuizzesCompleted: number;
  totalTimeSpent: number; // in minutes
  // Enhanced progress tracking
  wordsMastered: number;
  dailyGoal: number;
  weeklyGoal: number;
  achievements: string[];
}

// Quiz question types
export interface TypingQuestion {
  id: string;
  type: 'typing';
  question: string; // English word
  answer: string; // Korean word
  hints?: string[];
}

export interface DictationQuestion {
  id: string;
  type: 'dictation';
  audioText: string; // Korean word to be spoken
  answer: string; // Korean word to type
  hints?: string[];
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple-choice';
  question: string;
  correctAnswer: string;
  options: string[];
}

export type QuizQuestion = TypingQuestion | DictationQuestion | MultipleChoiceQuestion;

// Sentence practice
export interface KoreanSentence {
  id: string;
  korean: string;
  english: string;
  wordId: string; // ID of the word this sentence demonstrates
  difficulty: 'easy' | 'medium' | 'hard';
}

// Match the Pairs game
export interface MatchGameCard {
  id: string;
  content: string;
  type: 'korean' | 'english';
  wordId: string;
  isMatched: boolean;
  isFlipped: boolean;
}

export interface MatchGameSession {
  id: string;
  lessonId: string;
  cards: MatchGameCard[];
  matchedPairs: number;
  totalPairs: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number; // in seconds
  excludedWord?: WordPair; // Word that couldn't be paired (odd number of words)
}

// Spaced repetition intervals (in days)
export const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const;
