# ESP32-CAM → CES 스마트팜 연동 가이드

## 개요

ESP32-CAM 모듈은 **실시간 MJPEG 스트리밍**을 제공합니다.  
대시보드의 **모듈 상세** 페이지에서 해당 모듈에 **카메라 스트림 URL**을 설정하면 실시간 영상을 볼 수 있습니다.

---

## 스트림 URL 형식

ESP32-CAM 예제는 두 개의 HTTP 서버를 사용합니다.

| 포트 | 용도        | 스트림 URL 예시                    |
|------|-------------|-------------------------------------|
| 80   | 웹 UI, 캡처 | `http://<ESP32_IP>/`               |
| 81   | MJPEG 스트림 | `http://<ESP32_IP>:81/stream`     |

**실시간 영상용 URL**: `http://<ESP32-CAM의 IP>:81/stream`

- 예: ESP32-CAM IP가 `192.168.0.100`이면 → `http://192.168.0.100:81/stream`

---

## 대시보드에서 카메라 모듈 등록

1. **모듈 추가** 버튼 클릭
2. **모듈 이름**: 예) "농장 카메라"
3. **모듈 ID**: 예) `CAM_001` (고유한 ID, 아두이노 R4와 구분용)
4. **WiFi 이름 / 비밀번호**: 카메라 전용 모듈이면 비워두어도 됨 (ESP32-CAM은 .ino 또는 config에서 직접 WiFi 설정)
5. **카메라 스트림 URL**: `http://<ESP32-CAM IP>:81/stream` 입력
6. **추가** 클릭

등록 후 **모듈 상세** 페이지에 들어가면 **실시간 카메라** 섹션에 영상이 표시됩니다.

---

## ESP32-CAM IP 확인 방법

1. 시리얼 모니터(115200 baud) 열기
2. 스케치 업로드 후 재부팅하면 예시처럼 출력됨:
   ```
   WiFi connected
   Camera Ready! Use 'http://192.168.0.100' to connect
   ```
3. 위에 나온 IP를 사용해 스트림 URL 작성: `http://192.168.0.100:81/stream`

또는 공유기/라우터의 연결 기기 목록에서 ESP32-CAM에 할당된 IP를 확인할 수 있습니다.

---
http://192.168.1.13:81/stream

http://192.168.1.13/stream

## 네트워크 조건

- **같은 네트워크**: 브라우저(PC/휴대폰)와 ESP32-CAM이 **같은 WiFi(동일 LAN)**에 있어야 실시간 영상이 보입니다.
- **다른 네트워크**: 외부에서 보려면 공유기 포트포워딩(80, 81) 또는 VPN/터널 설정이 필요합니다.
- **VPN/터널 설정**: 서버가 ESP32-CAM과 다른 네트워크에 있을 때, VPN을 통해 접속할 수 있습니다. 자세한 설정은 `backend/VPN_SETUP_GUIDE.md`를 참고하세요.

---

## 제공 API (ESP32-CAM 내장 서버)

| 경로       | 메서드 | 설명           |
|------------|--------|----------------|
| `/`        | GET    | 웹 UI (카메라 설정 등) |
| `/stream`  | GET    | **실시간 MJPEG 스트림** (포트 81) |
| `/capture` | GET    | 정지 화면 1장 (JPEG)   |
| `/status`  | GET    | 카메라 설정 상태 (JSON) |
| `/control` | GET    | 파라미터 조정 (var=..., val=...) |

스트리밍은 **포트 81**에서만 동작합니다 (`app_httpd.cpp` 참고).

---

## 파일 구성

- `CES_CAMERA.ino`: 초기화, WiFi 연결, 카메라 서버 시작
- `app_httpd.cpp` / `app_httpd.h`: HTTP 서버 및 `/stream`, `/capture` 등 핸들러
- `camera_index.h`: 웹 UI (gzip HTML)
- `board_config.h`: 카메라 보드 선택 (예: AI_THINKER)
- `camera_pins.h`: 보드별 핀 매핑

---

## 문제 해결

### "카메라에 연결할 수 없습니다"

- ESP32-CAM 전원 및 WiFi 연결 확인
- PC/휴대폰이 ESP32-CAM과 **같은 WiFi**에 연결되어 있는지 확인
- 모듈 상세에 등록한 **카메라 스트림 URL**이 `http://<IP>:81/stream` 형식인지 확인
- 방화벽/공유기에서 **80, 81 포트** 차단 여부 확인

### 영상이 끊기거나 느림

- WiFi 신호 강도 개선
- `app_httpd.cpp`의 해상도/품질 설정 조정 (예: `FRAMESIZE_QVGA` 유지)
- 동시 접속 수 줄이기

### 스트림 URL 수정

- 대시보드 **모듈 목록**에서 해당 모듈 선택 후 **수정**에서 **카메라 스트림 URL**만 변경 가능 (백엔드 PUT `/api/modules/:id`에 `camera_stream_url` 포함).

---

## 참고

- **아두이노 R4 모듈**: `arduino-r4/CES_SmartFarm/` 및 `API_DOCUMENTATION.md`
- **서버 API**: `backend/routes/modules.js` (모듈 생성/수정 시 `camera_stream_url` 저장)
- **프론트엔드**: `frontend/pages/dashboard/modules/[moduleId].js` (실시간 카메라 섹션)
