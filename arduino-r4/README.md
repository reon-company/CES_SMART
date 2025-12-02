# Arduino R4 스마트팜 코드

## 아두이노 IDE 사용 방법

### 1. 아두이노 IDE 설정

1. **아두이노 IDE 설치**
   - https://www.arduino.cc/en/software 에서 최신 버전 다운로드

2. **보드 매니저에서 Arduino R4 WiFi 설치**
   - Tools > Board > Boards Manager
   - "Arduino UNO R4 WiFi" 검색 후 설치

3. **필요한 라이브러리 설치**
   - Sketch > Include Library > Manage Libraries
   - 다음 라이브러리 설치:
     - **WiFiS3** (Arduino R4 WiFi용)
     - **ArduinoJson** (JSON 파싱용, 버전 6.x)
     - **OneWire** (DS18B20 온도 센서용)
     - **DallasTemperature** (DS18B20 온도 센서용)

### 2. 코드 업로드 방법

#### 방법 1: 전체 폴더 복사 (권장)
1. `arduino-r4` 폴더 전체를 아두이노 스케치 폴더로 복사
2. 아두이노 IDE에서 `main.ino` 파일 열기
3. `config.h` 파일에서 WiFi 정보와 모듈 ID 수정
4. 보드 선택: Tools > Board > Arduino UNO R4 WiFi
5. 포트 선택: Tools > Port > (해당 포트)
6. Upload 버튼 클릭

#### 방법 2: 파일 병합 (간단한 방법)
모든 파일을 하나의 폴더에 넣고 `main.ino`만 열어도 됩니다.

### 3. 설정 수정 필수!

`config.h` 파일을 열어서 다음을 수정하세요:

```cpp
// WiFi Configuration
#define WIFI_SSID "여기에_당신의_WiFi_이름"        // 수정 필요!
#define WIFI_PASSWORD "여기에_당신의_WiFi_비밀번호"  // 수정 필요!

// Module Configuration
#define MODULE_ID "MODULE_001"  // 각 모듈마다 고유 ID로 변경 (예: MODULE_002, MODULE_003...)
```

### 4. 하드웨어 연결

#### 센서 연결
- **워터 레벨 센서**: A0 핀 (아날로그)
- **온도 센서 (DS18B20)**: 핀 2 (디지털, OneWire)
- **DO 센서**: A1 핀 (아날로그, 0-3V)
- **pH 센서**: A2 핀 (아날로그)
- **조도 센서**: A3 핀 (아날로그)

#### 액추에이터 연결 (릴레이 모듈)
- **워터 펌프**: 핀 3
- **에어 펌프**: 핀 4
- **밸브**: 핀 5
- **히터**: 핀 6
- **쿨러**: 핀 7

### 5. 시리얼 모니터 확인

1. Tools > Serial Monitor 열기
2. 보드레이트: 9600 설정
3. 업로드 후 시리얼 모니터에서 다음 메시지 확인:
   - WiFi 연결 상태
   - 센서 읽기 값
   - 서버 통신 상태

### 6. 동작 확인

정상 작동 시 시리얼 모니터에서:
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
...
Sending sensor data to server...
Sensor data sent successfully!
```

## 문제 해결

### WiFi 연결 실패
- WiFi SSID와 비밀번호 확인
- WiFi 신호 강도 확인
- 라우터가 2.4GHz 대역인지 확인 (5GHz는 지원 안 됨)

### 서버 연결 실패
- 서버 IP 주소 확인: `http://3.36.109.155:3000`
- 서버가 실행 중인지 확인
- 방화벽 설정 확인

### 센서 값이 이상함
- 센서 연결 확인
- 센서 캘리브레이션 필요할 수 있음
- 각 센서 헤더 파일에서 읽기 로직 수정

### 컴파일 오류
- 필요한 라이브러리가 모두 설치되었는지 확인
- Arduino R4 WiFi 보드가 선택되었는지 확인
- 파일 경로가 올바른지 확인

## 파일 구조

```
arduino-r4/
├── main.ino              # 메인 프로그램 (아두이노 IDE에서 열기)
├── config.h              # 설정 파일 (WiFi, 핀, 모듈 ID)
├── api_client.h          # 서버 통신 코드
├── sensors/
│   ├── WaterLevelSensor.h
│   ├── TemperatureSensor.h
│   ├── DOSensor.h
│   ├── PHSensor.h
│   └── LightSensor.h
└── actuators/
    ├── RelayControl.h
    ├── WaterPump.h
    ├── AirPump.h
    ├── Valve.h
    ├── Heater.h
    └── Cooler.h
```

## 주요 기능

1. **센서 데이터 전송**: 30초마다 서버로 센서 데이터 전송
2. **액추에이터 제어**: 서버에서 받은 명령으로 액추에이터 제어
3. **자동 제어**: 임계값 기반 자동 제어 로직
4. **WiFi 자동 재연결**: 연결 끊김 시 자동 재연결

## 다음 단계

1. 코드 업로드 후 시리얼 모니터 확인
2. 서버에서 센서 데이터 수신 확인
3. 웹 대시보드에서 모듈 등록 및 제어 테스트

