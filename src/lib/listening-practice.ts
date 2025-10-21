import { Lesson, WordPair } from '@/types';

export interface ListeningQuestion {
  id: string;
  word: WordPair;
  options: string[];
  correctAnswer: string;
}

export interface ListeningPracticeSession {
  id: string;
  lessonId: string;
  questions: ListeningQuestion[];
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number;
}

export class ListeningPracticeService {
  /**
   * Create a new listening practice session
   */
  static createSession(lesson: Lesson, questionCount: number = 15): ListeningPracticeSession {
    const questions = this.generateQuestions(lesson.words, questionCount);

    return {
      id: `listening-${Date.now()}`,
      lessonId: lesson.id,
      questions,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: new Date(),
      isCompleted: false,
    };
  }

  /**
   * Generate questions for the session
   */
  private static generateQuestions(words: WordPair[], count: number): ListeningQuestion[] {
    const selectedWords = this.selectWords(words, count);

    return selectedWords.map((word, index) => {
      const wrongOptions = this.generateWrongOptions(words, word.korean, 3);
      const options = this.shuffleArray([word.korean, ...wrongOptions]);

      return {
        id: `q-${index}`,
        word,
        options,
        correctAnswer: word.korean,
      };
    });
  }

  /**
   * Submit an answer
   */
  static submitAnswer(
    session: ListeningPracticeSession,
    answer: string
  ): {
    isCorrect: boolean;
    updatedSession: ListeningPracticeSession;
  } {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    const updatedSession: ListeningPracticeSession = {
      ...session,
      currentQuestionIndex: nextIndex,
      correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
      incorrectAnswers: !isCorrect ? session.incorrectAnswers + 1 : session.incorrectAnswers,
      isCompleted,
      endTime: isCompleted ? new Date() : undefined,
      timeSpent: isCompleted
        ? Math.floor((Date.now() - session.startTime.getTime()) / 1000)
        : undefined,
    };

    return { isCorrect, updatedSession };
  }

  /**
   * Generate wrong options
   */
  private static generateWrongOptions(words: WordPair[], correctAnswer: string, count: number): string[] {
    const wrongOptions = words
      .filter(w => w.korean !== correctAnswer)
      .map(w => w.korean)
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
  static getStats(session: ListeningPracticeSession) {
    const total = session.correctAnswers + session.incorrectAnswers;
    const accuracy = total > 0 ? (session.correctAnswers / total) * 100 : 0;
    const xpEarned = session.correctAnswers * 15; // 15 XP per correct answer

    return {
      correctAnswers: session.correctAnswers,
      incorrectAnswers: session.incorrectAnswers,
      total,
      accuracy,
      timeSpent: session.timeSpent || 0,
      xpEarned,
    };
  }
}

