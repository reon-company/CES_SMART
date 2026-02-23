import { useMemo, useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const apiBase = useMemo(() => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ces-smart.reonaicoffee.com';
    }

    const explicit = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
    if (explicit) return explicit;

    const host = (window.location.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return 'https://ces-smart.reonaicoffee.com';
  }, []);

  const installerDownloadUrl = `${apiBase}/downloads/CES_SMART_Installer.exe`;

  const runVerify = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(`${apiBase}/api/setup/verify`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '검증 실행 실패');
      }
      setResult(data);
    } catch (err) {
      setError(err.message || '검증 실행 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CES 스마트팜 설치 및 셋업</h1>
          <a href="/" className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition">홈으로</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">1) 설치 파일 다운로드</h2>
          <p className="text-gray-600 mb-4">새 PC에서 아래 설치 파일을 다운로드해 실행하세요.</p>
          <a
            href={installerDownloadUrl}
            className="inline-block px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            CES_SMART_Installer.exe 다운로드
          </a>
          <p className="text-xs text-gray-500 mt-3 break-all">다운로드 경로: {installerDownloadUrl}</p>
        </section>

        <section className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">2) 설치/초기 실행</h2>
          <ol className="list-decimal ml-5 text-gray-700 space-y-1">
            <li>설치 프로그램 실행</li>
            <li>설치 완료 후 자동으로 의존성 설치(`npm install`) 진행</li>
            <li>`backend/.env`, `frontend/.env.local` 값 설정</li>
            <li>`start_all.bat`로 백엔드/프론트 실행</li>
          </ol>
        </section>

        <section className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">3) 서버 검증 스크립트 실행</h2>
          <p className="text-gray-600 mb-4">백엔드 헬스/설치파일 존재/API 라우트를 자동 점검합니다.</p>
          <button
            onClick={runVerify}
            disabled={loading}
            className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? '검증 실행 중...' : '검증 스크립트 실행'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4">
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded mb-3">
                {result.message || '검증 완료'}
              </div>
              <pre className="bg-gray-900 text-green-200 p-4 rounded text-xs whitespace-pre-wrap overflow-auto max-h-96">
{result.stdout || '(stdout 없음)'}
              </pre>
              {result.stderr ? (
                <pre className="bg-gray-100 text-red-700 p-4 rounded text-xs whitespace-pre-wrap overflow-auto max-h-96 mt-3">
{result.stderr}
                </pre>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
