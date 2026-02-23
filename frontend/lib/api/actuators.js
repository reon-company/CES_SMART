import api from '../api';

// 유지보수 메모:
// 이 래퍼는 레거시와 현재 액추에이터 라우트 형태를 연결합니다.
// 엔드포인트 경로 변경 전 백엔드 라우트 호환성을 확인하세요.
export const actuatorsAPI = {
  getStatus: async (moduleId) => {
    const response = await api.get(`/api/actuators/status/${moduleId}`);
    return response.data;
  },

  control: async (moduleId, actuator, status) => {
    const response = await api.post(`/api/actuators/control/${moduleId}`, {
      actuator,
      status,
    });
    return response.data;
  },
};

