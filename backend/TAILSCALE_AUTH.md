# Tailscale 인증 안내

## 🔐 서버 Tailscale 인증 필요

서버에 Tailscale이 설치되었지만 아직 인증이 완료되지 않았습니다.

## 인증 방법

### 1단계: 브라우저에서 인증 URL 열기

다음 URL을 브라우저에서 열어주세요:

**https://login.tailscale.com/a/42d687b01db64**

### 2단계: Tailscale 계정으로 로그인

- 기존 Tailscale 계정이 있으면 로그인
- 없으면 무료 계정 생성 (Google, Microsoft, GitHub 등으로 가입 가능)

### 3단계: 인증 완료 확인

인증이 완료되면 서버에서 다음 명령으로 확인:

```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
sudo tailscale status
```

정상적으로 연결되면 서버의 Tailscale IP가 표시됩니다.

## 다음 단계

인증이 완료되면:

1. ✅ 서버 Tailscale IP 확인
2. 🔄 ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치
3. 🔄 같은 계정으로 로그인
4. 🔄 ESP32-CAM 접속 설정

자세한 내용은 `backend/TAILSCALE_SETUP_COMPLETE.md`를 참고하세요.
