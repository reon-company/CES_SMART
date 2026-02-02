import api from '../api';

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

