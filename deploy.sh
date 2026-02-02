#!/bin/bash

# CES SmartFarm Lightsail 배포 스크립트
# 사용법: ./deploy.sh

LIGHTSAIL_IP="43.203.141.2"
SSH_KEY="./LightsailDefaultKey-ap-northeast-2.pem"
SSH_USER="ubuntu"  # 또는 "ec2-user" (Amazon Linux의 경우)
REMOTE_DIR="/home/ubuntu/ces-smartfarm"

echo "=== CES SmartFarm 배포 시작 ==="

# SSH 키 권한 설정
chmod 400 "$SSH_KEY"

# 서버에 디렉토리 생성
echo "서버 디렉토리 생성 중..."
ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$SSH_USER@$LIGHTSAIL_IP" "mkdir -p $REMOTE_DIR"

# 백엔드 파일 업로드
echo "백엔드 파일 업로드 중..."
scp -o StrictHostKeyChecking=no -i "$SSH_KEY" -r backend/* "$SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/backend/"

# package.json 업로드
scp -o StrictHostKeyChecking=no -i "$SSH_KEY" backend/package.json "$SSH_USER@$LIGHTSAIL_IP:$REMOTE_DIR/backend/"

echo "배포 완료!"
echo ""
echo "다음 단계:"
echo "1. 서버에 SSH 접속: ssh -i $SSH_KEY $SSH_USER@$LIGHTSAIL_IP"
echo "2. cd $REMOTE_DIR/backend"
echo "3. npm install"
echo "4. .env 파일 생성 및 설정"
echo "5. npm start 또는 PM2로 실행"

