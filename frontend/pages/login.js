import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/Auth/LoginForm';
import { isAuthenticated } from '../lib/auth';

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

