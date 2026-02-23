import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/Layout/DashboardLayout';
import SensorPanel from '../../../components/SensorPanel/SensorPanel';
import SensorChart from '../../../components/SensorPanel/SensorChart';
import ActuatorControl from '../../../components/ActuatorControl/ActuatorControl';
import EditModuleModal from '../../../components/ModuleList/EditModuleModal';
import { modulesAPI } from '../../../lib/api/modules';
import { isAuthenticated } from '../../../lib/auth';

export default function ModuleDetailPage() {
  const router = useRouter();
  const { moduleId } = router.query;
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const cameraImgRef = useRef(null);

  // 카메라 스트림 URL을 서버 프록시 URL로 변환
  // 외부 네트워크 사용자도 동일하게 보기 위해 항상 서버를 경유한다.
  const getProxyStreamUrl = (streamUrl, moduleId) => {
    if (!streamUrl || !moduleId) {
      return streamUrl;
    }

    try {
      const url = new URL(streamUrl);

      // 이미 서버 프록시 URL이면 그대로 사용
      if (url.pathname.includes('/api/camera/')) {
        return streamUrl;
      }

      const apiBaseUrl = (() => {
        const explicit = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
        if (explicit) return explicit;

        if (typeof window !== 'undefined') {
          const hostname = (window.location.hostname || '').toLowerCase();
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
          }
        }

        return 'https://ces-smart.reonaicoffee.com';
      })();

      let token = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }
      const proxyUrl = `${apiBaseUrl}/api/camera/${moduleId}/stream${token ? '?token=' + encodeURIComponent(token) : ''}`;
      console.log('Converting stream URL to proxy URL:', streamUrl, '->', proxyUrl);
      return proxyUrl;
    } catch (e) {
      console.error('Invalid stream URL:', streamUrl, e);
      return streamUrl;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId, router]);

  useEffect(() => {
    setCameraError(false);
  }, [module?.camera_stream_url]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const response = await modulesAPI.getById(moduleId);
      if (response.success) {
        setModule(response.module);
      }
    } catch (error) {
      console.error('Failed to fetch module:', error);
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

  const handleUpdateModule = async (updateData) => {
    try {
      setUpdateError('');
      const response = await modulesAPI.update(moduleId, updateData);
      if (response.success) {
        setModule(response.module);
        setShowEditModal(false);
        // 카메라 URL이 변경되면 에러 상태 초기화
        if (updateData.camera_stream_url !== undefined) {
          setCameraError(false);
        }
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || '모듈 수정에 실패했습니다.');
    }
  };

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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center space-x-2"
              >
                <span>✏️</span>
                <span>수정</span>
              </button>
              {getStatusBadge(module.status)}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-5xl">🔌</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{module.name}</h1>
              <p className="text-gray-600">모듈 ID: <span className="font-mono font-semibold">{module.module_id}</span></p>
            </div>
          </div>
        </div>

        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {updateError}
          </div>
        )}

        {/* 실시간 카메라 섹션 (항상 표시) */}
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">📷</span>
              <h2 className="text-2xl font-bold text-gray-900">실시간 카메라</h2>
            </div>
            {module.camera_stream_url && (
              <button
                onClick={() => {
                  setCameraError(false);
                  if (cameraImgRef.current && module.camera_stream_url) {
                    const proxyUrl = getProxyStreamUrl(module.camera_stream_url, module.module_id);
                    const isProxyUrl = proxyUrl.includes('/api/camera/');
                    cameraImgRef.current.src = isProxyUrl 
                      ? proxyUrl 
                      : proxyUrl + (proxyUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
                  }
                }}
                className="text-sm text-blue-500 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>🔄</span>
                <span>새로고침</span>
              </button>
            )}
          </div>
          <div className={`rounded-lg overflow-hidden border-2 border-gray-200 ${module.camera_stream_url ? 'bg-gray-100 aspect-video max-w-6xl mx-auto' : 'bg-gray-50'} flex items-center justify-center ${module.camera_stream_url ? 'min-h-[400px]' : 'min-h-[300px]'}`}>
            {!module.camera_stream_url ? (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-700 font-semibold mb-2">카메라 스트림 URL이 설정되지 않았습니다</p>
                <p className="text-gray-500 text-sm mb-4">
                  모듈 수정 버튼을 클릭하여 카메라 스트림 URL을 입력하세요.
                </p>
                <p className="text-gray-400 text-xs">
                  형식: <code className="bg-gray-200 px-2 py-1 rounded">http://&lt;ESP32-CAM IP&gt;:81/stream</code>
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  예: <code className="bg-gray-200 px-2 py-1 rounded">http://100.69.169.126:81/stream</code> (Tailscale) 또는 <code className="bg-gray-200 px-2 py-1 rounded">http://192.168.1.13:81/stream</code>
                </p>
              </div>
            ) : cameraError ? (
              <div className="text-center p-8">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-gray-700 font-semibold mb-2">카메라에 연결할 수 없습니다</p>
                <div className="text-gray-600 text-sm mb-4 space-y-2">
                  <p>서버 프록시가 ESP32-CAM 주소에 접근할 수 없습니다.</p>
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>원인:</strong> 서버와 ESP32-CAM 사이의 Tailscale/VPN/포트포워딩 경로가 끊겼을 수 있습니다.
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>해결 방법:</strong>
                  </p>
                  <ul className="text-xs text-gray-500 text-left max-w-md mx-auto mt-2 space-y-1">
                    <li>• VPN 설정: 서버를 ESP32-CAM 네트워크에 연결</li>
                    <li>• 포트 포워딩: 라우터에서 ESP32-CAM 포트 열기</li>
                    <li>• 터널링 서비스: ngrok 등 사용</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setCameraError(false);
                    if (cameraImgRef.current && module.camera_stream_url) {
                      const proxyUrl = getProxyStreamUrl(module.camera_stream_url, module.module_id);
                      const isProxyUrl = proxyUrl.includes('/api/camera/');
                      cameraImgRef.current.src = isProxyUrl 
                        ? proxyUrl 
                        : proxyUrl + (proxyUrl.includes('?') ? '&' : '?') + '_t=' + Date.now();
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              <img
                ref={cameraImgRef}
                src={getProxyStreamUrl(module.camera_stream_url, module.module_id)}
                alt="실시간 카메라 영상"
                className="w-full h-full object-contain"
                onError={() => setCameraError(true)}
                onLoad={() => setCameraError(false)}
              />
            )}
          </div>
          {module.camera_stream_url && (
            <>
              <p className="mt-4 text-sm text-gray-500">
                스트림 URL: <span className="font-mono break-all">{module.camera_stream_url}</span>
              </p>
              <p className="mt-2 text-xs text-gray-400">
                ⚠️ 서버가 ESP32-CAM의 로컬 IP에 접근하려면 VPN 또는 포트 포워딩이 필요합니다.
              </p>
            </>
          )}
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
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 lg:col-span-2">
              <SensorChart moduleId={module.module_id} sensorType="light_level" title="조도 (%)" />
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

      {showEditModal && (
        <EditModuleModal
          module={module}
          onClose={() => {
            setShowEditModal(false);
            setUpdateError('');
          }}
          onUpdate={handleUpdateModule}
        />
      )}
    </DashboardLayout>
  );
}

