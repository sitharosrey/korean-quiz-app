'use client';

import { useUser } from '@/contexts/UserContext';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    // Show sidebar and adjust layout for authenticated users
    return (
      <>
        <Sidebar />
        <div className="lg:ml-64">
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
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
