import { Lesson, WordPair } from '@/types';

export interface TypingChallengeWord {
  word: WordPair;
  startTime?: number;
  endTime?: number;
  isCorrect?: boolean;
  userAnswer?: string;
}

export interface TypingChallengeSession {
  id: string;
  lessonId: string;
  words: TypingChallengeWord[];
  currentWordIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalTimeSpent: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  mode: 'korean-to-english' | 'english-to-korean';
  wordsPerMinute: number;
}

export class TypingChallengeService {
  /**
   * Create a new typing challenge session
   */
  static createSession(
    lesson: Lesson,
    wordCount: number = 20,
    mode: 'korean-to-english' | 'english-to-korean' = 'english-to-korean'
  ): TypingChallengeSession {
    const selectedWords = this.selectWords(lesson.words, wordCount);
    const typingWords: TypingChallengeWord[] = selectedWords.map(word => ({ word }));

    return {
      id: `typing-${Date.now()}`,
      lessonId: lesson.id,
      words: typingWords,
      currentWordIndex: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      mode,
      wordsPerMinute: 0,
    };
  }

  /**
   * Start typing for current word
   */
  static startWord(session: TypingChallengeSession): TypingChallengeSession {
    const updatedWords = [...session.words];
    updatedWords[session.currentWordIndex] = {
      ...updatedWords[session.currentWordIndex],
      startTime: Date.now(),
    };

    return {
      ...session,
      words: updatedWords,
    };
  }

  /**
   * Submit answer for current word
   */
  static submitAnswer(
    session: TypingChallengeSession,
    userAnswer: string
  ): {
    isCorrect: boolean;
    correctAnswer: string;
    updatedSession: TypingChallengeSession;
    timeSpent: number;
  } {
    const currentWordData = session.words[session.currentWordIndex];
    const currentWord = currentWordData.word;
    
    // Get correct answer based on mode
    const correctAnswer = session.mode === 'korean-to-english' 
      ? currentWord.english.toLowerCase()
      : currentWord.korean;
    
    const isCorrect = session.mode === 'korean-to-english'
      ? userAnswer.trim().toLowerCase() === correctAnswer
      : userAnswer.trim() === correctAnswer;

    const endTime = Date.now();
    const startTime = currentWordData.startTime || endTime;
    const timeSpent = endTime - startTime;

    // Update current word
    const updatedWords = [...session.words];
    updatedWords[session.currentWordIndex] = {
      ...currentWordData,
      endTime,
      isCorrect,
      userAnswer,
    };

    const nextIndex = session.currentWordIndex + 1;
    const isCompleted = nextIndex >= session.words.length;
    const totalTimeSpent = session.totalTimeSpent + timeSpent;

    // Calculate WPM
    const minutesElapsed = totalTimeSpent / 60000;
    const wordsPerMinute = minutesElapsed > 0 
      ? Math.round(nextIndex / minutesElapsed) 
      : 0;

    const updatedSession: TypingChallengeSession = {
      ...session,
      words: updatedWords,
      currentWordIndex: nextIndex,
      correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
      incorrectAnswers: !isCorrect ? session.incorrectAnswers + 1 : session.incorrectAnswers,
      totalTimeSpent,
      wordsPerMinute,
      isCompleted,
      endTime: isCompleted ? new Date() : undefined,
    };

    return {
      isCorrect,
      correctAnswer,
      updatedSession,
      timeSpent,
    };
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
  static getStats(session: TypingChallengeSession) {
    const total = session.correctAnswers + session.incorrectAnswers;
    const accuracy = total > 0 ? (session.correctAnswers / total) * 100 : 0;
    const avgTimePerWord = total > 0 ? session.totalTimeSpent / total : 0;
    const baseXP = session.correctAnswers * 12;
    const speedBonus = session.wordsPerMinute > 30 ? 20 : session.wordsPerMinute > 20 ? 10 : 0;
    const xpEarned = baseXP + speedBonus;

    return {
      correctAnswers: session.correctAnswers,
      incorrectAnswers: session.incorrectAnswers,
      total,
      accuracy,
      wordsPerMinute: session.wordsPerMinute,
      avgTimePerWord: Math.round(avgTimePerWord),
      totalTimeSpent: session.totalTimeSpent,
      xpEarned,
    };
  }
}

