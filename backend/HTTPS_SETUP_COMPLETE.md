# HTTPS 설정 완료 - Let's Encrypt

## ✅ 완료된 작업

1. ✅ DNS 설정 확인 (CES-smart.reonaicoffee.com → 43.203.141.2)
2. ✅ Certbot 설치
3. ✅ Nginx 설정 업데이트 (도메인 추가)
4. ✅ Let's Encrypt 인증서 발급
5. ✅ HTTPS 리다이렉트 설정
6. ✅ 프론트엔드 API URL 업데이트 (HTTPS)

## 인증서 정보

- **도메인**: CES-smart.reonaicoffee.com
- **인증서 유형**: Let's Encrypt (무료, 신뢰할 수 있는 인증서)
- **만료일**: 2026-04-03 (89일 후)
- **자동 갱신**: 설정됨 (Certbot이 자동으로 갱신)

## 인증서 경로

- **인증서**: `/etc/letsencrypt/live/ces-smart.reonaicoffee.com/fullchain.pem`
- **개인키**: `/etc/letsencrypt/live/ces-smart.reonaicoffee.com/privkey.pem`

## HTTPS 엔드포인트

- **API Health Check**: https://CES-smart.reonaicoffee.com/api/health
- **모든 API**: https://CES-smart.reonaicoffee.com/api/*

## 자동 갱신 확인

인증서는 자동으로 갱신됩니다. 수동으로 갱신하려면:

```bash
sudo certbot renew
```

갱신 테스트:

```bash
sudo certbot renew --dry-run
```

## 프론트엔드 업데이트

다음 파일들이 HTTPS로 업데이트되었습니다:

1. `frontend/public/js/api.js` - `https://CES-smart.reonaicoffee.com`
2. `frontend/lib/api.js` - `https://CES-smart.reonaicoffee.com`
3. `frontend/public/module.html` - `https://CES-smart.reonaicoffee.com`

## 확인 명령어

```bash
# HTTPS 연결 테스트
curl https://CES-smart.reonaicoffee.com/api/health

# 인증서 정보 확인
sudo certbot certificates

# Nginx 설정 확인
sudo nginx -t
sudo systemctl status nginx

# 인증서 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 보안 개선 사항

✅ **Mixed Content 오류 해결**: HTTPS 프론트엔드에서 HTTPS 백엔드 호출
✅ **신뢰할 수 있는 인증서**: 브라우저 경고 없음
✅ **자동 갱신**: 인증서 만료 전 자동 갱신
✅ **HTTP → HTTPS 리다이렉트**: 자동 설정됨

## 다음 단계

1. ✅ HTTPS 설정 완료
2. ✅ 프론트엔드 업데이트 완료
3. ⚠️ 아두이노 코드 업데이트 필요 (HTTP → HTTPS 또는 IP 주소 유지)

## 주의사항

⚠️ **아두이노 코드**: 
- 아두이노는 HTTPS를 지원하지 않을 수 있으므로, IP 주소(`43.203.141.2`)를 사용하거나 HTTP를 유지해야 할 수 있습니다.
- 또는 아두이노용 별도 HTTP 엔드포인트를 유지할 수 있습니다.

## 완료! 🎉

HTTPS가 성공적으로 설정되었습니다. 이제 브라우저에서 경고 없이 안전하게 API를 호출할 수 있습니다.

