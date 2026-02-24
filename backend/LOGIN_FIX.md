# 로그인 연결 타임아웃 해결 가이드

## 오류 메시지
```
Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
ces-smart.reonaicoffee.com/api/auth/login
```

## 원인
DNS가 이전 IP 주소(43.203.141.2)를 가리키고 있어서 새 서버(43.201.148.223)에 연결할 수 없습니다.

## 해결 방법

### 방법 1: DNS 업데이트 (권장)

1. **AWS Route 53 콘솔** 접속
2. `reonaicoffee.com` 호스팅 영역 선택
3. `CES-smart` A 레코드 편집
4. 값을 `43.201.148.223`으로 변경
5. 저장 후 5-10분 대기

### 방법 2: 임시 해결 (즉시 사용 가능)

#### 옵션 A: IP 주소로 직접 접속
브라우저에서:
- https://43.201.148.223/login

#### 옵션 B: 호스트 파일 수정 (Windows)

1. 메모장을 **관리자 권한**으로 실행
2. 파일 열기: `C:\Windows\System32\drivers\etc\hosts`
3. 다음 줄 추가:
   ```
   43.201.148.223 ces-smart.reonaicoffee.com
   ```
4. 저장
5. 브라우저에서 https://ces-smart.reonaicoffee.com 접속

### 방법 3: 브라우저 캐시 클리어

1. **Ctrl+Shift+Delete** (캐시 삭제)
2. 또는 **시크릿 모드**로 접속

## 서버 상태 확인

서버는 정상 작동 중입니다:
- ✅ Node.js 서버: 실행 중
- ✅ Nginx: 실행 중
- ✅ 포트 443 (HTTPS): 열림

## 빠른 테스트

임시로 IP 주소로 직접 접속하여 로그인 테스트:
```
https://43.201.148.223/login
```

## DNS 전파 확인

DNS 업데이트 후 전파 확인:
```powershell
nslookup ces-smart.reonaicoffee.com
```

결과가 `43.201.148.223`을 가리켜야 합니다.
