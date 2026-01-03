# 스마트팜 시스템

기반 수조 관리 시스템입니다. 5개의 센서를 통해 실시간으로 수조 상태를 모니터링하고, 릴레이를 통해 액추에이터를 자동 제어합니다.

## 시스템 아키텍처

```
홈페이지 (Vercel) <-> 아마존 Lightsail <-> RDS <-> 모듈(아두이노 R4) no.1~30
```

- **프론트엔드**: Vercel에 배포된 Next.js 웹 애플리케이션
- **백엔드**: AWS Lightsail에서 실행되는 Node.js/Express 서버
- **데이터베이스**: AWS RDS (관계형 데이터베이스)
- **하드웨어 모듈**: 아두이노 R4 기반 센서/액추에이터 제어 모듈 (최대 30개)

### 데이터 흐름

- 센서 인풋값은 **30초마다** 아마존 서버로 전송되어 업데이트됩니다.
- 사용자는 로그인 후 등록된 모듈을 통해 실시간 모니터링 및 제어가 가능합니다.

## 시스템 구성

### 하드웨어

- **아두이노 R4 WiFi**: 센서 데이터 수집 및 액추에이터 제어
- **WiFi 설정**: AP 모드 웹 포털을 통한 EEPROM 저장 방식

#### 현재 테스트 버전 (v1.1.0)

**센서**:

- ✅ DHT11 온도/습도 센서

**액추에이터**:

- ✅ 1채널 릴레이 모듈 [SZH-EK082]

#### 전체 구성 (향후 확장 예정)

**센서**:

- 워터 레벨 센서 (아날로그)
- DS18B20 온도 센서
- DO 센서 (SEN0237-A, 0-3V)
- pH 센서
- Grove Light Sensor v1.2

**액추에이터** (릴레이 모듈):

- Water Pump
- Air Pump
- Actuator Valve (pH 조절용)
- Heater
- Cooler

### 소프트웨어

- **아두이노 R4**: Arduino IDE 기반 센서 읽기 및 제어
- **백엔드**: Node.js/Express (AWS Lightsail)
- **프론트엔드**: Next.js (Vercel 배포)
- **데이터베이스**: AWS RDS

## 프로젝트 구조

```
CES_SmartFarm/
├── arduino-r4/            # 아두이노 R4 코드
│   ├── sensors/           # 센서 읽기 모듈
│   ├── actuators/         # 액추에이터 제어 모듈
│   ├── main.ino          # 메인 제어 루프
│   ├── api_client.h      # API 통신 클라이언트
│   └── config.h          # 설정 파일
├── backend/              # AWS Lightsail 백엔드
│   ├── models/           # 데이터베이스 모델
│   ├── routes/           # API 라우트
│   ├── middleware/       # 인증 미들웨어
│   └── server.js         # 서버 진입점
└── frontend/             # Vercel 배포용 프론트엔드
    ├── pages/            # Next.js 페이지
    │   ├── login/        # 로그인 페이지
    │   └── dashboard/    # 컨트롤 패널
    ├── components/       # React 컴포넌트
    │   ├── ModuleList/   # 모듈 목록 컴포넌트
    │   ├── SensorPanel/  # 센서 모니터링 패널
    │   └── ActuatorControl/ # 액추에이터 제어 패널
    └── styles/           # CSS 스타일
```

## 사용자 및 모듈 관리

### 로그인 및 인증

- 사용자는 웹사이트에 로그인하여 시스템에 접근합니다.
- 로그인 시 등록된 모듈이 자동으로 연동됩니다.

### 모듈 관리

- **최대 30개의 모듈**을 추가할 수 있습니다.
- 각 모듈은 고유한 아두이노 R4 하드웨어와 연결됩니다.
- 사용자별로 자신이 등록한 모듈만 접근 및 제어가 가능합니다.

### 컨트롤 패널

로그인 후 사용자에게 제공되는 컨트롤 패널에서:

- **센서 인풋 확인**: 각 모듈의 실시간 센서 데이터 모니터링
- **아웃풋 제어**: 각 모듈의 액추에이터 수동 제어
- **모듈별 독립 제어**: 최대 30개 모듈을 개별적으로 관리

## 설치 및 설정

### 아두이노 R4 설정

1. Arduino IDE 설치 및 라이브러리 추가:

   - Arduino IDE 2.x 이상 설치
   - 필요한 라이브러리 설치:
     - WiFi 라이브러리 (WiFiNINA 또는 ESP8266/ESP32용)
     - HTTPClient 라이브러리
     - OneWire 라이브러리 (DS18B20용)
     - DallasTemperature 라이브러리

2. 설정 파일 수정 (`config.h`):

   - `API_BASE_URL`: Lightsail 서버 주소로 변경
   - `MODULE_ID`: 각 모듈의 고유 ID 설정
   - `WIFI_SSID`, `WIFI_PASSWORD`: WiFi 연결 정보
   - GPIO 핀 번호 확인 및 수정
   - 센서 ADC 채널 확인

3. 아두이노에 업로드:

   - Arduino IDE에서 `main.ino` 파일 열기
   - 보드 선택: Arduino R4 WiFi (또는 사용하는 R4 보드 타입)
   - 포트 선택 후 업로드

4. 시리얼 모니터 확인:
   - 업로드 후 시리얼 모니터에서 연결 상태 및 센서 데이터 확인

### 백엔드 설정 (AWS Lightsail)

1. Lightsail 인스턴스에 접속

2. Node.js 설치:

