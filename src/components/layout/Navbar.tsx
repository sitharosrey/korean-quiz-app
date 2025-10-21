'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Brain, 
  Settings, 
  BarChart3, 
  Gamepad2, 
  Sparkles, 
  Image, 
  Menu,
  X,
  ChevronDown,
  Shuffle,
  Zap,
  Keyboard,
  Headphones,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Lessons', href: '/lessons', icon: BookOpen },
  { name: 'Quiz', href: '/quiz', icon: Brain },
  { name: 'Sentences', href: '/sentences', icon: Sparkles },
  { name: 'Images', href: '/images', icon: Image },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
];

const gamesMenu = [
  { name: 'Match Pairs', href: '/games/match-pairs', icon: Gamepad2, description: 'Memory card matching game' },
  { name: 'Word Scramble', href: '/games/word-scramble', icon: Shuffle, description: 'Unscramble Korean words' },
  { name: 'Speed Quiz', href: '/games/speed-quiz', icon: Zap, description: 'Rapid-fire vocabulary quiz' },
  { name: 'Typing Challenge', href: '/games/typing-challenge', icon: Keyboard, description: 'Test your typing speed' },
  { name: 'Listening Practice', href: '/games/listening-practice', icon: Headphones, description: 'Listen and identify words' },
  { name: 'Fill in the Blanks', href: '/games/fill-blanks', icon: FileText, description: 'Complete sentences' },
  { name: 'Memory Chain', href: '/games/memory-chain', icon: Brain, description: 'Remember word sequences' },
  { name: 'True or False', href: '/games/true-false', icon: CheckCircle, description: 'Quick translation test' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">한</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Korean Learner</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Games Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname.startsWith('/games')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Games
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {gamesMenu.map((game) => (
                    <DropdownMenuItem key={game.name} asChild>
                      <Link
                        href={game.href}
                        className={cn(
                          'flex items-start gap-3 px-3 py-2 cursor-pointer',
                          pathname === game.href && 'bg-blue-50'
                        )}
                      >
                        <game.icon className="w-5 h-5 mt-0.5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{game.name}</div>
                          <div className="text-xs text-gray-500">{game.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side - Settings */}
            <div className="flex items-center space-x-4">
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'text-gray-600 hover:text-gray-900',
                    pathname === '/settings' && 'bg-blue-100 text-blue-700'
                  )}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Games Section in Mobile */}
              <div className="pt-2 pb-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Games
                </div>
                {gamesMenu.map((game) => (
                  <Link
                    key={game.name}
                    href={game.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      pathname === game.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <game.icon className="w-4 h-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{game.name}</div>
                      <div className="text-xs text-gray-500">{game.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Mobile Settings Link */}
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/settings' && 'bg-blue-100 text-blue-700'
                )}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
