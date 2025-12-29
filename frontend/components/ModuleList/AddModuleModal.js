import { useState } from 'react';

export default function AddModuleModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    module_id: '',
    wifi_ssid: '',
    wifi_password: '',
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
    if (!formData.name.trim() || !formData.module_id.trim() || !formData.wifi_ssid.trim() || !formData.wifi_password.trim()) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    onAdd(formData.name, formData.module_id, formData.wifi_ssid, formData.wifi_password);
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
              모듈 ID (아두이노에서 설정한 MODULE_ID)
            </label>
            <input
              type="text"
              id="module_id"
              name="module_id"
              value={formData.module_id}
              onChange={handleChange}
              required
              placeholder="예: MODULE_001"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="wifi_ssid" className="block text-gray-700 text-sm font-bold mb-2">
              WiFi 이름 (SSID)
            </label>
            <input
              type="text"
              id="wifi_ssid"
              name="wifi_ssid"
              value={formData.wifi_ssid}
              onChange={handleChange}
              required
              placeholder="예: SK_WiFiGIGA91A3_2.4G"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="wifi_password" className="block text-gray-700 text-sm font-bold mb-2">
              WiFi 비밀번호
            </label>
            <input
              type="password"
              id="wifi_password"
              name="wifi_password"
              value={formData.wifi_password}
              onChange={handleChange}
              required
              placeholder="WiFi 비밀번호를 입력하세요"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-xs text-gray-500 mt-1">아두이노가 이 WiFi에 자동으로 연결됩니다</p>
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

