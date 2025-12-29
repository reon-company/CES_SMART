// 인증 관련 함수
const auth = {
  // 토큰 저장
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem('token');
  },

  // 토큰 삭제
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // 로그인 여부 확인
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  },
};

