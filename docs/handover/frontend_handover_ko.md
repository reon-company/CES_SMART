# FRONTEND 핸드오버 가이드

---

## 대상 독자 / 목표

| 항목 | 내용 |
|------|------|
| **대상 독자** | 프론트엔드 인수 담당자, UI/UX 유지보수 개발자 |
| **목표** | Next.js + 정적 HTML 혼합 구조를 이해하고, 로컬 실행·배포·카메라/API 연동을 1일 내 수행 가능하도록 함 |

---

## 사전 준비물

- [ ] Node.js 18+
- [ ] `frontend/.env.local.example` 기반 `.env.local` 파일
- [ ] 백엔드 API가 동작 중인 서버 URL (`NEXT_PUBLIC_API_BASE_URL`)
- [ ] Chrome/Edge (웹 시리얼 모니터 사용 시)

---

## 1. 구조 개요
- Next.js 앱(`frontend/pages`, `frontend/components`, `frontend/lib`)
- 정적 HTML 앱(`frontend/public/*.html`, `frontend/public/js/*.js`)
- 두 UI가 공존하므로 기능 변경 시 양쪽 반영 여부를 반드시 확인

## 2. 핵심 파일
- `frontend/lib/api.js`: Next.js API 클라이언트, base URL/401 처리
- `frontend/public/js/api.js`: 정적 페이지 API 클라이언트, base URL/401 처리
- `frontend/pages/dashboard/modules/[moduleId].js`: Next 모듈 상세
- `frontend/public/module.html`: 정적 모듈 상세/카메라/릴레이/센서
- `frontend/public/module-settings.html`: 4개 세팅 섹션 페이지
- `frontend/public/serial-monitor.html`: Web Serial 기반 로컬 시리얼 모니터

## 3. 인증/라우팅 정책
- 토큰 저장: `localStorage`
- 401 처리: 토큰 제거 후 로그인 페이지로 이동
- 비로그인 접근 차단: 각 페이지 초기 auth 체크

## 4. 카메라 표시 정책
- 프론트는 `camera_stream_url` 원본을 직접 로드하지 않고 서버 프록시 URL로 변환해 사용
- 이유: HTTPS 환경 + 브라우저 PNA/CORS 제약 회피
- 모바일 레이아웃: 카메라 컨테이너는 `w-full` + `aspect-video` + 모바일 min-height 조합 사용

## 5. 웹 시리얼 모니터
- `serial-monitor.html`은 로컬 보조 도구 성격
- 요구 조건: Chrome/Edge + HTTPS 또는 localhost + 사용자 포트 권한 승인
- 기능: 장치별 연결/해제, 로그 조회, 명령 전송, txt 다운로드

## 6. 프론트 배포 시 점검
- Vercel 환경 변수: `NEXT_PUBLIC_API_BASE_URL`
- 정적 페이지 배포 경로에 신규 HTML 포함 여부 확인
- 변경 후 모바일 뷰에서 카메라 영역 이탈 여부 재검증

---

## 7. 단계별 절차

### Step 1: 환경 파일 생성
```bash
cd c:\KKJ\CES_SMART-main\CES_SMART-main\frontend
copy .env.local.example .env.local
```
- `.env.local`에서 `NEXT_PUBLIC_API_BASE_URL`를 백엔드 URL로 설정
  - 로컬: `http://localhost:3000`
  - 운영: `https://api.your-domain.com`

### Step 2: 의존성 설치 및 실행
```bash
npm install
npm run dev
```
- 정상: `http://localhost:3001` 접속 시 로그인 페이지 표시

### Step 3: 정적 HTML 페이지 접근
- `frontend/public/` 하위 HTML은 Next.js dev 시 `/index.html`, `/module.html` 등으로 접근
- 또는 Live Server 등으로 `frontend/public/` 직접 서빙 (API base URL 정책 적용 필요)

### Step 4: Vercel 배포 시
```bash
vercel
# 또는 vercel --prod
```
- Vercel 대시보드에서 `NEXT_PUBLIC_API_BASE_URL` 환경 변수 설정

---

## 8. 검증 방법 (정상/비정상 기준)

| 항목 | 정상 | 비정상 |
|------|------|--------|
| 로그인 페이지 | `/login` 로드, 폼 표시 | 404, 빈 화면 |
| 로그인 후 리다이렉트 | `/dashboard` 이동, 모듈 목록 표시 | 401 무한 리다이렉트 |
| 모듈 상세 | 카메라 영역 스트림 표시, 릴레이 토글 동작 | 검은 화면, CORS 에러 |
| 시리얼 모니터 | 포트 선택, 연결, 로그 수신 | Mixed Content, 권한 거부 |
| 모바일 뷰 | 카메라 비율 유지, overflow 없음 | 이미지 잘림, 레이아웃 깨짐 |

---

## 9. 자주 발생하는 문제와 해결

| 현상 | 원인 | 해결 |
|------|------|------|
| API 401 무한 리다이렉트 | JWT 만료/불일치, localStorage 토큰 | 로그아웃 후 재로그인, 백엔드 JWT_SECRET 확인 |
| 카메라 검은 화면 | 프록시 502/504, CORS | 백엔드 카메라 health API 확인, CORS_ORIGIN 확인 |
| Mixed Content | HTTP 페이지에서 HTTPS API 호출 | 페이지도 HTTPS 또는 로컬에서 테스트 |
| 시리얼 모니터 연결 실패 | HTTPS 아님, localhost 아님 | HTTPS 또는 localhost에서만 Web Serial 사용 |
| 모바일에서 카메라 overflow | aspect-video/min-height 미적용 | `w-full aspect-video` 등 Tailwind 클래스 확인 |

