# 서버 코드 문제점 및 수정 사항

## 발견된 문제점

### 1. ⚠️ **actuators.js - 미완성 함수 (문법 오류)**
- **위치**: `backend/routes/actuators.js` 라인 109-112
- **문제**: `router.post('/control/:moduleId', ...)` 함수가 시작되었지만 완료되지 않음
- **영향**: 서버 시작 시 문법 오류로 인한 크래시 가능성
- **수정**: 함수 완성 또는 제거

### 2. 🔴 **database.js - 메모리 누수 위험**
- **문제점**:
  - `queueLimit: 0` - 무제한 큐로 메모리 누수 가능
  - `acquireTimeout: 60000` - 너무 긴 타임아웃으로 요청이 계속 쌓임
  - 데이터베이스 연결 실패 시 재연결 로직 없음
- **영향**: 메모리 부족으로 서버 다운
- **수정**: 
  - `queueLimit: 5`로 제한
  - 타임아웃을 10초로 단축
  - 자동 재연결 로직 추가

### 3. 🟡 **server.js - 에러 처리 부족**
- **문제점**:
  - `uncaughtException`과 `unhandledRejection`에서 서버를 종료하지 않음
  - 에러가 계속 쌓이면 메모리 누수 가능
- **영향**: 에러가 누적되어 서버 성능 저하
- **수정**: 
  - 에러 카운터 추가
  - 일정 횟수 이상 발생 시 프로세스 종료 (PM2가 재시작)

### 4. 🟡 **PM2 설정 - 메모리 제한 부족**
- **문제점**:
  - `max_memory_restart: '500M'` - 너무 높음
  - 재시작 설정이 너무 관대함
- **영향**: 메모리 부족 시 늦게 재시작
- **수정**: 
  - 메모리 제한을 300M으로 낮춤
  - 재시작 설정 강화

## 적용된 수정 사항

### 1. actuators.js 수정
- 미완성 함수 완성
- 에러 핸들링 추가

### 2. database.js 수정
```javascript
queueLimit: 5, // 무제한 큐 방지
acquireTimeout: 10000, // 10초로 단축
timeout: 10000, // 10초로 단축
reconnect: true, // 자동 재연결
idleTimeout: 300000, // 5분 후 유휴 연결 종료
maxIdle: 5 // 최대 유휴 연결 수
```

### 3. server.js 수정
- 에러 카운터 추가
- 일정 횟수 이상 발생 시 프로세스 종료
- 카운터 자동 리셋 (1시간마다)

### 4. ecosystem.config.js 수정
```javascript
max_memory_restart: '300M', // 더 낮은 메모리 제한
max_restarts: 5, // 재시작 횟수 제한
min_uptime: '30s', // 최소 실행 시간 증가
restart_delay: 10000, // 재시작 지연 증가
```

## 서버 배포 방법

### 1. 코드 업데이트

```bash
# 서버 접속 (브라우저 SSH 또는 로컬 SSH)
cd ~/ces-smartfarm/backend

# Git에서 최신 코드 가져오기
git pull origin main

# 또는 수정된 파일을 직접 업로드
```

### 2. PM2 재시작

```bash
# PM2 프로세스 중지
pm2 stop ces-smartfarm

# PM2 프로세스 삭제
pm2 delete ces-smartfarm

# 새 설정으로 시작
pm2 start ecosystem.config.js

# PM2 저장
pm2 save

# 로그 확인
pm2 logs ces-smartfarm --lines 50
```

### 3. 확인

```bash
# 프로세스 상태
pm2 status

# 메모리 사용량
pm2 monit

# 서버 응답 테스트
curl http://localhost:3000/api/health
```

## 예상 효과

1. **메모리 사용량 감소**: 큐 제한으로 메모리 누수 방지
2. **응답 속도 개선**: 타임아웃 단축으로 빠른 실패 처리
3. **안정성 향상**: 자동 재연결 및 에러 처리 개선
4. **조기 재시작**: 메모리 제한 낮춤으로 문제 조기 감지

## 모니터링

서버 배포 후 다음을 확인하세요:

```bash
# PM2 상태
pm2 status

# 로그 확인
pm2 logs ces-smartfarm --lines 100

# 메모리 사용량
free -h

# CPU 사용률
top
```

## 문제가 지속되는 경우

1. **로그 확인**: `pm2 logs ces-smartfarm --err --lines 100`
2. **메모리 확인**: `free -h`
3. **데이터베이스 연결 확인**: `.env` 파일의 DB 설정 확인
4. **인스턴스 사양 확인**: Lightsail 콘솔에서 CPU/메모리 사용률 확인


