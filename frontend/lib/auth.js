// Auth utility functions
// 유지보수 메모:
// 로컬 스토리지 토큰 키는 axios 인터셉터 로직 및 정적 auth 헬퍼와 일치해야 합니다.

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const isAuthenticated = () => {
  return getToken() !== null;
};

