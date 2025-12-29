# 백엔드 CORS 설정 - Vercel 도메인 추가

## 현재 Vercel 도메인
- **프로덕션**: https://ces-smart.vercel.app

## 서버 접속 및 설정

### 1. SSH 접속

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.160.232
```

### 2. 환경 변수 파일 수정

```bash
cd ~/ces-smartfarm/backend
nano .env
```

### 3. CORS_ORIGIN 설정 추가

`.env` 파일에서 `CORS_ORIGIN`을 다음과 같이 설정:

```env
CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app
```

또는 모든 도메인 허용 (개발용):

```env
CORS_ORIGIN=*
```

### 4. 서버 재시작

```bash
# PM2 사용 시
pm2 restart ces-smartfarm --update-env

# 또는
pm2 restart ces-smartfarm
pm2 save
```

### 5. 로그 확인

```bash
pm2 logs ces-smartfarm
```

다음 메시지가 보이면 성공:
```
Server is running on port 3000
Database connected successfully
```

## 확인 방법

1. 브라우저에서 https://ces-smart.vercel.app 접속
2. 개발자 도구(F12) → Network 탭 열기
3. 회원가입 또는 로그인 시도
4. CORS 오류가 없으면 성공!

## 문제 해결

### CORS 오류가 계속 발생하는 경우

1. `.env` 파일의 `CORS_ORIGIN` 값 확인
   ```bash
   cat ~/ces-smartfarm/backend/.env | grep CORS_ORIGIN
   ```

2. 서버가 재시작되었는지 확인
   ```bash
   pm2 status
   pm2 logs ces-smartfarm --lines 50
   ```

3. 방화벽 설정 확인
   - AWS Lightsail 콘솔에서 포트 3000이 열려있는지 확인

4. Vercel 도메인이 정확히 입력되었는지 확인
   - `https://ces-smart.vercel.app` (https 포함)
   - 마지막에 슬래시(`/`) 없음

### 여러 도메인 허용

로컬 개발과 프로덕션을 모두 지원하려면:

```env
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080,https://ces-smart.vercel.app
```

