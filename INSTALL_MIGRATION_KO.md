# CES SmartFarm 이식 설치 가이드 (다른 PC/환경)

이 문서는 현재 구축한 시스템을 다른 PC 또는 다른 서버 환경에 빠르게 이식하기 위한 설치/실행 방법입니다.

## 1) 준비된 설치/실행 파일

- Windows 로컬 설치:
  - `installer/windows/install_local.ps1`
  - `installer/windows/install_local.bat` (더블클릭 실행용)
- Windows 실행:
  - `installer/windows/start_all.bat`
  - `installer/windows/start_backend.bat`
  - `installer/windows/start_frontend.bat`
- 전달용 압축 생성:
  - `installer/windows/make_portable_bundle.ps1`
- 단일 설치 EXE(Inno Setup):
  - `installer/inno/CES_SMART_Setup.iss`
  - `installer/inno/build_inno.bat`
- Linux 서버 설치:
  - `installer/linux/install_backend.sh`
- 환경 변수 템플릿:
  - `backend/.env.example`
  - `frontend/.env.local.example`

## 2) Windows 새 PC에서 로컬 실행

### 2-1. 필수 설치
- Node.js 18 이상
- npm (Node.js 포함)

### 2-2. 설치 스크립트 실행
PowerShell:

```powershell
cd C:\KKJ\CES_SMART-main\CES_SMART-main
powershell -ExecutionPolicy Bypass -File .\installer\windows\install_local.ps1
```

또는 더블클릭:
- `installer/windows/install_local.bat`

### 2-3. 환경값 설정
- `backend/.env` 수정:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`
  - `CORS_ORIGIN`
- `frontend/.env.local` 수정:
  - `NEXT_PUBLIC_API_BASE_URL`

### 2-4. 실행
```bat
installer\windows\start_all.bat
```

접속:
- Backend health: `http://localhost:3000/api/health`
- Frontend: `http://localhost:3001`

## 3) Linux 서버에 백엔드 이식

```bash
cd /path/to/CES_SMART-main
chmod +x installer/linux/install_backend.sh
./installer/linux/install_backend.sh
```

그 후:
1. `backend/.env` 수정
2. DB schema 적용 (`backend/database/schema.sql`)
3. `curl http://localhost:3000/api/health` 확인

## 4) 카메라 스트리밍 이식 시 추가

외부 스트리밍(Tailscale/포트포워딩) 사용 시:
- `backend/TAILSCALE_AUTO_PORTPROXY.ps1` 사용
- 참고 문서: `backend/TAILSCALE_PORT_FORWARDING.md`

## 5) 배포 체크리스트

- [ ] 백엔드 `.env` 값 반영
- [ ] DB 접속 및 스키마 적용
- [ ] `/api/health` 200 확인
- [ ] 로그인 성공 확인
- [ ] 모듈 상세에서 `/api/camera/:moduleId/stream` 응답 확인

## 6) 다른 환경 전달용 압축 생성

```powershell
cd C:\KKJ\CES_SMART-main\CES_SMART-main
powershell -ExecutionPolicy Bypass -File .\installer\windows\make_portable_bundle.ps1
```

생성 위치:
- `dist/CES_SMART_PORTABLE_YYYYMMDD_HHMMSS.zip`

## 7) 단일 설치 EXE 생성 (Inno Setup)

### 7-1. Inno Setup 설치
- 설치 링크: https://jrsoftware.org/isdl.php

### 7-2. 빌드
```bat
cd C:\KKJ\CES_SMART-main\CES_SMART-main
installer\inno\build_inno.bat
```

생성 위치:
- `dist/CES_SMART_Installer.exe`

### 7-3. EXE 동작
- 프로젝트를 `{ProgramFiles}\CES_SMART`에 복사
- 설치 완료 후 선택적으로:
  - `installer/windows/install_local.bat` 자동 실행 (npm install + env 템플릿 생성)
  - `start_all.bat` 실행 선택 가능
