'use client';

import { useUser } from '@/contexts/UserContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    // Show navbar and adjust layout for authenticated users
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </>
    );
  }

  // Show full-width layout for unauthenticated users
  return (
    <>
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
