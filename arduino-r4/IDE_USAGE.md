# 아두이노 IDE 사용 방법

## 중요: 파일 구조

아두이노 IDE는 **스케치 폴더(스케치 이름과 같은 폴더) 내의 모든 파일**을 같은 디렉토리로 인식합니다.

### 올바른 사용 방법

1. **`arduino-r4` 폴더 전체를 아두이노 스케치 폴더로 복사**
   - Windows: `Documents\Arduino\arduino-r4\`
   - Mac: `~/Documents/Arduino/arduino-r4/`
   - Linux: `~/Arduino/arduino-r4/`

2. **아두이노 IDE에서 `arduino-r4/main.ino` 파일 열기**

3. **모든 파일이 같은 폴더에 있는지 확인:**
   ```
   arduino-r4/
   ├── main.ino          ← 메인 파일
   ├── config.h         ← 설정 파일
   ├── api_client.h     ← API 통신
   ├── sensors/         ← 센서 헤더 파일들
   └── actuators/       ← 액추에이터 헤더 파일들
   ```

### 잘못된 사용 방법 (오류 발생)

❌ `main/main.ino` 파일만 열기
- `config.h` 파일을 찾을 수 없음
- 같은 폴더에 있어야 함

## 단계별 가이드

### 1. 폴더 복사
```bash
# 전체 arduino-r4 폴더를 아두이노 스케치 폴더로 복사
cp -r arduino-r4 ~/Documents/Arduino/
```

### 2. 아두이노 IDE에서 열기
- File > Open
- `~/Documents/Arduino/arduino-r4/main.ino` 선택

### 3. 설정 수정
- `config.h` 파일에서 WiFi 정보 수정

### 4. 업로드
- Tools > Board > Arduino UNO R4 WiFi
- Tools > Port > (연결된 포트)
- Upload 버튼 클릭

## 문제 해결

### "config.h: No such file or directory" 오류
→ **해결**: `main.ino` 파일과 `config.h` 파일이 같은 폴더에 있는지 확인

### "sensors/WaterLevelSensor.h: No such file or directory" 오류
→ **해결**: `sensors/` 폴더가 `main.ino`와 같은 폴더에 있는지 확인

### 모든 파일이 같은 폴더 구조인지 확인
```
arduino-r4/
├── main.ino
├── config.h
├── api_client.h
├── sensors/
│   ├── WaterLevelSensor.h
│   ├── TemperatureSensor.h
│   ├── DOSensor.h
│   ├── PHSensor.h
│   └── LightSensor.h
└── actuators/
    ├── RelayControl.h
    ├── WaterPump.h
    ├── AirPump.h
    ├── Valve.h
    ├── Heater.h
    └── Cooler.h
```

## 팁

- 아두이노 IDE는 스케치 폴더 이름을 스케치 이름으로 사용합니다
- 모든 `.h` 파일과 하위 폴더는 스케치 폴더 내에 있어야 합니다
- `main.ino` 파일 이름은 스케치 폴더 이름과 같을 필요는 없지만, 같은 폴더에 있어야 합니다

