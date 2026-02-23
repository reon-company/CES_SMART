// 인증 관련 함수
// 유지보수 메모:
// 정적 페이지 공용 인증 유틸입니다. token 키 이름과 로그아웃 리다이렉트 대상은
// API 401 처리 및 페이지별 auth guard와 결합되어 있으므로 함께 관리해야 합니다.
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
    window.location.href = 'login.html';
  },
};

