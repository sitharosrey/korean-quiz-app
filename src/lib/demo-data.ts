import { Lesson, WordPair } from '@/types';

// Helper function to create word pairs with consistent IDs
function createDemoWordPair(id: string, korean: string, english: string): WordPair {
  return {
    id,
    korean,
    english,
    difficulty: 0,
    nextReviewDate: new Date(),
    reviewCount: 0,
    correctStreak: 0,
    // Enhanced SRS fields
    level: 0,
    nextReview: new Date(),
    totalXP: 0,
  };
}

export const demoLessons: Lesson[] = [
  {
    id: 'demo-lesson-1',
    name: 'Basic Greetings',
    words: [
      createDemoWordPair('word-1', '안녕하세요', 'Hello'),
      createDemoWordPair('word-2', '안녕히 가세요', 'Goodbye (when someone is leaving)'),
      createDemoWordPair('word-3', '안녕히 계세요', 'Goodbye (when you are leaving)'),
      createDemoWordPair('word-4', '감사합니다', 'Thank you'),
      createDemoWordPair('word-5', '죄송합니다', 'Sorry'),
      createDemoWordPair('word-6', '괜찮습니다', 'It\'s okay'),
      createDemoWordPair('word-7', '네', 'Yes'),
      createDemoWordPair('word-8', '아니요', 'No'),
      createDemoWordPair('word-9', '실례합니다', 'Excuse me'),
      createDemoWordPair('word-10', '처음 뵙겠습니다', 'Nice to meet you'),
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-lesson-2',
    name: 'Food & Drinks',
    words: [
      createDemoWordPair('word-11', '밥', 'Rice'),
      createDemoWordPair('word-12', '물', 'Water'),
      createDemoWordPair('word-13', '커피', 'Coffee'),
      createDemoWordPair('word-14', '차', 'Tea'),
      createDemoWordPair('word-15', '빵', 'Bread'),
      createDemoWordPair('word-16', '고기', 'Meat'),
      createDemoWordPair('word-17', '생선', 'Fish'),
      createDemoWordPair('word-18', '야채', 'Vegetables'),
      createDemoWordPair('word-19', '과일', 'Fruit'),
      createDemoWordPair('word-20', '우유', 'Milk'),
      createDemoWordPair('word-21', '치즈', 'Cheese'),
      createDemoWordPair('word-22', '계란', 'Egg'),
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'demo-lesson-3',
    name: 'Family Members',
    words: [
      createDemoWordPair('word-23', '가족', 'Family'),
      createDemoWordPair('word-24', '아버지', 'Father'),
      createDemoWordPair('word-25', '어머니', 'Mother'),
      createDemoWordPair('word-26', '형', 'Older brother (male speaking)'),
      createDemoWordPair('word-27', '누나', 'Older sister (male speaking)'),
      createDemoWordPair('word-28', '언니', 'Older sister (female speaking)'),
      createDemoWordPair('word-29', '동생', 'Younger sibling'),
      createDemoWordPair('word-30', '할아버지', 'Grandfather'),
      createDemoWordPair('word-31', '할머니', 'Grandmother'),
      createDemoWordPair('word-32', '삼촌', 'Uncle'),
      createDemoWordPair('word-33', '이모', 'Aunt'),
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'demo-lesson-4',
    name: 'Numbers 1-20',
    words: [
      createDemoWordPair('word-34', '하나', 'One'),
      createDemoWordPair('word-35', '둘', 'Two'),
      createDemoWordPair('word-36', '셋', 'Three'),
      createDemoWordPair('word-37', '넷', 'Four'),
      createDemoWordPair('word-38', '다섯', 'Five'),
      createDemoWordPair('word-39', '여섯', 'Six'),
      createDemoWordPair('word-40', '일곱', 'Seven'),
      createDemoWordPair('word-41', '여덟', 'Eight'),
      createDemoWordPair('word-42', '아홉', 'Nine'),
      createDemoWordPair('word-43', '열', 'Ten'),
      createDemoWordPair('word-44', '열하나', 'Eleven'),
      createDemoWordPair('word-45', '열둘', 'Twelve'),
      createDemoWordPair('word-46', '열셋', 'Thirteen'),
      createDemoWordPair('word-47', '열넷', 'Fourteen'),
      createDemoWordPair('word-48', '열다섯', 'Fifteen'),
      createDemoWordPair('word-49', '열여섯', 'Sixteen'),
      createDemoWordPair('word-50', '열일곱', 'Seventeen'),
      createDemoWordPair('word-51', '열여덟', 'Eighteen'),
      createDemoWordPair('word-52', '열아홉', 'Nineteen'),
      createDemoWordPair('word-53', '스무', 'Twenty'),
    ],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'demo-lesson-5',
    name: 'Colors',
    words: [
      createDemoWordPair('word-54', '빨간색', 'Red'),
      createDemoWordPair('word-55', '파란색', 'Blue'),
      createDemoWordPair('word-56', '노란색', 'Yellow'),
      createDemoWordPair('word-57', '초록색', 'Green'),
      createDemoWordPair('word-58', '검은색', 'Black'),
      createDemoWordPair('word-59', '흰색', 'White'),
      createDemoWordPair('word-60', '보라색', 'Purple'),
      createDemoWordPair('word-61', '주황색', 'Orange'),
      createDemoWordPair('word-62', '분홍색', 'Pink'),
      createDemoWordPair('word-63', '갈색', 'Brown'),
      createDemoWordPair('word-64', '회색', 'Gray'),
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

export function initializeDemoData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existingLessons = localStorage.getItem('korean-flashcard-lessons');
    if (!existingLessons || JSON.parse(existingLessons).length === 0) {
      localStorage.setItem('korean-flashcard-lessons', JSON.stringify(demoLessons));
      console.log('Demo data initialized');
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}