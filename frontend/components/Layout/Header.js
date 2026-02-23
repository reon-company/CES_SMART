import Link from 'next/link';

// 유지보수 메모:
// Header는 DashboardLayout에서 user 객체를 받습니다. prop 계약을 안정적으로 유지하세요.
export default function Header({ user, onLogout }) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition">
            <div className="text-2xl">🌱</div>
            <h1 className="text-2xl font-bold text-white">CES SmartFarm</h1>
          </Link>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">{user.name || '사용자'}</p>
                  <p className="text-xs text-blue-100">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition border border-white border-opacity-30"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

