# 서버 완전 초기 설정 가이드

## 새 인스턴스 IP: 13.124.171.62

## 단계별 설정

### 1단계: 기본 패키지 설치

```bash
# 서버 접속
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@13.124.171.62

# 스크립트 다운로드 및 실행
cd ~
wget https://raw.githubusercontent.com/your-repo/ces-smartfarm/main/backend/SERVER_SETUP.sh
# 또는 로컬에서 업로드
chmod +x SERVER_SETUP.sh
bash SERVER_SETUP.sh
```

또는 수동 설치:

```bash
# 시스템 업데이트
sudo apt update
sudo apt upgrade -y

# Node.js 설치 (LTS 20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL 설치
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# PM2 설치
sudo npm install -g pm2

# Nginx 설치
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 프로젝트 디렉토리 생성
mkdir -p ~/ces-smartfarm/backend/logs
```

### 2단계: MySQL 데이터베이스 설정

```bash
# MySQL 보안 설정
sudo mysql_secure_installation
# 비밀번호 설정, 익명 사용자 제거, 원격 루트 로그인 비활성화 등

# 데이터베이스 및 사용자 생성
sudo mysql
```

MySQL 콘솔에서:

```sql
CREATE DATABASE ces_smartfarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ces_user'@'localhost' IDENTIFIED BY '강력한_비밀번호_입력';
GRANT ALL PRIVILEGES ON ces_smartfarm.* TO 'ces_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3단계: 프로젝트 코드 배포

#### 옵션 A: Git 사용 (권장)

```bash
cd ~/ces-smartfarm
git clone https://github.com/your-repo/ces-smartfarm.git .
# 또는
git clone https://github.com/your-repo/ces-smartfarm.git temp
mv temp/* temp/.* . 2>/dev/null || true
rmdir temp
```

#### 옵션 B: SCP로 파일 업로드

로컬에서:

```bash
scp -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem -r backend ubuntu@13.124.171.62:~/ces-smartfarm/
```

### 4단계: 데이터베이스 스키마 생성

```bash
cd ~/ces-smartfarm/backend
mysql -u ces_user -p ces_smartfarm < database/schema.sql
mysql -u ces_user -p ces_smartfarm < database/migration_add_wifi.sql
mysql -u ces_user -p ces_smartfarm < database/migration_add_relay.sql
```

### 5단계: 환경 변수 설정

```bash
cd ~/ces-smartfarm/backend
nano .env
```

다음 내용 입력:

```env
# 서버 설정
NODE_ENV=production
PORT=3000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USER=ces_user
DB_PASSWORD=위에서_설정한_비밀번호
DB_NAME=ces_smartfarm

# JWT 설정
JWT_SECRET=강력한_랜덤_문자열_생성_필요

# CORS 설정
CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app
```

JWT_SECRET 생성:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6단계: 의존성 설치 및 서버 시작

```bash
cd ~/ces-smartfarm/backend
npm install

# PM2로 서버 시작
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 시스템 재시작 시 자동 시작 설정
```

### 7단계: Nginx 설정 (HTTPS 준비)

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

### 8단계: 방화벽 설정 확인

AWS Lightsail 콘솔에서:
1. 인스턴스 선택
2. "Networking" 탭
3. 방화벽 규칙 확인:
   - HTTP (포트 80) - 허용
   - HTTPS (포트 443) - 허용
   - Custom (포트 3000) - 허용 (선택사항)
   - SSH (포트 22) - 허용

### 9단계: 확인

```bash
# 서버 상태 확인
pm2 status
pm2 logs ces-smartfarm --lines 20

# API 테스트
curl http://localhost:3000/api/health
curl http://13.124.171.62/api/health
```

## 프론트엔드 업데이트

새 IP 주소로 프론트엔드 API URL 업데이트:

```javascript
// frontend/public/js/api.js
return 'https://13.124.171.62';  // 또는 도메인 사용 시
```

## DNS 설정 (도메인 사용 시)

도메인을 사용하는 경우:
1. Route 53에서 A 레코드 설정: `CES-smart.reonaicoffee.com` → `13.124.171.62`
2. DNS 전파 대기 (5-10분)
3. Let's Encrypt 인증서 발급

## 문제 해결

### MySQL 접속 오류
```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '새_비밀번호';
FLUSH PRIVILEGES;
```

### PM2 프로세스가 시작되지 않음
```bash
pm2 logs ces-smartfarm --err
# 로그 확인 후 문제 해결
```

### 포트가 이미 사용 중
```bash
sudo lsof -i :3000
# 프로세스 종료 후 재시작
```

## 완료 체크리스트

- [ ] Node.js 설치 완료
- [ ] MySQL 설치 및 데이터베이스 생성 완료
- [ ] 프로젝트 코드 배포 완료
- [ ] 데이터베이스 스키마 생성 완료
- [ ] .env 파일 설정 완료
- [ ] npm install 완료
- [ ] PM2로 서버 시작 완료
- [ ] Nginx 설정 완료
- [ ] 방화벽 설정 확인 완료
- [ ] API 테스트 성공
- [ ] 프론트엔드 API URL 업데이트 완료

