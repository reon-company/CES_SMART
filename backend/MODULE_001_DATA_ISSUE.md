# MODULE_001 데이터 수신 문제 해결

## 문제 상황
- 서버에 MODULE_001이 등록되어 있음
- 아두이노에서 데이터가 전송되지 않음

## 원인 분석

### 확인된 사항
1. **아두이노 설정**: MODULE_ID가 `MODULE_004`로 설정됨
2. **서버 등록**: MODULE_001이 등록되어 있음
3. **데이터베이스**: MODULE_001의 마지막 데이터가 2026-01-06 (오래됨)
4. **서버 로그**: MODULE_001에 대한 센서 데이터 POST 요청이 없음

### 문제점
- 아두이노가 `MODULE_004`로 데이터를 전송하려고 하지만, 서버에는 `MODULE_001`만 등록되어 있음
- 서버는 등록되지 않은 모듈 ID의 데이터를 거부함

## 해결 방법

### 방법 1: 아두이노 MODULE_ID를 MODULE_001로 변경 (권장)

아두이노 코드에서 MODULE_ID를 MODULE_001로 변경:

```cpp
// arduino-r4/CES_SmartFarm/config.h
#define MODULE_ID "MODULE_001"  // MODULE_004에서 변경
```

변경 후:
1. Arduino IDE에서 코드 업로드
2. 시리얼 모니터에서 `Module ID: MODULE_001` 확인
3. 30초 후 서버 로그에서 센서 데이터 수신 확인

### 방법 2: 서버에 MODULE_004 등록

웹 대시보드에서 MODULE_004를 새로 등록:
- 모듈 이름: 예) "4호"
- Module ID: `MODULE_004`
- 아두이노는 MODULE_004로 데이터 전송

## 확인 방법

### 1. 아두이노 시리얼 모니터 확인
```
Module ID: MODULE_001  (또는 MODULE_004)
WiFi connected
API Base URL: http://43.201.148.223:3000
[SENSOR] Sending data...
```

### 2. 서버 로그 확인
```bash
pm2 logs ces-smartfarm | grep -i "SENSOR DATA\|POST.*sensors"
```

예상 출력:
```
[SENSOR DATA] Module: MODULE_001, Temp: 25.5, Humidity: 60.0, Relay: 0
[SENSOR DATA] Saved with ID: 123
```

### 3. 데이터베이스 확인
```bash
mysql -u ces_user -p ces_smartfarm -e "SELECT * FROM sensor_data WHERE module_id = 'MODULE_001' ORDER BY created_at DESC LIMIT 5;"
```

## 현재 상태

- **아두이노 MODULE_ID**: MODULE_004
- **서버 등록 모듈**: MODULE_001, MODULE_002, MODULE_003
- **마지막 데이터**: MODULE_001 (2026-01-06) - 오래됨

## 권장 조치

**아두이노의 MODULE_ID를 MODULE_001로 변경**하여 서버에 등록된 모듈과 일치시키세요.
