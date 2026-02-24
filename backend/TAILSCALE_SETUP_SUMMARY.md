# Tailscale 설정 완료 요약

## ✅ 설정 완료 정보

### 서버 정보
- **서버 Tailscale IP**: `100.81.196.64`
- **서버 이름**: `ip-172-26-9-50`
- **상태**: 정상 연결됨

### ESP32-CAM 네트워크 컴퓨터 정보
- **컴퓨터 Tailscale IP**: `100.69.169.126`
- **컴퓨터 이름**: `reonai-dev`
- **OS**: Windows
- **상태**: 정상 연결됨

### ESP32-CAM 정보
- **로컬 IP**: `192.168.1.3`
- **포트**: `81`
- **스트림 URL**: `http://192.168.1.3:81/stream`

## 🔧 포트 포워딩 설정

ESP32-CAM 네트워크 컴퓨터(Windows)에서 다음 명령을 실행하세요:

### PowerShell 관리자 권한으로 실행

```powershell
# 포트 포워딩 설정
netsh interface portproxy add v4tov4 listenport=81 listenaddress=0.0.0.0 connectport=81 connectaddress=192.168.1.3

# 방화벽 규칙 추가
New-NetFirewallRule -DisplayName "ESP32-CAM Proxy" -Direction Inbound -LocalPort 81 -Protocol TCP -Action Allow

# 설정 확인
netsh interface portproxy show all
```

또는 `backend/TAILSCALE_WINDOWS_SETUP.ps1` 스크립트를 실행하세요.

## 🧪 연결 테스트

### 1. ESP32-CAM 네트워크 컴퓨터에서 로컬 테스트

PowerShell에서:
```powershell
# ESP32-CAM 직접 접속 테스트
curl http://192.168.1.3:81/stream

# 포트 포워딩 테스트
curl http://localhost:81/stream
```

### 2. 서버에서 Tailscale IP로 테스트

```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# ESP32-CAM 네트워크 컴퓨터의 Tailscale IP로 접속 테스트
ping 100.69.169.126

# ESP32-CAM 스트림 접속 테스트
curl http://100.69.169.126:81/stream
```

성공하면 MJPEG 스트림 데이터가 출력됩니다.

## 📝 모듈 설정 업데이트

포트 포워딩이 정상 작동하면, 모듈 설정에서 스트림 URL을 업데이트합니다:

**스트림 URL**: `http://100.69.169.126:81/stream`

### 업데이트 방법

1. 대시보드에서 모듈 선택 (예: MODULE_001)
2. "수정" 버튼 클릭
3. "실시간 영상 URL" 필드에 입력: `http://100.69.169.126:81/stream`
4. 저장

## ✅ 완료 체크리스트

- [x] 서버에 Tailscale 설치 및 인증
- [x] ESP32-CAM 네트워크 컴퓨터에 Tailscale 설치 및 인증
- [x] Tailscale IP 확인
- [ ] 포트 포워딩 설정 (Windows에서 실행 필요)
- [ ] 서버에서 접속 테스트
- [ ] 모듈 설정에서 스트림 URL 업데이트

## 🔍 문제 해결

### 포트 포워딩이 작동하지 않을 때

1. **ESP32-CAM 직접 접속 확인**
   ```powershell
   curl http://192.168.1.3:81/stream
   ```

2. **포트 포워딩 상태 확인**
   ```powershell
   netsh interface portproxy show all
   ```

3. **방화벽 확인**
   ```powershell
   Get-NetFirewallRule -DisplayName "ESP32-CAM Proxy"
   ```

4. **포트 사용 확인**
   ```powershell
   netstat -ano | findstr :81
   ```

### 서버에서 접속이 안 될 때

1. **Tailscale 연결 확인**
   ```bash
   ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
   sudo tailscale status
   ```

2. **ping 테스트**
   ```bash
   ping 100.69.169.126
   ```

3. **포트 접속 테스트**
   ```bash
   telnet 100.69.169.126 81
   # 또는
   nc -zv 100.69.169.126 81
   ```

## 📚 참고 문서

- `backend/TAILSCALE_CLIENT_SETUP.md` - 클라이언트 설정 가이드
- `backend/TAILSCALE_PORT_FORWARDING.md` - 포트 포워딩 상세 가이드
- `backend/TAILSCALE_WINDOWS_SETUP.ps1` - Windows 자동 설정 스크립트
