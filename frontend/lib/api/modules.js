import api from '../api';

// 유지보수 메모:
// Module API 래퍼는 여러 대시보드 페이지에서 사용됩니다.
// 페이로드 키 이름을 backend/routes/modules.js와 동기화하세요.
export const modulesAPI = {
  getAll: async () => {
    const response = await api.get('/api/modules');
    return response.data;
  },

  getById: async (moduleId) => {
    const response = await api.get(`/api/modules/${moduleId}`);
    return response.data;
  },

  create: async (name, moduleId, wifiSsid, wifiPassword, cameraStreamUrl = null) => {
    const response = await api.post('/api/modules', {
      name,
      module_id: moduleId,
      wifi_ssid: wifiSsid,
      wifi_password: wifiPassword,
      camera_stream_url: cameraStreamUrl || undefined,
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/modules/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/modules/${id}`);
    return response.data;
  },
};