```bash
# Node.js 설치 (예: nvm 사용)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

3. 프로젝트 설정:

```bash
cd backend
npm install
cp .env.example .env
# .env 파일 수정: RDS_URI, PORT, JWT_SECRET 등
```

4. RDS 데이터베이스 연결:

   - AWS RDS 인스턴스 생성 및 연결 정보 설정
   - `.env` 파일에 `RDS_URI` 설정

5. 서버 실행:

```bash
npm start
# 또는 개발 모드
npm run dev
```

6. 방화벽 설정 (Lightsail):
   - 포트 3000 (또는 설정한 포트) 열기

### 프론트엔드 설정 (Vercel)

1. Vercel에 프로젝트 연결:

```bash
cd frontend
npm install
```

2. 환경 변수 설정:

   - Vercel 대시보드에서 `NEXT_PUBLIC_API_BASE_URL` 설정
   - Lightsail 서버 주소 입력

3. 배포:

```bash
vercel --prod
```

또는 GitHub에 푸시 후 Vercel에서 자동 배포 설정

## 주요 기능

### 센서 모니터링

**현재 테스트 버전**:

- ✅ 온도: 섭씨 온도 (DHT11)
- ✅ 습도: 0-100% (DHT11)
- **데이터 업데이트 주기**: 30초마다 자동 업데이트

**전체 버전 (향후 확장)**:

- 워터 레벨: 0-100%
- 온도: 섭씨 온도
- 용존산소 (DO): mg/L
- pH: 0-14
- 조도: 0-100%

### 제어 방식

**현재 구현**:

- ✅ 서버 기반 원격 제어 (웹 대시보드에서 수동 제어)
- ✅ 릴레이 모듈 제어

**향후 확장 예정**:

- 자동 제어 (임계값 기반)
  - 워터 레벨이 낮으면 워터 펌프 자동 작동
  - 온도가 범위를 벗어나면 히터/쿨러 자동 제어
  - DO가 낮으면 에어 펌프 자동 작동
  - pH가 범위를 벗어나면 액추에이터 밸브 제어
  - 조도에 따른 LED 제어

### 웹 대시보드

- **로그인 기능**: 사용자 인증 및 모듈 연동
- **모듈 관리**: 최대 30개 모듈 등록 및 관리
- **실시간 센서 값 표시**: 30초 간격 업데이트
- **액추에이터 수동 제어**: 각 모듈별 독립 제어
- **센서 데이터 히스토리 차트**: Highcharts를 이용한 시각화
- **임계값 설정 인터페이스**: 모듈별 임계값 설정

## API 엔드포인트

### 인증

- `POST /api/auth/login`: 사용자 로그인
- `POST /api/auth/register`: 사용자 회원가입
- `POST /api/auth/logout`: 로그아웃
- `GET /api/auth/me`: 현재 사용자 정보 조회

### 모듈 관리

- `GET /api/modules`: 사용자 등록 모듈 목록 조회
- `POST /api/modules`: 새 모듈 등록
- `GET /api/modules/:moduleId`: 특정 모듈 정보 조회
- `PUT /api/modules/:moduleId`: 모듈 정보 수정
- `DELETE /api/modules/:moduleId`: 모듈 삭제

### 센서

- `POST /api/sensors`: 센서 데이터 수신 및 저장 (아두이노 R4에서 30초마다 전송)
- `GET /api/sensors/latest/:moduleId`: 특정 모듈의 최신 센서 데이터 조회
- `GET /api/sensors/history/:moduleId`: 특정 모듈의 센서 데이터 히스토리 조회

### 액추에이터

- `GET /api/actuators/status/:moduleId`: 특정 모듈의 액추에이터 상태 조회 (Public - 아두이노용)
- `GET /api/actuators/:moduleId`: 특정 모듈의 액추에이터 상태 조회 (Private - 웹 대시보드용)
- `POST /api/actuators/:moduleId/:actuatorType`: 특정 모듈의 액추에이터 제어 (Private)
- `POST /api/actuators/control/:moduleId`: 특정 모듈의 액추에이터 제어 (Private - 레거시)
- `POST /api/actuators/status/update/:moduleId`: 액추에이터 상태 업데이트 (Public - 아두이노용)

### 설정

- `GET /api/config/thresholds/:moduleId`: 특정 모듈의 임계값 조회
- `POST /api/config/thresholds/:moduleId`: 특정 모듈의 임계값 업데이트
- `GET /api/config/thresholds/:moduleId/:sensor_type`: 특정 모듈의 특정 센서 임계값 조회

## 주의사항

1. **GPIO 핀 할당**: 릴레이 모듈의 GPIO 핀 번호를 실제 하드웨어에 맞게 수정해야 합니다.
2. **ADC 설정**: 아날로그 센서는 아두이노 R4의 내장 ADC를 사용합니다. 실제 하드웨어에 맞게 수정이 필요합니다.
3. **1-Wire 설정**: DS18B20 사용 시 아두이노 R4에서 OneWire 라이브러리를 사용합니다.
4. **WiFi 연결**: 아두이노 R4와 Lightsail 서버 간 안정적인 네트워크 연결이 필요합니다.
5. **모듈 ID 관리**: 각 아두이노 R4 모듈은 고유한 모듈 ID를 가져야 하며, 서버에 등록되어야 합니다.
6. **데이터 전송 주기**: 센서 데이터는 30초마다 전송되므로, 실시간성이 중요한 경우 주기를 조정할 수 있습니다.
7. **모듈 제한**: 사용자당 최대 30개의 모듈만 등록 가능합니다.

## 라이선스

ISC
