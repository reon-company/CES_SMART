# 서버 IP 주소 변경 가이드

## 새로운 서버 정보

- **새 IP 주소**: 54.180.237.225
- **이전 IP 주소**: 54.180.160.232

## 업데이트 필요 사항

### 1. 백엔드 CORS 설정

서버에 접속하여 `.env` 파일 수정:

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.237.225
cd ~/ces-smartfarm/backend
nano .env
```

`.env` 파일에서 CORS_ORIGIN 확인 (변경 불필요 - 도메인 기반이므로):
```env
CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app
```

### 2. 프론트엔드 API 설정

이미 업데이트됨:
- `frontend/public/js/api.js`: `http://54.180.237.225:3000`
- `frontend/lib/api.js`: `http://54.180.237.225:3000`

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
  -subj "/C=KR/ST=Seoul/L=Seoul/O=CES/CN=54.180.237.225"

# Nginx 설정 파일 업데이트
sudo nano /etc/nginx/sites-available/ces-api
```

`server_name`을 새 IP로 변경:
```nginx
server_name 54.180.237.225;
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
# Health check
curl http://54.180.237.225:3000/api/health

# HTTPS (설정한 경우)
curl -k https://54.180.237.225/api/health
```

## 프론트엔드 재배포

변경 사항을 Git에 푸시:

```bash
cd frontend
git add public/js/api.js lib/api.js
git commit -m "Update API server IP to 54.180.237.225"
git push
```

Vercel이 자동으로 재배포합니다.

