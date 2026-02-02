import { useState, useEffect } from 'react';

export default function EditModuleModal({ module, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    wifi_ssid: '',
    wifi_password: '',
    camera_stream_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (module) {
      setFormData({
        name: module.name || '',
        wifi_ssid: module.wifi_ssid || '',
        wifi_password: '', // 보안상 비밀번호는 비워둠
        camera_stream_url: module.camera_stream_url || '',
      });
    }
  }, [module]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('모듈 이름을 입력해주세요.');
      return;
    }
    
    // WiFi와 카메라 스트림 URL 중 하나는 있어야 함
    // 기존 모듈에 WiFi가 있었으면, 비밀번호를 비워도 기존 비밀번호가 유지되므로 WiFi 정보가 있다고 봄
    const hasWifi = (formData.wifi_ssid?.trim() && (formData.wifi_password?.trim() || module.wifi_password)) || 
                    (module.wifi_ssid && !formData.wifi_ssid?.trim() && !formData.wifi_password?.trim());
    const hasCamera = formData.camera_stream_url?.trim();
    const hadCamera = module.camera_stream_url;
    
    // 기존에 WiFi나 카메라가 있었거나, 새로 입력한 경우
    if (!hasWifi && !hasCamera && !hadCamera) {
      setError('WiFi 정보 또는 카메라 스트림 URL 중 하나는 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name.trim(),
      };
      
      // WiFi SSID: 빈 문자열이면 undefined (기존 값 유지), 값이 있으면 업데이트
      if (formData.wifi_ssid?.trim()) {
        updateData.wifi_ssid = formData.wifi_ssid.trim();
      } else if (formData.wifi_ssid !== undefined) {
        updateData.wifi_ssid = null;
      }
      
      // WiFi Password: 빈 문자열이면 undefined (기존 값 유지), 값이 있으면 업데이트
      if (formData.wifi_password?.trim()) {
        updateData.wifi_password = formData.wifi_password.trim();
      }
      // 빈 문자열이면 undefined로 보내서 백엔드에서 업데이트하지 않음
      
      // Camera Stream URL: 빈 문자열이면 null, 값이 있으면 업데이트
      if (formData.camera_stream_url?.trim()) {
        updateData.camera_stream_url = formData.camera_stream_url.trim();
      } else {
        updateData.camera_stream_url = null;
      }
      
      await onUpdate(updateData);
    } catch (err) {
      setError(err.message || '모듈 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!module) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">모듈 수정</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              모듈 이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="module_id" className="block text-gray-700 text-sm font-bold mb-2">
              모듈 ID
            </label>
            <input
              type="text"
              id="module_id"
              name="module_id"
              value={module.module_id}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">모듈 ID는 수정할 수 없습니다</p>
          </div>

          <div className="mb-4">
            <label htmlFor="wifi_ssid" className="block text-gray-700 text-sm font-bold mb-2">
              WiFi 이름 (SSID) <span className="text-gray-400 font-normal">(아두이노 R4용, 선택)</span>
            </label>
            <input
              type="text"
              id="wifi_ssid"
              name="wifi_ssid"
              value={formData.wifi_ssid}
              onChange={handleChange}
              placeholder="예: SK_WiFiGIGA91A3_2.4G"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="wifi_password" className="block text-gray-700 text-sm font-bold mb-2">
              WiFi 비밀번호 <span className="text-gray-400 font-normal">(아두이노 R4용, 선택)</span>
            </label>
            <input
              type="password"
              id="wifi_password"
              name="wifi_password"
              value={formData.wifi_password}
              onChange={handleChange}
              placeholder={module.wifi_password ? '기존 비밀번호 유지하려면 비워두세요' : 'WiFi 비밀번호를 입력하세요'}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-xs text-gray-500 mt-1">
              {module.wifi_password 
                ? '비밀번호를 변경하려면 새 비밀번호를 입력하세요. 변경하지 않으려면 비워두세요.'
                : '아두이노 R4 모듈이 이 WiFi에 자동으로 연결됩니다'}
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="camera_stream_url" className="block text-gray-700 text-sm font-bold mb-2">
              카메라 스트림 URL <span className="text-gray-400 font-normal">(ESP32-CAM용, 선택)</span>
            </label>
            <input
              type="url"
              id="camera_stream_url"
              name="camera_stream_url"
              value={formData.camera_stream_url}
              onChange={handleChange}
              placeholder="예: http://192.168.0.100:81/stream"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-xs text-gray-500 mt-1">ESP32-CAM 실시간 영상을 보려면 스트림 URL을 입력하세요 (포트 81, /stream)</p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
