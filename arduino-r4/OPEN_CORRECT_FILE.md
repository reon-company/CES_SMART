# 올바른 파일 열기 가이드

## 문제
`main/main.ino` 파일을 열면 `config.h` 파일을 찾을 수 없다는 오류가 발생합니다.

## 해결 방법

### ✅ 올바른 파일 열기

아두이노 IDE에서:
1. **File > Close** (현재 열린 스케치 닫기)
2. **File > Open**
3. **`arduino-r4/CES_SmartFarm/CES_SmartFarm.ino`** 파일 선택

### ❌ 잘못된 파일
- `arduino-r4/main/main.ino` ← 이 파일은 열지 마세요!

### ✅ 올바른 파일
- `arduino-r4/CES_SmartFarm/CES_SmartFarm.ino` ← 이 파일을 열어야 합니다!

## 파일 구조

```
arduino-r4/
├── CES_SmartFarm/          ← 이 폴더의 파일을 열어야 함
│   └── CES_SmartFarm.ino   ← ✅ 이 파일을 열기
├── config.h                ← 같은 레벨에 있음
├── api_client.h
├── wifi_config.h
├── sensors/
└── actuators/
```

## 확인 방법

아두이노 IDE에서 파일을 열었을 때:
- ✅ 왼쪽 파일 목록에 `config.h`, `api_client.h` 등이 보이면 정상
- ❌ 파일 목록이 비어있거나 `main.ino`만 보이면 잘못된 파일

## 팁

- 스케치 폴더 이름은 `.ino` 파일 이름과 같아야 합니다
- `CES_SmartFarm.ino`를 열면 스케치 폴더가 `CES_SmartFarm`이 됩니다
- 같은 폴더의 모든 파일이 자동으로 인식됩니다

