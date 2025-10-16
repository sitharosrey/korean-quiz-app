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
  X
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import { UserProfile } from '@/components/auth/UserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const getNavigation = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return [
      { name: 'Lessons', href: '/lessons', icon: BookOpen, requiresAuth: true },
      { name: 'Quiz', href: '/quiz', icon: Brain, requiresAuth: true },
      { name: 'Sentences', href: '/sentences', icon: Sparkles, requiresAuth: true },
      { name: 'Images', href: '/images', icon: Image, requiresAuth: true },
      { name: 'Games', href: '/games/match-pairs', icon: Gamepad2, requiresAuth: true },
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
      { name: 'Settings', href: '/settings', icon: Settings, requiresAuth: true },
    ];
  }

  return [
    { name: 'Home', href: '/', icon: Home, requiresAuth: false },
  ];
};

const getBottomNavigation = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return [
      { name: 'About', href: '/', icon: Home, requiresAuth: false },
    ];
  }
  return [];
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigation = getNavigation(isAuthenticated);
  const bottomNavigation = getBottomNavigation(isAuthenticated);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-white shadow-md"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64",
        "lg:w-64 lg:translate-x-0",
        isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">한</span>
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900">Korean Learner</span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Navigation */}
          {bottomNavigation.length > 0 && (
            <nav className="p-4 border-t border-gray-200 space-y-2">
              {bottomNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn(
                      "w-5 h-5",
                      isCollapsed ? "mx-auto" : "mr-3"
                    )} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className={cn(
                  "flex items-center space-x-3 p-2 rounded-lg bg-gray-50",
                  isCollapsed && "justify-center"
                )}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{user.username}
                      </p>
                    </div>
                  )}
                </div>

                {/* User Actions */}
                <div className={cn(
                  "flex gap-2",
                  isCollapsed && "flex-col"
                )}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(true)}
                    className={cn(
                      "flex-1 justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? "Profile" : undefined}
                  >
                    <UserCircle className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-2">Profile</span>}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className={cn(
                      "flex-1 justify-start text-gray-500 hover:text-gray-700",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? "Sign Out" : undefined}
                  >
                    <LogOut className="w-4 h-4" />
                    {!isCollapsed && <span className="ml-2">Sign Out</span>}
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/auth">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? "Sign In" : undefined}
                >
                  <User className="w-4 h-4" />
                  {!isCollapsed && <span className="ml-2">Sign In</span>}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

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
