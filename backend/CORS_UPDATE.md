# 백엔드 CORS 설정 업데이트 가이드

## Vercel 배포를 위한 CORS 설정

프론트엔드를 Vercel에 배포한 후, 백엔드 서버의 CORS 설정을 업데이트해야 합니다.

### 1. 서버 접속

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.160.232
```

### 2. 환경 변수 파일 수정

```bash
cd ~/ces-smartfarm/backend
nano .env
```

### 3. CORS_ORIGIN 설정

다음 중 하나를 선택하여 설정:

#### 옵션 1: 특정 도메인만 허용 (권장)

```env
CORS_ORIGIN=http://localhost:8080,https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

> **참고**: `your-vercel-app.vercel.app`을 실제 Vercel 도메인으로 변경하세요.

#### 옵션 2: 모든 도메인 허용 (개발용)

```env
CORS_ORIGIN=*
```

> **주의**: 프로덕션 환경에서는 특정 도메인만 허용하는 것이 보안상 안전합니다.

### 4. 서버 재시작

```bash
# PM2 사용 시
pm2 restart ces-smartfarm --update-env

# 또는 직접 실행 시
# Ctrl+C로 중지 후
npm start
```

### 5. 확인

```bash
# 로그 확인
pm2 logs ces-smartfarm

# 또는
tail -f ~/.pm2/logs/ces-smartfarm-out.log
```

로그에서 다음 메시지가 보이면 성공:
```
Server is running on port 3000
Database connected successfully
```

## 현재 서버 정보

- **IP 주소**: 54.180.160.232
- **포트**: 3000
- **프로토콜**: HTTP

## 문제 해결

### CORS 오류가 계속 발생하는 경우

1. `.env` 파일의 `CORS_ORIGIN` 값 확인
2. 서버 재시작 확인
3. 방화벽 설정 확인 (포트 3000이 열려있는지)
4. Vercel 도메인이 정확히 입력되었는지 확인

### 여러 도메인 허용

쉼표로 구분하여 여러 도메인을 허용할 수 있습니다:

```env
CORS_ORIGIN=http://localhost:8080,https://app1.vercel.app,https://app2.vercel.app
```

