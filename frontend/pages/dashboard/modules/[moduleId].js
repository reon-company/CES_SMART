import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import SensorPanel from '../../../components/SensorPanel/SensorPanel';
import SensorChart from '../../../components/SensorPanel/SensorChart';
import ActuatorControl from '../../../components/ActuatorControl/ActuatorControl';
import { modulesAPI } from '../../../lib/api/modules';
import { isAuthenticated } from '../../../lib/auth';

export default function ModuleDetailPage() {
  const router = useRouter();
  const { moduleId } = router.query;
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      setAuthenticated(true);
      if (moduleId) {
        fetchModule();
      }
    }
  }, [moduleId, router]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await modulesAPI.getById(moduleId);
      if (response.success && response.module) {
        setModule(response.module);
      } else {
        console.error('Module not found or access denied');
        router.push('/dashboard/modules');
      }
    } catch (error) {
      console.error('Failed to fetch module:', error);
      // 에러 상세 정보 출력
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      router.push('/dashboard/modules');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-300', text: '활성' },
      inactive: { color: 'bg-gray-100 text-gray-800 border-gray-300', text: '비활성' },
      error: { color: 'bg-red-100 text-red-800 border-red-300', text: '오류' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!mounted || !authenticated) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">모듈 정보를 불러오는 중...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!module) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">모듈을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">모듈이 삭제되었거나 접근 권한이 없습니다.</p>
          <button
            onClick={() => router.push('/dashboard/modules')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            모듈 목록으로 돌아가기
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard/modules')}
              className="text-blue-500 hover:text-blue-700 font-medium flex items-center space-x-2 transition"
            >
              <span>←</span>
              <span>모듈 목록으로 돌아가기</span>
            </button>
            {getStatusBadge(module.status)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">🔌</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{module.name}</h1>
                <p className="text-gray-600">모듈 ID: <span className="font-mono font-semibold">{module.module_id}</span></p>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>생성일: {new Date(module.created_at).toLocaleString('ko-KR')}</p>
                  {module.updated_at && (
                    <p>마지막 업데이트: {new Date(module.updated_at).toLocaleString('ko-KR')}</p>
                  )}
                </div>
              </div>
            </div>
            {module.wifi_ssid && (
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">WiFi 네트워크</p>
                <p className="text-lg font-semibold text-gray-900">📶 {module.wifi_ssid}</p>
              </div>
            )}
          </div>
        </div>

        {/* 센서 데이터 섹션 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">실시간 센서 데이터</h2>
          </div>
          <SensorPanel moduleId={module.module_id} />
        </div>

        {/* 센서 히스토리 차트 섹션 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">📈</span>
            <h2 className="text-2xl font-bold text-gray-900">센서 데이터 히스토리</h2>
            <span className="text-sm text-gray-500">(최근 24시간)</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <SensorChart moduleId={module.module_id} sensorType="water_level" title="워터 레벨 (%)" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <SensorChart moduleId={module.module_id} sensorType="temperature" title="온도 (°C)" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <SensorChart moduleId={module.module_id} sensorType="do_level" title="용존산소 (DO) mg/L" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <SensorChart moduleId={module.module_id} sensorType="ph_level" title="pH" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <SensorChart moduleId={module.module_id} sensorType="light_level" title="조도 (%)" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <SensorChart moduleId={module.module_id} sensorType="wifi_rssi" title="WiFi 신호 강도 (dBm)" />
            </div>
          </div>
        </div>

        {/* 액추에이터 제어 섹션 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">⚙️</span>
            <h2 className="text-2xl font-bold text-gray-900">액추에이터 제어</h2>
          </div>
          <ActuatorControl moduleId={module.module_id} />
        </div>
      </div>
    </DashboardLayout>
  );
}

