import { useState } from 'react';

// 유지보수 메모:
// 추가 모달 유효성 검사 규칙은 백엔드 moduleValidation 규칙과 일치해야 합니다.
export default function AddModuleModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    module_id: '',
    wifi_ssid: '',
    wifi_password: '',
    camera_stream_url: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.module_id.trim()) {
      setError('모듈 이름과 모듈 ID를 입력해주세요.');
      return;
    }
    // 아두이노 R4 모듈은 WiFi 필수, 카메라 전용은 WiFi 선택
    const needsWifi = !formData.camera_stream_url?.trim();
    if (needsWifi && (!formData.wifi_ssid?.trim() || !formData.wifi_password?.trim())) {
      setError('WiFi SSID와 비밀번호를 입력해주세요. (카메라 전용 모듈인 경우 카메라 스트림 URL만 입력하면 됩니다)');
      return;
    }
    onAdd(formData.name, formData.module_id, formData.wifi_ssid || null, formData.wifi_password || null, formData.camera_stream_url?.trim() || null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">새 모듈 추가</h2>

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
              모듈 ID <span className="text-gray-400 font-normal">(고유한 ID, 아두이노 R4와 구분용)</span>
            </label>
            <input
              type="text"
              id="module_id"
              name="module_id"
              value={formData.module_id}
              onChange={handleChange}
              required
              placeholder="예: MODULE_001 또는 CAM_001"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-xs text-gray-500 mt-1">아두이노 R4 모듈: MODULE_001, ESP32-CAM 모듈: CAM_001</p>
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
            <p className="text-xs text-gray-500 mt-1">카메라 전용 모듈(ESP32-CAM)이면 비워두어도 됩니다 (ESP32-CAM은 .ino 또는 config에서 직접 WiFi 설정)</p>
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
              placeholder="WiFi 비밀번호를 입력하세요"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-xs text-gray-500 mt-1">아두이노 R4 모듈이 이 WiFi에 자동으로 연결됩니다. 카메라 전용 모듈이면 비워두세요.</p>
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
            <p className="text-xs text-gray-500 mt-1">
              ESP32-CAM 실시간 영상을 보려면 스트림 URL을 입력하세요. 형식: <code className="bg-gray-100 px-1 rounded">http://&lt;ESP32-CAM IP&gt;:81/stream</code>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              등록 후 모듈 상세 페이지에 들어가면 실시간 카메라 섹션에 영상이 표시됩니다.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

