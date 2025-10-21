import { Lesson, WordPair } from '@/types';

export interface WordScrambleSession {
  id: string;
  lessonId: string;
  words: WordPair[];
  currentWordIndex: number;
  scrambledWord: string;
  originalWord: string;
  correctAnswers: number;
  incorrectAnswers: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number;
  hints: string[];
}

export class WordScrambleService {
  /**
   * Create a new word scramble session
   */
  static createSession(lesson: Lesson, wordCount: number = 10): WordScrambleSession {
    const selectedWords = this.selectWords(lesson.words, wordCount);
    const firstWord = selectedWords[0];
    const scrambled = this.scrambleWord(firstWord.korean);

    return {
      id: `scramble-${Date.now()}`,
      lessonId: lesson.id,
      words: selectedWords,
      currentWordIndex: 0,
      scrambledWord: scrambled,
      originalWord: firstWord.korean,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: new Date(),
      isCompleted: false,
      hints: this.generateHints(firstWord),
    };
  }

  /**
   * Scramble a Korean word
   */
  static scrambleWord(word: string): string {
    const chars = word.split('');
    
    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    // Make sure it's actually scrambled (not the same as original)
    const scrambled = chars.join('');
    if (scrambled === word && word.length > 1) {
      // If it's the same, swap first two characters
      [chars[0], chars[1]] = [chars[1], chars[0]];
      return chars.join('');
    }
    
    return scrambled;
  }

  /**
   * Check if the answer is correct
   */
  static checkAnswer(session: WordScrambleSession, userAnswer: string): {
    isCorrect: boolean;
    updatedSession: WordScrambleSession;
  } {
    const currentWord = session.words[session.currentWordIndex];
    const isCorrect = userAnswer.trim() === currentWord.korean;

    const updatedSession = {
      ...session,
      correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
      incorrectAnswers: !isCorrect ? session.incorrectAnswers + 1 : session.incorrectAnswers,
    };

    return { isCorrect, updatedSession };
  }

  /**
   * Move to next word
   */
  static nextWord(session: WordScrambleSession): WordScrambleSession {
    const nextIndex = session.currentWordIndex + 1;
    const isCompleted = nextIndex >= session.words.length;

    if (isCompleted) {
      return {
        ...session,
        currentWordIndex: nextIndex,
        isCompleted: true,
        endTime: new Date(),
        timeSpent: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
      };
    }

    const nextWord = session.words[nextIndex];
    const scrambled = this.scrambleWord(nextWord.korean);

    return {
      ...session,
      currentWordIndex: nextIndex,
      scrambledWord: scrambled,
      originalWord: nextWord.korean,
      hints: this.generateHints(nextWord),
    };
  }

  /**
   * Generate hints for a word
   */
  private static generateHints(word: WordPair): string[] {
    return [
      `English: ${word.english}`,
      `Length: ${word.korean.length} characters`,
      `First character: ${word.korean[0]}`,
    ];
  }

  /**
   * Select random words from lesson
   */
  private static selectWords(words: WordPair[], count: number): WordPair[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
  }

  /**
   * Get game statistics
   */
  static getStats(session: WordScrambleSession) {
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

