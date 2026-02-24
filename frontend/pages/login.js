import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/Auth/LoginForm';
import { isAuthenticated } from '../lib/auth';

// 유지보수 메모:
// 로그인 페이지는 불필요한 토큰 발급을 피하기 위해 인증된 사용자를 리다이렉트합니다.
export default function Login() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}

