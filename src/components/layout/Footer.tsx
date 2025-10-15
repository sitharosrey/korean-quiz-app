'use client';

import { Heart, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* App Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Korean Flashcard Trainer
            </h3>
            <p className="text-gray-600 text-sm">
              Master Korean vocabulary with interactive flashcards, AI-powered translation, and personalized lessons.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Interactive Flashcards</li>
              <li>• AI Translation (Groq API)</li>
              <li>• Custom Lessons</li>
              <li>• Progress Tracking</li>
              <li>• Quiz Mode</li>
            </ul>
          </div>

          {/* Contact & Links */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com/sitharosrey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="mailto:sitharosrey@gmail.com"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-gray-600">
              Created by <strong>Srey Sitharo</strong>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 Korean Flashcard Trainer by Srey Sitharo. Built with Next.js and Tailwind CSS.
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> for Korean learners
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
