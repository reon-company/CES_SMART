# Tailscale 설정 완료 가이드

## ✅ 서버 설정 완료

서버(43.201.148.223)에 Tailscale이 설치되고 인증되었습니다.

### 서버 Tailscale 정보 확인
```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
sudo tailscale status
sudo tailscale ip -4
```

## 🔄 다음 단계: ESP32-CAM 네트워크에 Tailscale 설치

ESP32-CAM과 같은 네트워크에 있는 컴퓨터에 Tailscale을 설치해야 합니다.

### Windows에서 설치

1. **Tailscale 다운로드 및 설치**
   - https://tailscale.com/download/windows 방문
   - 다운로드한 설치 파일 실행
   - 설치 완료 후 Tailscale 앱 실행

2. **로그인**
   - 서버와 **같은 Tailscale 계정**으로 로그인
   - 브라우저에서 인증 완료

3. **Tailscale IP 확인**
   - Tailscale 앱에서 IP 주소 확인
   - 또는 명령 프롬프트에서:
   ```cmd
   tailscale ip -4
   ```

### Mac에서 설치

```bash
# Homebrew 사용
brew install tailscale

# 또는 수동 설치
# https://tailscale.com/download/macos 방문

# 시작
sudo tailscale up
```

### Linux에서 설치

```bash
# 설치
curl -fsSL https://tailscale.com/install.sh | sh

# 시작
sudo tailscale up
```

## 📋 ESP32-CAM 접속 설정

### 1. ESP32-CAM 네트워크의 컴퓨터 Tailscale IP 확인

ESP32-CAM과 같은 네트워크에 있는 컴퓨터의 Tailscale IP를 확인합니다.

예: `100.64.1.2`

### 2. ESP32-CAM의 로컬 IP 확인

ESP32-CAM의 로컬 IP를 확인합니다 (예: `192.168.1.13`).

### 3. Tailscale을 통한 ESP32-CAM 접속

ESP32-CAM 네트워크의 컴퓨터에서 Tailscale이 설치되어 있으면, 서버에서 해당 컴퓨터의 Tailscale IP를 통해 ESP32-CAM에 접속할 수 있습니다.

**하지만 더 나은 방법**: ESP32-CAM 네트워크의 컴퓨터에서 포트 포워딩을 설정하거나, ESP32-CAM을 직접 Tailscale 네트워크에 연결할 수 없으므로, ESP32-CAM 네트워크의 컴퓨터를 Tailscale로 연결한 후, 해당 컴퓨터를 통해 ESP32-CAM에 접속합니다.

### 4. 모듈 설정 업데이트

**옵션 A: ESP32-CAM 네트워크 컴퓨터의 Tailscale IP 사용**

ESP32-CAM 네트워크의 컴퓨터에서 포트 포워딩을 설정:
- ESP32-CAM: `192.168.1.13:81`
- 컴퓨터의 Tailscale IP: `100.64.1.2`
- 컴퓨터에서 `192.168.1.13:81`을 `100.64.1.2:81`로 포워딩

그러면 서버에서 `http://100.64.1.2:81/stream`로 접속 가능

**옵션 B: SSH 터널 사용**

ESP32-CAM 네트워크의 컴퓨터에서 SSH 터널 설정:
```bash
# ESP32-CAM 네트워크의 컴퓨터에서 실행
ssh -R 8081:192.168.1.13:81 ubuntu@43.201.148.223
```

서버에서 `http://localhost:8081/stream`로 접속

**옵션 C: ngrok 사용 (임시 테스트용)**

ESP32-CAM 네트워크의 컴퓨터에서:
```bash
ngrok http 192.168.1.13:81
```

생성된 URL을 모듈 설정에 입력

## 🧪 연결 테스트

### 서버에서 테스트

```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# ESP32-CAM 네트워크 컴퓨터의 Tailscale IP로 접속 테스트
ping 100.64.1.2  # ESP32-CAM 네트워크 컴퓨터의 Tailscale IP

# ESP32-CAM 접속 테스트 (포트 포워딩 설정 후)
curl http://100.64.1.2:81/stream
```

## 📝 권장 설정 방법

### 가장 간단한 방법: ESP32-CAM 네트워크 컴퓨터에서 포트 포워딩

1. **ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치 및 로그인**

2. **포트 포워딩 설정 (Windows)**
   - PowerShell 관리자 권한으로 실행:
   ```powershell
   netsh interface portproxy add v4tov4 listenport=81 listenaddress=0.0.0.0 connectport=81 connectaddress=192.168.1.13
   ```

3. **방화벽 규칙 추가**
   ```powershell
   New-NetFirewallRule -DisplayName "ESP32-CAM Proxy" -Direction Inbound -LocalPort 81 -Protocol TCP -Action Allow
   ```

4. **모듈 설정 업데이트**
   - 스트림 URL: `http://<컴퓨터의_Tailscale_IP>:81/stream`
   - 예: `http://100.64.1.2:81/stream`

### Linux/Mac에서 포트 포워딩

```bash
# iptables 사용 (Linux)
sudo iptables -t nat -A PREROUTING -p tcp --dport 81 -j DNAT --to-destination 192.168.1.13:81
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

# 또는 socat 사용
sudo apt install socat
socat TCP-LISTEN:81,fork,reuseaddr TCP:192.168.1.13:81
```

## ✅ 완료 체크리스트

- [ ] 서버에 Tailscale 설치 및 인증 완료
- [ ] ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치
- [ ] 같은 Tailscale 계정으로 로그인
- [ ] ESP32-CAM 네트워크 컴퓨터의 Tailscale IP 확인
- [ ] 포트 포워딩 설정 (선택사항)
- [ ] 서버에서 ESP32-CAM 접속 테스트
- [ ] 모듈 설정에서 스트림 URL 업데이트

## 🔍 문제 해결

### Tailscale 연결이 안 될 때

1. **상태 확인**
   ```bash
   sudo tailscale status
   ```

2. **재연결**
   ```bash
   sudo tailscale down
   sudo tailscale up
   ```

3. **방화벽 확인**
   - Tailscale은 자동으로 방화벽 규칙을 설정하지만, 확인 필요

### ESP32-CAM에 접속이 안 될 때

1. **ESP32-CAM 네트워크 컴퓨터에서 테스트**
   ```bash
   curl http://192.168.1.13:81/stream
   ```

2. **포트 포워딩 확인**
   - 포트 포워딩이 올바르게 설정되었는지 확인

3. **서버에서 직접 테스트**
   ```bash
   curl http://<Tailscale_IP>:81/stream
   ```

## 📚 참고

- Tailscale 공식 문서: https://tailscale.com/kb/
- Tailscale 상태 확인: `sudo tailscale status`
- Tailscale IP 확인: `sudo tailscale ip -4`
