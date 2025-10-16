/**
 * Fuzzy matching service for Korean typing practice
 * Allows minor spelling mistakes while maintaining accuracy
 */

export interface MatchResult {
  isMatch: boolean;
  confidence: number; // 0-1, higher is better
  suggestions?: string[];
}

export class FuzzyMatchService {
  /**
   * Check if user input matches the target Korean word
   */
  static matchKorean(userInput: string, target: string): MatchResult {
    const normalizedInput = this.normalizeKorean(userInput);
    const normalizedTarget = this.normalizeKorean(target);
    
    // Exact match
    if (normalizedInput === normalizedTarget) {
      return {
        isMatch: true,
        confidence: 1.0,
      };
    }
    
    // Calculate similarity
    const similarity = this.calculateSimilarity(normalizedInput, normalizedTarget);
    
    // More lenient threshold for Korean text (70% instead of 80%)
    const threshold = 0.7;
    const isMatch = similarity >= threshold;
    
    return {
      isMatch,
      confidence: similarity,
      suggestions: isMatch ? undefined : [target], // Show correct answer if no match
    };
  }

  /**
   * Check if user input matches the target English word
   */
  static matchEnglish(userInput: string, target: string): MatchResult {
    const normalizedInput = this.normalizeEnglish(userInput);
    const normalizedTarget = this.normalizeEnglish(target);
    
    // Exact match
    if (normalizedInput === normalizedTarget) {
      return {
        isMatch: true,
        confidence: 1.0,
      };
    }
    
    // Calculate similarity
    const similarity = this.calculateSimilarity(normalizedInput, normalizedTarget);
    
    // More lenient threshold for English text (75%)
    const threshold = 0.75;
    const isMatch = similarity >= threshold;
    
    return {
      isMatch,
      confidence: similarity,
      suggestions: isMatch ? undefined : [target], // Show correct answer if no match
    };
  }

  /**
   * Normalize Korean text for comparison
   */
  private static normalizeKorean(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '') // Keep only Korean characters
      .toLowerCase(); // Convert to lowercase for comparison
  }

  /**
   * Normalize English text for comparison
   */
  private static normalizeEnglish(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize spaces
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1.0;
    
    return 1 - (distance / maxLength);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Check for common Korean typing mistakes
   */
  static checkCommonMistakes(userInput: string, target: string): string[] {
    const mistakes: string[] = [];
    
    // Check for missing characters
    if (userInput.length < target.length) {
      mistakes.push('Missing characters');
    }
    
    // Check for extra characters
    if (userInput.length > target.length) {
      mistakes.push('Extra characters');
    }
    
    // Check for similar looking characters
    const similarChars = this.getSimilarKoreanChars();
    for (let i = 0; i < Math.min(userInput.length, target.length); i++) {
      const userChar = userInput[i];
      const targetChar = target[i];
      
      if (userChar !== targetChar) {
        const similar = similarChars.get(userChar);
        if (similar && similar.includes(targetChar)) {
          mistakes.push(`Similar character: ${userChar} → ${targetChar}`);
        }
      }
    }
    
    return mistakes;
  }

  /**
   * Get map of similar looking Korean characters
   */
  private static getSimilarKoreanChars(): Map<string, string[]> {
    return new Map([
      ['ㅏ', ['ㅓ', 'ㅗ', 'ㅜ']],
      ['ㅓ', ['ㅏ', 'ㅗ', 'ㅜ']],
      ['ㅗ', ['ㅏ', 'ㅓ', 'ㅜ']],
      ['ㅜ', ['ㅏ', 'ㅓ', 'ㅗ']],
      ['ㅡ', ['ㅣ']],
      ['ㅣ', ['ㅡ']],
      ['ㄱ', ['ㄴ', 'ㅋ']],
      ['ㄴ', ['ㄱ', 'ㄷ', 'ㅌ']],
      ['ㄷ', ['ㄴ', 'ㅌ', 'ㄹ']],
      ['ㄹ', ['ㄷ', 'ㅌ']],
      ['ㅁ', ['ㅂ', 'ㅍ']],
      ['ㅂ', ['ㅁ', 'ㅍ']],
      ['ㅅ', ['ㅆ', 'ㅈ']],
      ['ㅆ', ['ㅅ', 'ㅈ']],
      ['ㅈ', ['ㅅ', 'ㅆ', 'ㅊ']],
      ['ㅊ', ['ㅈ', 'ㅋ']],
      ['ㅋ', ['ㄱ', 'ㅊ']],
      ['ㅌ', ['ㄴ', 'ㄷ', 'ㄹ']],
      ['ㅍ', ['ㅁ', 'ㅂ']],
      ['ㅎ', ['ㅇ']],
      ['ㅇ', ['ㅎ']],
    ]);
  }

  /**
   * Get typing hints for a Korean word
   */
  static getTypingHints(word: string): string[] {
    const hints: string[] = [];
    
    // Syllable count hint
    const syllables = this.getSyllableCount(word);
    hints.push(`${syllables} syllable${syllables > 1 ? 's' : ''}`);
    
    // Character count hint
    hints.push(`${word.length} character${word.length > 1 ? 's' : ''}`);
    
    // First character hint
    if (word.length > 0) {
      hints.push(`Starts with: ${word[0]}`);
    }
    
    return hints;
  }

  /**
   * Count syllables in Korean word
   */
  private static getSyllableCount(word: string): number {
    // Korean syllables are typically one character each
    // This is a simplified count
    return word.length;
  }
}
