# Korean Flashcard Trainer

A modern, full-stack web application for learning Korean vocabulary using interactive flashcards, OCR-powered word extraction, and personalized lessons.

## Features

### 🎯 Core Features
- **Image Upload & OCR**: Upload images containing Korean text and automatically extract vocabulary using Groq AI
- **Manual Word Entry**: Add Korean-English word pairs manually
- **Lesson Management**: Create, organize, and manage custom vocabulary lessons
- **Interactive Quizzes**: Test your knowledge with multiple-choice quizzes
- **Progress Tracking**: Monitor your learning progress and review wrong answers
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

1. **Home Page**: Overview of features and quick access to lessons and quizzes
2. **Lessons**: Create and manage your vocabulary lessons
3. **Quiz**: Test your knowledge with interactive flashcards
4. **Settings**: Configure your preferences and API keys

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
│   ├── settings/          # Settings page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── lesson/           # Lesson-related components
│   ├── quiz/             # Quiz components
│   ├── word-input/       # Word input components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utility functions
│   ├── demo-data.ts      # Demo lesson data
│   ├── groq.ts          # Groq API integration
│   ├── quiz.ts          # Quiz logic
│   ├── storage.ts       # Local storage utilities
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

### Quiz System
- Multiple choice questions
- Configurable question count (5-25)
- Bidirectional learning modes
- Real-time progress tracking
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

- [ ] User authentication and cloud sync
- [ ] Spaced repetition algorithm
- [ ] Audio pronunciation
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Community lesson sharing
- [ ] Offline mode support