"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Upload, Settings, Gamepad2, BarChart3, Volume2, Sparkles, Target, Zap, Shuffle, Keyboard, Headphones, FileText, CheckCircle, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";

export default function Home() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Korean Learner
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master Korean vocabulary with spaced repetition, pronunciation practice, context sentences, and interactive games.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Brain, title: "Spaced Repetition", description: "Smart review system that adapts to your learning pace and memory retention", color: "text-blue-500" },
          { icon: Volume2, title: "Pronunciation Practice", description: "Hear correct Korean pronunciation using browser speech synthesis", color: "text-green-500" },
          { icon: Sparkles, title: "Context Sentences", description: "Generate example sentences using AI to understand word usage in context", color: "text-purple-500" },
          { icon: Gamepad2, title: "Match the Pairs", description: "Fun memory game to reinforce Korean-English word associations", color: "text-orange-500" },
          { icon: BarChart3, title: "Progress Dashboard", description: "Track your learning journey with XP, streaks, and detailed statistics", color: "text-indigo-500" },
          { icon: BookOpen, title: "Organize Lessons", description: "Create and manage custom lessons with your Korean-English word pairs", color: "text-pink-500" },
          { icon: Upload, title: "Image Attachments", description: "Add visual memory aids with auto-fetched or uploaded images", color: "text-cyan-500" },
          { icon: Settings, title: "Customizable", description: "Adjust settings, review wrong answers, and learn at your own pace", color: "text-yellow-500" },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className={`w-8 h-8 ${feature.color} mb-2`} />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ready to Start Learning?</h2>
        <p className="text-gray-600 mb-6">Get started with your Korean learning journey!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quiz">
            <Button size="lg" className="w-full sm:w-auto">
              <Target className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </Link>
          <Link href="/lessons">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <BookOpen className="w-5 h-5 mr-2" />
              Manage Lessons
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Progress
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Demo Data Notice */}
      <motion.div 
        className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Memory Booster Update</h3>
        <p className="text-blue-700">
          This enhanced version includes advanced spaced repetition, multiple quiz modes (typing, dictation, multiple choice), 
          AI-generated context sentences, visual memory aids, comprehensive progress tracking with charts and achievements, 
          and gamification features to make your Korean learning journey more effective and engaging.
        </p>
      </motion.div>

      {/* Games Section */}
      <motion.div 
        className="mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Brain Training Games
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Boost your memory and typing skills with fun, interactive games designed to help you master Korean vocabulary faster
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Match Pairs",
              description: "Test your memory by matching Korean words with English translations",
              icon: Gamepad2,
              color: "bg-gradient-to-br from-blue-500 to-blue-600",
              textColor: "text-blue-600",
              bgColor: "bg-blue-50",
              href: "/games/match-pairs",
              xp: "10 XP per pair"
            },
            {
              title: "Word Scramble",
              description: "Unscramble Korean letters to form the correct words",
              icon: Shuffle,
              color: "bg-gradient-to-br from-green-500 to-green-600",
              textColor: "text-green-600",
              bgColor: "bg-green-50",
              href: "/games/word-scramble",
              xp: "15 XP per word"
            },
            {
              title: "Speed Quiz",
              description: "Race against the clock in rapid-fire vocabulary challenges",
              icon: Zap,
              color: "bg-gradient-to-br from-yellow-500 to-orange-500",
              textColor: "text-yellow-600",
              bgColor: "bg-yellow-50",
              href: "/games/speed-quiz",
              xp: "10-15 XP per question"
            },
            {
              title: "Typing Challenge",
              description: "Improve your Korean typing speed and accuracy",
              icon: Keyboard,
              color: "bg-gradient-to-br from-purple-500 to-purple-600",
              textColor: "text-purple-600",
              bgColor: "bg-purple-50",
              href: "/games/typing-challenge",
              xp: "12+ XP per word"
            },
            {
              title: "Listening Practice",
              description: "Listen to Korean pronunciation and identify the correct word",
              icon: Headphones,
              color: "bg-gradient-to-br from-pink-500 to-pink-600",
              textColor: "text-pink-600",
              bgColor: "bg-pink-50",
              href: "/games/listening-practice",
              xp: "15 XP per question"
            },
            {
              title: "Fill in the Blanks",
              description: "Complete Korean sentences with the correct words",
              icon: FileText,
              color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
              textColor: "text-cyan-600",
              bgColor: "bg-cyan-50",
              href: "/games/fill-blanks",
              xp: "20 XP per sentence"
            },
            {
              title: "Memory Chain",
              description: "Remember sequences of Korean words and type them back",
              icon: Brain,
              color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
              textColor: "text-indigo-600",
              bgColor: "bg-indigo-50",
              href: "/games/memory-chain",
              xp: "25 XP per round"
            },
            {
              title: "True or False",
              description: "Quick-fire quiz to test your translation skills",
              icon: CheckCircle,
              color: "bg-gradient-to-br from-red-500 to-red-600",
              textColor: "text-red-600",
              bgColor: "bg-red-50",
              href: "/games/true-false",
              xp: "8 XP + streaks"
            },
            {
              title: "Flashcard Study",
              description: "Master vocabulary with classic flashcard memorization",
              icon: Layers,
              color: "bg-gradient-to-br from-teal-500 to-teal-600",
              textColor: "text-teal-600",
              bgColor: "bg-teal-50",
              href: "/games/flashcard",
              xp: "10 XP + bonuses"
            }
          ].map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
            >
              <Link href={game.href}>
                <Card className="hover:shadow-xl transition-all hover:-translate-y-1 h-full cursor-pointer group">
                  <CardHeader>
                    <div className={`w-16 h-16 ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <game.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg mb-2">{game.title}</CardTitle>
                    <CardDescription className="mb-3">
                      {game.description}
                    </CardDescription>
                    <div className={`inline-block px-3 py-1 ${game.bgColor} rounded-full`}>
                      <span className={`text-xs font-semibold ${game.textColor}`}>
                        {game.xp}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How to Use Section */}
      <motion.div 
        className="mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Take Quiz",
              description: "Test your knowledge with interactive quizzes and spaced repetition",
              icon: Target,
              color: "bg-blue-500",
              href: "/quiz"
            },
            {
              step: "2", 
              title: "Manage Lessons",
              description: "Create and organize your Korean vocabulary lessons",
              icon: BookOpen,
              color: "bg-green-500",
              href: "/lessons"
            },
            {
              step: "3",
              title: "Play Games",
              description: "Have fun while learning with memory games and challenges",
              icon: Gamepad2,
              color: "bg-purple-500",
              href: "/games/match-pairs"
            },
            {
              step: "4",
              title: "Track Progress",
              description: "Monitor your learning journey with detailed statistics",
              icon: BarChart3,
              color: "bg-orange-500",
              href: "/dashboard"
            }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
            >
              <Link href={item.href}>
                <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer hover:scale-105">
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}>
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageContainer>
  );
}
