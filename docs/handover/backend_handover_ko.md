# BACKEND 핸드오버 가이드

---

## 대상 독자 / 목표

| 항목 | 내용 |
|------|------|
| **대상 독자** | 백엔드 인수 담당자, API 유지보수 개발자 |
| **목표** | Node.js/Express 백엔드 구조를 이해하고, 로컬 실행·배포·트러블슈팅을 1일 내 수행 가능하도록 함 |

---

## 사전 준비물

- [ ] Node.js 18+ (권장 LTS)
- [ ] MySQL 8.0+ (로컬 또는 원격)
- [ ] `backend/.env.example` 기반 `.env` 파일
- [ ] PM2 (운영 배포 시): `npm install -g pm2`

---

## 1. 책임 범위
- 인증(JWT), 모듈 CRUD, 센서 수신/조회, 액추에이터 제어, 카메라 프록시, 설치 검증 API 제공

## 2. 핵심 파일
- `backend/server.js`: Express 진입점, CORS, 라우트 마운트, 예외/종료 처리
- `backend/routes/auth.js`: 로그인/회원가입/사용자 조회
- `backend/routes/modules.js`: 모듈 생성/수정/삭제, WiFi config 조회
- `backend/routes/sensors.js`: 센서 데이터 수신/히스토리
- `backend/routes/actuators.js`: 릴레이/액추에이터 상태 조회/제어
- `backend/routes/camera.js`: 스트림/헬스/WiFi 설정 프록시
- `backend/routes/setup.js`: 설치파일 메타, 서버 검증 스크립트 실행
- `backend/models/*.js`: DB 접근 계층
- `backend/config/database.js`: DB 연결

## 3. 실행/배포
- 로컬
  - `cd backend && npm install && npm start`
- 운영
  - PM2 기반 실행: `pm2 start ecosystem.config.js`
  - 상태 확인: `pm2 status`, `pm2 logs ces-smartfarm`

## 4. 환경 변수 핵심
- `PORT`, `NODE_ENV`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRE`
- `CORS_ORIGIN`

## 5. 카메라 프록시 동작
- `GET /api/camera/:moduleId/health`: 서버에서 카메라 URL 도달성 검사
- `GET /api/camera/:moduleId/stream`: MJPEG 프록시
- `POST /api/camera/:moduleId/wifi`: ESP32-CAM `/wifi/set` 프록시 호출
- 중요: 프론트는 카메라 URL을 직접 쓰지 않고 위 스트림 API를 사용

## 6. 운영 트러블슈팅
- 401 반복: 토큰 만료/서명키 불일치 여부 점검
- 카메라 504: 서버-ESP32 네트워크(Tailscale/포트포워딩) 점검
- CORS 차단: `server.js`의 허용 origin과 실제 origin 비교

## 7. 변경 시 영향도
- `modules.js`/`Module.js` 수정 시: 프론트 모듈 세팅, Arduino 모듈 ID 매칭 영향
- `camera.js` 수정 시: 모바일/외부 스트리밍 전체 영향
- `server.js` CORS 수정 시: Vercel/정적 페이지/로컬 테스트 동시 영향

---

## 8. 단계별 절차

### Step 1: 환경 파일 생성
```bash
cd c:\KKJ\CES_SMART-main\CES_SMART-main\backend
copy .env.example .env
```
- `.env`에서 `DB_*`, `JWT_SECRET`, `CORS_ORIGIN` 반드시 수정

### Step 2: DB 스키마 적용
```bash
# MySQL 접속 후
mysql -u root -p ces_smartfarm < database/schema.sql
```

### Step 3: 의존성 설치 및 실행
```bash
npm install
npm start
```
- 로컬 개발 시: `npm run dev` (nodemon)

### Step 4: PM2 운영 배포
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
- 로그 경로: `backend/logs/out.log`, `backend/logs/err.log`

---

## 9. 검증 방법 (정상/비정상 기준)

| 항목 | 정상 | 비정상 |
|------|------|--------|
| 서버 기동 | `Server running on port 3000` | ECONNREFUSED, 포트 충돌 |
| `GET /api/health` | 200 `{"status":"ok"}` | 500, DB 연결 실패 |
| `POST /api/auth/login` | 200 + `token` | 401 인증 실패, 500 |
| `GET /api/modules` (Bearer) | 200 + JSON 배열 | 401 토큰 만료/유효하지 않음 |
| `GET /api/camera/:id/health` | 200 카메라 도달 | 502/504 프록시 실패 |

---

## 10. 자주 발생하는 문제와 해결

| 현상 | 원인 | 해결 |
|------|------|------|
| 401 반복 | JWT_SECRET 불일치, 토큰 만료 | `.env` JWT_SECRET 통일, 7d 기준 확인 |
| 카메라 504 | 서버→ESP32 네트워크 미연결 | Tailscale/portproxy, `curl http://카메라IP:81/stream` 확인 |
| CORS 차단 | Origin 미허용 | `CORS_ORIGIN` 콤마 구분 목록에 추가 |
| DB connection refused | MySQL 미가동/포트/계정 오류 | `net start mysql`, `DB_HOST`/`DB_PORT` 확인 |
| PM2 재시작 루프 | 메모리/예외 한계 도달 | `pm2 logs`로 err.log 원인 확인, `max_restarts` 조정 |

