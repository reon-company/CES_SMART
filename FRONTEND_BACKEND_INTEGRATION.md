# 프론트엔드-백엔드 연동 가이드

## 연동 완료 상태

### 백엔드 서버
- **URL**: http://3.36.109.155:3000
- **상태**: ✅ 정상 작동 중
- **데이터베이스**: ✅ 연결 성공

### 프론트엔드 서버
- **URL**: http://localhost:3001 (개발 모드)
- **API 연동**: ✅ 백엔드 서버와 연결됨

## 설정 완료 사항

### 1. API 기본 URL 설정
`frontend/lib/api.js` 파일에서 기본 URL이 백엔드 서버로 설정됨:
```javascript
baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.36.109.155:3000'
```

### 2. 환경 변수 (선택사항)
프로덕션 배포 시 Vercel에서 환경 변수 설정:
```
NEXT_PUBLIC_API_BASE_URL=http://3.36.109.155:3000
```

## 개발 서버 실행

### 로컬 개발
```bash
cd frontend
NEXT_PUBLIC_API_BASE_URL=http://3.36.109.155:3000 npm run dev
```

또는 `.env.local` 파일 생성 (gitignore에 포함됨):
```
NEXT_PUBLIC_API_BASE_URL=http://3.36.109.155:3000
```

### 접속
- 프론트엔드: http://localhost:3001
- 백엔드 API: http://3.36.109.155:3000

## 연동 테스트

### 1. 회원가입 테스트
브라우저에서 http://localhost:3001/register 접속하여 테스트 계정 생성

### 2. 로그인 테스트
http://localhost:3001/login 접속하여 로그인

### 3. 대시보드 테스트
로그인 후 http://localhost:3001/dashboard 접속하여 모듈 관리 기능 확인

## API 연동 확인

### 브라우저 개발자 도구에서 확인
1. F12로 개발자 도구 열기
2. Network 탭 확인
3. API 요청이 `http://3.36.109.155:3000`으로 전송되는지 확인

### 테스트 명령어
```bash
# Health Check
curl http://3.36.109.155:3000/api/health

# 회원가입
curl -X POST http://3.36.109.155:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","name":"Test User"}'

# 로그인
curl -X POST http://3.36.109.155:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

## CORS 설정

백엔드 서버의 CORS 설정이 프론트엔드 개발 서버를 허용하도록 설정되어 있습니다:
- 개발: `http://localhost:3001`
- 프로덕션: Vercel 배포 URL

## 문제 해결

### CORS 오류
백엔드 `.env` 파일에서 `CORS_ORIGIN` 확인:
```env
CORS_ORIGIN=http://localhost:3001
```

### API 연결 실패
1. 백엔드 서버 상태 확인: `curl http://3.36.109.155:3000/api/health`
2. 방화벽 설정 확인 (포트 3000 열려있는지)
3. 네트워크 연결 확인

### 인증 오류
1. JWT 토큰이 localStorage에 저장되는지 확인
2. 토큰이 만료되지 않았는지 확인
3. 백엔드 로그 확인

## 다음 단계

1. ✅ 프론트엔드-백엔드 연동 완료
2. 모듈 추가 및 테스트
3. 센서 데이터 전송 테스트 (아두이노)
4. 액추에이터 제어 테스트
5. Vercel에 프론트엔드 배포

