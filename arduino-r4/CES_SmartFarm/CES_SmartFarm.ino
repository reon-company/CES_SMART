// CES SmartFarm - Arduino R4 Main Control Loop
#include "config.h"
#include "wifi_config.h"  // WiFi 웹 설정 추가
#include "api_client.h"

// Sensor includes
#include "sensors/WaterLevelSensor.h"
#include "sensors/TemperatureSensor.h"
#include "sensors/DOSensor.h"
#include "sensors/PHSensor.h"
#include "sensors/LightSensor.h"

// Actuator includes
#include "actuators/WaterPump.h"
#include "actuators/AirPump.h"
#include "actuators/Valve.h"
#include "actuators/Heater.h"
#include "actuators/Cooler.h"

// 전역 객체를 포인터로 선언 (setup()에서 초기화)
// 전역 객체 생성자가 setup() 전에 실행되어 문제를 일으킬 수 있음

// Sensor objects (포인터로 선언)
WaterLevelSensor* waterLevelSensor = nullptr;
TemperatureSensor* temperatureSensor = nullptr;
DOSensor* doSensor = nullptr;
PHSensor* phSensor = nullptr;
LightSensor* lightSensor = nullptr;

// Actuator objects (포인터로 선언)
WaterPump* waterPump = nullptr;
AirPump* airPump = nullptr;
Valve* valve = nullptr;
Heater* heater = nullptr;
Cooler* cooler = nullptr;

// WiFi Config Manager (EEPROM에 저장된 WiFi 정보 사용)
WiFiConfig* wifiConfig = nullptr;

// API client
APIClient* apiClient = nullptr;

// Timing variables
unsigned long lastSensorUpdate = 0;
unsigned long lastActuatorCheck = 0;

// Default thresholds (can be updated from server)
float waterLevelMin = 20.0;  // Minimum water level (%)
float temperatureMin = 20.0; // Minimum temperature (°C)
float temperatureMax = 28.0; // Maximum temperature (°C)
float doMin = 5.0;           // Minimum DO (mg/L)
float phMin = 6.5;           // Minimum pH
float phMax = 8.5;           // Maximum pH
float lightLevelMin = 30.0;  // Minimum light level (%)

