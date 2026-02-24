# ESP32-CAM 네트워크 컴퓨터에 Tailscale 설치 가이드

## ✅ 서버 설정 완료

- 서버 Tailscale IP: `100.81.196.64`
- 서버 이름: `ip-172-26-9-50`

## 🔄 ESP32-CAM 네트워크 컴퓨터에 Tailscale 설치

ESP32-CAM과 같은 네트워크에 있는 컴퓨터에 Tailscale을 설치하고, **서버와 같은 Tailscale 계정**으로 로그인해야 합니다.

### Windows에서 설치

#### 1단계: Tailscale 다운로드 및 설치

1. 브라우저에서 https://tailscale.com/download/windows 방문
2. "Download for Windows" 버튼 클릭
3. 다운로드한 `Tailscale-installer.exe` 실행
4. 설치 완료

#### 2단계: Tailscale 시작 및 로그인

1. 설치 완료 후 Tailscale 앱이 자동으로 실행됩니다
2. **서버와 같은 Tailscale 계정**으로 로그인
3. 브라우저에서 인증 완료

#### 3단계: Tailscale IP 확인

**방법 1: Tailscale 앱에서 확인**
- 시스템 트레이의 Tailscale 아이콘 클릭
- "IP address" 확인

**방법 2: 명령 프롬프트에서 확인**
```cmd
tailscale ip -4
```

예: `100.64.1.2` 또는 `100.x.x.x` 형식의 IP

### Mac에서 설치

#### 1단계: Tailscale 설치

**Homebrew 사용:**
```bash
brew install tailscale
```

**또는 수동 설치:**
1. https://tailscale.com/download/macos 방문
2. 다운로드 및 설치

#### 2단계: Tailscale 시작 및 로그인

```bash
sudo tailscale up
```

브라우저에서 인증 URL이 열리면 **서버와 같은 계정**으로 로그인

#### 3단계: Tailscale IP 확인

```bash
tailscale ip -4
```

### Linux에서 설치

#### 1단계: Tailscale 설치

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

#### 2단계: Tailscale 시작 및 로그인

```bash
sudo tailscale up
```

브라우저에서 인증 URL이 열리면 **서버와 같은 계정**으로 로그인

#### 3단계: Tailscale IP 확인

```bash
tailscale ip -4
```

## 📋 다음 단계: ESP32-CAM 접속 설정

ESP32-CAM 네트워크 컴퓨터에 Tailscale이 설치되고 로그인되면, 두 가지 방법으로 ESP32-CAM에 접속할 수 있습니다:

### 방법 1: 포트 포워딩 (권장)

ESP32-CAM 네트워크 컴퓨터에서 ESP32-CAM의 포트를 Tailscale IP로 포워딩합니다.

#### Windows에서 포트 포워딩

**PowerShell 관리자 권한으로 실행:**

```powershell
# 포트 포워딩 설정 (ESP32-CAM: 192.168.1.13:81)
netsh interface portproxy add v4tov4 listenport=81 listenaddress=0.0.0.0 connectport=81 connectaddress=192.168.1.13

# 방화벽 규칙 추가
New-NetFirewallRule -DisplayName "ESP32-CAM Proxy" -Direction Inbound -LocalPort 81 -Protocol TCP -Action Allow
```

#### Linux/Mac에서 포트 포워딩

**socat 사용 (간단):**
```bash
# socat 설치
sudo apt install socat  # Ubuntu/Debian
# 또는
brew install socat  # Mac

# 포트 포워딩 실행
socat TCP-LISTEN:81,fork,reuseaddr TCP:192.168.1.13:81
```

**iptables 사용 (Linux):**
```bash
# IP 포워딩 활성화
sudo sysctl -w net.ipv4.ip_forward=1

# 포트 포워딩 설정
sudo iptables -t nat -A PREROUTING -p tcp --dport 81 -j DNAT --to-destination 192.168.1.13:81
sudo iptables -t nat -A POSTROUTING -j MASQUERADE
```

#### 모듈 설정 업데이트

ESP32-CAM 네트워크 컴퓨터의 Tailscale IP를 사용하여 스트림 URL 설정:

- **스트림 URL**: `http://<컴퓨터의_Tailscale_IP>:81/stream`
- **예**: `http://100.64.1.2:81/stream`

### 방법 2: SSH 터널 (임시 테스트용)

ESP32-CAM 네트워크 컴퓨터에서 SSH 터널을 생성합니다:

```bash
# ESP32-CAM 네트워크 컴퓨터에서 실행
ssh -R 8081:192.168.1.13:81 ubuntu@100.81.196.64
```

서버에서 `http://localhost:8081/stream`로 접속 가능

## 🧪 연결 테스트

### 1. 서버에서 ESP32-CAM 네트워크 컴퓨터 접속 테스트

```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# ESP32-CAM 네트워크 컴퓨터의 Tailscale IP로 ping 테스트
ping <컴퓨터의_Tailscale_IP>

# ESP32-CAM 스트림 접속 테스트
curl http://<컴퓨터의_Tailscale_IP>:81/stream
```

### 2. ESP32-CAM 네트워크 컴퓨터에서 테스트

```bash
# 로컬에서 ESP32-CAM 접속 테스트
curl http://192.168.1.13:81/stream
```

## ✅ 완료 체크리스트

- [ ] ESP32-CAM 네트워크 컴퓨터에 Tailscale 설치
- [ ] 서버와 같은 Tailscale 계정으로 로그인
- [ ] 컴퓨터의 Tailscale IP 확인
- [ ] 포트 포워딩 설정 (선택사항)
- [ ] 서버에서 접속 테스트
- [ ] 모듈 설정에서 스트림 URL 업데이트

## 📝 참고

- **서버 Tailscale IP**: `100.81.196.64`
- **ESP32-CAM 로컬 IP**: `192.168.1.13` (또는 실제 IP)
- **ESP32-CAM 포트**: `81`

ESP32-CAM 네트워크 컴퓨터의 Tailscale IP를 확인한 후 알려주시면, 모듈 설정을 업데이트하겠습니다!
