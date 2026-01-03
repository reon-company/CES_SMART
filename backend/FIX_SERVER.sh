#!/bin/bash

# 서버에 접속하여 마이그레이션 실행 및 문제 해결 스크립트
# 사용법: ./FIX_SERVER.sh [SSH_KEY_PATH] [SERVER_IP]

SSH_KEY=${1:-"LightsailDefaultKey-ap-northeast-2.pem"}
SERVER_IP=${2:-"43.203.141.2"}

echo "=========================================="
echo "서버 문제 해결 스크립트"
echo "=========================================="
echo "SSH Key: $SSH_KEY"
echo "Server IP: $SERVER_IP"
echo ""

# SSH 키 파일 확인
if [ ! -f "$SSH_KEY" ]; then
    echo "Error: SSH key file not found: $SSH_KEY"
    echo "Please provide the correct path to the SSH key file"
    exit 1
fi

# SSH 키 권한 설정
chmod 400 "$SSH_KEY"

echo "서버에 접속하여 마이그레이션 실행 중..."
echo ""

# 서버에서 실행할 명령어
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" << 'ENDSSH'
cd ~/ces-smartfarm/backend

echo "=========================================="
echo "1. 현재 디렉토리 확인"
echo "=========================================="
pwd
ls -la

echo ""
echo "=========================================="
echo "2. .env 파일에서 DB 정보 확인"
echo "=========================================="
if [ -f .env ]; then
    echo "DB_HOST: $(grep '^DB_HOST=' .env | cut -d '=' -f2)"
    echo "DB_USER: $(grep '^DB_USER=' .env | cut -d '=' -f2)"
    echo "DB_NAME: $(grep '^DB_NAME=' .env | cut -d '=' -f2)"
else
    echo "Error: .env file not found!"
    exit 1
fi

echo ""
echo "=========================================="
echo "3. .env에서 DB 정보 추출"
echo "=========================================="
DB_HOST=$(grep "^DB_HOST=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_USER=$(grep "^DB_USER=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Database configuration not found in .env file"
    exit 1
fi

echo "DB_HOST: $DB_HOST"
echo "DB_USER: $DB_USER"
echo "DB_NAME: $DB_NAME"

echo ""
echo "=========================================="
echo "4. actuator_status 테이블 구조 확인"
echo "=========================================="
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE actuator_status;" 2>/dev/null || echo "Error connecting to database"

echo ""
echo "=========================================="
echo "5. relay 컬럼 존재 여부 확인"
echo "=========================================="
RELAY_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='actuator_status' AND COLUMN_NAME='relay';" 2>/dev/null)

if [ "$RELAY_EXISTS" = "1" ]; then
    echo "✓ relay column already exists"
else
    echo "✗ relay column does not exist - adding it now..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOF
ALTER TABLE actuator_status
ADD COLUMN relay BOOLEAN DEFAULT FALSE AFTER cooler;
EOF
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully added relay column"
    else
        echo "✗ Failed to add relay column"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "6. humidity 컬럼 존재 여부 확인"
echo "=========================================="
HUMIDITY_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='sensor_data' AND COLUMN_NAME='humidity';" 2>/dev/null)

if [ "$HUMIDITY_EXISTS" = "1" ]; then
    echo "✓ humidity column already exists"
else
    echo "✗ humidity column does not exist - adding it now..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOF
ALTER TABLE sensor_data
ADD COLUMN humidity DECIMAL(5,2) DEFAULT NULL COMMENT '습도 % (DHT11)' AFTER temperature;
EOF
    
    if [ $? -eq 0 ]; then
        echo "✓ Successfully added humidity column"
    else
        echo "✗ Failed to add humidity column"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "7. 최종 테이블 구조 확인"
echo "=========================================="
echo "actuator_status:"
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE actuator_status;" 2>/dev/null

echo ""
echo "sensor_data:"
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE sensor_data;" 2>/dev/null

echo ""
echo "=========================================="
echo "8. 서버 재시작"
echo "=========================================="
pm2 restart ces-smartfarm
sleep 3

echo ""
echo "=========================================="
echo "9. API 테스트"
echo "=========================================="
curl -s http://localhost:3000/api/actuators/status/MODULE_001 | head -20

echo ""
echo "=========================================="
echo "완료!"
echo "=========================================="
ENDSSH

echo ""
echo "서버 작업 완료!"

