# 401 오류 디버깅 가이드

## 현재 상황

서버를 재시작했는데도 401 Unauthorized 오류가 계속 발생합니다.

## 디버깅 단계

### 1. 서버 로그 확인

서버에 SSH 접속하여 로그 확인:

```bash
ssh -i [key].pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend
pm2 logs ces-smartfarm --lines 50
```

**확인할 내용**:
- `[PUBLIC] GET /api/actuators/status/MODULE_001` 메시지가 나타나는지
- `[PRIVATE] GET /api/actuators/...` 메시지가 나타나는지

### 2. 서버에서 직접 테스트

서버에서 curl로 테스트:

```bash
# Public 엔드포인트 테스트 (인증 없이)
curl http://localhost:3000/api/actuators/status/MODULE_001

# 예상 응답 (정상):
# {"success":true,"status":{"module_id":"MODULE_001","relay":false,...}}

# 오류 응답 (401):
# {"success":false,"message":"No token, authorization denied"}
```

### 3. 라우터 순서 확인

`backend/routes/actuators.js` 파일에서:

```javascript
// ✅ 올바른 순서 (현재 코드)
router.get('/status/:moduleId', async (req, res) => { ... });  // 12번 라인 - Public
router.get('/:moduleId', auth, async (req, res) => { ... });   // 59번 라인 - Private
```

**중요**: `/status/:moduleId`가 `/:moduleId`보다 **먼저** 와야 합니다.

### 4. 서버 코드 재확인

서버에서 실제 파일 확인:

```bash
cat ~/ces-smartfarm/backend/routes/actuators.js | grep -A 5 "router.get('/status/:moduleId'"
```

**확인 사항**:
- `auth` 미들웨어가 **없어야** 함
- `async (req, res) => {` 바로 시작해야 함

## 가능한 원인

### 원인 1: 서버 코드가 실제로 업데이트되지 않음

**확인**:
```bash
# 서버에서 Git 상태 확인
cd ~/ces-smartfarm/backend
git status
git log --oneline -5
```

**해결**: 코드를 다시 서버에 업로드하고 재시작

### 원인 2: PM2가 이전 코드를 캐시하고 있음

**해결**:
```bash
pm2 delete ces-smartfarm
pm2 start ecosystem.config.js
pm2 save
```

### 원인 3: 라우터 매칭 문제

Express가 `/status/:moduleId`를 매칭하지 못하고 `/:moduleId`를 매칭하는 경우.

**해결**: 라우터 순서를 명확히 하고, 더 구체적인 경로를 먼저 정의

## 임시 해결책

서버 코드를 수정할 수 없는 경우, 아두이노 코드에서 401 오류를 무시하고 계속 동작하도록 할 수 있습니다:

```cpp
// api_client.h의 getRelayStatus() 함수에서
if (statusCode == 401) {
  // 401 오류는 무시하고 기본값(false) 사용
  relayState = false;
  if (LOG_LEVEL >= 1) {
    Serial.println("Warning: 401 Unauthorized - Using default relay state (OFF)");
  }
  client.stop();
  return true;  // 오류지만 계속 동작
}
```

하지만 **권장하지 않습니다**. 서버 코드를 수정하는 것이 올바른 해결책입니다.

## 최종 확인 체크리스트

- [ ] 서버에서 `pm2 logs`로 `[PUBLIC]` 메시지 확인
- [ ] 서버에서 `curl`로 Public 엔드포인트 테스트
- [ ] `actuators.js` 파일에서 `auth` 미들웨어 없음 확인
- [ ] 라우터 순서 확인 (`/status/:moduleId`가 먼저)
- [ ] PM2 완전 재시작 (`pm2 delete` 후 `pm2 start`)

