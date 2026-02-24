========================================
ESP32-CAM (CES_CAMERA) 컴파일 오류 해결
========================================

오류: "해당(또는) 항목을 찾을 수 없습니다" / exit status 1

원인: 프로젝트 경로에 '&' 문자가 있음
      예: c:\R&D\...  → "R&D"의 & 가 원인

해결: 스케치 폴더를 '&' 가 없는 경로로 옮기세요.

1. 예시 경로로 폴더 복사:
   - C:\RD\CES_SMART-main\CES_CAMERA
   - C:\Projects\CES_SMART-main\CES_CAMERA
   - D:\Arduino\CES_CAMERA

2. Arduino IDE에서
   파일 → 열기 → 옮긴 폴더의 CES_CAMERA.ino 선택

3. 보드: 도구 → 보드 → ESP32 Arduino → AI Thinker ESP32-CAM

4. 다시 컴파일(확인) 실행

========================================
