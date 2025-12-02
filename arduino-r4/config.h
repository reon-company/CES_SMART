#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"

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

