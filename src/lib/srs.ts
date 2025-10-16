import { WordPair } from '@/types';

// Spaced Repetition intervals in days
const SRS_INTERVALS = [1, 3, 7, 14, 30, 60, 120, 240] as const;

export interface SRSWord extends WordPair {
  level: number; // 0-7 (0 = new, 7 = mastered)
  nextReview: Date;
  reviewCount: number;
  correctStreak: number;
  lastReviewed?: Date;
  totalXP: number;
}

export class SRSService {
  /**
   * Create a new word with SRS tracking
   */
  static createSRSWord(korean: string, english: string, imageUrl?: string): SRSWord {
    return {
      id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      korean,
      english,
      imageUrl,
      difficulty: 0,
      nextReviewDate: new Date(), // Review immediately for new words
      reviewCount: 0,
      correctStreak: 0,
      // SRS specific fields
      level: 0,
      nextReview: new Date(),
      totalXP: 0,
    };
  }

  /**
   * Update word based on user's answer
   */
  static updateWordProgress(word: SRSWord, isCorrect: boolean, timeSpent?: number): SRSWord {
    const updatedWord = { ...word };
    
    // Update basic stats
    updatedWord.reviewCount += 1;
    updatedWord.lastReviewed = new Date();
    
    if (isCorrect) {
      // Correct answer - increase level and streak
      updatedWord.correctStreak += 1;
      updatedWord.level = Math.min(7, updatedWord.level + 1);
      
      // Award XP based on level and time
      const baseXP = 10;
      const levelBonus = updatedWord.level * 2;
      const timeBonus = timeSpent && timeSpent < 3000 ? 5 : 0; // Bonus for quick answers
      updatedWord.totalXP += baseXP + levelBonus + timeBonus;
      
      // Calculate next review date
      const intervalDays = SRS_INTERVALS[Math.min(updatedWord.level, SRS_INTERVALS.length - 1)];
      updatedWord.nextReview = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
    } else {
      // Incorrect answer - reset level and streak
      updatedWord.correctStreak = 0;
      updatedWord.level = Math.max(0, updatedWord.level - 1);
      
      // Still award some XP for effort
      updatedWord.totalXP += 2;
      
      // Review again soon
      updatedWord.nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    }
    
    return updatedWord;
  }

  /**
   * Get words that need review today
   */
  static getWordsForReview(words: SRSWord[]): SRSWord[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    return words.filter(word => word.nextReview <= today);
  }

  /**
   * Get words by mastery level
   */
  static getWordsByLevel(words: SRSWord[], level: number): SRSWord[] {
    return words.filter(word => word.level === level);
  }

  /**
   * Get mastery statistics
   */
  static getMasteryStats(words: SRSWord[]) {
    const total = words.length;
    const newWords = words.filter(w => w.level === 0).length;
    const learning = words.filter(w => w.level >= 1 && w.level <= 3).length;
    const reviewing = words.filter(w => w.level >= 4 && w.level <= 6).length;
    const mastered = words.filter(w => w.level === 7).length;
    
    return {
      total,
      newWords,
      learning,
      reviewing,
      mastered,
      masteryPercentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  }

  /**
   * Calculate total XP from all words
   */
  static getTotalXP(words: SRSWord[]): number {
    return words.reduce((total, word) => total + word.totalXP, 0);
  }

  /**
   * Get level from total XP
   */
  static getLevelFromXP(totalXP: number): number {
    if (totalXP < 100) return 1;
    if (totalXP < 300) return 2;
    if (totalXP < 600) return 3;
    if (totalXP < 1000) return 4;
    if (totalXP < 1500) return 5;
    if (totalXP < 2200) return 6;
    if (totalXP < 3000) return 7;
    return 8; // Max level
  }

  /**
   * Get XP needed for next level
   */
  static getXPForNextLevel(currentLevel: number): number {
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
    return levelThresholds[Math.min(currentLevel, levelThresholds.length - 1)];
  }

  /**
   * Get XP progress for current level
   */
  static getXPProgress(totalXP: number): { current: number; needed: number; percentage: number } {
    const currentLevel = this.getLevelFromXP(totalXP);
    const currentLevelXP = this.getXPForNextLevel(currentLevel - 1);
    const nextLevelXP = this.getXPForNextLevel(currentLevel);
    
    const currentXP = totalXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    const percentage = neededXP > 0 ? Math.min(100, (currentXP / neededXP) * 100) : 100;
    
    return {
      current: currentXP,
      needed: neededXP,
      percentage,
    };
  }
}
