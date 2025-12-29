# CES SmartFarm Frontend

바닐라 JavaScript로 구현된 CES 스마트팜 프론트엔드 애플리케이션

## 기술 스택

- **HTML5** / **CSS3** / **JavaScript (ES6+)**
- **Tailwind CSS** (CDN)
- **Fetch API** (HTTP 요청)

## 프로젝트 구조

```
frontend/
├── public/              # 정적 파일 (배포 대상)
│   ├── index.html       # 랜딩 페이지
│   ├── login.html       # 로그인 페이지
│   ├── register.html    # 회원가입 페이지
│   ├── dashboard.html   # 대시보드 페이지
│   └── js/              # JavaScript 파일
│       ├── api.js        # API 호출 함수
│       └── auth.js       # 인증 관련 함수
├── vercel.json          # Vercel 배포 설정
└── DEPLOY.md            # 배포 가이드
```

## 로컬 개발

### 1. HTTP 서버 실행

```bash
cd public
python3 -m http.server 8080
```

또는

```bash
npx serve public -p 8080
```

### 2. 브라우저에서 접속

- http://localhost:8080

## 배포

### Vercel 배포

자세한 내용은 [DEPLOY.md](./DEPLOY.md) 참고

### 빠른 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
cd frontend
vercel

# 프로덕션 배포
vercel --prod
```

## API 설정

API 서버 주소는 `public/js/api.js`에서 자동으로 감지됩니다:

- **로컬 개발**: `http://localhost:3000`
- **프로덕션**: `http://54.180.160.232:3000`

## 백엔드 서버

- **주소**: http://54.180.160.232:3000
- **Health Check**: http://54.180.160.232:3000/api/health

## 주요 기능

- ✅ 사용자 인증 (회원가입/로그인)
- ✅ 모듈 관리
- ✅ 센서 데이터 조회
- ✅ 액추에이터 제어

## 라이선스

ISC

