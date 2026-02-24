# WiFi 웹 설정 기능

## 개요

하드코딩된 WiFi 정보 대신, **WiFi AP 모드**를 통해 웹 브라우저로 WiFi 설정을 할 수 있습니다.

## 작동 원리

1. **첫 부팅**: EEPROM에 WiFi 설정이 없으면 AP 모드로 시작
2. **웹 설정 페이지**: `http://192.168.4.1`에서 WiFi 정보 입력
3. **EEPROM 저장**: 설정한 정보를 EEPROM에 저장
4. **자동 연결**: 다음 부팅부터 저장된 WiFi에 자동 연결

## 사용 방법

### 1단계: 아두이노 업로드
- `wifi_config.h` 파일 포함
- `CES_SmartFarm.ino` 업로드

### 2단계: WiFi AP 모드 확인
시리얼 모니터에서 다음 메시지 확인:
```
WiFi 설정이 없습니다. 설정 포털을 시작합니다.
Starting WiFi Configuration Portal...
AP IP address: 192.168.4.1
Connect to WiFi: CES_SmartFarm_Setup
Then open browser: http://192.168.4.1
```

### 3단계: 스마트폰/컴퓨터로 연결
1. WiFi 목록에서 **"CES_SmartFarm_Setup"** 찾기
2. 연결 (비밀번호 없음)
3. 웹 브라우저에서 `http://192.168.4.1` 접속

### 4단계: WiFi 정보 입력
웹 페이지에서:
- **WiFi 이름 (SSID)**: 연결할 WiFi 이름 입력
- **WiFi 비밀번호**: WiFi 비밀번호 입력
- **"설정 저장"** 버튼 클릭

### 5단계: 완료
- "설정이 저장되었습니다!" 메시지 확인
- 아두이노가 자동으로 저장된 WiFi에 연결 시도

## 장점

✅ **하드코딩 불필요**: 코드에 WiFi 정보 노출 안 됨
✅ **다중 환경 지원**: 여러 WiFi 환경에서 사용 가능
✅ **보안**: 비밀번호가 코드에 하드코딩되지 않음
✅ **사용자 친화적**: 웹 인터페이스로 쉽게 설정

## 파일 구조

```
arduino-r4/
├── CES_SmartFarm.ino    ← WiFiConfig 사용
├── wifi_config.h        ← WiFi 설정 관리 클래스
├── config.h             ← 하드코딩 제거됨
└── ...
```

## 주의사항

- **EEPROM 사용**: Arduino R4 WiFi는 EEPROM을 지원하므로 설정이 유지됩니다
- **AP 모드**: 첫 부팅 시에만 AP 모드로 시작
- **재설정**: EEPROM을 지우면 다시 설정 페이지가 나타남

## 설정 초기화

EEPROM을 초기화하려면:
- 시리얼 모니터에서 특정 명령 전송
- 또는 EEPROM 초기화 코드 추가

## 블루투스 대신 WiFi AP 모드 사용 이유

- Arduino R4 WiFi는 **블루투스가 없음**
- WiFi AP 모드가 더 안정적이고 범용적
- 웹 브라우저로 접근 가능 (앱 설치 불필요)
- 여러 기기에서 동시 접속 가능

