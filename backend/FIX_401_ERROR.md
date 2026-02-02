# 401 Unauthorized 오류 해결 가이드

## 문제 증상

아두이노 시리얼 모니터에서:
```
HTTP/1.1 401 Unauthorized
Empty response (HTTP 401)
```

릴레이 상태 조회 시 401 오류가 반복적으로 발생합니다.

## 원인

`GET /api/actuators/status/:moduleId` 엔드포인트는 Public이어야 하는데, 서버가 이전 코드를 실행 중이거나 라우터 순서 문제일 수 있습니다.

## 해결 방법

### 1. 서버 재시작 (가장 중요!)

서버에 SSH 접속하여 재시작:

```bash
ssh -i [key].pem ubuntu@43.203.141.2
cd ~/ces-smartfarm/backend
pm2 restart ces-smartfarm
# 또는
pm2 restart ecosystem.config.js
```

### 2. 서버 코드 확인

`backend/routes/actuators.js` 파일에서 다음 라인이 **auth 미들웨어 없이** 정의되어 있는지 확인:

```javascript
// ✅ 올바른 코드 (Public)
router.get('/status/:moduleId', async (req, res) => {
  // auth 미들웨어 없음
  ...
});

// ❌ 잘못된 코드 (Private)
router.get('/status/:moduleId', auth, async (req, res) => {
  // auth 미들웨어 있음 - 이렇게 되면 안 됨!
  ...
});
```

### 3. 라우터 순서 확인

`backend/routes/actuators.js`에서 **더 구체적인 경로가 먼저** 와야 합니다:

```javascript
// ✅ 올바른 순서
router.get('/status/:moduleId', async (req, res) => { ... });  // 먼저
router.get('/:moduleId', auth, async (req, res) => { ... });   // 나중

// ❌ 잘못된 순서 (이렇게 되면 안 됨)
router.get('/:moduleId', auth, async (req, res) => { ... });   // 먼저
router.get('/status/:moduleId', async (req, res) => { ... });  // 나중
```

### 4. 서버 로그 확인

서버에서 로그 확인:

```bash
pm2 logs ces-smartfarm
```

401 오류가 발생하는지 확인하고, 어떤 엔드포인트에서 발생하는지 확인.

## 확인 방법

### 1. curl로 테스트

서버에서 직접 테스트:

```bash
curl http://localhost:3000/api/actuators/status/MODULE_001
```

**예상 응답** (정상):
```json
{
  "success": true,
  "status": {
    "module_id": "MODULE_001",
    "relay": false
  }
}
```

**오류 응답** (401):
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 2. 아두이노 시리얼 모니터 확인

서버 재시작 후:
- 401 오류가 사라지고
- "Relay updated from server: ON/OFF" 메시지가 나타나야 함

## 임시 해결책

서버 재시작이 불가능한 경우, 아두이노 코드에서 401 오류를 무시하고 계속 동작하도록 할 수 있습니다:

```cpp
// api_client.h의 getRelayStatus() 함수에서
if (statusCode == 401) {
  // 401 오류는 무시하고 기본값(false) 사용
  relayState = false;
  return true;  // 오류지만 계속 동작
}
```

하지만 **권장하지 않습니다**. 서버를 재시작하는 것이 올바른 해결책입니다.

## 예방 방법

1. **코드 변경 후 항상 서버 재시작**
2. **라우터 순서 주의**: 구체적인 경로를 먼저 정의
3. **Public/Private 명확히 구분**: 주석으로 명시

## 참고

- 현재 코드는 이미 Public으로 설정되어 있음
- 서버 재시작만 하면 해결됨
- PM2를 사용 중이면 `pm2 restart`로 간단히 재시작 가능

