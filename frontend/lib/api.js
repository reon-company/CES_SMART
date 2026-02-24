import axios from 'axios';

// 유지보수 메모:
// 이 클라이언트는 Next.js 페이지 전용입니다.
// baseURL 결정/401 리다이렉트 정책은 public/js/api.js와 일치시켜
// 정적 HTML과 Next.js UI의 동작을 동일하게 유지해야 합니다.
const getApiBaseUrl = () => {
  const explicitBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = (window.location.hostname || '').toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }

  return 'https://farm.cessmart.com';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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

