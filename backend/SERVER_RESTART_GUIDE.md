# 서버 재시작 가이드 (401 오류 해결)

## 문제

서버를 재시작했는데도 401 Unauthorized 오류가 계속 발생합니다.

## 완전한 재시작 방법

### 방법 1: PM2 완전 재시작 (권장)

```bash
ssh -i [key].pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend

# 1. 현재 프로세스 완전 삭제
pm2 delete ces-smartfarm

# 2. 코드 확인 (최신 코드인지 확인)
git status
git pull  # 또는 최신 코드로 업데이트

# 3. 새로 시작
pm2 start ecosystem.config.js

# 4. 로그 확인
pm2 logs ces-smartfarm --lines 20
```

### 방법 2: PM2 재로드

```bash
cd ~/ces-smartfarm/backend
pm2 reload ces-smartfarm
```

### 방법 3: Node.js 직접 재시작

```bash
cd ~/ces-smartfarm/backend
pkill -f "node.*server.js"
pm2 start ecosystem.config.js
```

## 서버 로그 확인

재시작 후 로그에서 다음을 확인:

```bash
pm2 logs ces-smartfarm --lines 50
```

**확인할 내용**:
1. `[PUBLIC] GET /api/actuators/status/MODULE_001` 메시지가 나타나는지
2. 401 오류가 여전히 발생하는지

## 서버에서 직접 테스트

서버에서 curl로 Public 엔드포인트 테스트:

```bash
# 인증 없이 테스트 (아두이노와 동일)
curl -v http://localhost:3000/api/actuators/status/MODULE_001
```

**예상 결과** (정상):
```json
{"success":true,"status":{"module_id":"MODULE_001","relay":false,...}}
```

**오류 결과** (401):
```json
{"success":false,"message":"No token, authorization denied"}
```

## 코드 확인

서버에서 실제 파일 확인:

```bash
# Public 엔드포인트 확인 (auth 없어야 함)
grep -A 3 "router.get('/status/:moduleId'" ~/ces-smartfarm/backend/routes/actuators.js

# 출력 예시 (올바른 경우):
# router.get('/status/:moduleId', async (req, res) => {
#   // auth 미들웨어 없음
```

**잘못된 경우** (auth 있음):
```javascript
router.get('/status/:moduleId', auth, async (req, res) => {
  // ❌ auth 미들웨어 있음 - 이건 잘못됨!
```

## 문제가 계속되면

### 1. 서버 코드를 직접 수정

서버에 SSH 접속하여:

```bash
cd ~/ces-smartfarm/backend
nano routes/actuators.js
```

12번 라인 근처에서:
```javascript
// ✅ 올바른 코드
router.get('/status/:moduleId', async (req, res) => {
  // auth 없음
```

저장 후:
```bash
pm2 restart ces-smartfarm
```

### 2. Git에서 최신 코드 가져오기

```bash
cd ~/ces-smartfarm/backend
git pull origin main  # 또는 master
pm2 restart ces-smartfarm
```

### 3. 수동으로 코드 확인 및 수정

서버에서 직접 파일을 열어서 확인:

```bash
cd ~/ces-smartfarm/backend
cat routes/actuators.js | grep -n "router.get" | head -5
```

출력 예시:
```
12:router.get('/status/:moduleId', async (req, res) => {
62:router.get('/:moduleId', auth, async (req, res) => {
```

**중요**: `/status/:moduleId`가 `/:moduleId`보다 **먼저** 와야 합니다.

## 최종 확인

재시작 후 아두이노 시리얼 모니터에서:
- ✅ "Relay updated from server: ON/OFF" 메시지 확인
- ❌ "401 Unauthorized" 오류가 사라져야 함

## 추가 디버깅

서버 로그에 디버깅 메시지가 추가되었으므로:

```bash
pm2 logs ces-smartfarm | grep "PUBLIC\|PRIVATE"
```

이 명령으로 어떤 라우터가 매칭되는지 확인할 수 있습니다.

