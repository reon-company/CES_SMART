# 서버 배포 가이드 - 13.124.171.62

## 현재 상태
✅ Node.js 설치 완료 (v20.19.6)
✅ MySQL 설치 완료 (스왑 파일 추가됨)
✅ PM2 설치 완료
✅ Nginx 설치 완료
✅ 프로젝트 디렉토리 생성 완료 (~/ces-smartfarm/backend)

## 다음 단계

### 1. 프로젝트 코드 업로드

로컬에서 다음 명령어 실행:

```bash
# backend 폴더 전체 업로드
scp -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem -r backend/* ubuntu@13.124.171.62:~/ces-smartfarm/backend/

# 또는 Git 사용 (서버에서)
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@13.124.171.62
cd ~/ces-smartfarm
git clone https://your-repo-url.git .
```

### 2. 데이터베이스 설정

서버에서 실행:

```bash
# MySQL 접속
sudo mysql

# 데이터베이스 및 사용자 생성
CREATE DATABASE ces_smartfarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ces_user'@'localhost' IDENTIFIED BY '강력한_비밀번호_입력';
GRANT ALL PRIVILEGES ON ces_smartfarm.* TO 'ces_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 스키마 생성
cd ~/ces-smartfarm/backend
mysql -u ces_user -p ces_smartfarm < database/schema.sql
mysql -u ces_user -p ces_smartfarm < database/migration_add_wifi.sql
mysql -u ces_user -p ces_smartfarm < database/migration_add_relay.sql
```

### 3. 환경 변수 설정

```bash
cd ~/ces-smartfarm/backend
nano .env
```

다음 내용 입력:

```env
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=ces_user
DB_PASSWORD=위에서_설정한_비밀번호
DB_NAME=ces_smartfarm

JWT_SECRET=강력한_랜덤_문자열_생성
CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app
```

JWT_SECRET 생성:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. 의존성 설치 및 서버 시작

```bash
cd ~/ces-smartfarm/backend
npm install

# PM2로 서버 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx 설정

```bash
sudo nano /etc/nginx/sites-available/ces-api
```

다음 내용 입력:

```nginx
server {
    listen 80;
    server_name 13.124.171.62;

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

활성화:

```bash
sudo ln -s /etc/nginx/sites-available/ces-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 확인

```bash
# 서버 상태
pm2 status
pm2 logs ces-smartfarm --lines 20

# API 테스트
curl http://localhost:3000/api/health
curl http://13.124.171.62/api/health
```

### 7. 프론트엔드 업데이트

`frontend/public/js/api.js`에서 IP 주소 업데이트:

```javascript
return 'http://13.124.171.62';  // 또는 HTTPS 사용 시
```

## 중요 사항

⚠️ **메모리 부족 문제**:
- 인스턴스 메모리가 416MB로 매우 작습니다
- 스왑 파일 1GB가 추가되었습니다
- MySQL 메모리 설정이 최적화되어 있습니다
- 프로덕션 환경에서는 더 큰 인스턴스 사용 권장

⚠️ **보안**:
- MySQL 비밀번호를 강력하게 설정하세요
- JWT_SECRET을 안전하게 보관하세요
- .env 파일은 절대 Git에 커밋하지 마세요

## 문제 해결

### MySQL 시작 안 됨
```bash
sudo systemctl status mysql
sudo journalctl -xeu mysql.service
```

### PM2 프로세스 오류
```bash
pm2 logs ces-smartfarm --err
```

### 포트 충돌
```bash
sudo lsof -i :3000
```


