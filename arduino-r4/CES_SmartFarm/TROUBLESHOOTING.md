# 아두이노 문제 해결 가이드

## 일반적인 오류 및 해결 방법

### 1. "Module not found" 오류

**증상**:
```
{"success":false,"message":"Module not found"}
Sensor data sent
```

**원인**:
- 웹 대시보드에 모듈이 등록되지 않음
- 아두이노의 `MODULE_ID`와 웹 대시보드에 등록한 `Module ID`가 일치하지 않음

**해결 방법**:

1. **아두이노의 MODULE_ID 확인**:
   - 시리얼 모니터에서 부팅 시 출력되는 `Module ID: MODULE_001` 확인
   - 또는 `config.h` 파일에서 확인

2. **웹 대시보드에서 모듈 등록**:
   - 로그인 후 대시보드 접속
   - "+ 모듈 추가" 클릭
   - 모듈 이름 입력 (예: "1호 수조")
   - **Module ID 입력**: 아두이노의 `MODULE_ID`와 **정확히 일치**해야 함
     - 예: 아두이노가 `MODULE_001`이면 웹에서도 `MODULE_001` 입력
   - "추가" 버튼 클릭

3. **확인**:
   - 모듈 목록에 추가된 모듈이 표시되는지 확인
   - 시리얼 모니터에서 "Sensor data sent successfully" 메시지 확인

**주의사항**:
- `MODULE_001` ≠ `module_001` (대소문자 구분)
- 공백 없이 입력
- 특수문자 사용 불가 (영문자, 숫자, 언더스코어만)

### 2. "JSON parsing failed: EmptyInput" 오류

**증상**:
```
JSON parsing failed: EmptyInput
JSON parsing failed: EmptyInput
JSON parsing failed: EmptyInput
```

**원인**:
- 릴레이 상태 조회 시 서버에서 404 오류 반환
- 응답 본문이 비어있어 JSON 파싱 실패
- 모듈이 등록되지 않아 발생

**해결 방법**:
1. 위의 "Module not found" 오류 해결 방법 참조
2. 모듈 등록 후 자동으로 해결됨

### 3. "Connection to server failed!" 오류

**증상**:
```
Connection to server failed!
```

**원인**:
- 서버 주소 오류
- 서버가 다운됨
- 네트워크 연결 문제

**해결 방법**:

1. **서버 주소 확인**:
   ```cpp
   // config.h
   #define API_BASE_URL "http://43.203.141.2:3000"
   ```

2. **서버 상태 확인**:
   - 웹 브라우저에서 `http://43.203.141.2:3000/api/health` 접속
   - 정상 응답이 오는지 확인

3. **WiFi 연결 확인**:
   - 시리얼 모니터에서 WiFi 연결 상태 확인
   - "WiFi connected! IP address: ..." 메시지 확인

### 4. "Client timeout!" 오류

**증상**:
```
Client timeout!
```

**원인**:
- 서버 응답이 5초 내에 오지 않음
- 서버 부하 또는 네트워크 지연

**해결 방법**:
1. 서버 상태 확인
2. 네트워크 연결 확인
3. 잠시 후 자동으로 재시도됨

### 5. 센서 데이터가 전송되지 않음

**확인 사항**:

1. **WiFi 연결**:
   ```
   WiFi status: Connected | IP: 192.168.x.x
   ```

2. **센서 읽기**:
   ```
   Temperature: 25.00C | Humidity: 24.00%
   ```

3. **모듈 등록**:
   - 웹 대시보드에 모듈이 등록되어 있는지 확인

4. **서버 응답**:
   - "Sensor data sent successfully" 메시지 확인
   - 오류 메시지가 있으면 위의 해결 방법 참조

## 단계별 디버깅

### Step 1: 기본 확인

```
✅ 시리얼 모니터 보드레이트: 9600
✅ WiFi 연결 상태 확인
✅ 센서 데이터 읽기 확인
```

### Step 2: 모듈 등록 확인

```
✅ 웹 대시보드에 모듈 등록됨
✅ 아두이노 MODULE_ID와 웹 Module ID 일치
```

### Step 3: 서버 통신 확인

```
✅ 서버 주소 정확함 (config.h 확인)
✅ 서버가 실행 중임 (웹 브라우저에서 확인)
✅ HTTP 응답 코드 확인 (200 OK 여부)
```

## 시리얼 모니터 정상 출력 예시

**정상 동작 시**:
```
========================================
CES SmartFarm Arduino R4 Starting
========================================
Module ID: MODULE_001
========================================
WiFi connected! IP address: 192.168.1.100
========================================
Initialization complete!
========================================
Main loop starting...

Temperature: 25.00C | Humidity: 24.00%
Sensor data sent successfully

Relay updated from server: OFF
```

**오류 발생 시**:
```
Temperature: 25.00C | Humidity: 24.00%
HTTP/1.1 404 Not Found
Server error: Module not found
ERROR: Module not found! Please register module in web dashboard.
Current MODULE_ID: MODULE_001
```

## 빠른 체크리스트

모듈이 동작하지 않을 때:

- [ ] 웹 대시보드에 로그인되어 있음
- [ ] 웹 대시보드에 모듈이 등록되어 있음
- [ ] 아두이노의 `MODULE_ID`와 웹의 `Module ID`가 일치함
- [ ] WiFi가 연결되어 있음
- [ ] 서버가 실행 중임
- [ ] `config.h`의 `API_BASE_URL`이 정확함

## 추가 도움말

- **모듈 추가 가이드**: `MODULE_SETUP_GUIDE.md` 참조
- **아두이노 셋업**: `ARDUINO_SETUP.md` 참조
- **API 문서**: `API_DOCUMENTATION.md` 참조

