import { Lesson, QuizQuestion, QuizSession, WordPair } from '@/types';

export class QuizService {
  static generateQuizQuestions(lesson: Lesson, questionCount: number = 10): QuizQuestion[] {
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
        english: word.english,
        correctKorean: word.korean,
        options: uniqueOptions,
        correctAnswer: word.korean,
      };
    });
  }

  static generateReverseQuizQuestions(lesson: Lesson, questionCount: number = 10): QuizQuestion[] {
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
        english: word.korean, // Korean word as the question
        correctKorean: word.english, // English as the answer
        options: uniqueOptions,
        correctAnswer: word.english,
      };
    });
  }

  static createQuizSession(lesson: Lesson, questionCount: number = 10, reverseMode: boolean = false): QuizSession {
    const questions = reverseMode 
      ? this.generateReverseQuizQuestions(lesson, questionCount)
      : this.generateQuizQuestions(lesson, questionCount);

    return {
      id: `quiz-${Date.now()}`,
      lessonId: lesson.id,
      questions,
      results: [],
      currentQuestionIndex: 0,
      startTime: new Date(),
      isCompleted: false,
    };
  }

  static submitAnswer(session: QuizSession, selectedAnswer: string, timeSpent: number): QuizSession {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    const result = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
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

  static getQuizScore(session: QuizSession): { correct: number; total: number; percentage: number } {
    const correct = session.results.filter(r => r.isCorrect).length;
    const total = session.results.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    return { correct, total, percentage };
  }

  static getWrongAnswers(session: QuizSession): QuizQuestion[] {
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
