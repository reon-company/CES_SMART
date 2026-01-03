import axios from 'axios';

// 브라우저 환경에서는 상대 경로를 사용하여 Vercel rewrites를 통해 프록시
// 서버 사이드에서는 원래 백엔드 URL 사용
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // 브라우저 환경: 상대 경로 사용 (Vercel rewrites가 프록시)
    return '/api';
  }
  // 서버 사이드: 원래 백엔드 URL 사용
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.36.109.155:3000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

