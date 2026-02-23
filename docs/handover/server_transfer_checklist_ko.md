# 서버 이관 체크리스트 (KO)

---

## 대상 독자 / 목표

| 항목 | 내용 |
|------|------|
| **대상 독자** | 서버/인프라 운영자, 배포 담당자 |
| **목표** | 기존 서버에서 새 서버로 CES SMART 백엔드·DB·카메라 네트워크를 이전하고 운영 검증을 완료함 |

---

## 사전 준비물

- [ ] 새 서버(VM/클라우드) SSH 접근 권한
- [ ] MySQL 클라이언트/접근 권한
- [ ] Node.js 18+ (nvm 또는 직접 설치)
- [ ] PM2 (`npm install -g pm2`)
- [ ] Tailscale(또는 대체 VPN) 계정 (카메라 네트워크용)
- [ ] 도메인 DNS 관리 권한

---

## 1. 인프라 기본
- [ ] 새 서버 생성 및 SSH 접근 확인
- [ ] 방화벽 포트(22, 80, 443, 필요 시 3000) 개방
- [ ] 도메인 DNS A 레코드 변경

## 2. 백엔드 배포
- [ ] `backend` 업로드
- [ ] `npm install` 완료
- [ ] `.env` 구성(DB/JWT/CORS)
- [ ] PM2 실행 및 startup 등록

## 3. 데이터베이스
- [ ] `database/schema.sql` 적용
- [ ] 필요 마이그레이션 SQL 적용
- [ ] 모듈/유저 데이터 무결성 확인

## 4. 카메라 네트워크
- [ ] Tailscale 연결 상태 확인
- [ ] Windows `portproxy` 규칙 확인
- [ ] 서버에서 카메라 IP:81 연결 확인
- [ ] `GET /api/camera/:moduleId/health` 확인

## 5. 운영 검증
- [ ] `GET /api/health`
- [ ] 로그인 및 모듈 조회
- [ ] 카메라 스트림 표시
- [ ] 설치 검증 API(`/api/setup/verify`) 실행

---

## 6. 단계별 이관 절차

### Step 1: 새 서버 준비
```bash
# SSH 접속
ssh user@new-server-ip

# Node.js 설치 (예: nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# MySQL 클라이언트 (Ubuntu)
sudo apt update && sudo apt install -y mysql-client
```

### Step 2: 방화벽 포트 개방
```bash
# UFW 예시
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000   # 필요 시
sudo ufw enable
```

### Step 3: 백엔드 배포
```bash
# 소스 업로드 (scp/rsync/git clone)
scp -r backend user@new-server:/opt/ces-smart/

# 서버 내부
cd /opt/ces-smart/backend
cp .env.example .env
# .env 편집: DB_*, JWT_SECRET, CORS_ORIGIN

npm install --production
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

### Step 4: DB 마이그레이션
```bash
mysql -h DB_HOST -u DB_USER -p DB_NAME < backend/database/schema.sql
# 기존 데이터 이전 시: mysqldump/restore
```

### Step 5: Tailscale/카메라 네트워크
- Tailscale: `tailscale up` 후 ESP32-CAM 네트워크와 동일 Tailnet
- Windows portproxy: `netsh interface portproxy add v4tov4 listenport=81 listenaddress=0.0.0.0 connectport=81 connectaddress=ESP32_TAILSCALE_IP`
- `modules.camera_stream_url`이 서버에서 접근 가능한 URL인지 확인

---

## 7. 검증 방법 (정상/비정상 기준)

| 항목 | 정상 | 비정상 |
|------|------|--------|
| `GET https://api.your-domain.com/api/health` | 200 OK | 502, 404, 타임아웃 |
| 로그인 | JWT 발급, 대시보드 접근 | 401, CORS 에러 |
| 카메라 스트림 | 영상 재생 | 504, 검은 화면 |
| PM2 상태 | `pm2 status` online | restarting, errored |

---

## 8. 자주 발생하는 문제와 해결

| 현상 | 해결 |
|------|------|
| 포트 충돌 | `lsof -i :3000` 확인 후 프로세스 종료 또는 PORT 변경 |
| DB connection refused | MySQL 원격 허용, `bind-address`, 방화벽 3306 |
| 카메라 504 | Tailscale up, portproxy 규칙, `curl http://카메라IP:81/stream` |
| CORS 에러 | `.env` CORS_ORIGIN에 프론트 도메인 추가 |
| PM2 재시작 루프 | `pm2 logs ces-smartfarm` 확인, 메모리/예외 로그 분석 |

