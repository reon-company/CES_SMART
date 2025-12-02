# MySQL 설치 및 설정 가이드

현재 Lightsail 서버 (3.36.68.151)에 MySQL을 설치하고 설정하는 방법입니다.

## 1. 서버 접속

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@3.36.68.151
```

## 2. MySQL 설치

```bash
sudo apt update
sudo apt install mysql-server -y
```

## 3. MySQL 보안 설정

```bash
sudo mysql_secure_installation
```

설정 옵션:

- **VALIDATE PASSWORD PLUGIN**: `y` (권장)
- **Password validation policy**: `2` (STRONG 권장)
- **root 비밀번호**: 강력한 비밀번호 입력
- **Remove anonymous users**: `y`
- **Disallow root login remotely**: `y` (로컬에서만 접속)
- **Remove test database**: `y`
- **Reload privilege tables**: `y`

## 4. MySQL 접속 및 데이터베이스 생성

```bash
sudo mysql -u root -p
```

MySQL 콘솔에서 다음 명령어 실행:

```sql
-- 데이터베이스 생성
CREATE DATABASE ces_smartfarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 (비밀번호는 원하는 것으로 변경)
CREATE USER 'ces_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- 권한 부여
GRANT ALL PRIVILEGES ON ces_smartfarm.* TO 'ces_user'@'localhost';

-- 권한 적용
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user = 'ces_user';

-- 종료
EXIT;
```

## 5. 스키마 적용

```bash
cd ~/ces-smartfarm/backend
mysql -u ces_user -p ces_smartfarm < database/schema.sql
```

비밀번호를 입력하면 스키마가 적용됩니다.

## 6. 스키마 확인

```bash
mysql -u ces_user -p ces_smartfarm -e "SHOW TABLES;"
```

다음 테이블들이 생성되어야 합니다:

- users
- modules
- sensor_data
- actuator_status
- thresholds

## 7. .env 파일 업데이트

```bash
nano ~/ces-smartfarm/backend/.env
```

다음 내용으로 수정:

```env
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=ces_user
DB_PASSWORD=your_secure_password_here
DB_NAME=ces_smartfarm

# JWT Configuration
JWT_SECRET=change-this-to-a-very-secret-key-minimum-32-characters-long-for-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

**중요**:

- `DB_PASSWORD`를 4단계에서 설정한 비밀번호로 변경
- `JWT_SECRET`을 최소 32자 이상의 강력한 랜덤 문자열로 변경

## 8. 서버 재시작

```bash
source ~/.nvm/nvm.sh
pm2 restart ces-smartfarm --update-env
pm2 logs ces-smartfarm
```

## 9. 연결 확인

로그에서 다음 메시지가 보이면 성공:

```
Database connected successfully
```

오류가 있다면 로그를 확인하세요:

```bash
pm2 logs ces-smartfarm --err
```

## 10. API 테스트

로컬에서 테스트:

```bash
curl http://3.36.68.151:3000/api/health
```

회원가입 테스트:

```bash
curl -X POST http://3.36.68.151:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

## 문제 해결

### MySQL 접속 오류

```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql
```

### 권한 오류

```bash
# MySQL 재접속하여 권한 확인
sudo mysql -u root -p
SHOW GRANTS FOR 'ces_user'@'localhost';
```

### 포트 확인

```bash
# MySQL이 3306 포트에서 리스닝 중인지 확인
sudo netstat -tlnp | grep 3306
```

## 보안 권장사항

1. **방화벽 설정**: MySQL은 localhost에서만 접속 가능하도록 설정됨 (기본값)
2. **강력한 비밀번호**: 최소 12자 이상, 대소문자, 숫자, 특수문자 포함
3. **정기 백업**: 데이터베이스 백업 스크립트 설정 권장

## 백업 스크립트 예시

```bash
# 백업 디렉토리 생성
mkdir -p ~/backups

# 백업 스크립트 생성
cat > ~/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u ces_user -p ces_smartfarm > ~/backups/ces_smartfarm_$DATE.sql
find ~/backups -name "ces_smartfarm_*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup_db.sh
```
