# VPN 빠른 설정 가이드

## 서버에서 직접 실행할 명령어

서버에 SSH 접속 후 다음 명령어를 순서대로 실행하세요:

```bash
# 1. 서버에 SSH 접속
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# 2. WireGuard 설치 (한 번만 실행)
sudo apt update
sudo apt install -y wireguard wireguard-tools

# 3. VPN 설정 스크립트 실행
cd ~/ces-smartfarm/backend
sudo ./setup_vpn.sh
```

## 또는 수동 설정 (스크립트 없이)

```bash
# 1. WireGuard 설치
sudo apt update
sudo apt install -y wireguard wireguard-tools

# 2. 클라이언트 키 생성
sudo mkdir -p /etc/wireguard
cd /etc/wireguard
sudo wg genkey | sudo tee client_private.key | sudo wg pubkey | sudo tee client_public.key
sudo chmod 600 client_private.key

# 3. 공개키 확인 (이것을 VPN 서버에 등록해야 함)
sudo cat client_public.key

# 4. 설정 파일 생성
sudo nano /etc/wireguard/wg0.conf
```

설정 파일 내용:
```ini
[Interface]
PrivateKey = <위에서 생성한 client_private.key 내용>
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = <VPN서버의_공개키>
Endpoint = <ESP32-CAM_네트워크_공인IP>:51820
AllowedIPs = 192.168.1.0/24
PersistentKeepalive = 25
```

```bash
# 5. VPN 시작
sudo wg-quick up wg0

# 6. 상태 확인
sudo wg show

# 7. ESP32-CAM 접속 테스트
ping 192.168.1.13

# 8. 자동 시작 설정
sudo systemctl enable wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

## 더 간단한 방법: Tailscale (추천)

VPN 서버 설정이 복잡하다면 Tailscale을 사용하세요:

```bash
# 서버에 Tailscale 설치
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# ESP32-CAM 네트워크의 게이트웨이에도 Tailscale 설치
# (같은 계정으로 로그인하면 자동으로 연결됨)
```

## 현재 상태 확인

```bash
# VPN 인터페이스 확인
ip link show wg0

# WireGuard 상태 확인
sudo wg show

# ESP32-CAM 접속 테스트
ping 192.168.1.13
curl http://192.168.1.13:81/stream
```
