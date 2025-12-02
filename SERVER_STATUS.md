# 서버 배포 상태 확인 결과

## ✅ 정상 작동 중인 항목

1. **서버 실행 상태**: PM2에서 "online" 상태로 실행 중

   - 프로세스 ID: 2329
   - 메모리 사용: 60.7MB
   - CPU 사용: 0%

2. **포트 리스닝**: 포트 3000에서 정상적으로 리스닝 중

   ```
   LISTEN 0 511 *:3000 *:*
   ```

3. **API Health Check**: 성공
   ```json
   { "status": "ok", "message": "CES SmartFarm API Server" }
   ```
   - URL: http://3.36.68.151:3000/api/health

## ⚠️ 수정이 필요한 항목

### 1. .env 파일 설정

`.env` 파일이 생성되었지만, 다음 값들을 실제 값으로 변경해야 합니다:

- **DB_HOST**: RDS MySQL 엔드포인트
- **DB_USER**: 데이터베이스 사용자 이름
- **DB_PASSWORD**: 데이터베이스 비밀번호
- **JWT_SECRET**: 최소 32자 이상의 강력한 시크릿 키
- **CORS_ORIGIN**: Vercel 배포 URL

### 2. 데이터베이스 연결 오류

현재 데이터베이스 연결이 실패하고 있습니다:

```
Database connection error: Error: connect ECONNREFUSED 127.0.0.1:3306
```

**해결 방법**:

1. AWS RDS MySQL 인스턴스 생성
2. RDS 보안 그룹에서 Lightsail IP (3.36.68.151) 허용
3. `.env` 파일에 실제 RDS 정보 입력
4. 서버 재시작: `pm2 restart ces-smartfarm`

### 3. PM2 Startup 설정

서버 재시작 시 자동 실행을 위해 다음 명령 실행 필요:

```bash
sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v18.20.8/bin /home/ubuntu/.nvm/versions/node/v18.20.8/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## 다음 단계

1. **RDS 데이터베이스 생성**

   - AWS RDS 콘솔에서 MySQL 인스턴스 생성
   - 보안 그룹 설정

2. **데이터베이스 스키마 적용**

   ```bash
   # MySQL 클라이언트 설치
   sudo apt install mysql-client-core-8.0

   # 스키마 실행
   mysql -h your-rds-endpoint.rds.amazonaws.com -u your_db_user -p < ~/ces-smartfarm/backend/database/schema.sql
   ```

3. **.env 파일 업데이트**

   ```bash
   nano ~/ces-smartfarm/backend/.env
   ```

4. **서버 재시작**

   ```bash
   source ~/.nvm/nvm.sh
   pm2 restart ces-smartfarm
   pm2 logs ces-smartfarm
   ```

5. **방화벽 확인**
   - Lightsail 콘솔에서 포트 3000이 열려있는지 확인

## 현재 서버 접근

- **API Base URL**: http://3.36.68.151:3000
- **Health Check**: http://3.36.68.151:3000/api/health ✅

## 체크리스트

- [x] 서버 배포 완료
- [x] Node.js 설치 완료
- [x] PM2 설치 및 실행 완료
- [x] 포트 3000 리스닝 확인
- [x] API Health Check 성공
- [ ] .env 파일 실제 값으로 설정
- [ ] RDS 데이터베이스 생성 및 연결
- [ ] 데이터베이스 스키마 적용
- [ ] PM2 startup 설정
- [ ] Lightsail 방화벽 포트 3000 열기
