# Lightsail 배포 가이드

## 서버 정보

- **IP 주소**: 3.36.68.151
- **SSH 키**: `LightsailDefaultKey-ap-northeast-2.pem`
- **지역**: ap-northeast-2 (서울)

## 1. 서버 초기 설정

### SSH 접속

```bash
chmod 400 LightsailDefaultKey-ap-northeast-2.pem
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@3.36.68.151
```

### Node.js 설치

```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js 18 설치
nvm install 18
nvm use 18
node --version
```

### 프로젝트 디렉토리 생성

```bash
mkdir -p ~/ces-smartfarm/backend
cd ~/ces-smartfarm/backend
```

## 2. 백엔드 배포

### 로컬에서 파일 업로드

```bash
# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh
```

또는 수동으로:

```bash
scp -i LightsailDefaultKey-ap-northeast-2.pem -r backend/* ubuntu@3.36.68.151:~/ces-smartfarm/backend/
```

### 서버에서 설정

```bash
# SSH 접속
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@3.36.68.151

# 프로젝트 디렉토리로 이동
cd ~/ces-smartfarm/backend

# 의존성 설치
npm install

# 환경 변수 파일 생성
nano .env
```

### .env 파일 내용

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (AWS RDS MySQL)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ces_smartfarm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## 3. 데이터베이스 설정

### RDS MySQL 연결

1. AWS RDS 콘솔에서 MySQL 인스턴스 생성
2. 보안 그룹에서 Lightsail IP (3.36.68.151) 허용
3. 데이터베이스 스키마 실행:

```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u your_db_user -p < database/schema.sql
```

## 4. 서버 실행

### 개발 모드

```bash
npm run dev
```

### 프로덕션 모드 (PM2 사용 권장)

```bash
# PM2 설치
npm install -g pm2

# 서버 시작
pm2 start server.js --name ces-smartfarm

# 자동 재시작 설정
pm2 startup
pm2 save
```

### 서버 상태 확인

```bash
pm2 status
pm2 logs ces-smartfarm
```

## 5. 방화벽 설정

### Lightsail 방화벽 설정

1. AWS Lightsail 콘솔 접속
2. 네트워킹 탭에서 포트 3000 열기
3. HTTP (80) 및 HTTPS (443) 포트도 열기 (필요시)

### Ubuntu 방화벽 설정 (ufw)

```bash
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

## 6. Nginx 리버스 프록시 설정 (선택사항)

### Nginx 설치

```bash
sudo apt update
sudo apt install nginx
```

### Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/ces-smartfarm
```

### 설정 내용

```nginx
server {
    listen 80;
    server_name 3.36.68.151;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Nginx 활성화 및 재시작

```bash
sudo ln -s /etc/nginx/sites-available/ces-smartfarm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. API 테스트

### Health Check

```bash
curl http://3.36.68.151:3000/api/health
```

### 로컬에서 테스트

```bash
curl http://3.36.68.151:3000/api/health
```

## 8. 모니터링 및 로그

### PM2 모니터링

```bash
pm2 monit
```

### 로그 확인

```bash
pm2 logs ces-smartfarm
# 또는
tail -f ~/.pm2/logs/ces-smartfarm-out.log
```

## 9. 프론트엔드 환경 변수 업데이트

Vercel 배포 시 환경 변수 설정:

```
NEXT_PUBLIC_API_BASE_URL=http://3.36.68.151:3000
```

또는 Nginx를 사용하는 경우:

```
NEXT_PUBLIC_API_BASE_URL=http://3.36.68.151
```

## 10. 아두이노 설정 업데이트

`arduino-r4/config.h` 파일에서:

```cpp
#define API_BASE_URL "http://3.36.68.151:3000"
```

## 문제 해결

### 포트가 열려있지 않은 경우

```bash
# 포트 확인
sudo netstat -tlnp | grep 3000

# 프로세스 확인
ps aux | grep node
```

### 데이터베이스 연결 실패

- RDS 보안 그룹에서 Lightsail IP 허용 확인
- 데이터베이스 엔드포인트 확인
- 사용자 이름 및 비밀번호 확인

### 서버 재시작 후 자동 실행

```bash
pm2 startup
pm2 save
```
