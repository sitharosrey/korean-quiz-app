import { Lesson, WordPair } from '@/types';

export interface SpeedQuizQuestion {
  id: string;
  word: WordPair;
  options: string[];
  correctAnswer: string;
  question: string;
}

export interface SpeedQuizSession {
  id: string;
  lessonId: string;
  questions: SpeedQuizQuestion[];
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  maxStreak: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number;
  timeLimit: number; // seconds per question
}

export class SpeedQuizService {
  /**
   * Create a new speed quiz session
   */
  static createSession(
    lesson: Lesson,
    questionCount: number = 15,
    timeLimit: number = 10
  ): SpeedQuizSession {
    const questions = this.generateQuestions(lesson.words, questionCount);

    return {
      id: `speed-quiz-${Date.now()}`,
      lessonId: lesson.id,
      questions,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      maxStreak: 0,
      startTime: new Date(),
      isCompleted: false,
      timeLimit,
    };
  }

  /**
   * Generate questions for the quiz
   */
  private static generateQuestions(
    words: WordPair[],
    count: number
  ): SpeedQuizQuestion[] {
    const selectedWords = this.selectWords(words, count);

    return selectedWords.map((word, index) => {
      const isKoreanToEnglish = Math.random() > 0.5;
      const wrongOptions = this.generateWrongOptions(
        words,
        isKoreanToEnglish ? word.english : word.korean,
        3
      );
      const options = this.shuffleArray([
        isKoreanToEnglish ? word.english : word.korean,
        ...wrongOptions,
      ]);

      return {
        id: `q-${index}`,
        word,
        options,
        correctAnswer: isKoreanToEnglish ? word.english : word.korean,
        question: isKoreanToEnglish ? word.korean : word.english,
      };
    });
  }

  /**
   * Submit an answer
   */
  static submitAnswer(
    session: SpeedQuizSession,
    answer: string,
    timeSpent: number
  ): {
    isCorrect: boolean;
    updatedSession: SpeedQuizSession;
    bonusPoints: number;
  } {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Calculate bonus points for speed
    const speedBonus = timeSpent < session.timeLimit * 0.5 ? 5 : 0;
    const streakBonus = isCorrect && session.streak >= 5 ? 10 : 0;

    const newStreak = isCorrect ? session.streak + 1 : 0;
    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    const updatedSession: SpeedQuizSession = {
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

    return {
      isCorrect,
      updatedSession,
      bonusPoints: speedBonus + streakBonus,
    };
  }

  /**
   * Generate wrong options
   */
  private static generateWrongOptions(
    words: WordPair[],
    correctAnswer: string,
    count: number
  ): string[] {
    const isKorean = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(correctAnswer);
    const wrongOptions = words
      .filter(w => (isKorean ? w.korean : w.english) !== correctAnswer)
      .map(w => (isKorean ? w.korean : w.english))
      .filter((option, index, array) => array.indexOf(option) === index);

    return this.shuffleArray(wrongOptions).slice(0, count);
  }

  /**
   * Select random words
   */
  private static selectWords(words: WordPair[], count: number): WordPair[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
  }

  /**
   * Shuffle array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get game statistics
   */
  static getStats(session: SpeedQuizSession) {
    const total = session.correctAnswers + session.incorrectAnswers;
    const accuracy = total > 0 ? (session.correctAnswers / total) * 100 : 0;
    const baseXP = session.correctAnswers * 10;
    const streakBonus = session.maxStreak * 5;
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

