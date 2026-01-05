# 서버 연결 문제 진단 가이드

## 현재 상황
- **서버 IP**: `54.180.237.225`
- **문제**: 접속 로딩이 매우 길고 거의 안 되는 수준
- **진단 결과**: Ping 실패 (100% 패킷 손실)

## 가능한 원인

### 1. 서버가 다운되었거나 재시작 중
- AWS Lightsail 인스턴스가 중지되었을 수 있음
- 서버가 재부팅 중일 수 있음

### 2. 네트워크 문제
- 방화벽 설정 문제
- 보안 그룹에서 SSH 포트(22)가 차단됨
- ICMP(ping)가 차단됨 (일부 클라우드에서는 정상)

### 3. 서버 리소스 부족
- CPU 100% 사용
- 메모리 부족으로 인한 스왑 사용
- 디스크 공간 부족

### 4. 서버 프로세스 문제
- Node.js 프로세스가 무한 루프
- PM2 프로세스가 응답하지 않음
- Nginx가 응답하지 않음

## 해결 방법

### 1. AWS Lightsail 콘솔에서 확인

1. **AWS Lightsail 콘솔 접속**
   - https://lightsail.aws.amazon.com/

2. **인스턴스 상태 확인**
   - 인스턴스가 "실행 중" 상태인지 확인
   - "중지됨" 또는 "재시작 중" 상태라면 시작/재시작

3. **네트워킹 확인**
   - "Networking" 탭 클릭
   - 방화벽 규칙 확인:
     - SSH (포트 22) - 허용
     - HTTP (포트 80) - 허용
     - HTTPS (포트 443) - 허용
     - Custom (포트 3000) - 허용

4. **인스턴스 재시작**
   - 인스턴스 선택 → "Actions" → "Reboot"
   - 또는 "Stop" → "Start"

### 2. 서버 리소스 확인 (접속 가능한 경우)

```bash
# 서버 접속
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.237.225

# 시스템 리소스 확인
top
# 또는
htop

# 메모리 사용량
free -h

# 디스크 사용량
df -h

# CPU 사용률
mpstat 1 5

# 실행 중인 프로세스 확인
ps aux | head -20
```

### 3. PM2 및 Node.js 프로세스 확인

```bash
# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs --lines 50

# PM2 프로세스 재시작
pm2 restart all

# 또는 특정 프로세스
pm2 restart ces-smartfarm
```

### 4. Nginx 상태 확인

```bash
# Nginx 상태
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 5. 서버 재부팅

```bash
# 안전한 재부팅
sudo reboot

# 또는 강제 재시작 (AWS 콘솔에서)
```

### 6. 인스턴스 스냅샷 및 복원

문제가 지속되면:

1. **스냅샷 생성** (데이터 백업)
2. **새 인스턴스 생성** (스냅샷에서)
3. **IP 주소 확인** (새 인스턴스는 다른 IP를 가질 수 있음)

## 빠른 해결 체크리스트

- [ ] AWS Lightsail 콘솔에서 인스턴스 상태 확인
- [ ] 인스턴스가 "실행 중"인지 확인
- [ ] 방화벽 규칙 확인 (포트 22, 80, 443, 3000)
- [ ] 인스턴스 재시작 시도
- [ ] 새 IP 주소 확인 (재시작 후 변경될 수 있음)
- [ ] SSH 연결 재시도

## 예상 결과

### 정상적인 경우
- Ping 응답 (또는 ICMP 차단으로 ping 실패는 정상일 수 있음)
- SSH 연결 성공 (5초 이내)
- HTTP/HTTPS 응답

### 문제가 있는 경우
- Ping 실패
- SSH 타임아웃
- HTTP/HTTPS 연결 실패

## 다음 단계

1. **AWS Lightsail 콘솔에서 인스턴스 상태 확인**
2. **인스턴스 재시작**
3. **새 IP 주소 확인** (재시작 후 변경될 수 있음)
4. **방화벽 규칙 확인**

인스턴스가 재시작되면 IP 주소가 변경될 수 있으므로, 새 IP를 확인한 후 알려주세요.


