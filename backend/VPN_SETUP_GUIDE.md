# VPN/터널 설정 가이드 - ESP32-CAM 외부 접속

## 개요

서버(43.201.148.223)가 ESP32-CAM 네트워크와 다른 네트워크에 있을 때, VPN을 통해 ESP32-CAM에 접속할 수 있도록 설정합니다.

## 네트워크 구조

```
클라이언트 (외부)
  ↓ HTTPS
서버 (43.201.148.223) 
  ↓ VPN (WireGuard)
ESP32-CAM 네트워크 라우터/게이트웨이
  ↓ LAN
ESP32-CAM (192.168.1.13:81)
```

## 방법 1: WireGuard VPN (권장)

### 1단계: ESP32-CAM 네트워크에 VPN 서버 설정

ESP32-CAM이 연결된 네트워크의 라우터/게이트웨이에 WireGuard VPN 서버를 설정합니다.

#### 라우터가 OpenWrt/LEDE인 경우:

```bash
# 라우터에 SSH 접속
ssh root@192.168.1.1

# WireGuard 설치
opkg update
opkg install wireguard-tools

# WireGuard 인터페이스 생성
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

#### 일반 라우터인 경우:

라우터가 WireGuard를 지원하지 않으면, ESP32-CAM 네트워크에 있는 별도의 서버/PC에 WireGuard 서버를 설치합니다.

### 2단계: 서버에 WireGuard 클라이언트 설정

```bash
# 서버에 SSH 접속
ssh -i ~/LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# WireGuard 설치
sudo apt update
sudo apt install wireguard -y

# 클라이언트 키 생성
wg genkey | sudo tee /etc/wireguard/client_private.key | wg pubkey | sudo tee /etc/wireguard/client_public.key

# 설정 파일 생성
sudo nano /etc/wireguard/wg0.conf
```

설정 파일 내용:
```ini
[Interface]
PrivateKey = <클라이언트_개인키>
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = <VPN서버_공개키>
Endpoint = <ESP32-CAM_네트워크_공인IP>:51820
AllowedIPs = 192.168.1.0/24  # ESP32-CAM 네트워크 대역
PersistentKeepalive = 25
```

### 3단계: VPN 시작 및 자동 시작 설정

```bash
# VPN 시작
sudo wg-quick up wg0

# 상태 확인
sudo wg show

# 자동 시작 설정
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

### 4단계: ESP32-CAM 접속 테스트

```bash
# VPN을 통해 ESP32-CAM에 접속 테스트
ping 192.168.1.13
curl http://192.168.1.13:81/stream
```

## 방법 2: ngrok 터널 (간단하지만 임시)

ESP32-CAM 네트워크의 게이트웨이/라우터에서 ngrok을 실행합니다.

### 1단계: ngrok 설치 (ESP32-CAM 네트워크의 게이트웨이에서)

```bash
# ngrok 다운로드 및 설치
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# ngrok 계정 설정 (무료 계정 생성 필요)
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

### 2단계: 터널 시작

```bash
# ESP32-CAM의 포트 81을 외부에 노출
ngrok http 192.168.1.13:81
```

### 3단계: ngrok URL 사용

ngrok이 제공하는 URL (예: `https://abc123.ngrok.io`)을 사용하여:
- 모듈 설정에서 카메라 스트림 URL: `https://abc123.ngrok.io/stream`

**주의**: ngrok 무료 버전은 URL이 재시작 시마다 변경됩니다.

## 방법 3: Tailscale (가장 간단)

### 1단계: ESP32-CAM 네트워크의 게이트웨이에 Tailscale 설치

```bash
# Tailscale 설치
curl -fsSL https://tailscale.com/install.sh | sh

# Tailscale 시작
sudo tailscale up
```

### 2단계: 서버에 Tailscale 설치

```bash
# 서버에 SSH 접속
ssh -i ~/LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# Tailscale 설치
curl -fsSL https://tailscale.com/install.sh | sh

# Tailscale 시작
sudo tailscale up
```

### 3단계: ESP32-CAM 접속

Tailscale이 자동으로 IP를 할당하므로, 해당 IP를 사용하여 접속합니다.

## 서버 설정 스크립트

서버에 VPN 설정을 자동화하는 스크립트를 제공합니다:

```bash
# VPN 설정 스크립트 실행
cd ~/ces-smartfarm/backend
chmod +x setup_vpn.sh
sudo ./setup_vpn.sh
```

## 문제 해결

### VPN 연결이 안 될 때

1. **방화벽 확인**:
   ```bash
   sudo ufw status
   sudo ufw allow 51820/udp  # WireGuard 포트
   ```

2. **라우팅 확인**:
   ```bash
   ip route show
   ping 192.168.1.13
   ```

3. **VPN 상태 확인**:
   ```bash
   sudo wg show
   sudo systemctl status wg-quick@wg0
   ```

### 카메라 프록시가 작동하지 않을 때

1. **VPN을 통한 접속 테스트**:
   ```bash
   curl -v http://192.168.1.13:81/stream
   ```

2. **서버 로그 확인**:
   ```bash
   pm2 logs ces-smartfarm
   ```

## 보안 고려사항

- ✅ VPN을 사용하면 암호화된 터널을 통해 접속
- ✅ ESP32-CAM을 직접 외부에 노출하지 않음
- ✅ 인증된 사용자만 접속 가능
- ⚠️ VPN 서버의 보안 설정 확인 필요

## 참고

- **WireGuard**: 빠르고 현대적인 VPN 프로토콜
- **ngrok**: 빠른 테스트용, 프로덕션에는 부적합
- **Tailscale**: 가장 간단하지만 중앙 서버 의존
