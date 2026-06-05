"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/dashboard/PageHeader';
import KpiGrid from '../../components/dashboard/KpiGrid';
import ContentGrid from '../../components/dashboard/ContentGrid';
import DataTableSkeleton from '../../components/dashboard/DataTableSkeleton';
import DetailPanel from '../../components/dashboard/DetailPanel';

const APP_ROLE = 'SUPERADMIN';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== APP_ROLE)) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#64748B] font-medium">Loading workspace...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        title="Service History"
        subtitle="View and manage all completed and ongoing services."
      />
      <KpiGrid />
      <ContentGrid>
        <DataTableSkeleton />
        <DetailPanel />
      </ContentGrid>
    </div>
  );
}
