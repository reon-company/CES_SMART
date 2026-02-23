# Inno Setup EXE 빌드

## 1) 사전 준비
- Windows PC
- Inno Setup 6 설치: https://jrsoftware.org/isdl.php

## 2) 빌드 명령

```bat
cd C:\KKJ\CES_SMART-main\CES_SMART-main
installer\inno\build_inno.bat
```

## 3) 결과물
- `dist/CES_SMART_Installer.exe`

## 3-1) 새 PC 5분 설치 테스트 체크리스트
- `installer/inno/INSTALL_TEST_CHECKLIST_5MIN_KO.md`

## 4) 주의사항
- 설치 EXE에는 `node_modules`, `.git`, `dist`, `frontend/.next`가 제외됩니다.
- 설치 후 최초 1회 `npm install`이 실행되므로 인터넷 연결이 필요합니다.
