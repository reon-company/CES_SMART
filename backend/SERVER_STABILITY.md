# 서버 안정성 개선 가이드

## 발견된 문제점

1. **SQL 오류**: `SensorData.getHistory`에서 LIMIT/OFFSET 파라미터 바인딩 오류
2. **에러 핸들링 부족**: 처리되지 않은 예외로 인한 서버 크래시
3. **PM2 설정 부족**: 자동 재시작 및 메모리 제한 없음
4. **데이터베이스 연결**: 타임아웃 설정 부족

## 적용된 수정 사항

### 1. SQL 쿼리 수정
- `SensorData.getHistory`: LIMIT/OFFSET을 쿼리 문자열에 직접 포함하도록 수정

### 2. 에러 핸들링 개선
- 처리되지 않은 예외 처리 추가
- Graceful shutdown 구현
- 데이터베이스 연결 오류 처리

### 3. PM2 설정 추가
- `ecosystem.config.js` 파일 생성
- 메모리 제한 (500MB)
- 자동 재시작 설정
- 로그 관리

### 4. 서버 안정성 개선
- 타임아웃 설정
- Keep-alive 설정
- 요청 크기 제한

## 서버 재시작 방법

### 방법 1: PM2 설정 파일 사용 (권장)

```bash
cd ~/ces-smartfarm/backend

# PM2 설정 파일로 시작
pm2 start ecosystem.config.js

# 또는 기존 프로세스 삭제 후 재시작
pm2 delete ces-smartfarm
pm2 start ecosystem.config.js
pm2 save
```

### 방법 2: 기존 방식

```bash
cd ~/ces-smartfarm/backend
pm2 restart ces-smartfarm --update-env
```

## 모니터링

```bash
# 프로세스 상태 확인
pm2 status

# 로그 확인
pm2 logs ces-smartfarm

# 메모리 사용량 확인
pm2 monit

# 재시작 횟수 확인
pm2 list
```

## 문제 해결

### 서버가 계속 재시작되는 경우

```bash
# 로그 확인
pm2 logs ces-smartfarm --err --lines 50

# 메모리 사용량 확인
free -h
df -h

# 데이터베이스 연결 확인
mysql -h $DB_HOST -u $DB_USER -p -e "SELECT 1"
```

### 메모리 부족인 경우

1. Lightsail 인스턴스 사양 확인 (최소 1GB RAM 권장)
2. `ecosystem.config.js`에서 `max_memory_restart` 값 조정
3. 데이터베이스 쿼리 최적화

### 데이터베이스 연결 문제

```bash
# .env 파일 확인
cat ~/ces-smartfarm/backend/.env | grep DB_

# 데이터베이스 연결 테스트
cd ~/ces-smartfarm/backend
node -e "require('./config/database').getConnection().then(() => console.log('OK')).catch(e => console.error(e))"
```

## 자동 재시작 설정

서버 재부팅 시 자동으로 시작되도록 설정:

```bash
pm2 startup
pm2 save
```

## 권장 사항

1. **로그 모니터링**: 정기적으로 `pm2 logs` 확인
2. **리소스 모니터링**: `pm2 monit`으로 실시간 모니터링
3. **백업**: 정기적으로 데이터베이스 백업
4. **알림 설정**: PM2 Plus 또는 다른 모니터링 도구 사용


