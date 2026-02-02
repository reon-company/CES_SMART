# 인스턴스 복구 가이드

## 현재 상황
- 오류: UPSTREAM_ERROR [515]
- 인스턴스 연결 불가

## 즉시 조치 사항

### 1. AWS Lightsail 콘솔 접속
https://lightsail.aws.amazon.com

### 2. 인스턴스 상태 확인
- 인스턴스가 "Stopped" 상태인지 확인
- "Running" 상태라면 재시작 시도

### 3. 인스턴스 재시작
1. 인스턴스 선택
2. "..." 메뉴 → "재시작" 또는 "시작"
3. 1-2분 대기

### 4. 연결 테스트
재시작 후:
```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
```

## 연결 성공 후 확인 사항

```bash
# 1. 서버 상태 확인
uptime
df -h
free -m

# 2. PM2 프로세스 확인
pm2 status

# 3. 애플리케이션 재시작 (필요시)
cd ~/ces-smartfarm/backend
pm2 restart ces-smartfarm
pm2 logs ces-smartfarm --lines 20

# 4. VPN 상태 확인 (설정한 경우)
sudo wg show
```

## 자동 복구 설정 (재시작 후)

```bash
# PM2 자동 시작 확인
pm2 startup
pm2 save

# VPN 자동 시작 확인 (설정한 경우)
sudo systemctl status wg-quick@wg0
sudo systemctl enable wg-quick@wg0
```

## 예방 조치

### 리소스 모니터링
```bash
# 메모리 사용량 모니터링
watch -n 5 free -m

# 디스크 사용량 확인
df -h
du -sh ~/ces-smartfarm/backend/logs/*
```

### 로그 정리
```bash
# 오래된 로그 파일 삭제
find ~/ces-smartfarm/backend/logs -name "*.log" -mtime +7 -delete
```

## 문제가 계속되면

1. AWS 콘솔에서 인스턴스 로그 확인
2. 인스턴스 스냅샷에서 복원
3. 새 인스턴스 생성 및 마이그레이션
