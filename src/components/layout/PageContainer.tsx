'use client';

import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  const { isAuthenticated } = useUser();

  return (
    <div className={cn(
      "container mx-auto px-4 py-8",
      isAuthenticated ? "lg:px-8" : "lg:px-4",
      className
    )}>
      {children}
    </div>
  );
}
