# 스케치 이름 충돌 해결 방법

## 문제
아두이노 IDE에서 "main"이라는 이름의 스케치가 이미 존재하여 충돌이 발생했습니다.

## 해결 방법

### 방법 1: 새로운 스케치 이름 사용 (권장)

1. **아두이노 IDE에서 `CES_SmartFarm.ino` 파일 열기**
   - File > Open
   - `arduino-r4/CES_SmartFarm.ino` 선택

2. **스케치 폴더 이름이 `CES_SmartFarm`으로 생성됨**
   - 모든 파일이 올바르게 인식됨

### 방법 2: 기존 "main" 스케치 삭제

1. **아두이노 IDE에서 기존 스케치 삭제**
   - Sketch > Show Sketch Folder
   - 상위 폴더로 이동
   - `main` 폴더 삭제

2. **그 후 `main.ino` 파일 열기**

### 방법 3: 다른 이름으로 저장

1. **아두이노 IDE에서 임시로 스케치 열기**
2. **File > Save As**
3. **새 이름 입력**: `CES_SmartFarm` 또는 원하는 이름

## 권장 사항

✅ **`CES_SmartFarm.ino` 파일 사용** (이미 생성됨)
- 의미있는 이름
- 충돌 없음
- 모든 파일이 올바르게 인식됨

## 파일 구조

```
arduino-r4/
├── CES_SmartFarm.ino    ← 이 파일을 열기 (권장)
├── config.h
├── api_client.h
├── sensors/
└── actuators/
```

## 다음 단계

1. 아두이노 IDE에서 `CES_SmartFarm.ino` 파일 열기
2. `config.h`에서 WiFi 정보 수정
3. 컴파일 및 업로드

