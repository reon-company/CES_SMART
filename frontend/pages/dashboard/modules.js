import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ModuleList from '../../components/ModuleList/ModuleList';
import { isAuthenticated } from '../../lib/auth';

export default function ModulesPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">모듈 관리</h1>
        <ModuleList />
      </div>
    </DashboardLayout>
  );
}

