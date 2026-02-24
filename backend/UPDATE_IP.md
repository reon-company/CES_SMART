# 서버 IP 주소 변경 가이드

## 새로운 서버 정보

- **새 IP 주소**: 43.203.141.2
- **새 API 도메인**: https://CES-smart.reonaicoffee.com
- **이전 IP 주소**: 54.180.237.225

## 업데이트 필요 사항

### 1. 백엔드 CORS 설정

서버에 접속하여 `.env` 파일 수정:

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend
nano .env
```

`.env` 파일에서 CORS_ORIGIN 확인 (변경 불필요 - 도메인 기반이므로):
```env
CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app
```

### 2. 프론트엔드 API 설정

업데이트 필요:
- `frontend/public/js/api.js`: `https://CES-smart.reonaicoffee.com`
- `frontend/lib/api.js`: `https://CES-smart.reonaicoffee.com`
- `frontend/public/module.html`: `https://CES-smart.reonaicoffee.com`

### 3. HTTPS 설정 (Nginx)

HTTPS를 설정한 경우, SSL 인증서의 CN을 업데이트하거나 새로 생성:

```bash
# 기존 인증서 삭제 (선택사항)
sudo rm /etc/ssl/certs/ces-api.crt
sudo rm /etc/ssl/private/ces-api.key

# 새 인증서 생성
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/ces-api.key \
  -out /etc/ssl/certs/ces-api.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=CES/CN=CES-smart.reonaicoffee.com"

# Nginx 설정 파일 업데이트
sudo nano /etc/nginx/sites-available/ces-api
```

`server_name`을 새 도메인으로 변경:
```nginx
server_name CES-smart.reonaicoffee.com;
```

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 방화벽 설정

AWS Lightsail 콘솔에서:
- 포트 3000 열기
- 포트 443 (HTTPS) 열기 (설정한 경우)

### 5. 서버 상태 확인

```bash
# Health check (HTTP - 내부 테스트용)
curl http://43.203.141.2:3000/api/health

# HTTPS (프로덕션)
curl https://CES-smart.reonaicoffee.com/api/health
```

## 프론트엔드 재배포

변경 사항을 Git에 푸시:

```bash
cd frontend
git add public/js/api.js lib/api.js public/module.html
git commit -m "Update API server to https://CES-smart.reonaicoffee.com"
git push
```

### 4. 아두이노 설정

아두이노는 HTTPS를 지원하지 않으므로 HTTP로 접근:
- `arduino-r4/CES_SmartFarm/config.h`의 `API_BASE_URL`을 `http://43.203.141.2:3000`으로 설정
- 또는 도메인 사용 시: `http://CES-smart.reonaicoffee.com` (HTTP 포트 80 또는 3000)

Vercel이 자동으로 재배포합니다.

