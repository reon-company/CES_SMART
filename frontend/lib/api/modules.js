import api from '../api';

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

