import { useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '../../lib/api/auth';
import { setToken } from '../../lib/auth';

// 유지보수 메모:
// 로그인 성공 경로는 라우트 전환 전에 토큰이 저장된다고 가정합니다.
export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      if (response.success) {
        setToken(response.token);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🌱</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
        <p className="text-gray-600">CES 스마트팜 시스템에 접속하세요</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <span className="text-xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
            className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            </span>
          ) : (
            '로그인'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <a href="/register" className="text-blue-500 hover:text-blue-700 font-semibold">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}

