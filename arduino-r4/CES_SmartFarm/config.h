#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
// 하드코딩 대신 WiFi AP 모드로 웹 설정 페이지 사용
// 첫 부팅 시 "CES_SmartFarm_Setup" WiFi에 연결하여 설정
// #define WIFI_SSID "SK_WiFiGIGA91A3_2.4G"  // 사용 안 함 (EEPROM에 저장됨)
// #define WIFI_PASSWORD "2006076422"        // 사용 안 함 (EEPROM에 저장됨)

// API Configuration
// Arduino는 HTTPS를 지원하지 않으므로 HTTP 사용
// 도메인 사용 시: http://CES-smart.reonaicoffee.com (포트 80 또는 3000)
// IP 직접 사용 시: http://43.201.148.223:3000
#define API_BASE_URL "http://43.201.148.223:3000"
#define API_SENSORS_ENDPOINT "/api/sensors"
#define API_ACTUATORS_STATUS_ENDPOINT "/api/actuators/status"
#define API_ACTUATORS_CONTROL_ENDPOINT "/api/actuators/control"

// Module Configuration
#define MODULE_ID "MODULE_004"  // 각 모듈마다 고유 ID 설정 필요

// Sensor Pin Configuration
#define DHT11_PIN 2             // DHT11 온도/습도 센서 (디지털 핀)

// Actuator Pin Configuration (릴레이 모듈)
#define RELAY_PIN 3              // 1채널 릴레이 모듈

// Timing Configuration
#define SENSOR_UPDATE_INTERVAL 30000  // 30초 (밀리초)

// Log level control (0=none, 1=essential, 2=detailed)
#define LOG_LEVEL 1

#endif

