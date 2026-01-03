# 프론트엔드 실행 가이드

## 빠른 시작

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경 변수 설정 (선택사항)

백엔드 API URL을 설정하려면 `.env.local` 파일을 생성하세요:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

> **참고**: 환경 변수를 설정하지 않으면 기본값 `http://localhost:3000`이 사용됩니다.
> 백엔드가 실행 중이지 않아도 프론트엔드 UI는 확인할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 시작되면 다음 메시지가 표시됩니다:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3001
  - Network:      http://192.168.x.x:3001
```

### 4. 브라우저에서 확인

브라우저를 열고 다음 주소로 접속하세요:
- **로컬**: http://localhost:3001
- **네트워크**: 터미널에 표시된 네트워크 주소

## 접속 가능한 페이지

1. **랜딩 페이지**: http://localhost:3001/
   - 시스템 소개 및 기능 안내

2. **로그인 페이지**: http://localhost:3001/login
   - 사용자 로그인

3. **회원가입 페이지**: http://localhost:3001/register
   - 새 계정 생성

4. **대시보드**: http://localhost:3001/dashboard
   - 모듈 개요 및 통계 (로그인 필요)

5. **모듈 관리**: http://localhost:3001/dashboard/modules
   - 모듈 목록 및 관리 (로그인 필요)

6. **모듈 상세**: http://localhost:3001/dashboard/modules/[moduleId]
   - 센서 데이터, 차트, 액추에이터 제어 (로그인 필요)

## 주요 기능 확인

### UI 확인 (백엔드 없이)
- ✅ 랜딩 페이지 디자인
- ✅ 로그인/회원가입 폼
- ✅ 대시보드 레이아웃
- ✅ 모듈 카드 디자인
- ✅ 센서 패널 UI
- ✅ 액추에이터 제어 UI

### 전체 기능 확인 (백엔드 필요)
백엔드 서버가 실행 중이어야 합니다:
- ✅ 실제 로그인/회원가입
- ✅ 모듈 추가/삭제
- ✅ 센서 데이터 조회
- ✅ 액추에이터 제어
- ✅ 센서 차트 표시

## 문제 해결

### 포트가 이미 사용 중인 경우
Next.js는 자동으로 다른 포트(3002, 3003 등)를 사용합니다.

### 의존성 설치 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 오류
```bash
# 캐시 삭제 후 재시도
rm -rf .next
npm run dev
```

## 프로덕션 빌드

프로덕션 빌드를 테스트하려면:

```bash
npm run build
npm start
```

빌드된 앱은 http://localhost:3000 에서 실행됩니다.







