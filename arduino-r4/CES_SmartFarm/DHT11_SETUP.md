# DHT11 센서 설정 가이드

## 라이브러리 설치

아두이노 IDE에서 다음 라이브러리를 설치해야 합니다:

1. **DHT sensor library** (Adafruit)
   - Sketch > Include Library > Manage Libraries
   - "DHT sensor library" 검색
   - Adafruit에서 제공하는 버전 설치

2. **Adafruit Unified Sensor** (의존성)
   - DHT 라이브러리 설치 시 자동으로 설치됨
   - 수동 설치가 필요한 경우:
     - "Adafruit Unified Sensor" 검색 후 설치

## 하드웨어 연결

### DHT11 센서
- **VCC** → 5V (또는 3.3V)
- **GND** → GND
- **DATA** → 디지털 핀 2 (config.h의 DHT11_PIN)

### 릴레이 모듈 [SZH-EK082]
- **VCC** → 5V
- **GND** → GND
- **IN** → 디지털 핀 3 (config.h의 RELAY_PIN)

**참고**: 릴레이 모듈은 보통 LOW 신호에서 ON, HIGH 신호에서 OFF입니다.
코드에서 이미 이 로직이 구현되어 있습니다.

## 핀 변경

핀을 변경하려면 `config.h` 파일을 수정하세요:

```cpp
#define DHT11_PIN 2    // DHT11 데이터 핀
#define RELAY_PIN 3    // 릴레이 제어 핀
```

## 테스트

1. 코드 업로드 후 시리얼 모니터 열기 (9600 baud)
2. "SETUP_START" 메시지 확인
3. WiFi 연결 확인
4. 센서 데이터가 30초마다 전송되는지 확인
5. 웹 대시보드에서 릴레이 제어 테스트

