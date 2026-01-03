# 서버에서 직접 수정하는 명령어

## 문제

서버에서 `curl http://localhost:3000/api/actuators/status/MODULE_001`을 실행했을 때 401 오류가 발생합니다.

## 해결 방법

서버에 SSH 접속하여 다음 명령어를 실행하세요:

```bash
ssh -i [key].pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend
```

### 1. 현재 파일 확인

```bash
# 라인 12-20 확인 (Public 엔드포인트)
sed -n '12,20p' routes/actuators.js

# 라인 62-70 확인 (Private 엔드포인트)
sed -n '62,70p' routes/actuators.js
```

### 2. 파일 직접 수정

```bash
nano routes/actuators.js
```

**12번 라인 근처를 찾아서** 다음처럼 되어 있는지 확인:

```javascript
// ✅ 올바른 코드 (auth 없음)
router.get('/status/:moduleId', async (req, res) => {
```

**만약 다음과 같다면** (auth 있음):
```javascript
// ❌ 잘못된 코드
router.get('/status/:moduleId', auth, async (req, res) => {
```

이 경우 `auth,` 부분을 삭제해야 합니다.

### 3. 또는 sed로 직접 수정

```bash
# auth 미들웨어가 있는 경우 제거
sed -i "s|router.get('/status/:moduleId', auth, async|router.get('/status/:moduleId', async|g" routes/actuators.js

# 확인
grep -n "router.get('/status/:moduleId'" routes/actuators.js
```

### 4. PM2 완전 재시작

```bash
pm2 delete ces-smartfarm
pm2 start ecosystem.config.js
pm2 save
```

### 5. 테스트

```bash
curl -v http://localhost:3000/api/actuators/status/MODULE_001
```

**예상 결과** (정상):
```json
{"success":true,"status":{"module_id":"MODULE_001","relay":false,...}}
```

### 6. 로그 확인

```bash
pm2 logs ces-smartfarm --lines 20
```

`[PUBLIC] GET /api/actuators/status/MODULE_001` 메시지가 나타나야 합니다.

## 빠른 수정 스크립트

전체를 한 번에 실행:

```bash
cd ~/ces-smartfarm/backend

# 1. 백업
cp routes/actuators.js routes/actuators.js.backup

# 2. auth 제거 (만약 있다면)
sed -i "s|router.get('/status/:moduleId', auth, async|router.get('/status/:moduleId', async|g" routes/actuators.js

# 3. 확인
grep -A 2 "router.get('/status/:moduleId'" routes/actuators.js

# 4. 재시작
pm2 delete ces-smartfarm
pm2 start ecosystem.config.js

# 5. 테스트
sleep 2
curl http://localhost:3000/api/actuators/status/MODULE_001
```

## 문제가 계속되면

### Git에서 최신 코드 가져오기

```bash
cd ~/ces-smartfarm/backend
git status
git pull origin main  # 또는 master
pm2 restart ces-smartfarm
```

### 또는 로컬에서 수정한 파일을 서버에 업로드

로컬에서:
```bash
scp -i [key].pem backend/routes/actuators.js ubuntu@43.203.141.2:~/ces-smartfarm/backend/routes/
```

서버에서:
```bash
pm2 restart ces-smartfarm
```

