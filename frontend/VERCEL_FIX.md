# Vercel 404 오류 해결 방법

## 문제
Vercel에서 404 오류가 발생하는 경우, 배포 설정을 확인해야 합니다.

## 해결 방법

### 방법 1: Vercel 대시보드에서 설정 변경 (권장)

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → General
4. **Root Directory** 설정:
   - `frontend` (현재 설정)
   - 또는 `frontend/public` (더 간단)

5. **Output Directory** 설정:
   - `public` (Root가 `frontend`인 경우)
   - `.` (Root가 `frontend/public`인 경우)

6. **Build Command**: (비워두기)
7. **Install Command**: `npm install` (또는 비워두기)

### 방법 2: vercel.json 수정

현재 `vercel.json`이 업데이트되었습니다. Git에 푸시하면 자동으로 재배포됩니다:

```bash
cd frontend
git add vercel.json
git commit -m "Fix Vercel 404 error"
git push
```

### 방법 3: 프로젝트 구조 변경

만약 위 방법이 작동하지 않으면, `public` 폴더의 내용을 루트로 이동:

```bash
# frontend/public의 모든 파일을 frontend/로 이동
cd frontend
mv public/* .
mv public/.gitignore . 2>/dev/null || true
rmdir public
```

그리고 Vercel 설정에서:
- Root Directory: `frontend`
- Output Directory: `.`

## 확인

배포 후 다음 URL들이 작동해야 합니다:
- https://ces-smart.vercel.app/ (index.html)
- https://ces-smart.vercel.app/login.html
- https://ces-smart.vercel.app/register.html
- https://ces-smart.vercel.app/dashboard.html

