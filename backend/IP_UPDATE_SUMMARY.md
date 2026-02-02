# IP 주소 업데이트 완료

## 새 IP 주소
- **43.201.148.223** (이전: 43.203.141.2)

## 업데이트된 파일

### 프론트엔드
- ✅ `frontend/public/js/api.js` - API 기본 URL

### 아두이노 설정
- ✅ `arduino-r4/config.h`
- ✅ `arduino-r4/CES_SmartFarm/config.h`
- ✅ `arduino-r4/CES_SmartFarm/sensors/config.h`
- ✅ `arduino-r4/CES_SmartFarm/actuators/config.h`
- ✅ `arduino-r4/CES_SmartFarm/api_client.h` (주석)
- ✅ `arduino-r4/api_client.h` (주석)

### 배포 스크립트
- ✅ `deploy.sh`
- ✅ `backend/FIX_SERVER.sh`

### 문서 파일
- ✅ `backend/VPN_SETUP_STEPS.txt`
- ✅ `backend/VPN_SETUP_GUIDE.md`
- ✅ `backend/VPN_QUICK_SETUP.md`
- ✅ `backend/AWS_INSTANCE_FIX.md`
- ✅ `backend/INSTANCE_RECOVERY.md`
- ✅ `backend/CHECK_CAMERA_URL.md`

## 다음 단계

### 1. 아두이노 코드 업로드
아두이노 모듈에 업데이트된 코드를 업로드하세요:
```bash
# Arduino IDE에서 각 모듈의 config.h가 업데이트되었는지 확인
# 그리고 스케치를 업로드
```

### 2. 프론트엔드 배포
프론트엔드가 배포되어 있다면 재배포하거나, 브라우저 캐시를 클리어하세요.

### 3. DNS 업데이트 (선택사항)
도메인을 사용하는 경우:
- Route 53 또는 DNS 제공업체에서 A 레코드를 `43.201.148.223`으로 업데이트

### 4. 접속 테스트
```bash
# API 헬스 체크
curl http://43.201.148.223:3000/api/health

# 또는 HTTPS
curl https://43.201.148.223/api/health
```

## 참고

- 프론트엔드의 `frontend/lib/api.js`는 환경 변수(`NEXT_PUBLIC_API_BASE_URL`)를 사용하므로 별도 업데이트 불필요
- 도메인(`CES-smart.reonaicoffee.com`)을 사용하는 경우 DNS만 업데이트하면 됨
