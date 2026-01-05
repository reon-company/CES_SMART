# 서버 설정 완료 - 13.124.171.62

## ✅ 완료된 작업

1. ✅ 시스템 업데이트
2. ✅ Node.js 설치 (v20.19.6)
3. ✅ MySQL 설치 및 설정
4. ✅ PM2 설치
5. ✅ Nginx 설치 및 설정
6. ✅ 스왑 파일 추가 (1GB) - 메모리 부족 해결
7. ✅ 프로젝트 코드 배포
8. ✅ 데이터베이스 생성 및 스키마 적용
9. ✅ 환경 변수 설정 (.env)
10. ✅ 의존성 설치 (npm install)
11. ✅ PM2로 서버 시작
12. ✅ Nginx 리버스 프록시 설정
13. ✅ 프론트엔드 API URL 업데이트

## 서버 정보

- **IP 주소**: 13.124.171.62
- **서버 상태**: ✅ 정상 작동 중
- **API 엔드포인트**: http://13.124.171.62/api/health
- **데이터베이스**: ces_smartfarm
- **데이터베이스 사용자**: ces_user
- **PM2 프로세스**: ces-smartfarm (online)

## 확인 명령어

```bash
# 서버 접속
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@13.124.171.62

# PM2 상태 확인
pm2 status

# 서버 로그 확인
pm2 logs ces-smartfarm --lines 50

# API 테스트
curl http://13.124.171.62/api/health

# MySQL 상태 확인
sudo systemctl status mysql

# Nginx 상태 확인
sudo systemctl status nginx
```

## 중요 정보

### 데이터베이스 접속 정보
- **호스트**: localhost
- **포트**: 3306
- **데이터베이스**: ces_smartfarm
- **사용자**: ces_user
- **비밀번호**: ces_smartfarm_2024! ⚠️ **프로덕션에서는 변경 권장**

### JWT_SECRET
- **값**: 7aa456593e5980930c10cdf84030de40c624bfac4b52ff0cd7ed19c14d3d91f78a01cfee111ac719254b1085a60fb27d63daeca8577146b82efa9fcd78b40bbb
- ⚠️ **절대 공개하지 마세요**

## 다음 단계

### 1. 방화벽 설정 확인
AWS Lightsail 콘솔에서:
- HTTP (포트 80) - 허용
- HTTPS (포트 443) - 허용 (도메인 설정 후)
- SSH (포트 22) - 허용

### 2. 도메인 설정 (선택사항)
도메인을 사용하는 경우:
1. Route 53에서 A 레코드 설정: `CES-smart.reonaicoffee.com` → `13.124.171.62`
2. DNS 전파 대기 (5-10분)
3. Let's Encrypt 인증서 발급

### 3. HTTPS 설정 (도메인 사용 시)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d CES-smart.reonaicoffee.com
```

### 4. 보안 강화
- MySQL 비밀번호 변경
- 방화벽 규칙 확인
- 정기적인 백업 설정

## 주의사항

⚠️ **메모리 부족 문제**:
- 인스턴스 메모리: 416MB (매우 작음)
- 스왑 파일: 1GB 추가됨
- 프로덕션 환경에서는 더 큰 인스턴스 사용 권장

⚠️ **보안**:
- 기본 비밀번호를 강력한 비밀번호로 변경하세요
- .env 파일은 절대 Git에 커밋하지 마세요
- 정기적으로 보안 업데이트를 적용하세요

## 문제 해결

### 서버가 응답하지 않음
```bash
pm2 restart ces-smartfarm
pm2 logs ces-smartfarm --err
```

### 데이터베이스 연결 오류
```bash
sudo systemctl status mysql
sudo journalctl -xeu mysql.service
```

### Nginx 오류
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## 완료! 🎉

서버가 정상적으로 설정되었습니다. 이제 프론트엔드에서 API를 호출할 수 있습니다.


