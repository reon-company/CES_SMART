# Arduino R4 WiFi 셋업 가이드

## 목차
1. [필수 준비사항](#필수-준비사항)
2. [하드웨어 연결](#하드웨어-연결)
3. [소프트웨어 설치](#소프트웨어-설치)
4. [코드 설정](#코드-설정)
5. [업로드 및 테스트](#업로드-및-테스트)
6. [문제 해결](#문제-해결)

---

## 필수 준비사항

### 하드웨어
- **Arduino UNO R4 WiFi** 보드
- **DHT11** 온도/습도 센서
- **1채널 5V 미니 릴레이 모듈 [SZH-EK082]**
- USB 케이블 (데이터 전송 가능)
- 점퍼 와이어
- 브레드보드 (선택사항)

### 소프트웨어
- **Arduino IDE** (최신 버전 권장)
  - 다운로드: https://www.arduino.cc/en/software

---

## 하드웨어 연결

### DHT11 센서 연결

| DHT11 핀 | Arduino R4 핀 | 설명 |
|---------|---------------|------|
| VCC | 5V | 전원 (또는 3.3V 가능) |
| GND | GND | 그라운드 |
| DATA | **핀 2** | 데이터 신호 (디지털) |

**참고**: DHT11의 DATA 핀과 Arduino 사이에 **4.7kΩ 풀업 저항**을 연결하는 것을 권장합니다 (일부 모듈에는 이미 내장되어 있음).

### 릴레이 모듈 연결

| 릴레이 모듈 핀 | Arduino R4 핀 | 설명 |
|---------------|---------------|------|
| VCC | 5V | 전원 |
| GND | GND | 그라운드 |
| IN | **핀 3** | 제어 신호 (디지털) |

**릴레이 동작 방식**:
- LOW 신호 (0V) → 릴레이 ON
- HIGH 신호 (5V) → 릴레이 OFF

**주의사항**:
- 릴레이 모듈의 NO (Normally Open) / COM / NC (Normally Closed) 단자는 실제 부하(전구, 모터 등)를 연결할 때 사용합니다.
- 테스트 시에는 릴레이 모듈의 LED만으로 동작 확인이 가능합니다.

### 전체 연결도

```
Arduino R4 WiFi
├── 5V ──┬── DHT11 VCC
│        └── 릴레이 모듈 VCC
├── GND ─┬── DHT11 GND
│        └── 릴레이 모듈 GND
├── 핀 2 ─── DHT11 DATA
└── 핀 3 ─── 릴레이 모듈 IN
```

---

## 소프트웨어 설치

### 1. Arduino IDE 설치

1. https://www.arduino.cc/en/software 에서 Arduino IDE 다운로드
2. 설치 후 실행

### 2. Arduino R4 WiFi 보드 패키지 설치

1. **File > Preferences** (또는 `Ctrl+,` / `Cmd+,`)
2. **Additional Board Manager URLs**에 다음 URL 추가:
   ```
   https://downloads.arduino.cc/packages/package_index.json
   ```
3. **Tools > Board > Boards Manager** 열기
4. "**Arduino UNO R4 WiFi**" 검색
5. **Arduino UNO R4 Boards** 설치 (최신 버전)

### 3. 필수 라이브러리 설치

**Sketch > Include Library > Manage Libraries**에서 다음 라이브러리 설치:

#### 필수 라이브러리

1. **WiFiS3**
   - Arduino R4 WiFi용 WiFi 라이브러리
   - 보드 패키지와 함께 자동 설치됨

2. **ArduinoJson** (버전 6.x)
   - 검색어: "ArduinoJson"
   - 작성자: Benoit Blanchon
   - 버전 6.21.x 이상 권장

3. **DHT sensor library**
   - 검색어: "DHT sensor library"
   - 작성자: Adafruit
   - 버전 1.4.x 이상

4. **Adafruit Unified Sensor** (의존성)
   - DHT 라이브러리 설치 시 자동 설치됨
   - 수동 설치 필요 시: "Adafruit Unified Sensor" 검색

#### 설치 확인

라이브러리 설치 후 다음 경로에서 확인 가능:
- **Sketch > Include Library** 메뉴에 라이브러리 이름이 표시되어야 함

---

## 코드 설정

### 1. 프로젝트 폴더 구조

```
CES_SmartFarm/
├── CES_SmartFarm.ino      (메인 스케치 파일)
├── config.h                (설정 파일)
├── wifi_config.h           (WiFi 설정 관리)
├── api_client.h            (API 통신)
├── sensors/
│   └── DHT11Sensor.h       (DHT11 센서 클래스)
└── actuators/
    └── RelayControl.h      (릴레이 제어 클래스)
```

### 2. config.h 설정

`config.h` 파일을 열어 다음 항목을 수정:

```cpp
// API Configuration
#define API_BASE_URL "http://3.36.109.155:3000"  // 서버 주소 변경 필요

// Module Configuration
#define MODULE_ID "MODULE_001"  // 각 모듈마다 고유 ID로 변경

// Sensor Pin Configuration
#define DHT11_PIN 2             // DHT11 데이터 핀 (변경 가능)

// Actuator Pin Configuration
#define RELAY_PIN 3             // 릴레이 제어 핀 (변경 가능)

// Timing Configuration
#define SENSOR_UPDATE_INTERVAL 30000  // 센서 데이터 전송 간격 (30초)

// Log level control
#define LOG_LEVEL 1             // 0=없음, 1=필수, 2=상세
```

**중요 설정 항목**:
- `API_BASE_URL`: 백엔드 서버 주소 (프로덕션/개발 환경에 맞게 변경)
- `MODULE_ID`: 각 아두이노 모듈마다 고유한 ID (예: MODULE_001, MODULE_002, ...)

### 3. 보드 및 포트 설정

1. **Tools > Board > Arduino UNO R4 WiFi** 선택
2. **Tools > Port** 에서 연결된 포트 선택
   - Windows: `COM3`, `COM4` 등
   - macOS: `/dev/cu.usbmodem...` 또는 `/dev/tty.usbmodem...`
   - Linux: `/dev/ttyACM0`, `/dev/ttyUSB0` 등

---

## 업로드 및 테스트

### 1. 코드 업로드

1. Arduino IDE에서 `CES_SmartFarm.ino` 파일 열기
2. **Sketch > Verify/Compile** (`Ctrl+R` / `Cmd+R`)로 컴파일 확인
3. **Sketch > Upload** (`Ctrl+U` / `Cmd+U`)로 업로드

**업로드 실패 시**:
- Arduino R4는 부트로더 모드가 필요할 수 있습니다
- **RESET 버튼을 빠르게 두 번 연속 클릭**하여 부트로더 모드 진입
- 업로드 중 "SAM-BA operation failed" 오류 발생 시 위 방법 시도

### 2. 시리얼 모니터 확인

1. **Tools > Serial Monitor** (`Ctrl+Shift+M` / `Cmd+Shift+M`) 열기
2. **보드레이트: 9600** 설정 확인
3. 다음 메시지들이 순서대로 나타나야 함:

```
SETUP_START
========================================
CES SmartFarm Arduino R4 Starting
========================================
Module ID: MODULE_001
Start time: [시간] ms
========================================
Initializing DHT11 sensor and relay...
```

### 3. WiFi 설정

#### 첫 부팅 시 (EEPROM에 WiFi 정보가 없는 경우)

1. 아두이노가 **AP 모드**로 시작
2. WiFi 목록에서 **"CES_SmartFarm_Setup"** 찾기
3. 스마트폰/컴퓨터로 연결 (비밀번호 없음)
4. 웹 브라우저에서 자동으로 설정 페이지 열림 (또는 `192.168.4.1` 접속)
5. WiFi SSID와 비밀번호 입력 후 저장
6. 아두이노가 자동으로 WiFi에 연결 시도

#### WiFi 연결 확인

시리얼 모니터에서 다음 메시지 확인:

```
WiFi connected!
IP address: 192.168.x.x
```

### 4. 센서 데이터 전송 확인

- 센서 데이터는 **30초마다** 서버로 전송됩니다
- 시리얼 모니터에서 다음 메시지 확인:

```
Temperature: 25.3C | Humidity: 60.5%
Sensor data sent
```

### 5. 릴레이 제어 테스트

1. 웹 대시보드 (`dashboard.html`) 접속
2. 모듈 추가 (MAC 주소 입력)
3. 모듈 상세 페이지에서 릴레이 스위치 클릭
4. 아두이노의 릴레이 모듈 LED 확인
   - LED 켜짐 = 릴레이 ON
   - LED 꺼짐 = 릴레이 OFF

---

## 문제 해결

### 시리얼 모니터에 아무것도 안 나타남

**원인**:
- 보드레이트 불일치
- USB 케이블 문제
- 코드 실행 전 크래시

**해결 방법**:
1. 시리얼 모니터 보드레이트를 **9600**으로 설정 확인
2. USB 케이블 교체 (데이터 전송 가능한 케이블 사용)
3. Arduino R4의 LED가 깜빡이는지 확인
4. 코드에서 `Serial.begin(9600)` 확인
5. "SETUP_START" 메시지가 안 보이면 `setup()` 함수가 실행되지 않은 것

### WiFi 연결 실패

**원인**:
- WiFi SSID/비밀번호 오류
- 신호 약함
- 라우터 설정 문제

**해결 방법**:
1. WiFi 설정 포털에서 SSID/비밀번호 재입력
2. 아두이노를 라우터 가까이로 이동
3. 2.4GHz WiFi 사용 확인 (5GHz는 Arduino R4 WiFi에서 지원 안 함)
4. EEPROM 초기화: 코드에서 `wifiConfig.reset()` 호출 후 재업로드

### 센서 데이터가 -999.0으로 표시됨

**원인**:
- DHT11 센서 연결 문제
- 센서 불량
- 풀업 저항 누락

**해결 방법**:
1. DHT11 연결 확인 (VCC, GND, DATA)
2. DATA 핀과 5V 사이에 4.7kΩ 풀업 저항 추가
3. 센서 교체 테스트
4. 핀 번호 확인 (`config.h`의 `DHT11_PIN`)

### 릴레이가 동작하지 않음

**원인**:
- 릴레이 모듈 연결 문제
- 핀 번호 오류
- 릴레이 모듈 불량

**해결 방법**:
1. 릴레이 모듈 연결 확인 (VCC, GND, IN)
2. 핀 번호 확인 (`config.h`의 `RELAY_PIN`)
3. 시리얼 모니터에서 "Relay updated from server: ON/OFF" 메시지 확인
4. 릴레이 모듈의 LED 확인 (동작 시 LED 켜짐)
5. 다른 핀으로 테스트

### 서버 연결 실패

**원인**:
- API_BASE_URL 오류
- 서버 다운
- 네트워크 문제

**해결 방법**:
1. `config.h`의 `API_BASE_URL` 확인
2. 서버 상태 확인 (웹 브라우저에서 접속 테스트)
3. 시리얼 모니터에서 "Connection to server failed!" 메시지 확인
4. 방화벽 설정 확인

### 컴파일 오류

**자주 발생하는 오류**:

1. **"WiFiS3.h: No such file or directory"**
   - Arduino R4 WiFi 보드 패키지 재설치

2. **"DHT.h: No such file or directory"**
   - DHT sensor library 설치 확인

3. **"ArduinoJson.h: No such file or directory"**
   - ArduinoJson 라이브러리 설치 확인

4. **"EEPROM.begin() was not declared"**
   - Arduino R4에서는 `EEPROM.begin()` 불필요 (자동 초기화)
   - 코드에서 해당 라인 제거 또는 주석 처리

---

## 추가 정보

### 로그 레벨 설정

`config.h`에서 `LOG_LEVEL` 설정:

- `0`: 로그 없음 (최소 출력)
- `1`: 필수 로그만 (기본값, 권장)
- `2`: 상세 로그 (디버깅용)

### 센서 업데이트 간격 변경

`config.h`에서 `SENSOR_UPDATE_INTERVAL` 수정:

```cpp
#define SENSOR_UPDATE_INTERVAL 10000  // 10초로 변경
```

### 릴레이 상태 확인 간격

코드에서 `lastActuatorCheck` 간격 수정:

```cpp
if (currentTime - lastActuatorCheck >= 5000) {  // 5초로 변경
```

### EEPROM 초기화

WiFi 설정을 초기화하려면:

1. `CES_SmartFarm.ino`의 `setup()` 함수에 다음 추가:
   ```cpp
   wifiConfig.reset();
   ```
2. 업로드 후 한 번 실행
3. 다시 제거 후 재업로드

---

## 참고 자료

- [Arduino R4 WiFi 공식 문서](https://docs.arduino.cc/hardware/uno-r4-wifi)
- [DHT11 센서 데이터시트](https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-Translated-Version-1143054.pdf)
- [WiFiS3 라이브러리 예제](https://github.com/arduino-libraries/WiFiS3)

---

## 버전 정보

- **코드 버전**: 1.1.0 (Test - DHT11 + Relay)
- **Arduino R4 WiFi**: 최신 펌웨어 권장
- **마지막 업데이트**: 2024

---

## 지원

문제가 지속되면 다음 정보와 함께 문의:
- 시리얼 모니터 전체 출력
- 하드웨어 연결 사진
- `config.h` 설정 내용
- Arduino IDE 버전 및 보드 패키지 버전

