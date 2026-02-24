# 라이브러리 설치 가이드

## 컴파일 오류 해결

### 오류 메시지
```
fatal error: ArduinoJson.h: No such file or directory
```

이 오류는 필요한 라이브러리가 설치되지 않아서 발생합니다.

## 해결 방법

### 1단계: Arduino IDE에서 라이브러리 매니저 열기

1. Arduino IDE 실행
2. **Sketch > Include Library > Manage Libraries...** 클릭
   - 또는 단축키: `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Shift+I` (Mac)

### 2단계: 필수 라이브러리 설치

라이브러리 매니저에서 다음 라이브러리를 검색하여 설치하세요:

#### 1. ArduinoJson (필수)

- **검색어**: `ArduinoJson`
- **작성자**: Benoit Blanchon
- **버전**: 6.21.x 이상 권장
- **설치**: "Install" 버튼 클릭

#### 2. DHT sensor library (필수)

- **검색어**: `DHT sensor library`
- **작성자**: Adafruit
- **버전**: 1.4.x 이상
- **설치**: "Install" 버튼 클릭
- **참고**: 이 라이브러리는 자동으로 "Adafruit Unified Sensor"도 설치합니다

#### 3. Adafruit Unified Sensor (의존성)

- DHT 라이브러리 설치 시 자동으로 설치됨
- 수동 설치가 필요한 경우:
  - **검색어**: `Adafruit Unified Sensor`
  - **작성자**: Adafruit

### 3단계: 설치 확인

라이브러리 설치 후:

1. **Sketch > Include Library** 메뉴를 확인
2. 다음 라이브러리들이 목록에 표시되어야 함:
   - ✅ ArduinoJson
   - ✅ DHT sensor library
   - ✅ Adafruit Unified Sensor

### 4단계: 코드 다시 컴파일

1. Arduino IDE에서 **Sketch > Verify/Compile** (`Ctrl+R` / `Cmd+R`)
2. 오류가 없으면 성공!

## 전체 설치 순서 요약

```
1. Arduino IDE 실행
2. Sketch > Include Library > Manage Libraries...
3. "ArduinoJson" 검색 → Install
4. "DHT sensor library" 검색 → Install
5. Sketch > Verify/Compile로 확인
```

## 추가 정보

### WiFiS3 라이브러리

- Arduino R4 WiFi 보드 패키지와 함께 자동 설치됨
- 별도 설치 불필요
- 보드 패키지가 설치되어 있지 않다면:
  1. **Tools > Board > Boards Manager**
  2. "Arduino UNO R4 WiFi" 검색
  3. "Arduino UNO R4 Boards" 설치

### 라이브러리 버전

- **ArduinoJson**: 버전 6.x 사용 (버전 7.x는 호환성 문제 가능)
- **DHT sensor library**: 최신 버전 사용 가능

## 문제 해결

### 라이브러리를 설치했는데도 오류가 발생할 때

1. **Arduino IDE 재시작**
2. **라이브러리 경로 확인**:
   - Windows: `C:\Users\[사용자명]\Documents\Arduino\libraries\`
   - Mac: `~/Documents/Arduino/libraries/`
   - Linux: `~/Arduino/libraries/`
3. **수동 설치** (필요시):
   - https://github.com/bblanchon/ArduinoJson/releases
   - 다운로드 후 라이브러리 폴더에 압축 해제

### 다른 컴파일 오류

- **WiFiS3 오류**: Arduino R4 WiFi 보드 패키지 설치 확인
- **EEPROM 오류**: Arduino R4는 EEPROM을 지원하므로 보드 선택 확인

## 완료!

라이브러리 설치가 완료되면 코드가 정상적으로 컴파일됩니다.
