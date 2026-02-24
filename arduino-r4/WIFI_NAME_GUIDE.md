# WiFi 이름 확인 방법

## macOS에서 WiFi 이름 확인하기

### 방법 1: 메뉴바에서 확인 (가장 쉬움)
1. 화면 상단 오른쪽의 WiFi 아이콘 클릭
2. 연결된 WiFi 이름이 체크 표시(✓)와 함께 표시됨
3. WiFi 이름을 복사하거나 메모

### 방법 2: 시스템 설정에서 확인
1. Apple 메뉴 > 시스템 설정
2. 네트워크 선택
3. WiFi 선택
4. 현재 연결된 네트워크 이름 확인

### 방법 3: 터미널 명령어
터미널에서 다음 명령어 실행:

```bash
# 방법 1
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep -E "^\s*SSID" | awk '{print $2}'

# 방법 2
networksetup -getairportnetwork en0

# 방법 3 (WiFi 인터페이스가 en1인 경우)
networksetup -getairportnetwork en1
```

### 방법 4: 시스템 정보에서 확인
1. Apple 메뉴 > 이 Mac에 관하여
2. 시스템 리포트 클릭
3. 네트워크 > WiFi > 현재 네트워크 정보에서 SSID 확인

## config.h에 설정하기

확인한 WiFi 이름을 `config.h` 파일에 설정:

```cpp
// WiFi Configuration
#define WIFI_SSID "여기에_WiFi_이름_입력"        // 예: "MyWiFi_5G"
#define WIFI_PASSWORD "여기에_WiFi_비밀번호_입력"  // 예: "mypassword123"
```

## 주의사항

- WiFi 이름에 공백이 있으면 그대로 입력
- 대소문자 구분
- 특수문자도 그대로 입력
- 2.4GHz 대역 WiFi 사용 권장 (Arduino R4는 5GHz 지원 안 됨)

