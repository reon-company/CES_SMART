# 새 인스턴스 설정 완료 ✅

## 인스턴스 정보
- **IP**: 43.201.148.223
- **RAM**: 4GB ✅
- **상태**: 정상 작동 중

## ✅ 완료된 작업

### 1. 시스템 확인
- ✅ 메모리: 1.9GB 사용 중, 1.1GB 사용 가능 (충분함)
- ✅ 디스크: 3.8GB / 58GB 사용 (7%)
- ✅ 업타임: 정상

### 2. 서비스 상태
- ✅ **MySQL**: 실행 중 (430MB)
- ✅ **Nginx**: 실행 중 (12MB)
- ✅ **Node.js 서버**: 실행 중 (71MB)
- ✅ **VPN 모니터**: 실행 중 (52MB)

### 3. 포트 상태
- ✅ **443 (HTTPS)**: 열림
- ✅ **80 (HTTP)**: 열림
- ✅ **3000 (Node.js)**: 리스닝 중

### 4. 애플리케이션
- ✅ PM2로 시작됨
- ✅ API 헬스 체크 정상: `{"status":"ok","message":"CES SmartFarm API Server"}`
- ✅ 데이터베이스 연결 성공
- ✅ 자동 시작 설정 완료

### 5. SSL 인증서
- ✅ 유효 (60일 남음)
- ✅ Nginx 설정 정상

## 📊 메모리 사용량 (4GB 기준)

| 항목 | 사용량 |
|------|--------|
| 시스템 | ~200MB |
| MySQL | 430MB |
| Nginx | 12MB |
| Node.js | 71MB |
| VPN 모니터 | 52MB |
| **총 사용** | **~765MB** |
| **사용 가능** | **~1.1GB** |

✅ **메모리 여유 충분합니다!**

## 🔗 접속 정보

### API 엔드포인트
- **로컬**: http://localhost:3000/api/health
- **외부 (HTTPS)**: https://43.201.148.223/api/health
- **도메인 (DNS 업데이트 후)**: https://CES-smart.reonaicoffee.com/api/health

### 프론트엔드
- **도메인**: https://CES-smart.reonaicoffee.com (DNS 업데이트 필요)
- **임시**: https://43.201.148.223

## ⚠️ 추가 작업 (선택사항)

### 1. DNS 업데이트
Route 53 또는 DNS 제공업체에서:
- **레코드 타입**: A
- **이름**: CES-smart.reonaicoffee.com
- **값**: 43.201.148.223
- **TTL**: 300

### 2. 방화벽 확인
Lightsail 콘솔에서 다음 포트가 열려있는지 확인:
- ✅ SSH (22)
- ✅ HTTP (80)
- ✅ HTTPS (443)

### 3. 모니터링 설정
```bash
# 메모리 모니터링
cd ~/ces-smartfarm/backend
chmod +x check_memory.sh
./check_memory.sh
```

## 🎉 완료!

새 인스턴스가 정상적으로 작동하고 있습니다. 4GB RAM으로 메모리 여유가 충분하며, 모든 서비스가 정상 실행 중입니다.

## 문제 해결

### 접속이 안 될 때
1. 방화벽 규칙 확인 (Lightsail 콘솔)
2. 서비스 상태 확인: `pm2 status`, `sudo systemctl status nginx mysql`
3. 로그 확인: `pm2 logs ces-smartfarm`

### API 오류
1. 데이터베이스 연결 확인: `mysql -u ces_user -p`
2. 환경 변수 확인: `cat ~/ces-smartfarm/backend/.env`
3. 로그 확인: `pm2 logs ces-smartfarm --lines 50`
