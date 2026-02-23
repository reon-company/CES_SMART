# ARDUINO(R4) 핸드오버 가이드

---

## 대상 독자 / 목표

| 항목 | 내용 |
|------|------|
| **대상 독자** | 하드웨어/임베디드 인수 담당자, 현장 배포 담당자 |
| **목표** | Arduino R4 기반 센서/릴레이 모듈의 업로드, WiFi 설정, 서버 연동을 1일 내 수행 가능하도록 함 |

---

## 사전 준비물

- [ ] Arduino IDE 2.x 또는 PlatformIO
- [ ] Arduino UNO R4 WiFi 보드
- [ ] USB 케이블 (데이터 통신 지원)
- [ ] 라이브러리: ArduinoJson, DHT sensor library, Adafruit Unified Sensor
- [ ] 서버 API URL (예: `http://your-server:3000`)
- [ ] DB에 등록된 `module_id` (모듈 ID)

---

## 1. 역할
- 센서(현재 DHT11 중심) 읽기
- 릴레이 상태 반영 및 서버 제어 동기화
- 주기적으로 센서/릴레이 상태를 백엔드 API로 전송

## 2. 핵심 파일
- `arduino-r4/CES_SmartFarm/CES_SmartFarm.ino`: 부팅/메인 루프/WiFi 재연결 상태기계
- `arduino-r4/CES_SmartFarm/api_client.h`: 서버 API 통신
- `arduino-r4/CES_SmartFarm/wifi_config.h`: AP 설정 포털/EEPROM 저장
- `arduino-r4/CES_SmartFarm/config.h`: 모듈 ID, 서버 URL, 주기, 핀 정의

## 3. 동작 흐름
1. 부팅 후 시리얼/센서/릴레이 초기화
2. EEPROM WiFi 설정 로드 또는 AP 설정 포털 진입
3. 연결 성공 시 주기 전송(센서), 주기 폴링(릴레이 상태)
4. WiFi 끊김 시 비차단 상태기계로 재연결 시도

## 4. 이관 체크포인트
- `MODULE_ID`가 서버 등록 모듈과 일치하는지 확인
- `API_BASE_URL`이 실제 운영 주소와 일치하는지 확인
- 보드/포트/라이브러리 설치 상태(ArduinoJson, DHT 등) 확인
- 시리얼 로그에서 초기화/연결/전송 성공 여부 확인

## 5. 장애 대응
- \"Connection to server failed\": 방화벽/도메인/API URL 확인
- 모듈 미표시: DB `user_id` 소유권/모듈 ID 불일치 확인
- 시리얼 미출력: Baud rate 및 보드 포트 재선택

---

## 6. 단계별 절차

### Step 1: Arduino IDE 환경 설정
1. 보드 매니저에서 "Arduino UNO R4 WiFi" 설치
2. 스케치 → 라이브러리 포함 → 라이브러리 관리에서 설치:
   - `ArduinoJson` (6.x)
   - `DHT sensor library`
   - `Adafruit Unified Sensor`

### Step 2: config.h 수정
```cpp
// arduino-r4/CES_SmartFarm/config.h
#define MODULE_ID       "your-module-id"   // DB modules.id와 동일
#define API_BASE_URL   "http://192.168.1.100:3000"  // 실제 서버 URL
#define SENSOR_INTERVAL_MS  30000   // 센서 전송 주기(ms)
```

### Step 3: 업로드 및 시리얼 모니터
1. 도구 → 보드 → Arduino UNO R4 WiFi
2. 도구 → 포트 → 해당 COM 포트 선택
3. 업로드 버튼 클릭
4. 도구 → 시리얼 모니터 (115200 baud)

### Step 4: WiFi 초기 설정 (최초 1회)
- EEPROM에 저장된 WiFi가 없으면 AP 모드 진입
- 스마트폰/PC에서 `CES_SmartFarm_AP` SSID로 접속 → `http://192.168.4.1` 또는 시리얼 안내에 따라 설정

---

## 7. 검증 방법 (정상/비정상 기준)

| 항목 | 정상 | 비정상 |
|------|------|--------|
| 시리얼 부팅 로그 | `WiFi connected`, `IP: xxx.xxx.xxx.xxx` | `WiFi connection failed` |
| 센서 전송 | `POST /api/sensors/data` 200 로그 | `Connection to server failed` |
| 릴레이 폴링 | `GET /api/actuators/status` 200 | 401, 404 |
| 대시보드 모듈 표시 | 해당 모듈 카드에 센서 데이터 표시 | 빈 카드, "연결 없음" |

---

## 8. 자주 발생하는 문제와 해결

| 현상 | 원인 | 해결 |
|------|------|------|
| Connection to server failed | API_BASE_URL 오타, 방화벽, 서버 미가동 | URL 확인, `curl`로 서버 도달 테스트 |
| 모듈 미표시 | MODULE_ID 불일치 | DB `modules` 테이블 `id`와 동일하게 설정 |
| 시리얼 미출력 | 포트/Baud 잘못 선택 | 115200, 올바른 COM 포트 재선택 |
| DHT 읽기 실패 | 핀 연결, 센서 고장 | `camera_pins.h`/`config.h` 핀 번호 확인 |
| AP 모드만 반복 | WiFi SSID/비밀번호 오류 | `/wifi/clear` 후 재설정 또는 시리얼 명령으로 초기화 |

