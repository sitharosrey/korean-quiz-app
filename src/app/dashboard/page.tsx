'use client';

import { Suspense } from 'react';
import { EnhancedProgressDashboard } from '@/components/dashboard/EnhancedProgressDashboard';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <EnhancedProgressDashboard />
      </Suspense>
    </AuthGuard>
  );
}
