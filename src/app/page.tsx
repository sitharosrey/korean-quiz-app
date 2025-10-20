"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Upload, Settings, Gamepad2, BarChart3, Volume2, Sparkles, Target, Zap } from "lucide-react";
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

      {/* How to Use Section */}
      <motion.div 
        className="mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
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
