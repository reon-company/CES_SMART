import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ModuleList from '../../components/ModuleList/ModuleList';
import { isAuthenticated } from '../../lib/auth';

// 유지보수 메모:
// 다른 대시보드 페이지와 인증 가드 동작을 일치시키세요.
// 보호된 콘텐츠 깜빡임 방지를 위해 여기서의 조용한 null 반환은 의도적입니다.
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

