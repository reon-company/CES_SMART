# 데이터베이스 마이그레이션 가이드

## 문제

500 Internal Server Error가 발생합니다. `actuator_status` 테이블에 `relay` 컬럼이 없어서 발생하는 문제입니다.

## 해결 방법

### 방법 1: 자동 스크립트 사용 (권장)

서버에 SSH 접속 후:

```bash
cd ~/ces-smartfarm/backend

# 스크립트에 실행 권한 부여 (처음 한 번만)
chmod +x RUN_MIGRATION.sh

# 마이그레이션 실행
./RUN_MIGRATION.sh
```

스크립트가 자동으로:
1. `.env` 파일에서 DB 정보를 읽어옵니다
2. `relay` 컬럼이 있는지 확인합니다
3. 없으면 추가합니다
4. `humidity` 컬럼도 확인하고 추가합니다
5. 테이블 구조를 보여줍니다

### 방법 2: 수동 실행

#### 1. .env 파일에서 DB 정보 확인

```bash
cd ~/ces-smartfarm/backend
cat .env | grep DB_
```

출력 예시:
```
DB_HOST=ces-smartfarm.xxxxx.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_password
DB_NAME=ces_smartfarm
```

#### 2. MySQL로 연결하여 마이그레이션 실행

```bash
# 실제 값으로 대체하세요
mysql -h [실제_RDS_ENDPOINT] -u [실제_DB_USER] -p[실제_DB_PASSWORD] ces_smartfarm
```

MySQL 프롬프트에서:

```sql
USE ces_smartfarm;

-- relay 컬럼 추가
ALTER TABLE actuator_status
ADD COLUMN IF NOT EXISTS relay BOOLEAN DEFAULT FALSE AFTER cooler;

-- humidity 컬럼 추가 (sensor_data 테이블)
ALTER TABLE sensor_data
ADD COLUMN IF NOT EXISTS humidity DECIMAL(5,2) DEFAULT NULL COMMENT '습도 % (DHT11)' AFTER temperature;

-- 확인
DESCRIBE actuator_status;
DESCRIBE sensor_data;

-- 종료
EXIT;
```

#### 3. 또는 한 줄로 실행

```bash
mysql -h [실제_RDS_ENDPOINT] -u [실제_DB_USER] -p[실제_DB_PASSWORD] ces_smartfarm << EOF
ALTER TABLE actuator_status
ADD COLUMN IF NOT EXISTS relay BOOLEAN DEFAULT FALSE AFTER cooler;

ALTER TABLE sensor_data
ADD COLUMN IF NOT EXISTS humidity DECIMAL(5,2) DEFAULT NULL COMMENT '습도 % (DHT11)' AFTER temperature;
EOF
```

### 방법 3: .env에서 자동으로 읽어서 실행

```bash
cd ~/ces-smartfarm/backend

# .env에서 DB 정보 추출
export $(grep -v '^#' .env | grep DB_ | xargs)

# 마이그레이션 실행
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOF
ALTER TABLE actuator_status
ADD COLUMN IF NOT EXISTS relay BOOLEAN DEFAULT FALSE AFTER cooler;

ALTER TABLE sensor_data
ADD COLUMN IF NOT EXISTS humidity DECIMAL(5,2) DEFAULT NULL COMMENT '습도 % (DHT11)' AFTER temperature;
EOF
```

## 마이그레이션 후 확인

### 1. 테이블 구조 확인

```bash
mysql -h [RDS_ENDPOINT] -u [DB_USER] -p[DB_PASSWORD] ces_smartfarm -e "DESCRIBE actuator_status;"
```

**예상 출력**:
```
+------------+-------------+------+-----+---------+-------+
| Field      | Type        | Null | Key | Default | Extra |
+------------+-------------+------+-----+---------+-------+
| id         | int         | NO   | PRI | NULL    | auto_increment |
| module_id  | varchar(50) | NO   | UNI | NULL    |       |
| water_pump | tinyint(1)  | YES  |     | 0       |       |
| air_pump   | tinyint(1)  | YES  |     | 0       |       |
| valve      | tinyint(1)  | YES  |     | 0       |       |
| heater     | tinyint(1)  | YES  |     | 0       |       |
| cooler     | tinyint(1)  | YES  |     | 0       |       |
| relay      | tinyint(1)  | YES  |     | 0       |       |  <-- 이게 있어야 함
| updated_at | timestamp   | YES  |     | NULL    |       |
+------------+-------------+------+-----+---------+-------+
```

### 2. 서버 재시작

```bash
pm2 restart ces-smartfarm
```

### 3. API 테스트

```bash
curl http://localhost:3000/api/actuators/status/MODULE_001
```

**예상 응답** (정상):
```json
{
  "success": true,
  "status": {
    "module_id": "MODULE_001",
    "water_pump": false,
    "air_pump": false,
    "valve": false,
    "heater": false,
    "cooler": false,
    "relay": false
  }
}
```

## 문제 해결

### "Unknown MySQL server host" 오류

`.env` 파일의 `DB_HOST` 값을 확인하세요. `[RDS_ENDPOINT]` 같은 플레이스홀더가 아닌 실제 RDS 엔드포인트 주소여야 합니다.

### "Access denied" 오류

`.env` 파일의 `DB_USER`와 `DB_PASSWORD` 값을 확인하세요.

### "Table doesn't exist" 오류

데이터베이스 이름이 올바른지 확인:
```bash
mysql -h [RDS_ENDPOINT] -u [DB_USER] -p[DB_PASSWORD] -e "SHOW DATABASES;"
```

## 참고

- 마이그레이션 파일: `backend/database/migration_add_relay.sql`
- 자동 스크립트: `backend/RUN_MIGRATION.sh`

