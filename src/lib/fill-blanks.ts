import { Lesson, WordPair } from '@/types';

export interface FillBlanksQuestion {
  id: string;
  word: WordPair;
  sentence: string;
  blankPosition: number;
  options: string[];
  correctAnswer: string;
}

export interface FillBlanksSession {
  id: string;
  lessonId: string;
  questions: FillBlanksQuestion[];
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number;
}

export class FillBlanksService {
  /**
   * Create a new fill in the blanks session
   */
  static createSession(lesson: Lesson, questionCount: number = 10): FillBlanksSession {
    const questions = this.generateQuestions(lesson.words, questionCount);

    return {
      id: `fillblanks-${Date.now()}`,
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
   * Generate questions with sentences
   */
  private static generateQuestions(words: WordPair[], count: number): FillBlanksQuestion[] {
    const selectedWords = this.selectWords(words, count);

    return selectedWords.map((word, index) => {
      const sentence = this.generateSentence(word);
      const wrongOptions = this.generateWrongOptions(words, word.korean, 3);
      const options = this.shuffleArray([word.korean, ...wrongOptions]);

      return {
        id: `q-${index}`,
        word,
        sentence,
        blankPosition: sentence.indexOf('___'),
        options,
        correctAnswer: word.korean,
      };
    });
  }

  /**
   * Generate a simple sentence with the word
   */
  private static generateSentence(word: WordPair): string {
    const templates = [
      `나는 ___을/를 좋아해요. (I like ___)`,
      `이것은 ___입니다. (This is ___)`,
      `___을/를 알아요. (I know ___)`,
      `___이/가 좋아요. (I like ___)`,
      `___을/를 먹어요. (I eat ___)`,
      `___이/가 있어요. (I have ___)`,
      `___을/를 봐요. (I see ___)`,
      `___을/를 해요. (I do ___)`,
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    return randomTemplate;
  }

  /**
   * Submit an answer
   */
  static submitAnswer(
    session: FillBlanksSession,
    answer: string
  ): {
    isCorrect: boolean;
    updatedSession: FillBlanksSession;
  } {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    const updatedSession: FillBlanksSession = {
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
  static getStats(session: FillBlanksSession) {
    const total = session.correctAnswers + session.incorrectAnswers;
    const accuracy = total > 0 ? (session.correctAnswers / total) * 100 : 0;
    const xpEarned = session.correctAnswers * 20; // 20 XP per correct answer

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

