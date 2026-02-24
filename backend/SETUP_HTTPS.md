# 백엔드 HTTPS 설정 가이드

## 빠른 설정

서버에 접속하여 다음 명령어를 실행하세요:

```bash
# 1. 스크립트 다운로드 (로컬에서)
# 또는 서버에 직접 스크립트 내용을 복사

# 2. 서버 접속
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.160.232

# 3. 스크립트 실행
cd ~/ces-smartfarm/backend
bash setup_https.sh
```

## 수동 설정

스크립트가 작동하지 않으면 다음을 수동으로 실행:

```bash
# 1. Nginx 설치
sudo apt update
sudo apt install nginx -y

# 2. SSL 인증서 생성
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/ces-api.key \
  -out /etc/ssl/certs/ces-api.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=CES/CN=54.180.160.232"

# 3. Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/ces-api
```

다음 내용 입력:

```nginx
server {
    listen 80;
    server_name 54.180.160.232;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name 54.180.160.232;

    ssl_certificate /etc/ssl/certs/ces-api.crt;
    ssl_certificate_key /etc/ssl/private/ces-api.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 4. 설정 활성화
sudo ln -s /etc/nginx/sites-available/ces-api /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 기본 설정 제거
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 5. 방화벽 설정 (AWS Lightsail 콘솔에서 포트 443 열기)
```

## 확인

```bash
# HTTPS 연결 테스트
curl -k https://54.180.160.232/api/health
```

응답이 오면 성공!

## 프론트엔드 업데이트

HTTPS 설정 후 `frontend/public/js/api.js`에서:

```javascript
return 'https://54.180.160.232';
```

Git에 푸시하여 재배포하세요.
