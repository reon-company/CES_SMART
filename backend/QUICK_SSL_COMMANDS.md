# Let's Encrypt SSL 인증서 발급 - 빠른 명령어

## 전제 조건

⚠️ **도메인이 필요합니다** (IP 주소로는 불가능)
- 예: `api.yourdomain.com`
- DNS A 레코드: `api.yourdomain.com` → `54.180.237.225`

## 서버 접속

```bash
ssh -i ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.237.225
```

## 1. Certbot 설치

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

## 2. Nginx 설정 (도메인 사용)

```bash
sudo nano /etc/nginx/sites-available/ces-api
```

다음 내용 입력 (도메인으로 변경):

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # 여기를 실제 도메인으로 변경

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

```bash
sudo ln -s /etc/nginx/sites-available/ces-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. 인증서 발급

```bash
sudo certbot --nginx -d api.yourdomain.com
```

프롬프트에 따라:
- 이메일 입력
- 약관 동의 (A 입력)
- 이메일 공유 여부 선택

## 4. 확인

```bash
curl https://api.yourdomain.com/api/health
sudo certbot certificates
```

## 5. 자동 갱신 확인

```bash
sudo certbot renew --dry-run
```

## 현재 IP 주소만 있는 경우

IP 주소만 있다면 Let's Encrypt를 사용할 수 없습니다.

**대안**:
1. 도메인 구매 (예: Namecheap, GoDaddy)
2. DNS A 레코드 설정
3. 위 명령어 실행

또는 현재 자체 서명 인증서를 계속 사용 (브라우저에서 한 번 허용 필요)

