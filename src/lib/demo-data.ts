import { Lesson, WordPair } from '@/types';

export const demoLessons: Lesson[] = [
  {
    id: 'demo-lesson-1',
    name: 'Basic Greetings',
    words: [
      { id: 'word-1', korean: '안녕하세요', english: 'Hello' },
      { id: 'word-2', korean: '안녕히 가세요', english: 'Goodbye (when someone is leaving)' },
      { id: 'word-3', korean: '안녕히 계세요', english: 'Goodbye (when you are leaving)' },
      { id: 'word-4', korean: '감사합니다', english: 'Thank you' },
      { id: 'word-5', korean: '죄송합니다', english: 'Sorry' },
      { id: 'word-6', korean: '괜찮습니다', english: 'It\'s okay' },
      { id: 'word-7', korean: '네', english: 'Yes' },
      { id: 'word-8', korean: '아니요', english: 'No' },
      { id: 'word-9', korean: '실례합니다', english: 'Excuse me' },
      { id: 'word-10', korean: '처음 뵙겠습니다', english: 'Nice to meet you' },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-lesson-2',
    name: 'Food & Drinks',
    words: [
      { id: 'word-11', korean: '밥', english: 'Rice' },
      { id: 'word-12', korean: '물', english: 'Water' },
      { id: 'word-13', korean: '커피', english: 'Coffee' },
      { id: 'word-14', korean: '차', english: 'Tea' },
      { id: 'word-15', korean: '빵', english: 'Bread' },
      { id: 'word-16', korean: '고기', english: 'Meat' },
      { id: 'word-17', korean: '생선', english: 'Fish' },
      { id: 'word-18', korean: '야채', english: 'Vegetables' },
      { id: 'word-19', korean: '과일', english: 'Fruit' },
      { id: 'word-20', korean: '우유', english: 'Milk' },
      { id: 'word-21', korean: '치즈', english: 'Cheese' },
      { id: 'word-22', korean: '계란', english: 'Egg' },
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'demo-lesson-3',
    name: 'Family Members',
    words: [
      { id: 'word-23', korean: '가족', english: 'Family' },
      { id: 'word-24', korean: '아버지', english: 'Father' },
      { id: 'word-25', korean: '어머니', english: 'Mother' },
      { id: 'word-26', korean: '형', english: 'Older brother (male speaking)' },
      { id: 'word-27', korean: '누나', english: 'Older sister (male speaking)' },
      { id: 'word-28', korean: '언니', english: 'Older sister (female speaking)' },
      { id: 'word-29', korean: '동생', english: 'Younger sibling' },
      { id: 'word-30', korean: '할아버지', english: 'Grandfather' },
      { id: 'word-31', korean: '할머니', english: 'Grandmother' },
      { id: 'word-32', korean: '삼촌', english: 'Uncle' },
      { id: 'word-33', korean: '이모', english: 'Aunt' },
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'demo-lesson-4',
    name: 'Numbers 1-20',
    words: [
      { id: 'word-34', korean: '하나', english: 'One' },
      { id: 'word-35', korean: '둘', english: 'Two' },
      { id: 'word-36', korean: '셋', english: 'Three' },
      { id: 'word-37', korean: '넷', english: 'Four' },
      { id: 'word-38', korean: '다섯', english: 'Five' },
      { id: 'word-39', korean: '여섯', english: 'Six' },
      { id: 'word-40', korean: '일곱', english: 'Seven' },
      { id: 'word-41', korean: '여덟', english: 'Eight' },
      { id: 'word-42', korean: '아홉', english: 'Nine' },
      { id: 'word-43', korean: '열', english: 'Ten' },
      { id: 'word-44', korean: '열하나', english: 'Eleven' },
      { id: 'word-45', korean: '열둘', english: 'Twelve' },
      { id: 'word-46', korean: '열셋', english: 'Thirteen' },
      { id: 'word-47', korean: '열넷', english: 'Fourteen' },
      { id: 'word-48', korean: '열다섯', english: 'Fifteen' },
      { id: 'word-49', korean: '열여섯', english: 'Sixteen' },
      { id: 'word-50', korean: '열일곱', english: 'Seventeen' },
      { id: 'word-51', korean: '열여덟', english: 'Eighteen' },
      { id: 'word-52', korean: '열아홉', english: 'Nineteen' },
      { id: 'word-53', korean: '스무', english: 'Twenty' },
    ],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'demo-lesson-5',
    name: 'Colors',
    words: [
      { id: 'word-54', korean: '빨간색', english: 'Red' },
      { id: 'word-55', korean: '파란색', english: 'Blue' },
      { id: 'word-56', korean: '노란색', english: 'Yellow' },
      { id: 'word-57', korean: '초록색', english: 'Green' },
      { id: 'word-58', korean: '검은색', english: 'Black' },
      { id: 'word-59', korean: '흰색', english: 'White' },
      { id: 'word-60', korean: '보라색', english: 'Purple' },
      { id: 'word-61', korean: '주황색', english: 'Orange' },
      { id: 'word-62', korean: '분홍색', english: 'Pink' },
      { id: 'word-63', korean: '갈색', english: 'Brown' },
      { id: 'word-64', korean: '회색', english: 'Gray' },
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
