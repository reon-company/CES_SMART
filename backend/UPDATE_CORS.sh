#!/bin/bash

# CORS 설정 업데이트 스크립트

echo "=== CORS 설정 업데이트 ==="

# 백엔드 디렉토리로 이동
cd ~/ces-smartfarm/backend || exit 1

# .env 파일 백업
cp .env .env.backup

# CORS_ORIGIN 업데이트 (기존 설정 유지하면서 Vercel 도메인 추가)
if grep -q "CORS_ORIGIN" .env; then
    # 기존 CORS_ORIGIN이 있으면 Vercel 도메인 추가
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app|' .env
else
    # CORS_ORIGIN이 없으면 추가
    echo "" >> .env
    echo "CORS_ORIGIN=http://localhost:8080,https://ces-smart.vercel.app" >> .env
fi

echo "✅ .env 파일 업데이트 완료"
echo ""
echo "현재 CORS_ORIGIN 설정:"
grep CORS_ORIGIN .env

echo ""
echo "=== 서버 상태 확인 ==="
pm2 status

echo ""
echo "=== 서버 시작/재시작 ==="
if pm2 list | grep -q "ces-smartfarm"; then
    echo "기존 프로세스 재시작 중..."
    pm2 restart ces-smartfarm --update-env
else
    echo "새 프로세스 시작 중..."
    cd ~/ces-smartfarm/backend
    pm2 start server.js --name ces-smartfarm
    pm2 save
fi

echo ""
echo "=== 서버 로그 확인 ==="
sleep 2
pm2 logs ces-smartfarm --lines 20 --nostream

echo ""
echo "✅ 완료!"

