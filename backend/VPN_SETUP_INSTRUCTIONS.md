# VPN 설정 완료 가이드

## 현재 상태

✅ **서버 측 설정 완료**
- WireGuard 클라이언트 설치 완료
- 클라이언트 키 생성 완료
- 클라이언트 공개키: `/qtIIjBFQPYOaloM+tbJdcqY3/FFkWPEbDN1e57+vG8=`

## 다음 단계: ESP32-CAM 네트워크에 VPN 서버 설정

ESP32-CAM과 같은 네트워크에 있는 컴퓨터에 VPN 서버를 설정해야 합니다.

### 필요한 정보

1. **서버의 클라이언트 공개키**: `/qtIIjBFQPYOaloM+tbJdcqY3/FFkWPEbDN1e57+vG8=`
2. **ESP32-CAM 네트워크 대역**: `192.168.1.0/24` (일반적으로)
3. **VPN 서버 공인 IP**: ESP32-CAM 네트워크의 공인 IP (확인 필요)

### 설정 방법

자세한 설정 방법은 `backend/VPN_SERVER_SETUP.md` 파일을 참고하세요.

#### 빠른 설정 (Linux/Mac)

```bash
# 1. WireGuard 설치
sudo apt update  # Ubuntu/Debian
sudo apt install -y wireguard wireguard-tools

# 2. 서버 키 생성
cd /etc/wireguard
sudo wg genkey | sudo tee server_private.key | sudo wg pubkey | sudo tee server_public.key
sudo chmod 600 server_private.key

# 3. 설정 파일 생성
sudo nano /etc/wireguard/wg0.conf
```

설정 파일 내용:
```ini
[Interface]
PrivateKey = <server_private.key의_내용>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -A FORWARD -o wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -D FORWARD -o wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = /qtIIjBFQPYOaloM+tbJdcqY3/FFkWPEbDN1e57+vG8=
AllowedIPs = 10.0.0.2/32
```

```bash
# 4. IP 포워딩 활성화
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# 5. 방화벽 설정
sudo ufw allow 51820/udp

# 6. VPN 서버 시작
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0

# 7. 서버 공개키 확인 (이것을 서버 설정에 사용)
sudo cat /etc/wireguard/server_public.key
```

### 공인 IP 확인

VPN 서버 컴퓨터에서:
```bash
curl ifconfig.me
```

또는 브라우저에서: https://whatismyipaddress.com

### 라우터 포트 포워딩 설정

라우터 관리 페이지에서:
- **프로토콜**: UDP
- **외부 포트**: 51820
- **내부 IP**: VPN 서버 컴퓨터의 IP (예: 192.168.1.100)
- **내부 포트**: 51820

## VPN 서버 설정 완료 후

VPN 서버 설정이 완료되면 다음 정보를 제공해주세요:

1. **VPN 서버 공개키**: `sudo cat /etc/wireguard/server_public.key`
2. **VPN 서버 엔드포인트**: `<공인IP>:51820` (예: `123.45.67.89:51820`)
3. **ESP32-CAM 네트워크 대역**: 일반적으로 `192.168.1.0/24`

이 정보를 받으면 서버 측 설정 파일을 완성하겠습니다.

## 대안: Tailscale 사용 (더 간단)

VPN 설정이 복잡하다면 Tailscale을 사용할 수 있습니다:

### 서버에 Tailscale 설치
```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### ESP32-CAM 네트워크의 컴퓨터에 Tailscale 설치
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

같은 계정으로 로그인하면 자동으로 연결됩니다.
