# 아두이노 → 서버 API 문서

## 센서 데이터 전송 API

### 엔드포인트

```
POST /api/sensors
```

### 전체 URL

```
http://43.203.141.2:3000/api/sensors
```

또는 도메인 사용 시:
```
http://CES-smart.reonaicoffee.com/api/sensors
```

### 요청 헤더

```
Content-Type: application/json
Connection: close
```

### 요청 본문 (JSON)

```json
{
  "module_id": "MODULE_001",
  "temperature": 25.3,
  "humidity": 60.5
}
```

**필드 설명**:
- `module_id` (string, 필수): 모듈 고유 ID (config.h의 MODULE_ID)
- `temperature` (float, 선택): 온도 (°C) - DHT11 센서
- `humidity` (float, 선택): 습도 (%) - DHT11 센서

**참고**: 현재 테스트 버전에서는 `temperature`와 `humidity`만 전송합니다. 
다른 센서 데이터(water_level, do_level, ph_level, light_level)도 서버에서 지원하지만 아두이노에서는 전송하지 않습니다.

### 응답

**성공 (201 Created)**:
```json
{
  "success": true,
  "message": "Sensor data saved successfully",
  "data_id": 123
}
```

**실패 (404 Not Found)**:
```json
{
  "success": false,
  "message": "Module not found"
}
```

**실패 (500 Internal Server Error)**:
```json
{
  "success": false,
  "message": "Server error"
}
```

### 전송 주기

- **기본 간격**: 30초 (30000ms)
- **설정 위치**: `config.h`의 `SENSOR_UPDATE_INTERVAL`
- **조건**: WiFi가 연결된 상태에서만 전송

### 코드 구현 위치

**아두이노 코드**:
- `api_client.h`: `sendSensorData(float temperature, float humidity)` 함수
- `CES_SmartFarm.ino`: `loop()` 함수에서 30초마다 호출

**서버 코드**:
- `backend/routes/sensors.js`: `POST /api/sensors` 엔드포인트
- `backend/models/SensorData.js`: 데이터베이스 저장 로직

---

## 액추에이터 상태 조회 API

### 엔드포인트

```
GET /api/actuators/status/:moduleId
```

### 전체 URL

```
http://43.203.141.2:3000/api/actuators/status/MODULE_001
```

### 요청

인증 불필요 (Public 엔드포인트)

### 응답

**성공 (200 OK)**:
```json
{
  "success": true,
  "status": {
    "module_id": "MODULE_001",
    "water_pump": false,
    "air_pump": false,
    "valve": false,
    "heater": false,
    "cooler": false,
    "relay": true
  }
}
```

**기본값 (레코드 없을 때)**:
```json
{
  "success": true,
  "status": {
    "module_id": "MODULE_001",
    "relay": false
  }
}
```

### 조회 주기

- **기본 간격**: 10초 (10000ms)
- **조건**: WiFi가 연결된 상태에서만 조회

### 코드 구현 위치

**아두이노 코드**:
- `api_client.h`: `getRelayStatus(bool& relayState)` 함수
- `CES_SmartFarm.ino`: `loop()` 함수에서 10초마다 호출

**서버 코드**:
- `backend/routes/actuators.js`: `GET /api/actuators/status/:moduleId` 엔드포인트

---

## HTTP 요청 예시 (아두이노 코드)

### 센서 데이터 전송

```cpp
// api_client.h의 sendSensorData() 함수 내부

// 1. JSON 생성
StaticJsonDocument<200> doc;
doc["module_id"] = String(MODULE_ID);
doc["temperature"] = temperature;
doc["humidity"] = humidity;

String jsonPayload;
serializeJson(doc, jsonPayload);

// 2. HTTP POST 요청
client.print("POST ");
client.print(API_SENSORS_ENDPOINT);  // "/api/sensors"
client.println(" HTTP/1.1");
client.print("Host: ");
client.println(host);  // "43.203.141.2"
client.println("Content-Type: application/json");
client.print("Content-Length: ");
client.println(jsonPayload.length());
client.println("Connection: close");
client.println();
client.println(jsonPayload);

// 3. 응답 대기 (최대 5초)
unsigned long timeout = millis();
while (client.available() == 0) {
  if (millis() - timeout > 5000) {
    Serial.println("Client timeout!");
    client.stop();
    return false;
  }
}
```

### 액추에이터 상태 조회

```cpp
// api_client.h의 getRelayStatus() 함수 내부

// 1. HTTP GET 요청
String endpoint = String(API_ACTUATORS_STATUS_ENDPOINT) + "/" + String(MODULE_ID);
// "/api/actuators/status/MODULE_001"

client.print("GET ");
client.print(endpoint);
client.println(" HTTP/1.1");
client.print("Host: ");
client.println(host);
client.println("Connection: close");
client.println();

// 2. 응답 파싱
// JSON 응답에서 "relay" 필드 추출
```

---

## 테스트 방법

### curl로 테스트

**센서 데이터 전송**:
```bash
curl -X POST http://43.203.141.2:3000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": "MODULE_001",
    "temperature": 25.3,
    "humidity": 60.5
  }'
```

**액추에이터 상태 조회**:
```bash
curl http://43.203.141.2:3000/api/actuators/status/MODULE_001
```

### 아두이노 시리얼 모니터 확인

**정상 전송 시**:
```
Temperature: 25.3C | Humidity: 60.5%
Sensor data sent
```

**전송 실패 시**:
```
Temperature: 25.3C | Humidity: 60.5%
Sensor data send failed
Connection to server failed!
```

**릴레이 상태 조회 시**:
```
Relay updated from server: ON
```

---

## 설정 파일

### config.h

```cpp
// API Configuration
#define API_BASE_URL "http://43.203.141.2:3000"
#define API_SENSORS_ENDPOINT "/api/sensors"
#define API_ACTUATORS_STATUS_ENDPOINT "/api/actuators/status"
#define MODULE_ID "MODULE_001"

// Timing Configuration
#define SENSOR_UPDATE_INTERVAL 30000  // 30초
```

---

## 주의사항

1. **HTTPS 미지원**: Arduino R4 WiFi는 HTTPS를 지원하지 않으므로 HTTP만 사용
2. **타임아웃**: 서버 응답이 5초 내에 오지 않으면 타임아웃
3. **WiFi 연결 필수**: WiFi가 연결되지 않으면 API 호출 실패
4. **모듈 ID**: 서버에 모듈이 등록되어 있어야 데이터 저장 가능
5. **전송 주기**: 너무 짧은 간격(예: 1초)은 서버 부하 증가

---

## 문제 해결

### "Module not found" 오류

- 서버에 모듈이 등록되어 있는지 확인
- `MODULE_ID`가 서버에 등록된 모듈 ID와 일치하는지 확인
- 웹 대시보드에서 모듈 추가 필요

### "Connection to server failed!" 오류

- 서버가 실행 중인지 확인: `curl http://43.203.141.2:3000/api/health`
- WiFi 연결 상태 확인
- 방화벽 설정 확인 (포트 3000 열려있는지)

### "Client timeout!" 오류

- 서버 응답이 느린 경우
- 네트워크 지연
- 서버 로그 확인 필요

---

## 참고

- **서버 API 문서**: `backend/routes/sensors.js`
- **아두이노 API 클라이언트**: `arduino-r4/CES_SmartFarm/api_client.h`
- **설정 파일**: `arduino-r4/CES_SmartFarm/config.h`

