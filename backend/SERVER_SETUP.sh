#!/bin/bash

# CES SmartFarm 서버 초기 설정 스크립트
# 사용법: bash SERVER_SETUP.sh

set -e  # 오류 발생 시 중단

echo "=========================================="
echo "CES SmartFarm 서버 초기 설정 시작"
echo "=========================================="

# 1. 시스템 업데이트
echo ""
echo "[1/8] 시스템 업데이트 중..."
sudo apt update
sudo apt upgrade -y

# 2. Node.js 설치 (LTS 버전)
echo ""
echo "[2/8] Node.js 설치 중..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "Node.js 설치 완료: $(node --version)"
    echo "npm 설치 완료: $(npm --version)"
else
    echo "Node.js가 이미 설치되어 있습니다: $(node --version)"
fi

# 3. MySQL 설치
echo ""
echo "[3/8] MySQL 설치 중..."
if ! command -v mysql &> /dev/null; then
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    echo "MySQL 설치 완료"
else
    echo "MySQL이 이미 설치되어 있습니다"
fi

# 4. PM2 설치
echo ""
echo "[4/8] PM2 설치 중..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "PM2 설치 완료"
else
    echo "PM2가 이미 설치되어 있습니다: $(pm2 --version)"
fi

# 5. Nginx 설치
echo ""
echo "[5/8] Nginx 설치 중..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo "Nginx 설치 완료"
else
    echo "Nginx가 이미 설치되어 있습니다"
fi

# 6. 프로젝트 디렉토리 생성
echo ""
echo "[6/8] 프로젝트 디렉토리 설정 중..."
PROJECT_DIR="$HOME/ces-smartfarm"
if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p "$PROJECT_DIR"
    echo "프로젝트 디렉토리 생성: $PROJECT_DIR"
else
    echo "프로젝트 디렉토리가 이미 존재합니다: $PROJECT_DIR"
fi

# 7. 로그 디렉토리 생성
echo ""
echo "[7/8] 로그 디렉토리 생성 중..."
mkdir -p "$PROJECT_DIR/backend/logs"
echo "로그 디렉토리 생성 완료"

# 8. 완료 메시지
echo ""
echo "=========================================="
echo "기본 패키지 설치 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo "1. 프로젝트 코드를 $PROJECT_DIR/backend에 배포"
echo "2. MySQL 데이터베이스 설정"
echo "3. .env 파일 설정"
echo "4. npm install 실행"
echo "5. PM2로 서버 시작"
echo ""
echo "설치된 버전:"
echo "  Node.js: $(node --version 2>/dev/null || echo 'N/A')"
echo "  npm: $(npm --version 2>/dev/null || echo 'N/A')"
echo "  MySQL: $(mysql --version 2>/dev/null || echo 'N/A')"
echo "  PM2: $(pm2 --version 2>/dev/null || echo 'N/A')"
echo "  Nginx: $(nginx -v 2>&1 || echo 'N/A')"


