#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
// 하드코딩 대신 WiFi AP 모드로 웹 설정 페이지 사용
// 첫 부팅 시 "CES_SmartFarm_Setup" WiFi에 연결하여 설정
// #define WIFI_SSID "SK_WiFiGIGA91A3_2.4G"  // 사용 안 함 (EEPROM에 저장됨)
// #define WIFI_PASSWORD "2006076422"        // 사용 안 함 (EEPROM에 저장됨)

// API Configuration
#define API_BASE_URL "http://3.36.109.155:3000"
#define API_SENSORS_ENDPOINT "/api/sensors"
#define API_ACTUATORS_STATUS_ENDPOINT "/api/actuators/status"
#define API_ACTUATORS_CONTROL_ENDPOINT "/api/actuators/control"

// Module Configuration
#define MODULE_ID "MODULE_001"  // 각 모듈마다 고유 ID 설정 필요

// Sensor Pin Configuration
#define WATER_LEVEL_PIN A0      // 워터 레벨 센서 (아날로그)
#define TEMPERATURE_PIN 2       // DS18B20 온도 센서 (OneWire)
#define DO_SENSOR_PIN A1        // DO 센서 (SEN0237-A, 0-3V)
#define PH_SENSOR_PIN A2        // pH 센서
#define LIGHT_SENSOR_PIN A3     // Grove Light Sensor v1.2

// Actuator Pin Configuration (릴레이 모듈)
#define WATER_PUMP_PIN 3
#define AIR_PUMP_PIN 4
#define VALVE_PIN 5
#define HEATER_PIN 6
#define COOLER_PIN 7

// Timing Configuration
#define SENSOR_UPDATE_INTERVAL 30000  // 30초 (밀리초)

#endif

