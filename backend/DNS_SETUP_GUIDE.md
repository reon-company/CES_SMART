# DNS 설정 가이드 - CES-smart.reonaicoffee.com

## 1. AWS Route 53 DNS 레코드 설정

### 현재 설정 정보

- **레코드 이름**: `CES-smart`
- **도메인**: `reonaicoffee.com`
- **전체 도메인**: `CES-smart.reonaicoffee.com`
- **레코드 유형**: `A - IPv4 주소`
- **값 (IP 주소)**: `54.180.237.225` ⚠️ **이 IP로 설정하세요!**
- **TTL**: `300` (5분) 또는 `60` (1분) 권장

### Route 53 설정 단계

1. **레코드 이름**: `CES-smart` (이미 입력됨)
2. **레코드 유형**: `A - IPv4 주소` (이미 선택됨)
3. **값/트래픽 라우팅 대상**:
   - 드롭다운: `엔드포인트 선택` 또는 `IP 주소`
   - 텍스트 영역에 입력: `54.180.237.225` ⚠️ **중요: 예시 IP(192.0.2.235)를 실제 IP로 변경!**
4. **TTL**: `300` (5분) 또는 `60` (1분) - 빠른 테스트를 위해
5. **"단순 레코드 정의"** 버튼 클릭

### 확인 사항

⚠️ **반드시 확인**:

- IP 주소가 `54.180.237.225`인지 확인
- 레코드 이름이 `CES-smart`인지 확인
- 도메인이 `.reonaicoffee.com`인지 확인

## 2. DNS 전파 확인 (설정 후)

DNS 레코드가 전파되는 데 몇 분이 걸릴 수 있습니다.

### 로컬에서 확인

```bash
# DNS 확인
nslookup CES-smart.reonaicoffee.com

# 또는
dig CES-smart.reonaicoffee.com

# 또는
ping CES-smart.reonaicoffee.com
```

### 온라인 도구로 확인

- https://www.whatsmydns.net/
- https://dnschecker.org/

`CES-smart.reonaicoffee.com`이 `54.180.237.225`로 해석되는지 확인하세요.

## 3. DNS 전파 완료 후 Let's Encrypt 인증서 발급

DNS가 전파되면 (보통 5-10분) 서버에서 인증서를 발급할 수 있습니다.

### 서버 접속

```bash
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.237.225
```

### Certbot 설치 (아직 안 했다면)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Nginx 설정 업데이트

```bash
sudo nano /etc/nginx/sites-available/ces-api
```

다음 내용으로 설정:

```nginx
server {
    listen 80;
    server_name CES-smart.reonaicoffee.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

저장 후:

```bash
sudo ln -sf /etc/nginx/sites-available/ces-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # 기본 설정 제거 (필요시)
sudo nginx -t
sudo systemctl reload nginx
```

### Let's Encrypt 인증서 발급

```bash
sudo certbot --nginx -d CES-smart.reonaicoffee.com
```

프롬프트에 따라:

1. **이메일 주소 입력**: 만료 알림을 받을 이메일
2. **약관 동의**: `A` 입력
3. **이메일 공유 여부**: 선택 (Y 또는 N)

Certbot이 자동으로:

- 인증서 발급
- Nginx 설정 업데이트 (HTTPS 리다이렉트 포함)
- 자동 갱신 설정

### 확인

```bash
# HTTPS 연결 테스트
curl https://CES-smart.reonaicoffee.com/api/health

# 인증서 정보 확인
sudo certbot certificates
```

## 4. 프론트엔드 API URL 업데이트

인증서 발급 후 프론트엔드에서 새 도메인을 사용하도록 업데이트해야 합니다.

### frontend/public/js/api.js 수정

```javascript
// 프로덕션 환경에서 새 도메인 사용
const API_BASE_URL = isLocalhost
  ? 'http://localhost:3000'
  : 'https://CES-smart.reonaicoffee.com'; // 새 도메인
```

## 5. 방화벽 확인

AWS Lightsail에서 포트 443 (HTTPS)이 열려있는지 확인:

1. AWS Lightsail 콘솔 접속
2. 인스턴스 선택
3. "Networking" 탭
4. "Firewall" 섹션에서 포트 443 추가 (없다면)

## 6. 최종 확인

### 브라우저에서 테스트

1. `https://CES-smart.reonaicoffee.com/api/health` 접속
2. 인증서 오류 없이 정상 접속되는지 확인
3. 프론트엔드에서 로그인 테스트

### 자동 갱신 확인

```bash
# 갱신 테스트
sudo certbot renew --dry-run

# 자동 갱신 상태 확인
sudo systemctl status certbot.timer
```

## 문제 해결

### DNS가 전파되지 않음

- TTL을 낮게 설정 (60초)
- 여러 DNS 확인 도구로 확인
- 브라우저 캐시 클리어

### 인증서 발급 실패

- DNS가 완전히 전파되었는지 확인
- 포트 80이 열려있는지 확인 (Let's Encrypt 검증용)
- Nginx가 정상 작동하는지 확인: `sudo systemctl status nginx`

### 연결 오류

- 방화벽에서 포트 443이 열려있는지 확인
- 서버에서 백엔드가 실행 중인지 확인: `pm2 status`

