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
    if (typeof window !== 'undefined') {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (!auth) {
        router.push('/login');
        return;
      }
    }
  }, [router]);

  if (!mounted || !authenticated) {
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

