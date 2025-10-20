'use client';

import { Suspense } from 'react';
import { EnhancedProgressDashboard } from '@/components/dashboard/EnhancedProgressDashboard';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <EnhancedProgressDashboard />
    </Suspense>
  );
}
