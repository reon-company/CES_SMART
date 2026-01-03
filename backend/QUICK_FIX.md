# 서버 느림 문제 빠른 해결 가이드

## 현재 상황
- 서버는 실행 중이지만 응답이 매우 느림 (10초 이상)
- SSH 연결 타임아웃
- HTTP API는 응답하지만 지연됨

## 즉시 확인 사항

### 1. AWS Lightsail 콘솔에서 확인

1. **인스턴스 상태**
   - https://lightsail.aws.amazon.com/
   - 인스턴스 선택
   - "Metrics" 탭 확인:
     - CPU 사용률이 100%인지?
     - 메모리 사용률이 높은지?
     - 네트워크 트래픽이 비정상적인지?

2. **인스턴스 사양**
   - 현재 인스턴스 타입 확인 (예: nano, micro)
   - 리소스가 부족할 수 있음

3. **인스턴스 재시작**
   - "Actions" → "Reboot"
   - 또는 "Stop" → "Start"

### 2. 인스턴스 사양 업그레이드 (필요시)

리소스 부족이 원인이라면:

1. **스냅샷 생성** (데이터 백업)
2. **인스턴스 타입 변경**
   - nano → micro 또는 더 큰 사양
3. **스냅샷에서 복원**

### 3. SSH 접속 문제 해결

SSH가 타임아웃되는 경우:

1. **AWS Lightsail 콘솔에서 브라우저 SSH 사용**
   - 인스턴스 선택
   - "Connect using SSH" 버튼 클릭
   - 브라우저에서 직접 접속

2. **방화벽 규칙 확인**
   - "Networking" 탭
   - SSH (포트 22)가 허용되어 있는지 확인

### 4. 서버 내부 확인 (브라우저 SSH 사용 시)

```bash
# 시스템 리소스 확인
top
# q 키로 종료

# 메모리 확인
free -h

# 디스크 확인
df -h

# PM2 상태
pm2 status

# PM2 로그 (최근 오류 확인)
pm2 logs --lines 100

# CPU 사용률 높은 프로세스 확인
ps aux --sort=-%cpu | head -10

# 메모리 사용률 높은 프로세스 확인
ps aux --sort=-%mem | head -10
```

### 5. 문제 프로세스 종료

```bash
# 문제가 있는 프로세스 종료
pm2 stop all
pm2 delete all

# 서버 재시작
pm2 start ecosystem.config.js --env production
pm2 save
```

### 6. Nginx 확인

```bash
# Nginx 상태
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 로그 확인
sudo tail -50 /var/log/nginx/error.log
```

## 예상 원인별 해결책

### 원인 1: CPU 100% 사용
- **해결**: 프로세스 확인 및 재시작
- **장기**: 인스턴스 사양 업그레이드

### 원인 2: 메모리 부족
- **해결**: PM2 메모리 제한 설정 확인
- **장기**: 인스턴스 사양 업그레이드

### 원인 3: 무한 루프 또는 메모리 누수
- **해결**: 프로세스 재시작
- **장기**: 코드 최적화

### 원인 4: 디스크 공간 부족
- **해결**: 로그 파일 정리
```bash
# 로그 정리
sudo journalctl --vacuum-time=7d
pm2 flush
```

## 빠른 해결 순서

1. ✅ **AWS Lightsail 콘솔 접속**
2. ✅ **인스턴스 Metrics 확인** (CPU, 메모리)
3. ✅ **브라우저 SSH로 접속** (Connect using SSH)
4. ✅ **리소스 사용량 확인** (`top`, `free -h`)
5. ✅ **PM2 프로세스 재시작** (`pm2 restart all`)
6. ✅ **인스턴스 재시작** (필요시)

## 다음 단계

1. AWS Lightsail 콘솔에서 Metrics 확인
2. 브라우저 SSH로 접속하여 상태 확인
3. 문제 원인 파악 후 해결

결과를 알려주시면 추가로 도와드리겠습니다.

