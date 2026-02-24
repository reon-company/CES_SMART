#!/bin/bash

# 메모리 사용량 확인 스크립트

echo "=========================================="
echo "메모리 사용량 확인"
echo "=========================================="
echo ""

echo "[1] 전체 메모리 정보"
echo "----------------------------------------"
free -h
echo ""

echo "[2] 상세 메모리 정보"
echo "----------------------------------------"
cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable|Buffers|Cached|SwapTotal|SwapFree"
echo ""

echo "[3] 상위 10개 프로세스 (메모리 사용량)"
echo "----------------------------------------"
ps aux --sort=-%mem | head -11
echo ""

echo "[4] MySQL 메모리 설정"
echo "----------------------------------------"
if command -v mysql &> /dev/null; then
    mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';" 2>/dev/null || echo "MySQL 접속 필요 (비밀번호 입력)"
else
    echo "MySQL이 설치되어 있지 않습니다."
fi
echo ""

echo "[5] 디스크 사용량"
echo "----------------------------------------"
df -h
echo ""

echo "[6] PM2 프로세스 메모리 사용량"
echo "----------------------------------------"
if command -v pm2 &> /dev/null; then
    pm2 list
    pm2 info ces-smartfarm 2>/dev/null || echo "ces-smartfarm 프로세스가 실행 중이지 않습니다."
else
    echo "PM2가 설치되어 있지 않습니다."
fi
echo ""

echo "=========================================="
echo "권장 사항"
echo "=========================================="
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
USED_MEM=$(free -m | awk '/^Mem:/{print $3}')
PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

echo "메모리 사용률: ${PERCENT}%"
echo ""

if [ $PERCENT -gt 90 ]; then
    echo "⚠️  경고: 메모리 사용률이 90%를 초과했습니다!"
    echo "   → 인스턴스 업그레이드 또는 메모리 최적화 필요"
elif [ $PERCENT -gt 80 ]; then
    echo "⚠️  주의: 메모리 사용률이 80%를 초과했습니다."
    echo "   → 메모리 모니터링 권장"
else
    echo "✓ 메모리 사용률이 정상 범위입니다."
fi

if [ $TOTAL_MEM -lt 2048 ]; then
    echo ""
    echo "⚠️  현재 RAM이 2GB 미만입니다."
    echo "   → 인스턴스 업그레이드 권장 (최소 2GB)"
fi
