import api from '../api';

export const sensorsAPI = {
  getLatest: async (moduleId) => {
    const response = await api.get(`/api/sensors/latest/${moduleId}`);
    return response.data;
  },

  getHistory: async (moduleId, startDate, endDate, limit = 100, offset = 0) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit);
    params.append('offset', offset);

    const response = await api.get(
      `/api/sensors/history/${moduleId}?${params.toString()}`
    );
    return response.data;
  },
};

