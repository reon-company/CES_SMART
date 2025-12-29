# Vercel 배포 가이드

## 배포 전 준비

### 1. Git 저장소 설정

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend` (또는 저장소 루트가 frontend라면 `.`)
   - **Build Command**: (비워두기 - 정적 파일이므로 빌드 불필요)
   - **Output Directory**: `public`

### 3. 환경 변수 설정 (선택사항)

Vercel 대시보드에서 환경 변수 설정:
- `NEXT_PUBLIC_API_BASE_URL`: `http://54.180.160.232:3000` (필요시)

> **참고**: 현재 `api.js`는 자동으로 환경을 감지하므로 환경 변수 설정이 필수는 아닙니다.

## 배포 방법

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리로 이동
cd frontend

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동 (권장)

1. GitHub에 코드 푸시
2. Vercel이 자동으로 감지하여 배포
3. 이후 `git push` 할 때마다 자동 배포

## 백엔드 CORS 설정

백엔드 서버(`54.180.160.232`)의 `.env` 파일에 Vercel 도메인 추가:

```env
CORS_ORIGIN=http://localhost:8080,https://your-vercel-app.vercel.app
```

또는 여러 도메인 허용:

```env
CORS_ORIGIN=*
```

> **주의**: `*`는 모든 도메인을 허용하므로 보안상 주의가 필요합니다.

## 배포 후 확인

1. Vercel에서 제공하는 URL로 접속
2. 브라우저 개발자 도구(F12) → Network 탭에서 API 요청 확인
3. CORS 오류가 발생하면 백엔드 CORS 설정 확인

## 문제 해결

### CORS 오류 발생 시

1. 백엔드 서버의 `.env` 파일 확인
2. `CORS_ORIGIN`에 Vercel 도메인 추가
3. 백엔드 서버 재시작

### API 연결 실패 시

1. `frontend/public/js/api.js`의 `API_BASE_URL` 확인
2. 백엔드 서버(`54.180.160.232:3000`)가 실행 중인지 확인
3. 방화벽 설정 확인

