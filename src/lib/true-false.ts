import { Lesson, WordPair } from '@/types';

export interface TrueFalseQuestion {
  id: string;
  word: WordPair;
  displayedWord: string; // Korean word shown
  displayedTranslation: string; // English translation shown (might be wrong)
  isTrue: boolean; // Is the translation correct?
  correctTranslation: string; // The actual correct translation
}

export interface TrueFalseSession {
  id: string;
  lessonId: string;
  questions: TrueFalseQuestion[];
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  maxStreak: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number;
}

export class TrueFalseService {
  /**
   * Create a new true/false session
   */
  static createSession(lesson: Lesson, questionCount: number = 20): TrueFalseSession {
    const questions = this.generateQuestions(lesson.words, questionCount);

    return {
      id: `truefalse-${Date.now()}`,
      lessonId: lesson.id,
      questions,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      maxStreak: 0,
      startTime: new Date(),
      isCompleted: false,
    };
  }

  /**
   * Generate true/false questions
   */
  private static generateQuestions(words: WordPair[], count: number): TrueFalseQuestion[] {
    const selectedWords = this.selectWords(words, count);
    
    return selectedWords.map((word, index) => {
      // 50% chance of being true
      const isTrue = Math.random() > 0.5;
      
      let displayedTranslation: string;
      if (isTrue) {
        displayedTranslation = word.english;
      } else {
        // Pick a random wrong translation
        const wrongWord = this.getRandomDifferentWord(words, word);
        displayedTranslation = wrongWord.english;
      }

      return {
        id: `q-${index}`,
        word,
        displayedWord: word.korean,
        displayedTranslation,
        isTrue,
        correctTranslation: word.english,
      };
    });
  }

  /**
   * Submit an answer (true or false)
   */
  static submitAnswer(
    session: TrueFalseSession,
    userAnswerIsTrue: boolean
  ): {
    isCorrect: boolean;
    updatedSession: TrueFalseSession;
  } {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = userAnswerIsTrue === currentQuestion.isTrue;

    const newStreak = isCorrect ? session.streak + 1 : 0;
    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    const updatedSession: TrueFalseSession = {
      ...session,
      currentQuestionIndex: nextIndex,
      correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
      incorrectAnswers: !isCorrect ? session.incorrectAnswers + 1 : session.incorrectAnswers,
      streak: newStreak,
      maxStreak: Math.max(session.maxStreak, newStreak),
      isCompleted,
      endTime: isCompleted ? new Date() : undefined,
      timeSpent: isCompleted
        ? Math.floor((Date.now() - session.startTime.getTime()) / 1000)
        : undefined,
    };

    return { isCorrect, updatedSession };
  }

  /**
   * Get a random word that's different from the given word
   */
  private static getRandomDifferentWord(words: WordPair[], currentWord: WordPair): WordPair {
    const differentWords = words.filter(w => w.id !== currentWord.id);
    if (differentWords.length === 0) return currentWord;
    
    const randomIndex = Math.floor(Math.random() * differentWords.length);
    return differentWords[randomIndex];
  }

  /**
   * Select random words
   */
  private static selectWords(words: WordPair[], count: number): WordPair[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
  }

  /**
   * Get game statistics
   */
  static getStats(session: TrueFalseSession) {
    const total = session.correctAnswers + session.incorrectAnswers;
    const accuracy = total > 0 ? (session.correctAnswers / total) * 100 : 0;
    
    // Base XP + streak bonus
    const baseXP = session.correctAnswers * 8;
    const streakBonus = session.maxStreak * 2;
    const xpEarned = baseXP + streakBonus;

    return {
      correctAnswers: session.correctAnswers,
      incorrectAnswers: session.incorrectAnswers,
      total,
      accuracy,
      maxStreak: session.maxStreak,
      timeSpent: session.timeSpent || 0,
      xpEarned,
    };
  }
}

