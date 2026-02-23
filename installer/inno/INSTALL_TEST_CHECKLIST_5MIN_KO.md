# CES_SMART_Installer.exe 설치 테스트 (새 PC, 5분 체크리스트)

목표: 새 PC에서 `CES_SMART_Installer.exe` 설치 후, 기본 실행/연결 상태를 5분 내 확인

---

## 0) 사전 준비 (30초)

- [ ] 관리자 권한 계정
- [ ] 인터넷 연결
- [ ] Node.js 18+ 설치 확인 (`node -v`)
- [ ] MySQL 또는 연결 가능한 DB 준비 (원격 DB 가능)

---

## 1) 설치 실행 (1분)

- [ ] `dist/CES_SMART_Installer.exe` 실행
- [ ] 설치 경로 기본값 유지(권장): `C:\Program Files\CES_SMART`
- [ ] 설치 완료 후
  - [ ] `의존성/환경 템플릿 자동 설치 실행` 옵션 체크 상태로 진행
  - [ ] 설치 실패 메시지 없는지 확인

실패 시:
- Node.js 미설치 메시지 나오면 Node 설치 후 재실행

---

## 2) 환경 파일 확인 (1분)

설치 경로 기준:
- [ ] `backend\.env` 파일 존재
- [ ] `frontend\.env.local` 파일 존재

필수 수정:
- [ ] `backend\.env`의 `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` 입력
- [ ] `backend\.env`의 `JWT_SECRET` 설정
- [ ] `frontend\.env.local`의 `NEXT_PUBLIC_API_BASE_URL` 설정
  - 로컬 테스트: `http://localhost:3000`
  - 운영 API 연동: `https://ces-smart.reonaicoffee.com`

---

## 3) 실행 확인 (1분)

- [ ] `CES SmartFarm 실행` 바로가기 또는 `installer\windows\start_all.bat` 실행
- [ ] 백엔드 창 실행 확인
- [ ] 프론트엔드 창 실행 확인

브라우저 확인:
- [ ] `http://localhost:3000/api/health` 접속 시 JSON 응답
- [ ] `http://localhost:3001` 접속 가능

---

## 4) 로그인/기능 스모크 테스트 (1분 30초)

- [ ] 로그인 페이지 진입
- [ ] 로그인 성공
- [ ] 대시보드 모듈 목록 표시
- [ ] 모듈 상세 진입
- [ ] 카메라 섹션/센서/릴레이 섹션 렌더링 확인

외부 스트리밍 구성 사용 시 추가:
- [ ] 모듈 `camera_stream_url` 저장값 확인 (`http://100.x.x.x:81/stream`)
- [ ] Network에서 `/api/camera/:moduleId/stream?...token=...` 요청 확인

---

## 5) 합격 기준

다음 조건을 모두 만족하면 합격:
- [ ] 설치 오류 없음
- [ ] `backend/.env`, `frontend/.env.local` 생성/수정 완료
- [ ] `http://localhost:3000/api/health` 정상
- [ ] `http://localhost:3001` 정상
- [ ] 로그인 및 모듈 상세 진입 정상

---

## 빠른 장애 대응

### A. `npm install` 실패
- 관리자 PowerShell에서 수동 실행:
  - `cd "C:\Program Files\CES_SMART\backend" && npm install`
  - `cd "C:\Program Files\CES_SMART\frontend" && npm install`

### B. `api/health` 실패
- `backend\.env` DB 설정 확인
- DB 스키마 적용 여부 확인 (`backend/database/schema.sql`)

### C. 카메라 504/연결 실패
- 서버↔카메라 경로(Tailscale/portproxy) 점검
- Windows 포워딩 자동화 스크립트 확인:
  - `backend\TAILSCALE_AUTO_PORTPROXY.ps1`
