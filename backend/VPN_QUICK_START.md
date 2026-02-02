# VPN 설정 빠른 시작 가이드

## ✅ 완료된 작업

1. ✅ 서버에 WireGuard 클라이언트 설치
2. ✅ 클라이언트 키 생성
3. ✅ 클라이언트 공개키: `/qtIIjBFQPYOaloM+tbJdcqY3/FFkWPEbDN1e57+vG8=`

## 🔄 다음 단계: ESP32-CAM 네트워크에 VPN 서버 설정

### 옵션 1: Tailscale 사용 (가장 간단, 권장)

#### 장점
- 설정이 매우 간단
- 공인 IP 불필요
- 자동 연결 관리
- 무료 (개인 사용)

#### 설정 방법

**1. 서버에 Tailscale 설치**
```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# 브라우저에서 인증 URL 열기
```

**2. ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치**
- Windows: https://tailscale.com/download/windows
- Mac: `brew install tailscale` 또는 다운로드
- Linux: `curl -fsSL https://tailscale.com/install.sh | sh`

**3. 같은 계정으로 로그인**
- 두 기기가 자동으로 연결됨
- Tailscale IP를 사용하여 ESP32-CAM 접속

**4. 모듈 설정 업데이트**
- ESP32-CAM의 Tailscale IP를 스트림 URL에 입력
- 예: `http://100.x.x.x:81/stream`

### 옵션 2: WireGuard VPN (더 안전, 설정 복잡)

#### 필요한 정보
1. VPN 서버 공개키
2. VPN 서버 엔드포인트 (공인 IP:51820)
3. ESP32-CAM 네트워크 대역 (일반적으로 192.168.1.0/24)

#### 설정 방법

**1. ESP32-CAM 네트워크의 컴퓨터에 VPN 서버 설정**

자세한 내용: `backend/VPN_SERVER_SETUP.md`

**2. VPN 서버 정보 제공**

VPN 서버 설정 완료 후 다음 정보를 알려주세요:
- VPN 서버 공개키
- VPN 서버 엔드포인트 (공인 IP:51820)
- ESP32-CAM 네트워크 대역

**3. 서버 설정 파일 생성**

정보를 받으면 서버 측 설정 파일을 완성하겠습니다.

## 📋 체크리스트

### Tailscale 사용 시
- [ ] 서버에 Tailscale 설치 및 인증
- [ ] ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치 및 인증
- [ ] ESP32-CAM의 Tailscale IP 확인
- [ ] 모듈 설정에서 스트림 URL 업데이트

### WireGuard 사용 시
- [ ] ESP32-CAM 네트워크에 VPN 서버 설정
- [ ] 공인 IP 확인
- [ ] 라우터 포트 포워딩 설정 (51820/UDP)
- [ ] VPN 서버 공개키 확인
- [ ] 서버 설정 파일 생성 요청
- [ ] VPN 연결 테스트

## 🚀 빠른 테스트

VPN 설정 완료 후:

```bash
# 서버에서 ESP32-CAM 접속 테스트
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
ping 192.168.1.13
curl http://192.168.1.13:81/stream
```

성공하면 카메라 스트림이 표시됩니다!

## 📚 참고 문서

- `backend/VPN_SETUP_INSTRUCTIONS.md` - 상세 설정 가이드
- `backend/VPN_SERVER_SETUP.md` - VPN 서버 설정 방법
- `backend/VPN_SETUP_GUIDE.md` - 전체 VPN 가이드
