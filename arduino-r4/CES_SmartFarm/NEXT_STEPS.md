# 아두이노 업로드 완료 - 다음 단계

## ✅ 완료된 작업
- 컴파일 성공
- 아두이노 업로드 성공

## 다음 단계

### 1. 시리얼 모니터 확인

아두이노 IDE에서:
- **Tools > Serial Monitor** 열기
- **보드레이트: 9600** 설정
- 다음 메시지들을 확인하세요:

```
=== CES SmartFarm Arduino R4 Starting ===
Module ID: MODULE_001
WiFi 연결 시도 중...
```

### 2. WiFi 연결 확인

시리얼 모니터에서 다음 중 하나를 확인:

#### 경우 1: EEPROM에 WiFi 설정이 있는 경우
```
EEPROM에서 WiFi 설정 로드
WiFi에 연결 중: [WiFi 이름]
WiFi connected! IP address: [IP 주소]
```

#### 경우 2: EEPROM에 설정이 없는 경우
```
EEPROM에 WiFi 설정이 없습니다.
Starting WiFi Configuration Portal...
AP IP address: 192.168.4.1
Connect to WiFi: CES_SmartFarm_Setup
Then open browser: http://192.168.4.1
```

### 3. 프론트엔드에서 모듈 추가

1. **웹 대시보드 접속**
   - http://localhost:3001/dashboard/modules

2. **"모듈 추가" 버튼 클릭**

3. **모듈 정보 입력:**
   - **모듈 이름**: 예) "수조 1호"
   - **모듈 ID**: `MODULE_001` (아두이노의 MODULE_ID와 일치해야 함)
   - **WiFi 이름 (SSID)**: 연결할 WiFi 이름
   - **WiFi 비밀번호**: WiFi 비밀번호

4. **"추가" 버튼 클릭**

### 4. 아두이노가 서버에서 WiFi 정보 받기

#### 방법 1: 임시 WiFi 연결 후 자동 설정 (권장)
1. **스마트폰 핫스팟 켜기**
2. **아두이노를 핫스팟에 연결** (웹 설정 페이지 사용)
3. **아두이노가 자동으로 서버에서 WiFi 정보를 받아서 연결**

#### 방법 2: 웹 설정 페이지 사용
1. **아두이노가 AP 모드로 시작** ("CES_SmartFarm_Setup")
2. **스마트폰/컴퓨터에서 "CES_SmartFarm_Setup" 연결**
3. **브라우저에서 `http://192.168.4.1` 접속**
4. **WiFi 정보 입력**

### 5. 센서 데이터 전송 확인

WiFi 연결 후 시리얼 모니터에서:
```
Reading sensors...
Water Level: 50.0%
Temperature: 25.0°C
DO Level: 6.5mg/L
pH Level: 7.0
Light Level: 60.0%
Sending sensor data to server...
HTTP Response code: 200
Sensor data sent successfully!
```

### 6. 웹 대시보드에서 확인

1. **모듈 상세 페이지 접속**
   - http://localhost:3001/dashboard/modules/MODULE_001

2. **센서 데이터 확인**
   - 30초마다 자동 업데이트되는 센서 값 확인

3. **액추에이터 제어 테스트**
   - 워터 펌프, 에어 펌프 등 스위치로 제어

## 문제 해결

### WiFi 연결 실패
- WiFi SSID와 비밀번호 확인
- 2.4GHz 대역 WiFi인지 확인 (5GHz는 지원 안 됨)
- 시리얼 모니터에서 오류 메시지 확인

### 서버 연결 실패
- 서버가 실행 중인지 확인: http://3.36.109.155:3000/api/health
- 모듈 ID가 일치하는지 확인
- 시리얼 모니터에서 HTTP 응답 코드 확인

### 센서 값이 이상함
- 센서 연결 확인
- 센서 전원 공급 확인
- 각 센서 헤더 파일의 읽기 로직 확인

## 성공 확인 체크리스트

- [ ] 시리얼 모니터에서 WiFi 연결 확인
- [ ] 웹 대시보드에서 모듈 추가 완료
- [ ] 시리얼 모니터에서 센서 데이터 전송 확인
- [ ] 웹 대시보드에서 센서 데이터 표시 확인
- [ ] 웹 대시보드에서 액추에이터 제어 테스트

## 축하합니다! 🎉

아두이노가 성공적으로 업로드되었습니다. 이제 시스템이 정상적으로 작동하는지 확인하세요!

