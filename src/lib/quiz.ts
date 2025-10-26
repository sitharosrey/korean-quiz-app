import { Lesson, WordPair, TypingQuestion, DictationQuestion, MultipleChoiceQuestion, QuizMode, QuizDirection } from '@/types';
import { QuizSession } from './quiz-enhanced';
import { StorageService } from './storage';
import { ProgressService } from './progress';

export class QuizService {
  static generateQuizQuestions(lesson: Lesson, questionCount: number = 10): MultipleChoiceQuestion[] {
    const { words } = lesson;
    
    if (words.length === 0) {
      return [];
    }

    // Shuffle words and take the requested number
    const shuffledWords = this.shuffleArray([...words]).slice(0, Math.min(questionCount, words.length));
    
    return shuffledWords.map((word, index) => {
      // Generate wrong options from other words in the lesson
      const wrongOptions = this.generateWrongOptions(words, word.korean, 3);
      const allOptions = this.shuffleArray([word.korean, ...wrongOptions]);
      
      // Ensure no duplicates in final options
      const uniqueOptions = [...new Set(allOptions)];
      
      return {
        id: `question-${index + 1}`,
        type: 'multiple-choice' as const,
        question: word.english,
        correctAnswer: word.korean,
        options: uniqueOptions,
      };
    });
  }

  static generateReverseQuizQuestions(lesson: Lesson, questionCount: number = 10): MultipleChoiceQuestion[] {
    const { words } = lesson;
    
    if (words.length === 0) {
      return [];
    }

    // Shuffle words and take the requested number
    const shuffledWords = this.shuffleArray([...words]).slice(0, Math.min(questionCount, words.length));
    
    return shuffledWords.map((word, index) => {
      // Generate wrong options from other words in the lesson
      const wrongOptions = this.generateWrongOptions(words, word.english, 3);
      const allOptions = this.shuffleArray([word.english, ...wrongOptions]);
      
      // Ensure no duplicates in final options
      const uniqueOptions = [...new Set(allOptions)];
      
      return {
        id: `question-${index + 1}`,
        type: 'multiple-choice' as const,
        question: word.korean, // Korean word as the question
        correctAnswer: word.english, // English as the answer
        options: uniqueOptions,
      };
    });
  }

  static createQuizSession(lesson: Lesson, questionCount: number = 10, reverseMode: boolean = false, useSpacedRepetition: boolean = true): QuizSession {
    let wordsToUse = lesson.words;
    
    // If spaced repetition is enabled, prioritize words that need review
    if (useSpacedRepetition) {
      const wordsForReview = StorageService.getWordsForReview([lesson]);
      const otherWords = lesson.words.filter(word => !wordsForReview.some(w => w.id === word.id));
      
      // Mix review words with other words (prioritize review words)
      const reviewWordsCount = Math.min(wordsForReview.length, Math.ceil(questionCount * 0.6));
      const otherWordsCount = Math.min(otherWords.length, questionCount - reviewWordsCount);
      
      wordsToUse = [
        ...wordsForReview.slice(0, reviewWordsCount),
        ...otherWords.slice(0, otherWordsCount)
      ];
    }
    
    const questions = reverseMode 
      ? this.generateReverseQuizQuestions({ ...lesson, words: wordsToUse }, questionCount)
      : this.generateQuizQuestions({ ...lesson, words: wordsToUse }, questionCount);

    return {
      id: `quiz-${Date.now()}`,
      lessonId: lesson.id,
      lessonIds: [lesson.id], // Support for multi-lesson quiz
      mode: 'multiple-choice' as const,
      direction: reverseMode ? 'korean-to-english' as const : 'english-to-korean' as const,
      questions,
      results: [],
      currentQuestionIndex: 0,
      startTime: new Date(),
      isCompleted: false,
      totalXP: 0,
    };
  }

  static submitAnswer(session: QuizSession, selectedAnswer: string, timeSpent: number): QuizSession {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = selectedAnswer === ('correctAnswer' in currentQuestion ? currentQuestion.correctAnswer : '');
    
    // Update spaced repetition data for the word
    this.updateWordProgress(currentQuestion, isCorrect);
    
    const result = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect,
      timeSpent,
      xpEarned: isCorrect ? 10 : 0,
    };

    const updatedResults = [...session.results, result];
    const nextQuestionIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextQuestionIndex >= session.questions.length;

    return {
      ...session,
      results: updatedResults,
      currentQuestionIndex: nextQuestionIndex,
      isCompleted,
      endTime: isCompleted ? new Date() : undefined,
    };
  }

  static updateWordProgress(question: TypingQuestion | DictationQuestion | MultipleChoiceQuestion, isCorrect: boolean): void {
    // Find the word in the lesson and update its progress
    const lessons = StorageService.getLessons();
    const lesson = lessons.find(l => l.id === question.id.split('-')[0]); // Extract lesson ID from question ID
    
    if (!lesson) return;
    
    // Find the word that corresponds to this question
    const correctAnswer = 'correctAnswer' in question ? question.correctAnswer : '';
    const word = lesson.words.find(w => 
      w.korean === correctAnswer || w.english === correctAnswer
    );
    
    if (!word) return;
    
    // Update word difficulty using spaced repetition
    const updatedWord = StorageService.updateWordDifficulty(word, isCorrect);
    
    // Update the lesson with the modified word
    const updatedWords = lesson.words.map(w => w.id === word.id ? updatedWord : w);
    const updatedLesson = { ...lesson, words: updatedWords };
    
    StorageService.updateLesson(updatedLesson);
    
    // Update user progress
    const progress = StorageService.getProgress();
    const updatedProgress = ProgressService.updateStreak(progress);
    
    // Award XP based on performance
    const xpAward = isCorrect ? 10 : 5; // More XP for correct answers
    const progressWithXP = ProgressService.addXP(updatedProgress, xpAward);
    
    StorageService.saveProgress(progressWithXP);
  }

  static getQuizScore(session: QuizSession): { correct: number; total: number; percentage: number } {
    const correct = session.results.filter(r => r.isCorrect).length;
    const total = session.results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, total, percentage };
  }

  static getWrongAnswers(session: QuizSession): (TypingQuestion | DictationQuestion | MultipleChoiceQuestion)[] {
    const wrongQuestionIds = session.results
      .filter(r => !r.isCorrect)
      .map(r => r.questionId);
    
    return session.questions.filter(q => wrongQuestionIds.includes(q.id));
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static generateWrongOptions(words: WordPair[], correctAnswer: string, count: number): string[] {
    // Get all possible wrong options (Korean words for normal mode, English for reverse mode)
    const isKoreanMode = words.some(w => w.korean === correctAnswer);
    const wrongOptions = words
      .filter(w => w.korean !== correctAnswer && w.english !== correctAnswer)
      .map(w => isKoreanMode ? w.korean : w.english)
      .filter((option, index, array) => array.indexOf(option) === index); // Remove duplicates
    
    const shuffled = this.shuffleArray(wrongOptions);
    return shuffled.slice(0, count);
  }
}
