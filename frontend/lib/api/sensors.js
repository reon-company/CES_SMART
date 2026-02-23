import api from '../api';

// 유지보수 메모:
// History 쿼리 파라미터 키는 백엔드 계약의 일부입니다.
// 날짜/필터 의미가 변경되면 프론트엔드와 백엔드를 함께 수정하세요.
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

