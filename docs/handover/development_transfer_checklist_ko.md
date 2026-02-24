# 개발 이관 체크리스트 (KO)

---

## 대상 독자 / 목표

| 항목 | 내용 |
|------|------|
| **대상 독자** | 신규 개발 인수 담당자, QA 담당자 |
| **목표** | 로컬 개발 환경을 구축하고 기능 재현·코드 변경 포인트를 점검하여 이관 완료를 검증함 |

---

## 사전 준비물

- [ ] Node.js 18+, MySQL 8.0+
- [ ] Arduino IDE 2.x (또는 PlatformIO), ESP32 보드 패키지
- [ ] Arduino UNO R4 WiFi, ESP32-CAM 보드 (선택: 실제 하드웨어 테스트 시)
- [ ] Git 또는 압축 해제된 `CES_SMART-main` 소스

---

## 1. 소스/환경
- [ ] 저장소 전체 구조 이해 (`backend`, `frontend`, `arduino-r4`, `CES_CAMERA`)
- [ ] `.env.example` 기반 로컬 환경 파일 생성
- [ ] Node/npm 버전 및 패키지 설치 완료

## 2. 기능 재현
- [ ] 로그인/대시보드/모듈 목록 조회
- [ ] 모듈 세팅 페이지 4개 섹션 저장
- [ ] 카메라 스트림 프록시 표시 확인
- [ ] 시리얼 모니터 페이지 연결/로그/명령/다운로드 확인

## 3. 코드 변경 가이드
- [ ] Next.js + 정적 HTML 동시 반영 포인트 확인
- [ ] API base URL 정책(로컬/운영 fallback) 이해
- [ ] 모듈 ID 변경이 DB 연관 테이블에 미치는 영향 이해

## 4. 테스트/검증
- [ ] `api/health` 성공
- [ ] 카메라 `health` API 성공
- [ ] 릴레이 제어 반영 확인

---

## 5. 단계별 이관 절차

### Phase 1: 환경 구축
1. 저장소 클론: `git clone <repo> CES_SMART-main && cd CES_SMART-main`
2. 백엔드: `cd backend && copy .env.example .env` 후 DB/JWT/CORS 수정
3. DB 스키마: `mysql -u root -p ces_smartfarm < backend/database/schema.sql`
4. 프론트: `cd frontend && copy .env.local.example .env.local` 후 `NEXT_PUBLIC_API_BASE_URL` 설정
5. 의존성: `backend`: `npm install`, `frontend`: `npm install`

### Phase 2: 실행 및 기능 확인
1. 백엔드: `cd backend && npm start` → `http://localhost:3000` 응답 확인
2. 프론트: `cd frontend && npm run dev` → `http://localhost:3001` 로그인 페이지
3. 로그인 → 대시보드 → 모듈 추가 → 모듈 상세(카메라/릴레이) 동작 확인

### Phase 3: 하드웨어(선택)
1. Arduino: `config.h` MODULE_ID, API_BASE_URL 수정 후 업로드
2. ESP32-CAM: `camera_wifi_config.h` 수정, 업로드, DB에 `camera_stream_url` 등록

---

## 6. 검증 방법 (정상/비정상 기준)

| 검증 항목 | 정상 | 비정상 |
|----------|------|--------|
| `GET /api/health` | 200 `{"status":"ok"}` | 500, 연결 거부 |
| 로그인 | JWT 발급, 대시보드 이동 | 401, 500 |
| 모듈 CRUD | 생성/수정/삭제 반영 | 401, 404 |
| 카메라 스트림 | 프록시로 영상 표시 | 502/504, 검은 화면 |
| 릴레이 제어 | 토글 시 즉시 반영 | 401, 504 |

---

## 7. 자주 발생하는 문제와 해결

| 현상 | 해결 |
|------|------|
| DB connection refused | MySQL 서비스 기동, `DB_HOST`/`DB_PORT` 확인 |
| 401 반복 | JWT_SECRET 통일, 로그아웃 후 재로그인 |
| 카메라 504 | 서버→ESP32 네트워크(Tailscale/portproxy) 점검 |
| Next.js + 정적 HTML 혼동 | 기능 수정 시 `pages/`와 `public/*.html` 양쪽 확인 |

