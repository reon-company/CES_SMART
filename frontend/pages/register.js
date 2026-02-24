import { useEffect } from 'react';
import { useRouter } from 'next/router';
import RegisterForm from '../components/Auth/RegisterForm';
import { isAuthenticated } from '../lib/auth';

// 유지보수 메모:
// 세션 일관성을 위해 회원가입 페이지는 로그인과 동일한 리다이렉트 정책을 따릅니다.
export default function Register() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}

