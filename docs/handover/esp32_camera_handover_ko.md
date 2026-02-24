# ESP32-CAMERA 핸드오버 가이드

---

## 대상 독자 / 목표

| 항목 | 내용 |
|------|------|
| **대상 독자** | ESP32/카메라 모듈 인수 담당자, 현장 배포·네트워크 담당자 |
| **목표** | ESP32-CAM MJPEG 스트리밍 모듈의 빌드, 업로드, WiFi 설정, 서버 프록시 연동을 1일 내 수행 가능하도록 함 |

---

## 사전 준비물

- [ ] Arduino IDE 2.x + ESP32 보드 패키지 (또는 PlatformIO)
- [ ] ESP32-CAM 모듈 (보드 타입에 따라 `board_config.h`, `camera_pins.h` 확인)
- [ ] USB-to-Serial 변환기 (대부분 ESP32-CAM에 직결 USB 없음)
- [ ] `CES_CAMERA/config.example.h` 기반 `config.h` (또는 `camera_wifi_config.h` 편집)
- [ ] 서버에서 카메라 IP로 접근 가능한 경로 (Tailscale/portproxy 등)

---

## 1. 역할
- MJPEG 스트리밍 제공
- WiFi 설정 저장(NVS) 및 재연결
- 시리얼/웹(`/wifi`) 기반 설정 인터페이스 제공

## 2. 핵심 파일
- `CES_CAMERA/CES_CAMERA.ino`: 카메라 초기화, WiFi 연결, serial 명령 처리
- `CES_CAMERA/app_httpd.cpp`: 스트림/캡처/설정 HTTP 엔드포인트
- `CES_CAMERA/camera_wifi_config.h`: 기본 WiFi fallback
- `CES_CAMERA/board_config.h`, `camera_pins.h`: 보드/핀 매핑

## 3. 주요 엔드포인트
- `/stream`: MJPEG 스트림
- `/capture`: 단일 이미지
- `/wifi`: WiFi 설정 페이지
- `/wifi/set`: WiFi 저장/적용
- `/wifi/clear`: 저장 설정 초기화

## 4. 운영 설계 포인트
- 외부 사용자는 ESP32 직접 접속 대신 서버 카메라 프록시 API 사용
- 서버가 ESP32에 닿지 못하면 프록시 502/504가 발생
- Tailscale/포트포워딩 경로가 끊기면 프론트 카메라 표시 실패

## 5. 이관 체크포인트
- 카메라 보드 타입/핀 정의 일치 확인
- 시리얼에서 연결 IP 및 \"Camera Ready\" 출력 확인
- 서버에서 `GET /api/camera/:moduleId/health` 성공 확인
- 스트림 URL은 DB 모듈의 `camera_stream_url`에 정확히 반영

---

## 6. 단계별 절차

### Step 1: ESP32 보드 패키지 설치
1. Arduino IDE → 파일 → 환경설정 → 추가 보드 매니저 URL에:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
2. 도구 → 보드 → 보드 매니저 → "esp32" 검색 설치
3. 도구 → 보드 → ESP32 Arduino → 사용 중인 CAM 보드 선택 (예: AI Thinker ESP32-CAM)

### Step 2: config.h / camera_wifi_config.h 설정
```cpp
// CES_CAMERA/camera_wifi_config.h 또는 config.h
#define CAMERA_WIFI_SSID     "your_wifi_ssid"
#define CAMERA_WIFI_PASSWORD "your_wifi_password"
```
- NVS에 저장된 값이 없을 때 fallback으로 사용
- 시리얼: `SET_WIFI SSID PASSWORD` 또는 웹 `/wifi/set`로 런타임 변경 가능

### Step 3: 보드/핀 매핑 확인
- `board_config.h`: `CAMERA_MODEL_AI_THINKER` 등 모델별 매크로
- `camera_pins.h`: 핀 번호 매핑 (보드 타입별로 다름)

### Step 4: 업로드 및 시리얼 모니터
1. USB-to-Serial 연결 후 GPIO0 GND 단축하여 부트로더 모드 진입 (필요 시)
2. 포트 선택, 115200 baud, 업로드
3. 시리얼 모니터에서 `WiFi connected`, `Camera Ready`, `IP: xxx.xxx.xxx.xxx` 확인

### Step 5: DB에 스트림 URL 등록
- `modules` 테이블 `camera_stream_url`: `http://ESP32_IP:81/stream`
- 서버가 이 IP:81에 접근할 수 있어야 프록시 동작

---

## 7. 검증 방법 (정상/비정상 기준)

| 항목 | 정상 | 비정상 |
|------|------|--------|
| 시리얼 부팅 | `Camera Ready`, `IP: xxx.xxx.xxx.xxx` | `Camera init failed`, `WiFi failed` |
| 로컬 스트림 | 브라우저 `http://ESP32_IP:81/stream` → 영상 표시 | 404, 연결 거부 |
| 서버 health | `GET /api/camera/:moduleId/health` 200 | 502, 504, 타임아웃 |
| 프론트 스트림 | 대시보드 모듈 상세에서 영상 표시 | 검은 화면, 504 |

---

## 8. 자주 발생하는 문제와 해결

| 현상 | 원인 | 해결 |
|------|------|------|
| Camera init failed | 보드/핀 불일치 | `board_config.h`, `camera_pins.h` 보드 타입 확인 |
| WiFi 연결 실패 | SSID/비밀번호 오류 | NVS 초기화: 시리얼 `CLEAR_WIFI` 후 재설정 |
| 서버 502/504 | 서버→ESP32 네트워크 미연결 | Tailscale/portproxy, 서버에서 `curl http://ESP32_IP:81/stream` 테스트 |
| 스트림 끊김 | WiFi 불안정, 메모리 부족 | 해상도/프레임 낮추기, WiFi 신호 강화 |
| /wifi/set 적용 후 무응답 | NVS 쓰기 실패 | 시리얼로 `SET_WIFI` 재시도, 전원 재부팅 |

