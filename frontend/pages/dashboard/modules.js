import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import ModuleList from '../../components/ModuleList/ModuleList';
import { isAuthenticated } from '../../lib/auth';

export default function ModulesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = isAuthenticated();
    setAuthenticated(auth);
    
    if (!auth) {
      router.push('/login');
    }
  }, [router]);

  // 클라이언트 마운트 전에는 로딩 화면 표시 (hydration 에러 방지)
  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!authenticated) {
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

