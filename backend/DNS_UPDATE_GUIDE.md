# DNS 업데이트 가이드

## 문제 상황
- 도메인 `ces-smart.reonaicoffee.com`이 이전 IP(43.203.141.2)를 가리키고 있음
- 새 인스턴스 IP: 43.201.148.223

## 해결 방법

### 1. Route 53에서 DNS 레코드 업데이트

1. AWS 콘솔 접속: https://console.aws.amazon.com/route53/
2. **Hosted zones** 선택
3. `reonaicoffee.com` 선택
4. 레코드 `CES-smart` 찾기
5. 레코드 편집:
   - **레코드 타입**: A
   - **값**: `43.201.148.223` (이전: 43.203.141.2)
   - **TTL**: 300 (5분) 또는 60 (1분) - 빠른 전파를 위해
6. **저장** 클릭

### 2. DNS 전파 확인

DNS 변경 후 전파되는 데 몇 분이 걸릴 수 있습니다.

#### Windows에서 확인:
```powershell
nslookup ces-smart.reonaicoffee.com
```

#### 온라인 도구:
- https://www.whatsmydns.net/
- https://dnschecker.org/

### 3. 임시 해결 방법

DNS 전파가 완료될 때까지 임시로 IP 주소로 직접 접속:

- **로그인 페이지**: https://43.201.148.223/login
- **API**: https://43.201.148.223/api/health

또는 브라우저에서 호스트 파일 수정 (임시):
```
43.201.148.223 ces-smart.reonaicoffee.com
```

## Nginx 설정 업데이트 완료

서버의 Nginx 설정에서 이전 IP를 새 IP로 업데이트했습니다.

## 확인 사항

DNS 업데이트 후:
1. 브라우저 캐시 클리어 (Ctrl+Shift+Delete)
2. https://ces-smart.reonaicoffee.com 접속 테스트
3. 로그인 시도

## 문제가 계속되면

1. **DNS 전파 대기**: 최대 24시간 (일반적으로 5-10분)
2. **브라우저 캐시 클리어**
3. **다른 네트워크에서 테스트** (모바일 데이터 등)
4. **임시로 IP 주소로 직접 접속**
