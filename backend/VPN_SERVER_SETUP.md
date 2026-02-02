# ESP32-CAM 네트워크에 VPN 서버 설정 가이드

## 개요

서버(43.201.148.223)가 ESP32-CAM의 로컬 네트워크(192.168.1.x)에 접근할 수 있도록, ESP32-CAM 네트워크에 WireGuard VPN 서버를 설정해야 합니다.

## 방법 1: ESP32-CAM 네트워크의 컴퓨터에 VPN 서버 설정 (권장)

ESP32-CAM과 같은 네트워크에 있는 Windows/Linux/Mac 컴퓨터에 VPN 서버를 설정합니다.

### Windows에서 설정 (PowerShell 관리자 권한)

#### 1단계: WireGuard 설치
```powershell
# Chocolatey 사용 (없으면 먼저 설치)
choco install wireguard

# 또는 수동 설치
# https://www.wireguard.com/install/ 에서 다운로드
```

#### 2단계: 서버 키 생성
```powershell
# WireGuard 설치 디렉토리로 이동 (일반적으로 C:\Program Files\WireGuard)
cd "C:\Program Files\WireGuard"

# 서버 키 생성
wg genkey | Out-File -Encoding ASCII server_private.key
Get-Content server_private.key | wg pubkey | Out-File -Encoding ASCII server_public.key

# 공개키 확인
Get-Content server_public.key
```

#### 3단계: 설정 파일 생성
`C:\Program Files\WireGuard\wg0.conf` 파일 생성:

```ini
[Interface]
PrivateKey = <server_private.key의_내용>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = netsh interface portproxy add v4tov4 listenport=51820 listenaddress=0.0.0.0 connectport=51820 connectaddress=10.0.0.1
PostDown = netsh interface portproxy delete v4tov4 listenport=51820 listenaddress=0.0.0.0

[Peer]
PublicKey = <서버에서_생성한_클라이언트_공개키>
AllowedIPs = 10.0.0.2/32
```

#### 4단계: 방화벽 규칙 추가
```powershell
# PowerShell 관리자 권한으로 실행
New-NetFirewallRule -DisplayName "WireGuard" -Direction Inbound -LocalPort 51820 -Protocol UDP -Action Allow
```

#### 5단계: VPN 서버 시작
```powershell
# WireGuard GUI에서 wg0 인터페이스 활성화
# 또는 명령줄에서:
wg-quick up wg0
```

### Linux/Mac에서 설정

#### 1단계: WireGuard 설치
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y wireguard wireguard-tools

# macOS
brew install wireguard-tools
```

#### 2단계: 서버 키 생성
```bash
cd /etc/wireguard
sudo wg genkey | sudo tee server_private.key | sudo wg pubkey | sudo tee server_public.key
sudo chmod 600 server_private.key
sudo chmod 644 server_public.key

# 공개키 확인
sudo cat server_public.key
```

#### 3단계: 설정 파일 생성
`/etc/wireguard/wg0.conf` 파일 생성:

```ini
[Interface]
PrivateKey = <server_private.key의_내용>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <서버에서_생성한_클라이언트_공개키>
AllowedIPs = 10.0.0.2/32
```

#### 4단계: IP 포워딩 활성화 (Linux)
```bash
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
```

#### 5단계: 방화벽 설정
```bash
# UFW 사용 시
sudo ufw allow 51820/udp

# 또는 iptables 직접 사용
sudo iptables -A INPUT -p udp --dport 51820 -j ACCEPT
```

#### 6단계: VPN 서버 시작
```bash
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

## 방법 2: 라우터에 VPN 서버 설정

라우터가 OpenWrt/LEDE를 지원하는 경우 라우터에 직접 설정할 수 있습니다.

### OpenWrt 라우터 설정

```bash
# 라우터에 SSH 접속
ssh root@192.168.1.1

# WireGuard 설치
opkg update
opkg install wireguard-tools

# 서버 키 생성
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key

# 설정 파일 생성
cat > /etc/config/wireguard <<EOF
config interface 'wg0'
    option private_key '$(cat /etc/wireguard/server_private.key)'
    option listen_port '51820'
    list addresses '10.0.0.1/24'

config peer 'server'
    option public_key '$(cat /etc/wireguard/server_public.key)'
    option allowed_ips '10.0.0.2/32'
    option persistent_keepalive '25'
EOF

# WireGuard 시작
/etc/init.d/wireguard start
/etc/init.d/wireguard enable
```

## 공인 IP 확인

VPN 서버를 외부에서 접근하려면 공인 IP가 필요합니다.

### 공인 IP 확인 방법
```bash
# Linux/Mac
curl ifconfig.me

# Windows PowerShell
Invoke-WebRequest -Uri "https://ifconfig.me" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### 공인 IP가 없는 경우 (NAT 뒤에 있는 경우)

1. **포트 포워딩 설정**: 라우터에서 포트 51820 (UDP)를 VPN 서버 컴퓨터로 포워딩
2. **DDNS 사용**: 공인 IP가 변경되는 경우 동적 DNS 서비스 사용

## 라우터 포트 포워딩 설정

라우터 관리 페이지에서:
- **프로토콜**: UDP
- **외부 포트**: 51820
- **내부 IP**: VPN 서버 컴퓨터의 IP (예: 192.168.1.100)
- **내부 포트**: 51820

## 서버 설정 정보

서버에서 생성한 클라이언트 공개키를 VPN 서버 설정에 추가해야 합니다.

서버의 클라이언트 공개키는 다음 명령으로 확인할 수 있습니다:
```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223 "sudo cat /etc/wireguard/client_public.key"
```

## 연결 테스트

VPN 서버 설정 후:

1. **서버에서 VPN 연결**:
```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
sudo wg-quick up wg0
sudo wg show
```

2. **ESP32-CAM 접속 테스트**:
```bash
ping 192.168.1.13
curl http://192.168.1.13:81/stream
```

## 문제 해결

### VPN 연결이 안 될 때

1. **방화벽 확인**:
   - VPN 서버 컴퓨터의 방화벽에서 포트 51820 (UDP) 허용
   - 라우터의 포트 포워딩 설정 확인

2. **공인 IP 확인**:
   - VPN 서버의 공인 IP가 올바른지 확인
   - DDNS를 사용하는 경우 도메인이 올바르게 업데이트되었는지 확인

3. **라우팅 확인**:
   - VPN 서버에서 ESP32-CAM 네트워크로의 라우팅이 올바른지 확인

### ESP32-CAM에 접속이 안 될 때

1. **VPN 연결 상태 확인**:
```bash
sudo wg show
```

2. **라우팅 테이블 확인**:
```bash
ip route show
```

3. **ESP32-CAM 네트워크 접속 테스트**:
```bash
ping 192.168.1.13
```

## 보안 고려사항

- ✅ VPN 키는 안전하게 보관
- ✅ 방화벽에서 필요한 포트만 열기
- ✅ 정기적으로 키 로테이션
- ✅ VPN 서버의 로그 모니터링
