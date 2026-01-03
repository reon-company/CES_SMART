# Let's Encrypt SSL 인증서 발급 가이드

## 중요 사항

⚠️ **주의**: `ces-smart.vercel.app`은 Vercel이 관리하는 도메인입니다.
- Vercel 도메인은 DNS 레코드를 직접 수정할 수 없습니다
- Let's Encrypt 인증서 발급을 위해서는 **도메인의 DNS 레코드를 제어할 수 있어야** 합니다

## 옵션 1: 새로운 서브도메인 사용 (권장)

자체 도메인이 있다면 서브도메인을 만들어 사용:

1. **도메인 예시**: `yourdomain.com`
2. **서브도메인**: `api.yourdomain.com` 또는 `backend.yourdomain.com`
3. **DNS 설정**: A 레코드로 `54.180.237.225` 연결

## 옵션 2: IP 주소로는 불가능

Let's Encrypt는 **도메인만** 지원하며 IP 주소로는 인증서를 발급할 수 없습니다.

## Let's Encrypt 인증서 발급 명령어

### 1. 서버 접속

```bash
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.237.225
```

### 2. Certbot 설치

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 3. DNS 설정 확인

도메인의 A 레코드가 서버 IP를 가리키는지 확인:

```bash
# 도메인으로 ping 테스트
ping api.yourdomain.com
# 또는
nslookup api.yourdomain.com
```

### 4. Nginx 설정 파일 준비

```bash
sudo nano /etc/nginx/sites-available/ces-api
```

다음 내용으로 설정 (도메인 사용 시):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # 또는 사용할 도메인

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
sudo ln -s /etc/nginx/sites-available/ces-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Let's Encrypt 인증서 발급

```bash
# 인증서 발급 (도메인 사용)
sudo certbot --nginx -d api.yourdomain.com

# 또는 여러 도메인
sudo certbot --nginx -d api.yourdomain.com -d www.api.yourdomain.com
```

인증서 발급 과정:
1. 이메일 주소 입력 (만료 알림용)
2. 이용 약관 동의 (A)
3. 이메일 공유 여부 선택
4. 자동으로 인증서 발급 및 Nginx 설정 업데이트

### 6. 자동 갱신 설정

```bash
# 갱신 테스트
sudo certbot renew --dry-run

# 자동 갱신은 이미 설정됨 (systemd timer)
sudo systemctl status certbot.timer
```

### 7. 확인

```bash
# HTTPS 연결 테스트
curl https://api.yourdomain.com/api/health

# 인증서 정보 확인
sudo certbot certificates
```

## 현재 상황 (IP 주소만 있는 경우)

IP 주소만 있다면 Let's Encrypt를 사용할 수 없습니다. 대신:

### 임시 해결책: 자체 서명 인증서 (이미 설정됨)

현재 자체 서명 인증서가 설정되어 있습니다:
- 브라우저에서 한 번 인증서를 허용하면 정상 작동
- 프로덕션에는 권장하지 않음

### 영구적 해결책: 도메인 구매 및 설정

1. 도메인 구매 (예: Namecheap, GoDaddy 등)
2. DNS A 레코드 설정: `api.yourdomain.com` → `54.180.237.225`
3. 위의 Let's Encrypt 명령어 실행

## 프론트엔드 업데이트

도메인을 사용하는 경우:

```javascript
// frontend/public/js/api.js
return 'https://api.yourdomain.com';
```

## 참고

- Let's Encrypt 인증서는 90일마다 자동 갱신됩니다
- 인증서 발급 후 Nginx가 자동으로 HTTPS 설정을 업데이트합니다
- 방화벽에서 포트 443이 열려있어야 합니다

