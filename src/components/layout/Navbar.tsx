'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Home, 
  Brain, 
  Settings, 
  BarChart3, 
  Gamepad2, 
  Sparkles, 
  Image, 
  User, 
  LogOut, 
  UserCircle,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import { UserProfile } from '@/components/auth/UserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const getNavigation = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return [
      { name: 'Lessons', href: '/lessons', icon: BookOpen, requiresAuth: true },
      { name: 'Quiz', href: '/quiz', icon: Brain, requiresAuth: true },
      { name: 'Sentences', href: '/sentences', icon: Sparkles, requiresAuth: true },
      { name: 'Images', href: '/images', icon: Image, requiresAuth: true },
      { name: 'Games', href: '/games/match-pairs', icon: Gamepad2, requiresAuth: true },
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
    ];
  }

  return [
    { name: 'Home', href: '/', icon: Home, requiresAuth: false },
  ];
};

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = getNavigation(isAuthenticated);

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
            </div>

            {/* Right side - User menu or Auth button */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  {/* Settings Link */}
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

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 px-3 py-2"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-gray-700">
                          {user.displayName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowProfile(true)}>
                        <UserCircle className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}

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
              
              {/* Mobile Settings Link */}
              {isAuthenticated && (
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
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <UserProfile />
        </DialogContent>
      </Dialog>
    </>
  );
}
