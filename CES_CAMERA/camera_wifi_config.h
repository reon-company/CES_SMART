#ifndef CAMERA_WIFI_CONFIG_H
#define CAMERA_WIFI_CONFIG_H

// ESP32-CAM 기본 WiFi 설정 (최초 부팅 fallback 값)
// 운영 중에는 시리얼 명령으로 변경하면 NVS에 저장되어 재부팅 후에도 유지됩니다.
// 예) SET_WIFI REON9999 999999999999
#define CAMERA_WIFI_SSID "REON9999"
#define CAMERA_WIFI_PASSWORD "999999999999"

#endif
