# 카메라 스트림 네트워크 문제 해결 가이드

## 문제 상황

서버에서 ESP32-CAM의 로컬 IP (예: `192.168.1.3:81/stream`)에 접근할 수 없습니다.

### 증상
- ESP32-CAM은 로컬 네트워크에서 정상 작동
- 서버 프록시를 통한 접근 시 "연결 실패" 또는 "타임아웃" 발생
- 서버 로그: `Connection timeout` 또는 `ECONNREFUSED`

### 원인
서버(43.201.148.223)와 ESP32-CAM(192.168.1.x)이 서로 다른 네트워크에 있어 직접 통신이 불가능합니다.

## 해결 방법

### 방법 1: VPN 설정 (권장)

서버를 ESP32-CAM의 로컬 네트워크에 VPN으로 연결합니다.

#### WireGuard 사용
```bash
# 서버에서 실행
cd ~/ces-smartfarm/backend
sudo apt update
sudo apt install -y wireguard

# 클라이언트 설정 (ESP32-CAM 네트워크의 라우터/게이트웨이에 WireGuard 서버 설치 필요)
# 또는 Tailscale 사용 (더 간단)
```

#### Tailscale 사용 (가장 간단)
```bash
# 서버에서 실행
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# ESP32-CAM 네트워크의 다른 기기에서도 Tailscale 설치 및 연결
# 자동으로 같은 네트워크처럼 작동
```

자세한 내용: `backend/VPN_SETUP_GUIDE.md`

### 방법 2: 포트 포워딩

라우터에서 ESP32-CAM의 포트를 외부에 열어 서버에서 접근 가능하게 합니다.

1. 라우터 관리 페이지 접속
2. 포트 포워딩 설정:
   - 외부 포트: 8081 (또는 원하는 포트)
   - 내부 IP: ESP32-CAM IP (예: 192.168.1.13)
   - 내부 포트: 81
   - 프로토콜: TCP
3. 공인 IP 확인 (예: `https://whatismyipaddress.com`)
4. 모듈 설정에서 스트림 URL을 `http://<공인IP>:8081/stream`로 변경

**주의**: 보안상 위험할 수 있으므로 방화벽 설정을 철저히 해야 합니다.

### 방법 3: 터널링 서비스 (ngrok)

ESP32-CAM 네트워크의 컴퓨터에서 ngrok을 실행하여 터널을 생성합니다.

```bash
# ESP32-CAM 네트워크의 컴퓨터에서 실행
ngrok http 192.168.1.13:81

# 생성된 URL (예: https://abc123.ngrok.io)을 모듈 설정에 입력
```

**단점**: 무료 버전은 URL이 매번 변경됩니다.

### 방법 4: ESP32-CAM을 외부 접근 가능한 네트워크로 이동

ESP32-CAM을 서버와 같은 네트워크에 배치하거나, 외부 접근이 가능한 네트워크로 이동합니다.

## 현재 상태 확인

### 서버에서 ESP32-CAM 접근 테스트
```bash
# 서버에서 실행
curl -v --connect-timeout 5 http://192.168.1.13:81/stream

# 성공하면 스트림 데이터가 출력됨
# 실패하면 "Connection timeout" 또는 "Connection refused" 오류
```

### 서버 로그 확인
```bash
# 서버에서 실행
pm2 logs backend --lines 50 | grep -i camera
```

## 권장 해결책

**가장 간단한 방법**: Tailscale 사용
1. 서버와 ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치
2. 같은 Tailscale 계정으로 로그인
3. ESP32-CAM의 Tailscale IP를 모듈 설정에 입력

**가장 안전한 방법**: VPN (WireGuard)
- 완전한 제어 가능
- 보안성 높음
- 설정 복잡

**가장 빠른 방법**: 포트 포워딩
- 즉시 적용 가능
- 보안 주의 필요

## 참고 문서

- `backend/VPN_SETUP_GUIDE.md` - VPN 설정 상세 가이드
- `backend/VPN_QUICK_SETUP.md` - 빠른 VPN 설정
- `CES_CAMERA/API_DOCUMENTATION.md` - ESP32-CAM API 문서