void setup() {
  // 시리얼 초기화 - 가장 먼저!
  Serial.begin(9600);
  delay(2000);  // 시리얼 포트 초기화 대기 시간 증가
  
  Serial.println("========================================");
  Serial.println("DEBUG: setup() 함수 시작");
  Serial.println("========================================");
  Serial.flush();
  delay(100);
  
  Serial.println("DEBUG: Serial 초기화 완료");
  Serial.flush();
  delay(100);
  
  // 전역 객체 초기화 (setup()에서 수행)
  Serial.println("DEBUG: 전역 객체 초기화 시작...");
  Serial.flush();
  delay(100);
  
  // WiFi Config 초기화
  wifiConfig = new WiFiConfig();
  Serial.println("DEBUG: WiFiConfig 초기화 완료");
  Serial.flush();
  delay(100);
  
  // API Client 초기화
  apiClient = new APIClient();
  Serial.println("DEBUG: APIClient 초기화 완료");
  Serial.flush();
  delay(100);
  
  // 센서 객체 초기화
  waterLevelSensor = new WaterLevelSensor();
  Serial.println("DEBUG: WaterLevelSensor 초기화 완료");
  Serial.flush();
  delay(100);
  
  temperatureSensor = new TemperatureSensor();
  Serial.println("DEBUG: TemperatureSensor 초기화 완료");
  Serial.flush();
  delay(100);
  
  doSensor = new DOSensor();
  Serial.println("DEBUG: DOSensor 초기화 완료");
  Serial.flush();
  delay(100);
  
  phSensor = new PHSensor();
  Serial.println("DEBUG: PHSensor 초기화 완료");
  Serial.flush();
  delay(100);
  
  lightSensor = new LightSensor();
  Serial.println("DEBUG: LightSensor 초기화 완료");
  Serial.flush();
  delay(100);
  
  // 액추에이터 객체 초기화
  waterPump = new WaterPump();
  Serial.println("DEBUG: WaterPump 초기화 완료");
  Serial.flush();
  delay(100);
  
  airPump = new AirPump();
  Serial.println("DEBUG: AirPump 초기화 완료");
  Serial.flush();
  delay(100);
  
  valve = new Valve();
  Serial.println("DEBUG: Valve 초기화 완료");
  Serial.flush();
  delay(100);
  
  heater = new Heater();
  Serial.println("DEBUG: Heater 초기화 완료");
  Serial.flush();
  delay(100);
  
  cooler = new Cooler();
  Serial.println("DEBUG: Cooler 초기화 완료");
  Serial.flush();
  delay(100);
  
  Serial.println("DEBUG: 모든 전역 객체 초기화 완료!");
  Serial.flush();
  delay(100);
  
  Serial.println("=== CES SmartFarm Arduino R4 Starting ===");
  Serial.print("Module ID: ");
  Serial.println(MODULE_ID);
  Serial.flush();
  delay(100);

  // WiFi 연결 시도 (우선순위: 하드코딩 > EEPROM > 서버)
  Serial.println("WiFi 연결 시도 중...");
  Serial.flush();
  delay(100);
  
  // 0. 하드코딩된 WiFi로 먼저 시도 (임시 테스트용)
  Serial.println("하드코딩된 WiFi로 연결 시도 중...");
  Serial.flush();
  delay(100);
  
  if (wifiConfig->connect(String(WIFI_SSID), String(WIFI_PASSWORD))) {
    Serial.println("✅ 하드코딩 WiFi로 연결 성공!");
    Serial.flush();
    delay(100);
    
    // 연결 성공 시 EEPROM에 저장
    wifiConfig->save(String(WIFI_SSID), String(WIFI_PASSWORD));
    Serial.println("WiFi 설정을 EEPROM에 저장했습니다.");
    Serial.flush();
  } else {
    Serial.println("하드코딩 WiFi 연결 실패. EEPROM 설정 확인 중...");
    Serial.flush();
    delay(100);
    
    // 1. EEPROM에 저장된 WiFi 정보로 시도
    if (wifiConfig->isConfigured()) {
      Serial.println("EEPROM에서 WiFi 설정 로드");
      Serial.flush();
      delay(100);
      
      String eepromSSID = wifiConfig->getSSID();
      String eepromPassword = wifiConfig->getPassword();
      if (wifiConfig->connect(eepromSSID, eepromPassword)) {
        Serial.println("EEPROM WiFi로 연결 성공!");
        Serial.flush();
      } else {
        Serial.println("EEPROM WiFi 연결 실패.");
        Serial.println("loop()에서 계속 재시도합니다.");
        Serial.flush();
      }
    } else {
      Serial.println("EEPROM에 WiFi 설정이 없습니다.");
      Serial.println("loop()에서 계속 재시도합니다.");
      Serial.flush();
    }
  }

  Serial.println("DEBUG: WiFi 초기화 완료, 센서 초기화 시작");
  Serial.flush();
  delay(100);
  
  // Initialize sensors
  Serial.println("Initializing sensors...");
  Serial.flush();
  delay(100);
  // Sensors are initialized in their constructors

  Serial.println("DEBUG: 센서 초기화 완료, 액추에이터 초기화 시작");
  Serial.flush();
  delay(100);

  // Initialize actuators (all OFF initially)
  Serial.println("Initializing actuators...");
  Serial.flush();
  delay(100);
  
  waterPump->turnOff();
  airPump->turnOff();
  valve->turnOff();
  heater->turnOff();
  cooler->turnOff();

  Serial.println("Initialization complete!");
  Serial.println("Starting main loop...");
}

