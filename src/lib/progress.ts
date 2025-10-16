import { UserProgress, Lesson, WordPair } from '@/types';
import { StorageService } from './storage';

export class ProgressService {
  static calculateLevel(totalXP: number): number {
    // Level calculation: each level requires more XP
    // Level 1: 0-99 XP, Level 2: 100-249 XP, Level 3: 250-449 XP, etc.
    if (totalXP < 100) return 1;
    if (totalXP < 250) return 2;
    if (totalXP < 450) return 3;
    if (totalXP < 700) return 4;
    if (totalXP < 1000) return 5;
    
    // For higher levels, use a more complex formula
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  static getXPForNextLevel(currentLevel: number): number {
    // Calculate XP needed for next level
    if (currentLevel === 1) return 100;
    if (currentLevel === 2) return 250;
    if (currentLevel === 3) return 450;
    if (currentLevel === 4) return 700;
    if (currentLevel === 5) return 1000;
    
    // For higher levels
    return Math.pow(currentLevel, 2) * 100;
  }

  static getXPProgress(currentLevel: number, totalXP: number): { current: number; needed: number; percentage: number } {
    const xpForCurrentLevel = currentLevel === 1 ? 0 : this.getXPForNextLevel(currentLevel - 1);
    const xpForNextLevel = this.getXPForNextLevel(currentLevel);
    const currentXP = totalXP - xpForCurrentLevel;
    const neededXP = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.min(100, (currentXP / neededXP) * 100);
    
    return {
      current: currentXP,
      needed: neededXP,
      percentage,
    };
  }

  static updateStreak(progress: UserProgress): UserProgress {
    const today = new Date();
    const lastStudyDate = progress.lastStudyDate;
    
    // Reset time to start of day for comparison
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastStudyStart = lastStudyDate ? new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate()) : null;
    
    const updatedProgress = { ...progress };
    
    if (!lastStudyStart) {
      // First time studying
      updatedProgress.currentStreak = 1;
      updatedProgress.longestStreak = Math.max(updatedProgress.longestStreak, 1);
    } else {
      const daysDifference = Math.floor((todayStart.getTime() - lastStudyStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === 0) {
        // Same day, no change to streak
      } else if (daysDifference === 1) {
        // Consecutive day
        updatedProgress.currentStreak += 1;
        updatedProgress.longestStreak = Math.max(updatedProgress.longestStreak, updatedProgress.currentStreak);
      } else {
        // Streak broken
        updatedProgress.currentStreak = 1;
      }
    }
    
    updatedProgress.lastStudyDate = today;
    return updatedProgress;
  }

  static addXP(progress: UserProgress, xp: number): UserProgress {
    const updatedProgress = { ...progress };
    updatedProgress.totalXP += xp;
    updatedProgress.currentLevel = this.calculateLevel(updatedProgress.totalXP);
    return updatedProgress;
  }

  static addQuizCompletion(progress: UserProgress, timeSpentMinutes: number): UserProgress {
    const updatedProgress = { ...progress };
    updatedProgress.totalQuizzesCompleted += 1;
    updatedProgress.totalTimeSpent += timeSpentMinutes;
    return updatedProgress;
  }

  static addWordLearned(progress: UserProgress): UserProgress {
    const updatedProgress = { ...progress };
    updatedProgress.totalWordsLearned += 1;
    return updatedProgress;
  }

  static getWordsForReview(): WordPair[] {
    const lessons = StorageService.getLessons();
    return StorageService.getWordsForReview(lessons);
  }

  static getStudyStats(): {
    totalWords: number;
    wordsForReview: number;
    masteredWords: number;
    newWords: number;
    averageDifficulty: number;
  } {
    const lessons = StorageService.getLessons();
    const allWords: WordPair[] = [];
    
    lessons.forEach(lesson => {
      allWords.push(...lesson.words);
    });
    
    const wordsForReview = this.getWordsForReview();
    const masteredWords = allWords.filter(word => word.difficulty >= 4);
    const newWords = allWords.filter(word => word.difficulty === 0);
    const averageDifficulty = allWords.length > 0 
      ? allWords.reduce((sum, word) => sum + word.difficulty, 0) / allWords.length 
      : 0;
    
    return {
      totalWords: allWords.length,
      wordsForReview: wordsForReview.length,
      masteredWords: masteredWords.length,
      newWords: newWords.length,
      averageDifficulty,
    };
  }

  static getRecentActivity(): Array<{
    type: 'quiz' | 'game' | 'review';
    description: string;
    xp: number;
    date: Date;
  }> {
    // This would typically come from a more detailed activity log
    // For now, we'll return a simple representation
    const progress = StorageService.getProgress();
    const activities = [];
    
    if (progress.lastStudyDate) {
      activities.push({
        type: 'review' as const,
        description: 'Studied vocabulary',
        xp: 10,
        date: progress.lastStudyDate,
      });
    }
    
    return activities;
  }

  static incrementWordsMastered(progress: UserProgress, count: number = 1): UserProgress {
    return {
      ...progress,
      wordsMastered: progress.wordsMastered + count,
    };
  }

  static addAchievement(progress: UserProgress, achievement: string): UserProgress {
    if (progress.achievements.includes(achievement)) {
      return progress; // Don't add duplicate achievements
    }
    
    return {
      ...progress,
      achievements: [...progress.achievements, achievement],
    };
  }

  static checkAndAddAchievements(progress: UserProgress): UserProgress {
    let updatedProgress = { ...progress };
    
    // Streak achievements
    if (progress.currentStreak >= 7 && !progress.achievements.includes('week_warrior')) {
      updatedProgress = this.addAchievement(updatedProgress, 'week_warrior');
    }
    if (progress.currentStreak >= 30 && !progress.achievements.includes('month_master')) {
      updatedProgress = this.addAchievement(updatedProgress, 'month_master');
    }
    
    // XP achievements
    if (progress.totalXP >= 1000 && !progress.achievements.includes('xp_collector')) {
      updatedProgress = this.addAchievement(updatedProgress, 'xp_collector');
    }
    if (progress.totalXP >= 5000 && !progress.achievements.includes('xp_master')) {
      updatedProgress = this.addAchievement(updatedProgress, 'xp_master');
    }
    
    // Words learned achievements
    if (progress.totalWordsLearned >= 100 && !progress.achievements.includes('century_learner')) {
      updatedProgress = this.addAchievement(updatedProgress, 'century_learner');
    }
    if (progress.totalWordsLearned >= 500 && !progress.achievements.includes('vocabulary_expert')) {
      updatedProgress = this.addAchievement(updatedProgress, 'vocabulary_expert');
    }
    
    // Quiz achievements
    if (progress.totalQuizzesCompleted >= 50 && !progress.achievements.includes('quiz_champion')) {
      updatedProgress = this.addAchievement(updatedProgress, 'quiz_champion');
    }
    
    return updatedProgress;
  }
}
