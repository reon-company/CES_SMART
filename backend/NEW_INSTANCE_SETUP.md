# 새 인스턴스 설정 체크리스트

## 인스턴스 정보
- **IP**: 43.201.148.223
- **RAM**: 4GB ✅
- **vCPU**: 2
- **SSD**: 40GB

## 1단계: 방화벽 설정 (우선)

### 필수 포트 열기
1. Lightsail 콘솔 → 인스턴스 선택 → "네트워킹" 탭
2. **IPv4 방화벽** 섹션에서 다음 포트 추가:
   - ✅ **443 (HTTPS)** - Custom, TCP, 모든 IPv4 주소
   - (선택) **3000 (Node.js)** - Nginx 없이 직접 접속할 때만

## 2단계: 서버 연결 및 상태 확인

```bash
# SSH 접속
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# 시스템 상태 확인
uptime
free -h
df -h
```

## 3단계: 애플리케이션 확인

```bash
# 프로젝트 디렉토리 확인
cd ~/ces-smartfarm/backend
ls -la

# PM2 프로세스 확인
pm2 status
pm2 list

# 애플리케이션 로그 확인
pm2 logs ces-smartfarm --lines 30
```

## 4단계: 서비스 확인

```bash
# MySQL 상태 확인
sudo systemctl status mysql

# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 설정 확인
sudo nginx -t
```

## 5단계: DNS 및 SSL 인증서 업데이트

새 IP로 변경되었으므로:

```bash
# Nginx 설정 확인
sudo nano /etc/nginx/sites-available/ces-api

# SSL 인증서 재발급 (필요시)
sudo certbot --nginx -d CES-smart.reonaicoffee.com
```

## 6단계: 환경 변수 확인

```bash
# .env 파일 확인
cd ~/ces-smartfarm/backend
cat .env | grep -v PASSWORD

# 데이터베이스 연결 확인
mysql -u ces_user -p -e "SHOW DATABASES;"
```

## 7단계: 애플리케이션 재시작

```bash
# PM2 재시작
cd ~/ces-smartfarm/backend
pm2 restart all
pm2 save

# 로그 확인
pm2 logs --lines 20
```

## 8단계: 접속 테스트

### 백엔드 API 테스트
```bash
# 헬스 체크
curl http://localhost:3000/api/health

# 또는 외부에서
curl https://43.201.148.223/api/health
```

### 프론트엔드 접속 테스트
- https://CES-smart.reonaicoffee.com (DNS 업데이트 후)
- 또는 https://43.201.148.223 (임시)

## 9단계: DNS 업데이트 (필요시)

Route 53 또는 DNS 제공업체에서:
- **레코드 타입**: A
- **이름**: CES-smart.reonaicoffee.com
- **값**: 43.201.148.223 (새 IP)
- **TTL**: 300

## 10단계: 모니터링 설정

```bash
# 메모리 모니터링 스크립트 (선택)
cd ~/ces-smartfarm/backend
chmod +x check_memory.sh
./check_memory.sh

# PM2 모니터링
pm2 monit
```

## 빠른 확인 스크립트

```bash
#!/bin/bash
echo "=== 시스템 상태 ==="
uptime
free -h
df -h

echo ""
echo "=== 서비스 상태 ==="
sudo systemctl status mysql nginx --no-pager | head -10

echo ""
echo "=== PM2 프로세스 ==="
pm2 status

echo ""
echo "=== 포트 리스닝 ==="
sudo netstat -tlnp | grep -E '3000|443|80|3306'
```

## 문제 해결

### 연결이 안 될 때
1. 방화벽 규칙 확인 (Lightsail 콘솔)
2. 서버 내부 방화벽 확인: `sudo ufw status`
3. 서비스 실행 확인: `pm2 status`, `sudo systemctl status nginx`

### 애플리케이션이 실행되지 않을 때
1. 로그 확인: `pm2 logs ces-smartfarm`
2. 환경 변수 확인: `cat .env`
3. 데이터베이스 연결 확인: `mysql -u ces_user -p`

### SSL 인증서 오류
1. DNS가 새 IP로 업데이트되었는지 확인
2. SSL 인증서 재발급: `sudo certbot --nginx -d CES-smart.reonaicoffee.com`
