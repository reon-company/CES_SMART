#ifndef CONFIG_EXAMPLE_H
#define CONFIG_EXAMPLE_H

// 유지보수 메모:
// 이 파일은 템플릿 참고용이며 실제 런타임 설정 파일로 사용하면 안 됩니다.
// ===========================
// WiFi 기본값 (camera_wifi_config.h용)
// ===========================
// #define CAMERA_WIFI_SSID     "your_ssid"
// #define CAMERA_WIFI_PASSWORD "your_password"

// 참고:
// 실제 운영 중 변경은 시리얼 명령으로 NVS에 저장 가능
// SET_WIFI <ssid> <password>

// ===========================
// Module ID (선택, 대시보드 등록용)
// ===========================
// 대시보드에 카메라 모듈을 추가할 때 사용합니다. 스트림은 ESP32-CAM IP를 통해 접근합니다.
// #define MODULE_ID "CAM_001"

#endif
