# Korean Flashcard Trainer

A modern, full-stack web application for learning Korean vocabulary with advanced memory-enhancing features including spaced repetition, pronunciation practice, context sentences, interactive games, and progress tracking.

## Features

### 🎯 Core Features
- **Spaced Repetition**: Smart review system that adapts to your learning pace and memory retention
- **Pronunciation Practice**: Hear correct Korean pronunciation using browser speech synthesis
- **Context Sentences**: AI-generated example sentences to understand word usage in context
- **Interactive Games**: Match the Pairs memory game for fun vocabulary practice
- **Progress Dashboard**: Track your learning journey with XP, streaks, and detailed statistics
- **Image Attachments**: Add visual memory aids with auto-fetched or uploaded images
- **Lesson Management**: Create, organize, and manage custom vocabulary lessons
- **Interactive Quizzes**: Test your knowledge with multiple-choice quizzes
- **Bidirectional Learning**: Practice both Korean → English and English → Korean

### 🎨 UI/UX Features
- **Modern Design**: Built with Tailwind CSS and Shadcn UI components
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion animations for engaging user experience
- **Intuitive Navigation**: Clean, easy-to-use interface

### 🔧 Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Local Storage**: Data persistence without backend requirements
- **Groq AI Integration**: Advanced OCR and translation capabilities

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key (optional, for OCR features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd korean-flashcard-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Groq API key:
   ```
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

### Using the App

1. **Home Page**: Overview of features and quick access to lessons, quizzes, and games
2. **Lessons**: Create and manage your vocabulary lessons
3. **Quiz**: Test your knowledge with interactive flashcards featuring spaced repetition
4. **Games**: Play Match the Pairs memory game for fun practice
5. **Dashboard**: View your progress, XP, streaks, and learning statistics
6. **Settings**: Configure your preferences, API keys, and feature toggles

### Demo Data

The app comes with pre-loaded demo lessons including:
- Basic Greetings (10 words)
- Food & Drinks (12 words)
- Family Members (11 words)
- Numbers 1-20 (20 words)
- Colors (11 words)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── lessons/           # Lesson management pages
│   ├── quiz/              # Quiz functionality
│   ├── games/             # Interactive games
│   │   └── match-pairs/   # Match the Pairs game
│   ├── dashboard/         # Progress dashboard
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── lesson/           # Lesson-related components
│   ├── quiz/             # Quiz components
│   ├── games/            # Game components
│   ├── dashboard/        # Dashboard components
│   ├── word-input/       # Word input components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utility functions
│   ├── demo-data.ts      # Demo lesson data
│   ├── groq.ts          # Groq API integration
│   ├── quiz.ts          # Quiz logic with spaced repetition
│   ├── storage.ts       # Local storage utilities
│   ├── progress.ts      # Progress tracking
│   ├── pronunciation.ts # Speech synthesis
│   ├── match-game.ts    # Match game logic
│   ├── image-service.ts # Image fetching
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions
    └── index.ts
```

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: Groq API
- **Storage**: Browser localStorage

## Features in Detail

### OCR Word Extraction
- Upload images containing Korean text
- Automatic text recognition using Groq AI
- Optional English translation
- Batch processing of multiple words

### Enhanced Learning Features
- **Spaced Repetition**: Smart review intervals based on memory science
- **Pronunciation Practice**: Browser-based speech synthesis for Korean words
- **Context Sentences**: AI-generated examples using Groq API
- **Progress Tracking**: XP system, learning streaks, and detailed statistics
- **Interactive Games**: Match the Pairs memory game for fun practice
- **Visual Memory**: Image attachments for better retention

### Quiz System
- Multiple choice questions with spaced repetition integration
- Configurable question count (5-25)
- Bidirectional learning modes
- Real-time progress tracking with XP rewards
- Detailed results with wrong answer review

### Lesson Management
- Create unlimited custom lessons
- Edit word pairs inline
- Delete individual words or entire lessons
- Import/export functionality (localStorage)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create components in the appropriate directory
2. Add types to `src/types/index.ts`
3. Update routing in `src/app/`
4. Test thoroughly with different screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or issues:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## Roadmap

- [x] Spaced repetition algorithm
- [x] Audio pronunciation
- [x] Progress tracking with XP system
- [x] Interactive games
- [x] Context sentence generation
- [x] Image attachments
- [ ] User authentication and cloud sync
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Community lesson sharing
- [ ] Offline mode support
- [ ] More game types (memory, speed, etc.)
- [ ] Social features and leaderboards