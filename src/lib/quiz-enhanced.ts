import { Lesson, WordPair, QuizQuestion, TypingQuestion, DictationQuestion, MultipleChoiceQuestion, QuizMode, QuizDirection } from '@/types';
import { SRSService, SRSWord } from './srs';
import { FuzzyMatchService } from './fuzzy-match';
import { StorageService } from './storage';

export interface QuizSession {
  id: string;
  lessonId: string;
  mode: QuizMode;
  direction: QuizDirection;
  questions: (TypingQuestion | DictationQuestion | MultipleChoiceQuestion)[];
  results: QuizResult[];
  currentQuestionIndex: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  totalXP: number;
}

export interface QuizResult {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  xpEarned: number;
  confidence?: number; // For fuzzy matching
}

export class EnhancedQuizService {
  /**
   * Create a new quiz session with the specified mode
   */
  static createQuizSession(
    lesson: Lesson, 
    questionCount: number,
    mode: QuizMode, 
    direction: QuizDirection
  ): QuizSession {
    const wordsToUse = this.selectWordsForQuiz(lesson, questionCount);
    const questions = this.generateQuestions(wordsToUse, mode, direction);
    
    console.log('Creating quiz session:', {
      lessonId: lesson.id,
      questionCount,
      mode,
      direction,
      wordsToUse: wordsToUse.length,
      questions: questions.length,
      firstQuestion: questions[0]
    });
    
    return {
      id: `quiz-${Date.now()}`,
      lessonId: lesson.id,
      mode,
      direction,
      questions,
      results: [],
      currentQuestionIndex: 0,
      startTime: new Date(),
      isCompleted: false,
      totalXP: 0,
    };
  }

  /**
   * Select words for the quiz (prioritize words that need review)
   */
  private static selectWordsForQuiz(lesson: Lesson, count: number): WordPair[] {
    const allWords = lesson.words as SRSWord[];
    const wordsForReview = SRSService.getWordsForReview(allWords);
    const otherWords = allWords.filter(word => !wordsForReview.some(w => w.id === word.id));
    
    // Mix review words with other words (prioritize review words)
    const reviewWordsCount = Math.min(wordsForReview.length, Math.ceil(count * 0.6));
    const otherWordsCount = Math.min(otherWords.length, count - reviewWordsCount);
    
    const selectedWords = [
      ...wordsForReview.slice(0, reviewWordsCount),
      ...otherWords.slice(0, otherWordsCount)
    ];
    
    return this.shuffleArray(selectedWords);
  }

  /**
   * Generate questions based on mode and direction
   */
  private static generateQuestions(
    words: WordPair[], 
    mode: QuizMode, 
    direction: QuizDirection
  ): (TypingQuestion | DictationQuestion | MultipleChoiceQuestion)[] {
    return words.map((word, index) => {
      const questionId = `question-${index + 1}`;
      
      switch (mode) {
        case 'typing':
          return this.createTypingQuestion(word, direction, questionId);
        case 'dictation':
          return this.createDictationQuestion(word, direction, questionId);
        case 'multiple-choice':
        default:
          return this.createMultipleChoiceQuestion(word, direction, questionId, words);
      }
    });
  }

  /**
   * Create a typing question
   */
  private static createTypingQuestion(
    word: WordPair, 
    direction: QuizDirection, 
    questionId: string
  ): TypingQuestion {
    if (direction === 'korean-to-english') {
      // Show English word, ask user to type Korean
      return {
        id: questionId,
        type: 'typing',
        question: word.english,
        answer: word.korean,
        hints: FuzzyMatchService.getTypingHints(word.korean),
      };
    } else {
      // Show Korean word, ask user to type English
      return {
        id: questionId,
        type: 'typing',
        question: word.korean,
        answer: word.english,
        hints: [`${word.english.length} letters`, `Starts with: ${word.english[0]}`],
      };
    }
  }

  /**
   * Create a dictation question
   */
  private static createDictationQuestion(
    word: WordPair, 
    direction: QuizDirection, 
    questionId: string
  ): DictationQuestion {
    if (direction === 'korean-to-english') {
      // Play Korean audio, ask user to type English
      return {
        id: questionId,
        type: 'dictation',
        audioText: word.korean,
        answer: word.english,
        hints: [`${word.english.length} letters`],
      };
    } else {
      // Play Korean audio, ask user to type Korean (for pronunciation practice)
      return {
        id: questionId,
        type: 'dictation',
        audioText: word.korean,
        answer: word.korean,
        hints: FuzzyMatchService.getTypingHints(word.korean),
      };
    }
  }

  /**
   * Create a multiple choice question
   */
  private static createMultipleChoiceQuestion(
    word: WordPair, 
    direction: QuizDirection, 
    questionId: string,
    allWords: WordPair[]
  ): MultipleChoiceQuestion {
    if (direction === 'korean-to-english') {
      const wrongOptions = this.generateWrongOptions(allWords, word.english, 3);
      const options = this.shuffleArray([word.english, ...wrongOptions]);
      
      return {
        id: questionId,
        type: 'multiple-choice',
        question: word.korean,
        correctAnswer: word.english,
        options,
      };
    } else {
      const wrongOptions = this.generateWrongOptions(allWords, word.korean, 3);
      const options = this.shuffleArray([word.korean, ...wrongOptions]);
      
      return {
        id: questionId,
        type: 'multiple-choice',
        question: word.english,
        correctAnswer: word.korean,
        options,
      };
    }
  }

