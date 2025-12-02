# 빠른 시작 가이드

## Lightsail 서버 배포

### 1. 배포 스크립트 실행
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. 서버 접속 및 설정
```bash
# SSH 접속
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@3.36.68.151

# Node.js 설치 (처음 한 번만)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 프로젝트 디렉토리로 이동
cd ~/ces-smartfarm/backend

# 의존성 설치
npm install

# 환경 변수 파일 생성
nano .env
```

### 3. .env 파일 설정
다음 내용을 입력하세요:
```env
PORT=3000
NODE_ENV=production
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ces_smartfarm
JWT_SECRET=your-very-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 4. 데이터베이스 설정
```bash
# RDS에 스키마 적용
mysql -h your-rds-endpoint.rds.amazonaws.com -u your_db_user -p < database/schema.sql
```

### 5. 서버 실행
```bash
# PM2 설치 및 실행
npm install -g pm2
pm2 start server.js --name ces-smartfarm
pm2 startup
pm2 save
```

### 6. 방화벽 설정
Lightsail 콘솔에서 포트 3000을 열어주세요.

### 7. 테스트
```bash
curl http://3.36.68.151:3000/api/health
```

## 프론트엔드 설정

### Vercel 환경 변수
```
NEXT_PUBLIC_API_BASE_URL=http://3.36.68.151:3000
```

## 아두이노 설정

`arduino-r4/config.h` 파일에서:
- `WIFI_SSID`: WiFi 이름
- `WIFI_PASSWORD`: WiFi 비밀번호
- `API_BASE_URL`: 이미 `http://3.36.68.151:3000`으로 설정됨
- `MODULE_ID`: 각 모듈마다 고유 ID 설정

## 체크리스트

- [ ] RDS MySQL 인스턴스 생성
- [ ] RDS 보안 그룹에서 Lightsail IP (3.36.68.151) 허용
- [ ] 데이터베이스 스키마 실행
- [ ] 서버 .env 파일 설정
- [ ] 서버 실행 및 테스트
- [ ] Lightsail 방화벽 포트 3000 열기
- [ ] Vercel 환경 변수 설정
- [ ] 아두이노 WiFi 및 모듈 ID 설정

