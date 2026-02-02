# 아두이노 R4 빠른 시작 가이드

## 5분 안에 시작하기

### ✅ 준비사항
- 아두이노 IDE 설치됨
- Arduino R4 WiFi 보드
- USB 케이블

### 📝 단계별 가이드

#### 1. 라이브러리 설치 (한 번만)
아두이노 IDE에서:
- **Sketch > Include Library > Manage Libraries**
- 다음 라이브러리 검색 후 설치:
  1. `WiFiS3` 
  2. `ArduinoJson` (버전 6.x)
  3. `OneWire`
  4. `DallasTemperature`

#### 2. 코드 열기
- 아두이노 IDE에서 `File > Open`
- `arduino-r4/main.ino` 파일 선택

#### 3. 설정 수정 (필수!)
`config.h` 파일에서:
```cpp
#define WIFI_SSID "당신의_WiFi_이름"           // 수정!
#define WIFI_PASSWORD "당신의_WiFi_비밀번호"     // 수정!
#define MODULE_ID "MODULE_001"                 // 각 모듈마다 변경
```

#### 4. 보드 선택
- **Tools > Board > Arduino UNO R4 WiFi**

#### 5. 포트 선택
- **Tools > Port > (연결된 포트)**

#### 6. 업로드
- **Upload (→)** 버튼 클릭

#### 7. 시리얼 모니터 확인
- **Tools > Serial Monitor** (보드레이트: 9600)
- WiFi 연결 및 센서 데이터 전송 확인

## 완료! 🎉

이제 아두이노가 30초마다 서버로 센서 데이터를 전송합니다.

## 문제가 있나요?

### 컴파일 오류
→ 필요한 라이브러리가 모두 설치되었는지 확인

### WiFi 연결 실패
→ WiFi SSID와 비밀번호 확인

### 서버 연결 실패
→ 서버가 실행 중인지 확인: http://3.36.109.155:3000/api/health

자세한 내용은 `ARDUINO_SETUP.md` 참고

