import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: '대시보드', icon: '📊' },
    { href: '/dashboard/modules', label: '모듈 관리', icon: '🔌' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen border-r border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href || 
              (item.href === '/dashboard/modules' && router.pathname.startsWith('/dashboard/modules'));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">💡 팁</p>
              <p className="text-xs text-gray-600">
                센서 데이터는 30초마다 자동으로 업데이트됩니다.
              </p>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}

