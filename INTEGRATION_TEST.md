# 프론트엔드-백엔드 연동 테스트 가이드

## 현재 상태

### ✅ 완료된 작업
1. 백엔드 서버: http://43.203.141.2:3000 (정상 작동)
2. 프론트엔드 서버: http://localhost:3001 (실행 중)
3. API 기본 URL 설정 완료
4. 데이터베이스 연결 성공

## 연동 테스트 방법

### 1. 브라우저에서 테스트

#### 홈페이지 접속
```
http://localhost:3001
```

#### 회원가입 테스트
1. http://localhost:3001/register 접속
2. 테스트 계정 생성:
   - 이메일: test@example.com
   - 비밀번호: test123456
   - 이름: Test User
3. 회원가입 버튼 클릭
4. 자동으로 대시보드로 이동하는지 확인

#### 로그인 테스트
1. http://localhost:3001/login 접속
2. 위에서 생성한 계정으로 로그인
3. 대시보드로 이동 확인

#### 대시보드 테스트
1. http://localhost:3001/dashboard 접속
2. 모듈 관리 페이지 확인
3. 모듈 추가 기능 테스트

### 2. 개발자 도구로 API 확인

1. 브라우저에서 F12로 개발자 도구 열기
2. Network 탭 선택
3. 회원가입/로그인 시도
4. API 요청이 `http://43.203.141.2:3000`으로 전송되는지 확인
5. 응답 상태 코드 확인 (200 OK)

### 3. 콘솔에서 직접 테스트

```bash
# Health Check
curl http://43.203.141.2:3000/api/health

# 회원가입
curl -X POST http://43.203.141.2:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'

# 로그인
curl -X POST http://43.203.141.2:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

## 예상되는 동작

### 회원가입 성공 시
- 백엔드에서 JWT 토큰 반환
- 프론트엔드에서 localStorage에 토큰 저장
- 자동으로 `/dashboard`로 리다이렉트

### 로그인 성공 시
- 백엔드에서 JWT 토큰 반환
- 프론트엔드에서 localStorage에 토큰 저장
- 자동으로 `/dashboard`로 리다이렉트

### 대시보드 접속 시
- JWT 토큰을 헤더에 포함하여 API 요청
- 사용자 정보 조회
- 등록된 모듈 목록 조회

## 문제 해결

### CORS 오류 발생 시
백엔드 서버의 `.env` 파일 확인:
```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend
cat .env | grep CORS
```

필요시 수정:
```env
CORS_ORIGIN=http://localhost:3001
```

서버 재시작:
```bash
source ~/.nvm/nvm.sh
pm2 restart ces-smartfarm --update-env
```

### API 연결 실패 시
1. 백엔드 서버 상태 확인
2. 방화벽 설정 확인 (포트 3000)
3. 네트워크 연결 확인

### 인증 오류 시
1. 브라우저 개발자 도구 > Application > Local Storage 확인
2. 토큰이 저장되어 있는지 확인
3. 토큰 만료 여부 확인

## 다음 단계

1. ✅ 프론트엔드-백엔드 연동 완료
2. 모듈 추가 기능 테스트
3. 센서 데이터 표시 테스트
4. 액추에이터 제어 테스트
5. Vercel 배포 준비

