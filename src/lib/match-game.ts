import { Lesson, WordPair, MatchGameCard, MatchGameSession } from '@/types';

export class MatchGameService {
  static createGameSession(lesson: Lesson, maxPairs: number = 8): MatchGameSession {
    // Limit the number of pairs to avoid overwhelming the player
    const wordsToUse = lesson.words.slice(0, Math.min(maxPairs, lesson.words.length));
    
    // Check if we have an odd number of words
    const isOddNumber = wordsToUse.length % 2 === 1;
    const actualPairs = isOddNumber ? wordsToUse.length - 1 : wordsToUse.length;
    
    // Create cards for each word pair (only use even number of words)
    const cards: MatchGameCard[] = [];
    const wordsForGame = isOddNumber ? wordsToUse.slice(0, -1) : wordsToUse;
    
    wordsForGame.forEach((word, index) => {
      // Korean card
      cards.push({
        id: `korean-${word.id}`,
        content: word.korean,
        type: 'korean',
        wordId: word.id,
        isMatched: false,
        isFlipped: false,
      });
      
      // English card
      cards.push({
        id: `english-${word.id}`,
        content: word.english,
        type: 'english',
        wordId: word.id,
        isMatched: false,
        isFlipped: false,
      });
    });
    
    // Shuffle the cards
    const shuffledCards = this.shuffleArray(cards);
    
    return {
      id: `match-game-${Date.now()}`,
      lessonId: lesson.id,
      cards: shuffledCards,
      matchedPairs: 0,
      totalPairs: actualPairs,
      startTime: new Date(),
      isCompleted: false,
      excludedWord: isOddNumber ? wordsToUse[wordsToUse.length - 1] : null, // Store the excluded word
    };
  }
  
  static flipCard(session: MatchGameSession, cardId: string): MatchGameSession {
    const updatedSession = { ...session };
    const card = updatedSession.cards.find(c => c.id === cardId);
    
    if (!card || card.isMatched || card.isFlipped) {
      return session; // No change if card doesn't exist or is already flipped/matched
    }
    
    // Flip the card
    card.isFlipped = true;
    
    // Check if we have two cards flipped
    const flippedCards = updatedSession.cards.filter(c => c.isFlipped && !c.isMatched);
    
    if (flippedCards.length === 2) {
      // Check if they match
      const [card1, card2] = flippedCards;
      
      if (card1.wordId === card2.wordId) {
        // Match found!
        card1.isMatched = true;
        card2.isMatched = true;
        updatedSession.matchedPairs += 1;
        
        // Check if game is complete
        if (updatedSession.matchedPairs === updatedSession.totalPairs) {
          updatedSession.isCompleted = true;
          updatedSession.endTime = new Date();
          updatedSession.timeSpent = Math.floor(
            (updatedSession.endTime.getTime() - updatedSession.startTime.getTime()) / 1000
          );
        }
      }
      // Note: We don't flip cards back immediately here
      // The component will handle the delay and call flipCard again to reset
    }
    
    return updatedSession;
  }

  static resetFlippedCards(session: MatchGameSession): MatchGameSession {
    const updatedSession = { ...session };
    
    // Reset all flipped but not matched cards
    updatedSession.cards.forEach(card => {
      if (card.isFlipped && !card.isMatched) {
        card.isFlipped = false;
      }
    });
    
    return updatedSession;
  }
  
  static resetGame(session: MatchGameSession): MatchGameSession {
    const updatedSession = { ...session };
    
    // Reset all cards
    updatedSession.cards.forEach(card => {
      card.isFlipped = false;
      card.isMatched = false;
    });
    
    // Reset game state
    updatedSession.matchedPairs = 0;
    updatedSession.isCompleted = false;
    updatedSession.startTime = new Date();
    updatedSession.endTime = undefined;
    updatedSession.timeSpent = undefined;
    
    // Shuffle cards again
    updatedSession.cards = this.shuffleArray(updatedSession.cards);
    
    return updatedSession;
  }
  
  static getGameStats(session: MatchGameSession) {
    const timeSpent = session.timeSpent || 
      Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    
    const accuracy = session.matchedPairs / session.totalPairs;
    const averageTimePerPair = timeSpent / session.totalPairs;
    
    return {
      timeSpent,
      accuracy,
      averageTimePerPair,
      totalMoves: session.cards.filter(c => c.isFlipped).length / 2,
    };
  }
  
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
