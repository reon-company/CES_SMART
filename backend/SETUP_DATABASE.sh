#!/bin/bash

# MySQL 데이터베이스 설정 스크립트
# 사용법: bash SETUP_DATABASE.sh

set -e

echo "=========================================="
echo "MySQL 데이터베이스 설정 시작"
echo "=========================================="

# MySQL 루트 비밀번호 설정 (처음 설치 시)
echo ""
echo "MySQL 보안 설정을 실행합니다..."
echo "비밀번호를 설정하세요 (강력한 비밀번호 권장)"
sudo mysql_secure_installation

# 데이터베이스 및 사용자 생성
echo ""
echo "데이터베이스 및 사용자 생성 중..."
read -p "데이터베이스 이름 (기본: ces_smartfarm): " DB_NAME
DB_NAME=${DB_NAME:-ces_smartfarm}

read -p "데이터베이스 사용자 이름 (기본: ces_user): " DB_USER
DB_USER=${DB_USER:-ces_user}

read -sp "데이터베이스 비밀번호: " DB_PASSWORD
echo ""

# MySQL에 접속하여 데이터베이스 및 사용자 생성
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
EOF

echo ""
echo "데이터베이스 및 사용자 생성 완료!"
echo ""
echo "생성된 정보:"
echo "  데이터베이스: ${DB_NAME}"
echo "  사용자: ${DB_USER}"
echo "  비밀번호: [설정한 비밀번호]"
echo ""
echo "다음 단계:"
echo "1. schema.sql 파일을 실행하여 테이블 생성"
echo "2. .env 파일에 위 정보 입력"