  /**
   * Submit an answer and get the result
   */
  static submitAnswer(
    session: QuizSession, 
    userAnswer: string, 
    timeSpent: number
  ): { session: QuizSession; result: QuizResult } {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const result = this.evaluateAnswer(currentQuestion, userAnswer, timeSpent);
    
    const updatedSession = {
      ...session,
      results: [...session.results, result],
      currentQuestionIndex: session.currentQuestionIndex + 1,
      totalXP: session.totalXP + result.xpEarned,
      isCompleted: session.currentQuestionIndex + 1 >= session.questions.length,
      endTime: session.currentQuestionIndex + 1 >= session.questions.length ? new Date() : undefined,
    };
    
    // Update word progress if SRS is enabled
    this.updateWordProgress(updatedSession, currentQuestion, result.isCorrect, timeSpent);
    
    return { session: updatedSession, result };
  }

  /**
   * Evaluate user's answer
   */
  private static evaluateAnswer(
    question: TypingQuestion | DictationQuestion | MultipleChoiceQuestion, 
    userAnswer: string, 
    timeSpent: number
  ): QuizResult {
    let isCorrect = false;
    let confidence = 1.0;
    let xpEarned = 0;
    
    switch (question.type) {
      case 'typing':
        // Use appropriate matching method based on answer type
        const typingResult = this.isKoreanText(question.answer) 
          ? FuzzyMatchService.matchKorean(userAnswer, question.answer)
          : FuzzyMatchService.matchEnglish(userAnswer, question.answer);
        isCorrect = typingResult.isMatch;
        confidence = typingResult.confidence;
        xpEarned = isCorrect ? 15 : 3; // More XP for typing
        break;
        
      case 'dictation':
        // Use appropriate matching method based on answer type
        const dictationResult = this.isKoreanText(question.answer) 
          ? FuzzyMatchService.matchKorean(userAnswer, question.answer)
          : FuzzyMatchService.matchEnglish(userAnswer, question.answer);
        isCorrect = dictationResult.isMatch;
        confidence = dictationResult.confidence;
        xpEarned = isCorrect ? 20 : 5; // Most XP for dictation
        break;
        
      case 'multiple-choice':
        isCorrect = userAnswer === question.correctAnswer;
        xpEarned = isCorrect ? 10 : 2; // Standard XP for multiple choice
        break;
    }
    
    // Time bonus for quick answers
    if (isCorrect && timeSpent < 3000) {
      xpEarned += 5;
    }
    
    return {
      questionId: question.id,
      userAnswer,
      isCorrect,
      timeSpent,
      xpEarned,
      confidence,
    };
  }

  /**
   * Check if text contains Korean characters
   */
  private static isKoreanText(text: string): boolean {
    return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
  }

  /**
   * Update word progress using SRS
   */
  private static updateWordProgress(
    session: QuizSession,
    question: TypingQuestion | DictationQuestion | MultipleChoiceQuestion, 
    isCorrect: boolean, 
    timeSpent: number
  ): void {
    // Find the word in lessons and update its progress
    const lessons = StorageService.getLessons();
    const lesson = lessons.find(l => l.id === session.lessonId);
    
    if (!lesson) return;
    
    // Find the word that corresponds to this question
    let word: SRSWord | undefined;
    
    switch (question.type) {
      case 'typing':
        word = lesson.words.find(w => 
          w.korean === question.answer || w.english === question.answer
        ) as SRSWord;
        break;
      case 'dictation':
        word = lesson.words.find(w => 
          w.korean === question.answer
        ) as SRSWord;
        break;
      case 'multiple-choice':
        word = lesson.words.find(w => 
          w.korean === question.correctAnswer || w.english === question.correctAnswer
        ) as SRSWord;
        break;
    }
    
    if (!word) return;
    
    // Update word using SRS
    const updatedWord = SRSService.updateWordProgress(word, isCorrect, timeSpent);
    
    // Update the lesson
    const updatedWords = lesson.words.map(w => w.id === word!.id ? updatedWord : w);
    const updatedLesson = { ...lesson, words: updatedWords };
    
    StorageService.updateLesson(updatedLesson);
  }

  /**
   * Get quiz statistics
   */
  static getQuizStats(session: QuizSession): {
    correct: number;
    total: number;
    percentage: number;
    totalXP: number;
    averageTime: number;
    mode: QuizMode;
  } {
    const correct = session.results.filter(r => r.isCorrect).length;
    const total = session.results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const totalTime = session.results.reduce((sum, r) => sum + r.timeSpent, 0);
    const averageTime = total > 0 ? Math.round(totalTime / total) : 0;
    
    return {
      correct,
      total,
      percentage,
      totalXP: session.totalXP,
      averageTime,
      mode: session.mode,
    };
  }

  /**
   * Generate wrong options for multiple choice
   */
  private static generateWrongOptions(words: WordPair[], correctAnswer: string, count: number): string[] {
    const wrongOptions = words
      .filter(w => w.korean !== correctAnswer && w.english !== correctAnswer)
      .map(w => w.korean === correctAnswer ? w.english : w.korean)
      .filter((option, index, array) => array.indexOf(option) === index);
    
    return this.shuffleArray(wrongOptions).slice(0, count);
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
}
