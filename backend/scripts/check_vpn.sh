#!/bin/bash

# VPN 연결 상태 확인 및 자동 재연결 스크립트

VPN_INTERFACE="wg0"
CHECK_INTERVAL=60  # 60초마다 확인
LOG_FILE="/var/log/vpn_check.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_vpn() {
    if ip link show "$VPN_INTERFACE" &>/dev/null; then
        if wg show "$VPN_INTERFACE" &>/dev/null; then
            # VPN 인터페이스가 있고 활성화되어 있음
            # ESP32-CAM 네트워크에 ping 테스트
            if ping -c 1 -W 2 192.168.1.13 &>/dev/null; then
                return 0  # 정상
            else
                log "VPN은 연결되어 있지만 ESP32-CAM에 접속할 수 없습니다."
                return 1
            fi
        else
            log "VPN 인터페이스가 있지만 비활성화되어 있습니다."
            return 1
        fi
    else
        log "VPN 인터페이스가 없습니다."
        return 1
    fi
}

restart_vpn() {
    log "VPN을 재시작합니다..."
    wg-quick down "$VPN_INTERFACE" 2>/dev/null || true
    sleep 2
    wg-quick up "$VPN_INTERFACE"
    sleep 5
    
    if check_vpn; then
        log "VPN 재시작 성공"
        return 0
    else
        log "VPN 재시작 실패"
        return 1
    fi
}

# 메인 루프
if [ "$1" == "daemon" ]; then
    log "VPN 모니터링 데몬 시작"
    while true; do
        if ! check_vpn; then
            restart_vpn
        fi
        sleep "$CHECK_INTERVAL"
    done
else
    # 일회성 확인
    if check_vpn; then
        echo "VPN 상태: 정상"
        exit 0
    else
        echo "VPN 상태: 오류"
        restart_vpn
        exit $?
    fi
fi
