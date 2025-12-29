# 빠른 배포 가이드

## 1. Git 저장소 준비

```bash
cd frontend
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 2. Vercel 배포

### 방법 A: Vercel 웹사이트 (권장)

1. https://vercel.com 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend` (또는 `.` - 저장소 루트가 frontend인 경우)
   - **Build Command**: (비워두기)
   - **Output Directory**: `public`
5. "Deploy" 클릭

### 방법 B: Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel
```

## 3. 백엔드 CORS 설정

배포 후 Vercel 도메인을 받으면, 백엔드 서버에 접속하여 CORS 설정 업데이트:

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@54.180.160.232
cd ~/ces-smartfarm/backend
nano .env
```

`.env` 파일에 추가:

```env
CORS_ORIGIN=http://localhost:8080,https://your-vercel-app.vercel.app
```

서버 재시작:

```bash
pm2 restart ces-smartfarm --update-env
```

## 4. 확인

1. Vercel에서 제공하는 URL로 접속
2. 회원가입/로그인 테스트
3. 브라우저 개발자 도구(F12) → Console 탭에서 오류 확인

## 문제 해결

### CORS 오류 발생 시

- 백엔드 `.env` 파일의 `CORS_ORIGIN`에 Vercel 도메인 추가 확인
- 서버 재시작 확인

### 404 오류 발생 시

- Vercel 설정에서 `Output Directory`가 `public`으로 설정되었는지 확인
- `vercel.json` 파일이 올바른지 확인

