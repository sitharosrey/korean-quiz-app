import { Lesson, WordPair } from '@/types';

export interface FlashcardQuestion {
  id: string;
  wordPair: WordPair;
  front: string; // What's shown initially
  back: string; // What's shown when flipped
  imageUrl?: string;
}

export interface FlashcardSession {
  id: string;
  lessonId: string;
  lessonIds?: string[]; // Support for multiple lessons
  cards: FlashcardQuestion[];
  currentCardIndex: number;
  correctCount: number;
  incorrectCount: number;
  direction: 'korean-to-english' | 'english-to-korean';
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  reviewedCards: {
    cardId: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface FlashcardStats {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  xpEarned: number;
  timeSpent: number;
}

export class FlashcardService {
  /**
   * Create a new flashcard session
   */
  static createSession(
    lesson: Lesson,
    direction: 'korean-to-english' | 'english-to-korean' = 'korean-to-english',
    cardCount?: number
  ): FlashcardSession {
    // Shuffle and limit cards
    const shuffledWords = [...lesson.words].sort(() => Math.random() - 0.5);
    const selectedWords = cardCount 
      ? shuffledWords.slice(0, Math.min(cardCount, shuffledWords.length))
      : shuffledWords;

    const cards: FlashcardQuestion[] = selectedWords.map(word => ({
      id: `card-${word.id}-${Date.now()}-${Math.random()}`,
      wordPair: word,
      front: direction === 'korean-to-english' ? word.korean : word.english,
      back: direction === 'korean-to-english' ? word.english : word.korean,
      imageUrl: word.imageUrl,
    }));

    return {
      id: `flashcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lessonId: lesson.id,
      cards,
      currentCardIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      direction,
      startTime: new Date(),
      isCompleted: false,
      reviewedCards: [],
    };
  }

  /**
   * Mark current card as correct and move to next
   */
  static markCorrect(session: FlashcardSession, timeSpent: number): FlashcardSession {
    const currentCard = session.cards[session.currentCardIndex];
    
    const updatedSession = {
      ...session,
      correctCount: session.correctCount + 1,
      reviewedCards: [
        ...session.reviewedCards,
        {
          cardId: currentCard.id,
          isCorrect: true,
          timeSpent,
        },
      ],
    };

    return this.advanceToNextCard(updatedSession);
  }

  /**
   * Mark current card as incorrect and move to next
   */
  static markIncorrect(session: FlashcardSession, timeSpent: number): FlashcardSession {
    const currentCard = session.cards[session.currentCardIndex];
    
    const updatedSession = {
      ...session,
      incorrectCount: session.incorrectCount + 1,
      reviewedCards: [
        ...session.reviewedCards,
        {
          cardId: currentCard.id,
          isCorrect: false,
          timeSpent,
        },
      ],
    };

    return this.advanceToNextCard(updatedSession);
  }

  /**
   * Move to the next card or complete the session
   */
  private static advanceToNextCard(session: FlashcardSession): FlashcardSession {
    const nextIndex = session.currentCardIndex + 1;

    if (nextIndex >= session.cards.length) {
      return {
        ...session,
        isCompleted: true,
        endTime: new Date(),
      };
    }

    return {
      ...session,
      currentCardIndex: nextIndex,
    };
  }

  /**
   * Get statistics for a completed session
   */
  static getStats(session: FlashcardSession): FlashcardStats {
    const total = session.reviewedCards.length;
    const correct = session.correctCount;
    const incorrect = session.incorrectCount;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    // XP calculation: 10 XP per correct card, bonus for high accuracy
    let xpEarned = correct * 10;
    if (accuracy >= 90) {
      xpEarned += Math.floor(total * 5); // 5 bonus XP per card for 90%+ accuracy
    } else if (accuracy >= 75) {
      xpEarned += Math.floor(total * 3); // 3 bonus XP per card for 75%+ accuracy
    }

    const timeSpent = session.endTime && session.startTime
      ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)
      : 0;

    return {
      total,
      correct,
      incorrect,
      accuracy,
      xpEarned,
      timeSpent,
    };
  }

  /**
   * Get progress percentage
   */
  static getProgress(session: FlashcardSession): number {
    if (session.cards.length === 0) return 0;
    return (session.currentCardIndex / session.cards.length) * 100;
  }

  /**
   * Shuffle remaining cards in the session
   */
  static shuffleRemaining(session: FlashcardSession): FlashcardSession {
    if (session.currentCardIndex >= session.cards.length - 1) {
      return session; // Nothing to shuffle
    }

    const reviewedCards = session.cards.slice(0, session.currentCardIndex);
    const remainingCards = session.cards.slice(session.currentCardIndex);
    const shuffledRemaining = [...remainingCards].sort(() => Math.random() - 0.5);

    return {
      ...session,
      cards: [...reviewedCards, ...shuffledRemaining],
    };
  }

  /**
   * Create a session from specific word pairs (e.g., incorrect words)
   */
  static createSessionFromWords(
    lessonId: string,
    words: WordPair[],
    direction: 'korean-to-english' | 'english-to-korean' = 'korean-to-english'
  ): FlashcardSession {
    if (words.length === 0) {
      throw new Error('Cannot create session with no words');
    }

    // Shuffle the words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    const cards: FlashcardQuestion[] = shuffledWords.map(word => ({
      id: `card-${word.id}-${Date.now()}-${Math.random()}`,
      wordPair: word,
      front: direction === 'korean-to-english' ? word.korean : word.english,
      back: direction === 'korean-to-english' ? word.english : word.korean,
      imageUrl: word.imageUrl,
    }));

    return {
      id: `flashcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lessonId,
      cards,
      currentCardIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      direction,
      startTime: new Date(),
      isCompleted: false,
      reviewedCards: [],
    };
  }

  /**
   * Get incorrect words from a completed session
   */
  static getIncorrectWords(session: FlashcardSession): WordPair[] {
    const incorrectCardIds = session.reviewedCards
      .filter(review => !review.isCorrect)
      .map(review => review.cardId);

    return session.cards
      .filter(card => incorrectCardIds.includes(card.id))
      .map(card => card.wordPair);
  }

  /**
   * Create a flashcard session from multiple lessons
   * Ensures proportional distribution of words from each lesson
   */
  static createSessionFromMultipleLessons(
    lessons: Lesson[],
    direction: 'korean-to-english' | 'english-to-korean' = 'korean-to-english',
    cardCount?: number
  ): FlashcardSession {
    // Combine all words from all lessons
    const allWords: WordPair[] = lessons.flatMap(lesson => lesson.words);
    
    if (allWords.length === 0) {
      throw new Error('Cannot create session with no words');
    }

    let selectedWords: WordPair[];

    if (cardCount && cardCount < allWords.length && lessons.length > 1) {
      // Proportionally sample from each lesson to ensure all lessons are represented
      selectedWords = [];
      const totalWords = allWords.length;
      
      // Calculate how many words to take from each lesson
      lessons.forEach(lesson => {
        const lessonWords = [...lesson.words].sort(() => Math.random() - 0.5);
        const proportion = lesson.words.length / totalWords;
        // Take at least 1 word from each lesson, proportionally distribute the rest
        const wordsToTake = Math.max(1, Math.round(cardCount * proportion));
        selectedWords.push(...lessonWords.slice(0, wordsToTake));
      });

      // Shuffle the combined selected words
      selectedWords = selectedWords.sort(() => Math.random() - 0.5);
      
      // Trim to exact card count if we went over
      if (selectedWords.length > cardCount) {
        selectedWords = selectedWords.slice(0, cardCount);
      }
    } else {
      // No limit or single lesson - shuffle all words
      const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
      selectedWords = cardCount 
        ? shuffledWords.slice(0, Math.min(cardCount, shuffledWords.length))
        : shuffledWords;
    }

    const cards: FlashcardQuestion[] = selectedWords.map(word => ({
      id: `card-${word.id}-${Date.now()}-${Math.random()}`,
      wordPair: word,
      front: direction === 'korean-to-english' ? word.korean : word.english,
      back: direction === 'korean-to-english' ? word.english : word.korean,
      imageUrl: word.imageUrl,
    }));

    return {
      id: `flashcard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lessonId: lessons.length === 1 ? lessons[0].id : 'multi-lesson',
      lessonIds: lessons.map(l => l.id), // Store all lesson IDs
      cards,
      currentCardIndex: 0,
      correctCount: 0,
      incorrectCount: 0,
      direction,
      startTime: new Date(),
      isCompleted: false,
      reviewedCards: [],
    };
  }
}

