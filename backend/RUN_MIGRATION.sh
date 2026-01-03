#!/bin/bash

# actuator_status 테이블에 relay 컬럼 추가 마이그레이션 스크립트

cd ~/ces-smartfarm/backend

# .env 파일에서 DB 정보 읽기
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# .env 파일에서 DB 정보 추출
DB_HOST=$(grep "^DB_HOST=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_USER=$(grep "^DB_USER=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
DB_NAME=$(grep "^DB_NAME=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# 값 확인
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Database configuration not found in .env file"
    echo "Please check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env"
    exit 1
fi

echo "Connecting to database: $DB_NAME at $DB_HOST"
echo "User: $DB_USER"
echo ""

# relay 컬럼이 이미 있는지 확인
RELAY_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='actuator_status' AND COLUMN_NAME='relay';" 2>/dev/null)

if [ "$RELAY_EXISTS" = "1" ]; then
    echo "✓ relay column already exists in actuator_status table"
else
    echo "Adding relay column to actuator_status table..."
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

# humidity 컬럼이 sensor_data 테이블에 있는지 확인
HUMIDITY_EXISTS=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='$DB_NAME' AND TABLE_NAME='sensor_data' AND COLUMN_NAME='humidity';" 2>/dev/null)

if [ "$HUMIDITY_EXISTS" = "1" ]; then
    echo "✓ humidity column already exists in sensor_data table"
else
    echo "Adding humidity column to sensor_data table..."
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

# 테이블 구조 확인
echo ""
echo "Current actuator_status table structure:"
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE actuator_status;" 2>/dev/null

echo ""
echo "Migration completed successfully!"
echo "Please restart the server: pm2 restart ces-smartfarm"