void loop() {
  static bool firstLoop = true;
  if (firstLoop) {
    Serial.println("DEBUG: loop() 함수 첫 실행!");
    Serial.flush();
    delay(100);
    firstLoop = false;
  }
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Attempting to reconnect...");
    Serial.flush();
    if (wifiConfig->isConfigured()) {
      String eepromSSID = wifiConfig->getSSID();
      String eepromPassword = wifiConfig->getPassword();
      if (!wifiConfig->connect(eepromSSID, eepromPassword)) {
        delay(5000);
        return;
      }
    } else {
      delay(5000);
      return;
    }
  }

  unsigned long currentTime = millis();

  // Send sensor data every 30 seconds
  if (currentTime - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL || lastSensorUpdate == 0) {
    lastSensorUpdate = currentTime;
    
    Serial.println("Reading sensors...");
    Serial.flush();
    
    // Read all sensors
    float waterLevel = waterLevelSensor->read();
    float temperature = temperatureSensor->read();
    float doLevel = doSensor->read();
    float phLevel = phSensor->read();
    float lightLevel = lightSensor->read();

    // Print sensor values
    Serial.print("Water Level: ");
    Serial.print(waterLevel);
    Serial.println("%");
    
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println("°C");
    
    Serial.print("DO Level: ");
    Serial.print(doLevel);
    Serial.println("mg/L");
    
    Serial.print("pH Level: ");
    Serial.print(phLevel);
    Serial.println();
    
    Serial.print("Light Level: ");
    Serial.print(lightLevel);
    Serial.println("%");

    // Send data to server
    Serial.println("Sending sensor data to server...");
    Serial.flush();
    if (apiClient->sendSensorData(waterLevel, temperature, doLevel, phLevel, lightLevel)) {
      Serial.println("Sensor data sent successfully!");
      Serial.flush();
    } else {
      Serial.println("Failed to send sensor data!");
      Serial.flush();
    }

    // Auto control based on sensor readings
    performAutoControl(waterLevel, temperature, doLevel, phLevel, lightLevel);
  }

  // Check actuator status from server every 10 seconds
  if (currentTime - lastActuatorCheck >= 10000) {
    lastActuatorCheck = currentTime;
    
    bool serverWaterPump, serverAirPump, serverValve, serverHeater, serverCooler;
    
    if (apiClient->getActuatorStatus(serverWaterPump, serverAirPump, serverValve, serverHeater, serverCooler)) {
      // Update actuators based on server status
      waterPump->setState(serverWaterPump);
      airPump->setState(serverAirPump);
      valve->setState(serverValve);
      heater->setState(serverHeater);
      cooler->setState(serverCooler);
      
      Serial.println("Actuator status updated from server");
    } else {
      Serial.println("Failed to get actuator status from server");
    }
  }

  delay(1000); // Small delay to prevent overwhelming the system
}

void performAutoControl(float waterLevel, float temperature, float doLevel, float phLevel, float lightLevel) {
  // Auto control logic based on thresholds
  
  // Water level control
  if (waterLevel < waterLevelMin) {
    waterPump->turnOn();
    Serial.println("Auto: Water pump ON (low water level)");
  } else if (waterLevel > 80.0) {
    waterPump->turnOff();
    Serial.println("Auto: Water pump OFF (sufficient water level)");
  }

  // Temperature control
  if (temperature < temperatureMin) {
    heater->turnOn();
    cooler->turnOff();
    Serial.println("Auto: Heater ON (low temperature)");
  } else if (temperature > temperatureMax) {
    heater->turnOff();
    cooler->turnOn();
    Serial.println("Auto: Cooler ON (high temperature)");
  } else {
    heater->turnOff();
    cooler->turnOff();
    Serial.println("Auto: Temperature OK");
  }

  // DO control
  if (doLevel < doMin) {
    airPump->turnOn();
    Serial.println("Auto: Air pump ON (low DO)");
  } else if (doLevel > 8.0) {
    airPump->turnOff();
    Serial.println("Auto: Air pump OFF (sufficient DO)");
  }

  // pH control
  if (phLevel < phMin) {
    valve->turnOn();
    Serial.println("Auto: Valve ON (low pH)");
  } else if (phLevel > phMax) {
    valve->turnOn();
    Serial.println("Auto: Valve ON (high pH)");
  } else {
    valve->turnOff();
    Serial.println("Auto: pH OK");
  }

  // Note: Light level is typically for monitoring, not control
  // But you can add LED control here if needed
}

