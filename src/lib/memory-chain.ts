import { Lesson, WordPair } from '@/types';

export interface MemoryChainRound {
  id: string;
  words: WordPair[];
  sequence: string[]; // Korean words to remember
  userAnswer: string[];
  isCorrect?: boolean;
}

export interface MemoryChainSession {
  id: string;
  lessonId: string;
  rounds: MemoryChainRound[];
  currentRoundIndex: number;
  correctRounds: number;
  incorrectRounds: number;
  currentSequenceLength: number;
  maxSequenceLength: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  timeSpent?: number;
}

export class MemoryChainService {
  /**
   * Create a new memory chain session
   */
  static createSession(lesson: Lesson, startingLength: number = 3, rounds: number = 8): MemoryChainSession {
    const allWords = [...lesson.words];
    const generatedRounds = this.generateRounds(allWords, startingLength, rounds);

    return {
      id: `memory-${Date.now()}`,
      lessonId: lesson.id,
      rounds: generatedRounds,
      currentRoundIndex: 0,
      correctRounds: 0,
      incorrectRounds: 0,
      currentSequenceLength: startingLength,
      maxSequenceLength: startingLength,
      startTime: new Date(),
      isCompleted: false,
    };
  }

  /**
   * Generate rounds with increasing difficulty
   */
  private static generateRounds(words: WordPair[], startingLength: number, roundCount: number): MemoryChainRound[] {
    const rounds: MemoryChainRound[] = [];
    let currentLength = startingLength;

    for (let i = 0; i < roundCount; i++) {
      const selectedWords = this.selectRandomWords(words, currentLength);
      const sequence = selectedWords.map(w => w.korean);

      rounds.push({
        id: `round-${i}`,
        words: selectedWords,
        sequence,
        userAnswer: [],
      });

      // Increase difficulty every 2 rounds
      if ((i + 1) % 2 === 0) {
        currentLength = Math.min(currentLength + 1, words.length);
      }
    }

    return rounds;
  }

  /**
   * Submit answer for current round
   */
  static submitAnswer(
    session: MemoryChainSession,
    userAnswer: string[]
  ): {
    isCorrect: boolean;
    correctSequence: string[];
    updatedSession: MemoryChainSession;
  } {
    const currentRound = session.rounds[session.currentRoundIndex];
    const correctSequence = currentRound.sequence;
    
    // Check if answers match
    const isCorrect = this.checkSequence(userAnswer, correctSequence);

    // Update round
    const updatedRounds = [...session.rounds];
    updatedRounds[session.currentRoundIndex] = {
      ...currentRound,
      userAnswer,
      isCorrect,
    };

    const nextIndex = session.currentRoundIndex + 1;
    const isCompleted = nextIndex >= session.rounds.length;
    
    // Update max sequence length achieved
    const newMaxLength = isCorrect && currentRound.sequence.length > session.maxSequenceLength
      ? currentRound.sequence.length
      : session.maxSequenceLength;

    const updatedSession: MemoryChainSession = {
      ...session,
      rounds: updatedRounds,
      currentRoundIndex: nextIndex,
      correctRounds: isCorrect ? session.correctRounds + 1 : session.correctRounds,
      incorrectRounds: !isCorrect ? session.incorrectRounds + 1 : session.incorrectRounds,
      currentSequenceLength: isCompleted ? session.currentSequenceLength : currentRound.sequence.length,
      maxSequenceLength: newMaxLength,
      isCompleted,
      endTime: isCompleted ? new Date() : undefined,
      timeSpent: isCompleted
        ? Math.floor((Date.now() - session.startTime.getTime()) / 1000)
        : undefined,
    };

    return { isCorrect, correctSequence, updatedSession };
  }

  /**
   * Check if user sequence matches correct sequence
   */
  private static checkSequence(userAnswer: string[], correctSequence: string[]): boolean {
    if (userAnswer.length !== correctSequence.length) return false;
    
    return userAnswer.every((answer, index) => 
      answer.trim() === correctSequence[index]
    );
  }

  /**
   * Select random words without duplicates
   */
  private static selectRandomWords(words: WordPair[], count: number): WordPair[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, words.length));
  }

  /**
   * Get game statistics
   */
  static getStats(session: MemoryChainSession) {
    const total = session.correctRounds + session.incorrectRounds;
    const accuracy = total > 0 ? (session.correctRounds / total) * 100 : 0;
    const xpEarned = session.correctRounds * 25; // 25 XP per correct round

    return {
      correctRounds: session.correctRounds,
      incorrectRounds: session.incorrectRounds,
      total,
      accuracy,
      maxSequenceLength: session.maxSequenceLength,
      timeSpent: session.timeSpent || 0,
      xpEarned,
    };
  }
}

