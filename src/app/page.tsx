"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Upload, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Korean Flashcard Trainer
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master Korean vocabulary with interactive flashcards, OCR-powered word extraction, and personalized lessons.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Upload, title: "Upload & Extract", description: "Upload images with Korean text and automatically extract vocabulary using AI", color: "text-blue-500" },
          { icon: BookOpen, title: "Organize Lessons", description: "Create and manage custom lessons with your Korean-English word pairs", color: "text-green-500" },
          { icon: Brain, title: "Interactive Quiz", description: "Test your knowledge with multiple-choice quizzes and track your progress", color: "text-purple-500" },
          { icon: Settings, title: "Customizable", description: "Adjust quiz settings, review wrong answers, and learn at your own pace", color: "text-orange-500" },
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get Started</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/lessons">
            <Button size="lg" className="w-full sm:w-auto">
              <BookOpen className="w-5 h-5 mr-2" />
              Manage Lessons
            </Button>
          </Link>
          <Link href="/quiz">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Brain className="w-5 h-5 mr-2" />
              Start Quiz
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
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Data Available</h3>
        <p className="text-blue-700">
          This app comes with sample Korean vocabulary lessons to help you get started. 
          You can also create your own lessons by uploading images or manually entering word pairs.
        </p>
      </motion.div>
    </div>
  );
}