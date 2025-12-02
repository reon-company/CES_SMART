# 아두이노 R4 IDE 설정 가이드

## 빠른 시작 가이드

### 1단계: 아두이노 IDE 준비

1. **아두이노 IDE 설치** (최신 버전 권장)

   - https://www.arduino.cc/en/software

2. **Arduino R4 WiFi 보드 설치**
   - Tools > Board > Boards Manager
   - "Arduino UNO R4 WiFi" 검색 후 설치

### 2단계: 라이브러리 설치

**Sketch > Include Library > Manage Libraries** 에서 다음 설치:

1. **WiFiS3** (Arduino R4 WiFi용 WiFi 라이브러리)
2. **ArduinoJson** (버전 6.x - JSON 파싱용)
3. **OneWire** (DS18B20 온도 센서용)
4. **DallasTemperature** (DS18B20 온도 센서용)

### 3단계: 코드 복사

**방법 1: 전체 폴더 복사 (권장)**

1. `arduino-r4` 폴더 전체를 복사
2. 아두이노 스케치 폴더에 붙여넣기
   - Windows: `Documents\Arduino\`
   - Mac: `~/Documents/Arduino/`
   - Linux: `~/Arduino/`
3. 아두이노 IDE에서 `main.ino` 파일 열기

**방법 2: 파일 직접 열기**

1. 아두이노 IDE에서 `File > Open`
2. `arduino-r4/main.ino` 파일 선택
3. 같은 폴더의 다른 파일들도 자동으로 인식됨

### 4단계: 설정 수정 (필수!)

`config.h` 파일을 열어서 수정:

```cpp
// WiFi Configuration - 반드시 수정하세요!
#define WIFI_SSID "여기에_당신의_WiFi_이름"
#define WIFI_PASSWORD "여기에_당신의_WiFi_비밀번호"

// Module Configuration - 각 모듈마다 고유 ID로 변경
#define MODULE_ID "MODULE_001"  // MODULE_002, MODULE_003 등으로 변경
```

### 5단계: 보드 및 포트 선택

1. **보드 선택**: Tools > Board > Arduino UNO R4 WiFi
2. **포트 선택**: Tools > Port > (연결된 포트 선택)
   - Windows: COM3, COM4 등
   - Mac/Linux: /dev/cu.usbmodem... 등

### 6단계: 업로드

1. **Verify (✓)** 버튼으로 컴파일 확인
2. **Upload (→)** 버튼으로 아두이노에 업로드
3. 업로드 완료 후 시리얼 모니터 열기 (Tools > Serial Monitor)
4. 보드레이트: **9600** 설정

### 7단계: 동작 확인

시리얼 모니터에서 다음 메시지 확인:

```
=== CES SmartFarm Arduino R4 Starting ===
Module ID: MODULE_001
Connecting to WiFi: your_wifi_ssid
WiFi connected! IP address: 192.168.x.x
Initializing sensors...
Initializing actuators...
Initialization complete!
Starting main loop...
Reading sensors...
Water Level: 50.0%
Temperature: 25.0°C
DO Level: 6.5mg/L
pH Level: 7.0
Light Level: 60.0%
Sending sensor data to server...
HTTP Response code: 200
Sensor data sent successfully!
```

## 파일 구조 설명

아두이노 IDE에서는 같은 폴더의 모든 파일을 자동으로 인식합니다:

```
arduino-r4/
├── main.ino              ← 메인 파일 (이 파일을 IDE에서 열기)
├── config.h              ← 설정 파일 (WiFi, 핀, 모듈 ID)
├── api_client.h          ← 서버 통신 코드
├── sensors/              ← 센서 헤더 파일들
│   ├── WaterLevelSensor.h
│   ├── TemperatureSensor.h
│   ├── DOSensor.h
│   ├── PHSensor.h
│   └── LightSensor.h
└── actuators/            ← 액추에이터 헤더 파일들
    ├── RelayControl.h
    ├── WaterPump.h
    ├── AirPump.h
    ├── Valve.h
    ├── Heater.h
    └── Cooler.h
```

## 하드웨어 연결

### 센서 연결

- **워터 레벨**: A0 (아날로그)
- **온도 (DS18B20)**: 핀 2 (디지털, OneWire)
- **DO 센서**: A1 (아날로그, 0-3V)
- **pH 센서**: A2 (아날로그)
- **조도 센서**: A3 (아날로그)

### 액추에이터 연결 (릴레이 모듈)

- **워터 펌프**: 핀 3
- **에어 펌프**: 핀 4
- **밸브**: 핀 5
- **히터**: 핀 6
- **쿨러**: 핀 7

## 문제 해결

### 컴파일 오류: "WiFiS3.h: No such file or directory"

→ **해결**: WiFiS3 라이브러리 설치 필요

### 컴파일 오류: "ArduinoJson.h: No such file or directory"

→ **해결**: ArduinoJson 라이브러리 설치 필요 (버전 6.x)

### WiFi 연결 실패

→ **확인 사항**:

- WiFi SSID와 비밀번호가 정확한지
- WiFi가 2.4GHz 대역인지 (5GHz는 지원 안 됨)
- 신호 강도가 충분한지

### 서버 연결 실패

→ **확인 사항**:

- 서버 IP 주소: `http://3.36.109.155:3000`
- 서버가 실행 중인지
- 방화벽 설정

### 센서 값이 0 또는 이상함

→ **확인 사항**:

- 센서 연결 확인
- 센서 전원 공급 확인
- 각 센서 헤더 파일의 읽기 로직 확인

## 주요 기능

1. **30초마다 센서 데이터 전송**
2. **10초마다 서버에서 액추에이터 상태 확인**
3. **임계값 기반 자동 제어**
4. **WiFi 자동 재연결**

## 다음 단계

1. ✅ 코드 업로드 완료
2. 시리얼 모니터에서 정상 동작 확인
3. 서버에서 센서 데이터 수신 확인
4. 웹 대시보드에서 모듈 등록 및 제어 테스트
