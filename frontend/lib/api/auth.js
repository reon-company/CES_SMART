import api from '../api';

// 유지보수 메모:
// auth 응답 스키마를 LoginForm/RegisterForm 기대와 일치하도록 안정적으로 유지하세요.
export const authAPI = {
  register: async (email, password, name) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};

