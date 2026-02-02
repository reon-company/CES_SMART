#!/bin/bash

# VPN 설정 스크립트 (WireGuard 클라이언트)
# 서버에서 ESP32-CAM 네트워크에 VPN으로 접속하기 위한 설정

set -e

echo "=========================================="
echo "VPN 설정 스크립트 (WireGuard 클라이언트)"
echo "=========================================="
echo ""

# 루트 권한 확인
if [ "$EUID" -ne 0 ]; then 
    echo "이 스크립트는 sudo 권한이 필요합니다."
    echo "사용법: sudo ./setup_vpn.sh"
    exit 1
fi

# WireGuard 설치 확인
if ! command -v wg &> /dev/null; then
    echo "WireGuard를 설치합니다..."
    apt update
    apt install -y wireguard wireguard-tools
    echo "✓ WireGuard 설치 완료"
else
    echo "✓ WireGuard가 이미 설치되어 있습니다."
fi

# 설정 디렉토리 생성
mkdir -p /etc/wireguard
cd /etc/wireguard

# 키가 없으면 생성
if [ ! -f client_private.key ]; then
    echo "클라이언트 키를 생성합니다..."
    wg genkey | tee client_private.key | wg pubkey > client_public.key
    chmod 600 client_private.key
    chmod 644 client_public.key
    echo "✓ 클라이언트 키 생성 완료"
    echo ""
    echo "클라이언트 공개키:"
    cat client_public.key
    echo ""
    echo "⚠️  이 공개키를 VPN 서버 설정에 추가해야 합니다."
else
    echo "✓ 클라이언트 키가 이미 존재합니다."
fi

# 설정 파일이 없으면 생성
if [ ! -f wg0.conf ]; then
    echo ""
    echo "=========================================="
    echo "VPN 설정 파일 생성"
    echo "=========================================="
    echo ""
    echo "다음 정보를 입력해주세요:"
    echo ""
    
    read -p "VPN 서버 공개키: " SERVER_PUBLIC_KEY
    read -p "VPN 서버 엔드포인트 (IP:포트, 예: 1.2.3.4:51820): " SERVER_ENDPOINT
    read -p "ESP32-CAM 네트워크 대역 (예: 192.168.1.0/24): " NETWORK_CIDR
    read -p "클라이언트 VPN IP (예: 10.0.0.2): " CLIENT_IP
    
    PRIVATE_KEY=$(cat client_private.key)
    
    cat > wg0.conf <<EOF
[Interface]
PrivateKey = $PRIVATE_KEY
Address = $CLIENT_IP/24
DNS = 8.8.8.8

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = $SERVER_ENDPOINT
AllowedIPs = $NETWORK_CIDR
PersistentKeepalive = 25
EOF
    
    chmod 600 wg0.conf
    echo ""
    echo "✓ 설정 파일 생성 완료: /etc/wireguard/wg0.conf"
else
    echo "✓ 설정 파일이 이미 존재합니다: /etc/wireguard/wg0.conf"
fi

# VPN 시작
echo ""
echo "VPN을 시작합니다..."
wg-quick down wg0 2>/dev/null || true
wg-quick up wg0

# 자동 시작 설정
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

echo ""
echo "=========================================="
echo "VPN 설정 완료"
echo "=========================================="
echo ""
echo "VPN 상태:"
wg show
echo ""
echo "ESP32-CAM 네트워크 접속 테스트:"
echo "ping 192.168.1.13"
echo "curl http://192.168.1.13:81/stream"
echo ""
