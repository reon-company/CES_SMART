import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { isAuthenticated } from '../../lib/auth';
import { modulesAPI } from '../../lib/api/modules';
import { sensorsAPI } from '../../lib/api/sensors';

export default function Dashboard() {
  const router = useRouter();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleStats, setModuleStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    error: 0,
  });
  const [recentSensorData, setRecentSensorData] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const modulesResponse = await modulesAPI.getAll();
      if (modulesResponse.success) {
        const modulesList = modulesResponse.modules || [];
        setModules(modulesList);

        // 통계 계산
        const stats = {
          total: modulesList.length,
          active: modulesList.filter((m) => m.status === 'active').length,
          inactive: modulesList.filter((m) => m.status === 'inactive').length,
          error: modulesList.filter((m) => m.status === 'error').length,
        };
        setModuleStats(stats);

        // 각 모듈의 최신 센서 데이터 가져오기
        const sensorPromises = modulesList.slice(0, 6).map(async (module) => {
          try {
            const sensorResponse = await sensorsAPI.getLatest(module.module_id);
            if (sensorResponse.success && sensorResponse.data) {
              return { moduleId: module.module_id, data: sensorResponse.data };
            }
          } catch (error) {
            console.error(`Failed to fetch sensor data for ${module.module_id}:`, error);
          }
          return null;
        });

        const sensorResults = await Promise.all(sensorPromises);
        const sensorDataMap = {};
        sensorResults.forEach((result) => {
          if (result) {
            sensorDataMap[result.moduleId] = result.data;
          }
        });
        setRecentSensorData(sensorDataMap);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-1">
              스마트팜 시스템에 오신 것을 환영합니다. 모듈을 관리하고 센서 데이터를 모니터링하세요.
            </p>
          </div>
          <Link
            href="/dashboard/modules"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition shadow-md hover:shadow-lg"
          >
            모듈 관리
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">전체 모듈</p>
                <p className="text-3xl font-bold mt-2">{moduleStats.total}</p>
                <p className="text-blue-100 text-xs mt-1">최대 30개</p>
              </div>
              <div className="text-4xl opacity-80">🔌</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">활성 모듈</p>
                <p className="text-3xl font-bold mt-2">{moduleStats.active}</p>
                <p className="text-green-100 text-xs mt-1">정상 작동</p>
              </div>
              <div className="text-4xl opacity-80">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium">비활성 모듈</p>
                <p className="text-3xl font-bold mt-2">{moduleStats.inactive}</p>
                <p className="text-gray-100 text-xs mt-1">대기 중</p>
              </div>
              <div className="text-4xl opacity-80">⏸️</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">오류 모듈</p>
                <p className="text-3xl font-bold mt-2">{moduleStats.error}</p>
                <p className="text-red-100 text-xs mt-1">점검 필요</p>
              </div>
              <div className="text-4xl opacity-80">⚠️</div>
            </div>
          </div>
        </div>

        {/* 모듈 목록 (최대 6개) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">모듈 목록</h2>
            <Link
              href="/dashboard/modules"
              className="text-blue-500 hover:text-blue-700 font-medium text-sm"
            >
              전체 보기 →
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-6xl mb-4">🔌</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">등록된 모듈이 없습니다</h3>
              <p className="text-gray-600 mb-6">첫 번째 모듈을 추가하여 시작하세요.</p>
              <Link
                href="/dashboard/modules"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                모듈 추가하기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.slice(0, 6).map((module) => {
                const sensorData = recentSensorData[module.module_id];
                const getStatusColor = (status) => {
                  switch (status) {
                    case 'active':
                      return 'bg-green-100 text-green-800 border-green-300';
                    case 'inactive':
                      return 'bg-gray-100 text-gray-800 border-gray-300';
                    case 'error':
                      return 'bg-red-100 text-red-800 border-red-300';
                    default:
                      return 'bg-gray-100 text-gray-800 border-gray-300';
                  }
                };

                return (
                  <Link
                    key={module.id}
                    href={`/dashboard/modules/${module.module_id}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 block border-2 border-transparent hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{module.name}</h3>
                        <p className="text-sm text-gray-500">ID: {module.module_id}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          module.status
                        )}`}
                      >
                        {module.status === 'active'
                          ? '활성'
                          : module.status === 'inactive'
                          ? '비활성'
                          : '오류'}
                      </span>
                    </div>

                    {sensorData ? (
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">온도</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {sensorData.temperature !== null && sensorData.temperature !== undefined
                              ? `${sensorData.temperature.toFixed(1)}°C`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">워터 레벨</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {sensorData.water_level !== null &&
                            sensorData.water_level !== undefined
                              ? `${sensorData.water_level.toFixed(1)}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">pH</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {sensorData.ph_level !== null && sensorData.ph_level !== undefined
                              ? sensorData.ph_level.toFixed(2)
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">DO</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {sensorData.do_level !== null && sensorData.do_level !== undefined
                              ? `${sensorData.do_level.toFixed(2)} mg/L`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-400 text-center">센서 데이터 없음</p>
                      </div>
                    )}

                    <div className="mt-4 text-right">
                      <span className="text-blue-500 text-sm font-medium hover:text-blue-700">
                        상세 보기 →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 빠른 액세스 */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 액세스</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/modules"
              className="bg-white rounded-lg p-4 hover:shadow-md transition flex items-center space-x-3 border border-gray-200"
            >
              <div className="text-3xl">➕</div>
              <div>
                <p className="font-semibold text-gray-900">모듈 추가</p>
                <p className="text-sm text-gray-600">새 모듈 등록</p>
              </div>
            </Link>
            <Link
              href="/dashboard/modules"
              className="bg-white rounded-lg p-4 hover:shadow-md transition flex items-center space-x-3 border border-gray-200"
            >
              <div className="text-3xl">📊</div>
              <div>
                <p className="font-semibold text-gray-900">모듈 관리</p>
                <p className="text-sm text-gray-600">모든 모듈 보기</p>
              </div>
            </Link>
            <div className="bg-white rounded-lg p-4 flex items-center space-x-3 border border-gray-200">
              <div className="text-3xl">⚙️</div>
              <div>
                <p className="font-semibold text-gray-900">설정</p>
                <p className="text-sm text-gray-600">시스템 설정</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

