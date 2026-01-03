# 500 Internal Server Error 해결 가이드

## 문제

릴레이 상태 조회 시 500 Internal Server Error가 발생합니다.

## 가능한 원인

### 1. `actuator_status` 테이블에 `relay` 컬럼이 없음

가장 가능성이 높은 원인입니다. 마이그레이션을 실행하지 않았을 수 있습니다.

## 해결 방법

### 서버에서 데이터베이스 확인 및 수정

```bash
ssh -i [key].pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend
```

### 1. 데이터베이스에 연결하여 테이블 구조 확인

```bash
mysql -u [username] -p -h [rds-endpoint] ces_smartfarm
```

또는 `.env` 파일에서 데이터베이스 정보 확인:

```bash
cat .env | grep DB_
```

### 2. `actuator_status` 테이블에 `relay` 컬럼이 있는지 확인

```sql
DESCRIBE actuator_status;
```

**예상 출력** (relay 컬럼이 있어야 함):
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
| relay      | tinyint(1) | YES  |     | 0       |       |  <-- 이게 있어야 함
| updated_at | timestamp   | YES  |     | NULL    |       |
+------------+-------------+------+-----+---------+-------+
```

### 3. `relay` 컬럼이 없으면 추가

```sql
USE ces_smartfarm;

ALTER TABLE actuator_status
ADD COLUMN relay BOOLEAN DEFAULT FALSE AFTER cooler;
```

### 4. 마이그레이션 파일 실행

또는 마이그레이션 파일을 직접 실행:

```bash
mysql -u [username] -p -h [rds-endpoint] ces_smartfarm < database/migration_add_relay.sql
```

### 5. 서버 재시작

```bash
pm2 restart ces-smartfarm
```

### 6. 테스트

```bash
curl http://localhost:3000/api/actuators/status/MODULE_001
```

## 서버 로그 확인

500 오류의 정확한 원인을 확인하려면:

```bash
pm2 logs ces-smartfarm --lines 50 | grep -A 5 "error\|Error\|ERROR"
```

또는:

```bash
tail -f ~/ces-smartfarm/backend/logs/err.log
```

## 빠른 수정 스크립트

데이터베이스 정보를 `.env`에서 가져와서 실행:

```bash
cd ~/ces-smartfarm/backend

# .env에서 DB 정보 추출
DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2)
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASS=$(grep DB_PASSWORD .env | cut -d '=' -f2)
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)

# relay 컬럼 추가
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME << EOF
USE ces_smartfarm;
ALTER TABLE actuator_status
ADD COLUMN IF NOT EXISTS relay BOOLEAN DEFAULT FALSE AFTER cooler;
EOF

# 서버 재시작
pm2 restart ces-smartfarm
```

## 확인

마이그레이션 후:

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

