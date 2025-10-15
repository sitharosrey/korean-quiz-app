export interface WordPair {
  id: string;
  korean: string;
  english: string;
}

export interface Lesson {
  id: string;
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

export interface AppSettings {
  groqApiKey?: string;
  defaultLanguage: 'korean' | 'english';
  quizMode: 'korean-to-english' | 'english-to-korean';
  questionsPerQuiz: number;
}
