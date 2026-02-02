# 카메라 스트림 URL 저장 확인 가이드

## 문제 진단

서버 로그에 모듈 업데이트 요청이 보이지 않습니다. 다음을 확인해야 합니다:

1. 데이터베이스에 `camera_stream_url` 컬럼이 있는지
2. 서버 코드가 최신인지
3. 모듈 업데이트 요청이 실제로 서버에 도달하는지

---

## 1단계: 데이터베이스 확인

### 서버에 SSH 접속

```bash
ssh ubuntu@43.203.141.2
# 또는
ssh -i [key-file].pem ubuntu@43.203.141.2
```

### 데이터베이스에 연결

```bash
cd ~/ces-smartfarm/backend

# .env 파일에서 데이터베이스 정보 확인
cat .env | grep DB_
```

### modules 테이블 구조 확인

```bash
# MySQL 접속 (환경 변수에 따라 다름)
mysql -u [DB_USER] -p -h [DB_HOST] ces_smartfarm

# 또는 로컬 MySQL인 경우
mysql -u ces_user -p ces_smartfarm
```

### SQL로 컬럼 확인

```sql
USE ces_smartfarm;

-- modules 테이블 구조 확인
DESCRIBE modules;

-- 또는
SHOW COLUMNS FROM modules;
```

**확인해야 할 것:**
- `camera_stream_url` 컬럼이 있어야 함
- 타입: `VARCHAR(512)`
- NULL 허용: `YES`

### 컬럼이 없으면 추가

```sql
USE ces_smartfarm;

ALTER TABLE modules
ADD COLUMN camera_stream_url VARCHAR(512) DEFAULT NULL
COMMENT 'ESP32-CAM 실시간 스트림 URL (예: http://192.168.0.100:81/stream)'
AFTER wifi_password;
```

또는 마이그레이션 파일 실행:

```bash
cd ~/ces-smartfarm/backend
mysql -u [DB_USER] -p -h [DB_HOST] ces_smartfarm < database/migration_add_camera_stream_url.sql
```

---

## 2단계: 서버 코드 확인 및 업데이트

### 서버 코드가 최신인지 확인

```bash
cd ~/ces-smartfarm/backend

# routes/modules.js에 다음 로그가 있는지 확인
grep -n "Update module request" routes/modules.js
grep -n "camera_stream_url" routes/modules.js

# models/Module.js에 다음 로그가 있는지 확인
grep -n "Adding camera_stream_url" models/Module.js
```

### 서버 재시작

```bash
# PM2로 재시작
pm2 restart ces-smartfarm

# 또는
cd ~/ces-smartfarm/backend
pm2 restart ecosystem.config.js
```

---

## 3단계: 실시간 로그 모니터링

### 실시간 로그 확인

```bash
# 실시간 로그 모니터링 시작
pm2 logs ces-smartfarm --lines 0

# 이 상태에서 브라우저에서 모듈 수정 시도
```

### 확인해야 할 로그

모듈 수정 시 다음 로그가 나타나야 합니다:

```
Update module request: { moduleId: '6', userId: 1, camera_stream_url: 'http://192.168.1.13:81/stream' }
Update data: { name: '1호', wifi_ssid: 'REON9999', camera_stream_url: 'http://192.168.1.13:81/stream' }
Module.update called with data: { id: 6, userId: 1, data: { ... } }
Adding camera_stream_url to update: http://192.168.1.13:81/stream
Executing SQL: UPDATE modules SET name = ?, wifi_ssid = ?, camera_stream_url = ? WHERE id = ? AND user_id = ?
Update result: { affectedRows: 1 }
Updated module from database: { id: 6, name: '1호', camera_stream_url: 'http://192.168.1.13:81/stream' }
```

---

## 4단계: 데이터베이스 직접 확인

### 저장된 값 확인

```sql
USE ces_smartfarm;

-- 특정 모듈의 camera_stream_url 확인
SELECT id, name, module_id, camera_stream_url FROM modules WHERE id = 6;

-- 또는 모든 모듈 확인
SELECT id, name, module_id, camera_stream_url FROM modules;
```

---

## 5단계: 문제 해결

### 로그가 전혀 보이지 않는 경우

1. **서버가 최신 코드로 실행 중인지 확인**
   ```bash
   pm2 restart ces-smartfarm
   ```

2. **코드가 서버에 업로드되었는지 확인**
   ```bash
   cd ~/ces-smartfarm/backend
   cat routes/modules.js | grep "Update module request"
   ```

3. **브라우저에서 실제로 요청이 전송되는지 확인**
   - 브라우저 개발자 도구 (F12)
   - Network 탭에서 PUT `/api/modules/6` 요청 확인
   - 요청 페이로드에 `camera_stream_url`이 포함되어 있는지 확인

### 컬럼이 없어서 에러가 발생하는 경우

```sql
-- 컬럼 추가
ALTER TABLE modules
ADD COLUMN camera_stream_url VARCHAR(512) DEFAULT NULL
COMMENT 'ESP32-CAM 실시간 스트림 URL'
AFTER wifi_password;

-- 확인
DESCRIBE modules;
```

---

## 빠른 확인 명령어

```bash
# 1. 데이터베이스 컬럼 확인
mysql -u [user] -p -h [host] ces_smartfarm -e "DESCRIBE modules;" | grep camera_stream_url

# 2. 서버 코드 확인
cd ~/ces-smartfarm/backend
grep -n "camera_stream_url" routes/modules.js models/Module.js

# 3. 실시간 로그 모니터링
pm2 logs ces-smartfarm --lines 0 | grep --line-buffered "camera_stream_url\|Update module"

# 4. 저장된 값 확인
mysql -u [user] -p -h [host] ces_smartfarm -e "SELECT id, name, camera_stream_url FROM modules WHERE id = 6;"
```
