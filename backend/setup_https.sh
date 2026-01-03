#!/bin/bash

# 백엔드 HTTPS 설정 스크립트
# 서버에서 실행: bash setup_https.sh

set -e

echo "=== CES SmartFarm 백엔드 HTTPS 설정 ==="
echo ""

# 1. Nginx 설치 확인 및 설치
echo "1. Nginx 설치 확인 중..."
if ! command -v nginx &> /dev/null; then
    echo "   Nginx가 설치되어 있지 않습니다. 설치 중..."
    sudo apt update
    sudo apt install nginx -y
    echo "   ✅ Nginx 설치 완료"
else
    echo "   ✅ Nginx가 이미 설치되어 있습니다."
fi

# 2. SSL 인증서 디렉토리 확인
echo ""
echo "2. SSL 인증서 디렉토리 확인 중..."
sudo mkdir -p /etc/ssl/private
sudo mkdir -p /etc/ssl/certs

# 3. 자체 서명 인증서 생성
echo ""
echo "3. SSL 인증서 생성 중..."
if [ ! -f /etc/ssl/certs/ces-api.crt ]; then
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/ces-api.key \
        -out /etc/ssl/certs/ces-api.crt \
        -subj "/C=KR/ST=Seoul/L=Seoul/O=CES/CN=54.180.160.232"
    echo "   ✅ SSL 인증서 생성 완료"
else
    echo "   ✅ SSL 인증서가 이미 존재합니다."
fi

# 4. Nginx 설정 파일 생성
echo ""
echo "4. Nginx 설정 파일 생성 중..."
sudo tee /etc/nginx/sites-available/ces-api > /dev/null <<'EOF'
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
EOF

echo "   ✅ Nginx 설정 파일 생성 완료"

# 5. 기본 설정 비활성화 (선택사항)
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo ""
    echo "5. 기본 Nginx 설정 비활성화 중..."
    sudo rm /etc/nginx/sites-enabled/default
    echo "   ✅ 기본 설정 비활성화 완료"
fi

# 6. 설정 파일 활성화
echo ""
echo "6. Nginx 설정 활성화 중..."
if [ ! -L /etc/nginx/sites-enabled/ces-api ]; then
    sudo ln -s /etc/nginx/sites-available/ces-api /etc/nginx/sites-enabled/
    echo "   ✅ 설정 활성화 완료"
else
    echo "   ✅ 설정이 이미 활성화되어 있습니다."
fi

# 7. Nginx 설정 테스트
echo ""
echo "7. Nginx 설정 테스트 중..."
if sudo nginx -t; then
    echo "   ✅ Nginx 설정이 올바릅니다."
else
    echo "   ❌ Nginx 설정에 오류가 있습니다."
    exit 1
fi

# 8. Nginx 재시작
echo ""
echo "8. Nginx 재시작 중..."
sudo systemctl restart nginx
sudo systemctl enable nginx
echo "   ✅ Nginx 재시작 완료"

# 9. 방화벽 안내
echo ""
echo "9. 방화벽 설정 확인 필요"
echo "   AWS Lightsail 콘솔에서 포트 443 (HTTPS)이 열려있는지 확인하세요."
echo "   또는 다음 명령어로 확인:"
echo "   sudo ufw allow 443/tcp"
echo "   sudo ufw reload"

# 10. 테스트
echo ""
echo "10. HTTPS 연결 테스트 중..."
sleep 2
if curl -k -s https://54.180.160.232/api/health > /dev/null; then
    echo "   ✅ HTTPS 연결 성공!"
    curl -k https://54.180.160.232/api/health
else
    echo "   ⚠️  HTTPS 연결 실패. 방화벽 설정을 확인하세요."
fi

echo ""
echo "=== 설정 완료 ==="
echo ""
echo "다음 단계:"
echo "1. 프론트엔드의 api.js에서 API_BASE_URL을 'https://54.180.160.232'로 변경"
echo "2. Git에 푸시하여 재배포"
echo ""
echo "참고: 자체 서명 인증서이므로 브라우저에서 경고가 표시될 수 있습니다."
echo "      '고급' → '계속 진행'을 클릭하면 사용할 수 있습니다."

