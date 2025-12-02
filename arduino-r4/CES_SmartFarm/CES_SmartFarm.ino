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

// Sensor objects
WaterLevelSensor waterLevelSensor;
TemperatureSensor temperatureSensor;
DOSensor doSensor;
PHSensor phSensor;
LightSensor lightSensor;

// Actuator objects
WaterPump waterPump;
AirPump airPump;
Valve valve;
Heater heater;
Cooler cooler;

// WiFi Config Manager (EEPROM에 저장된 WiFi 정보 사용)
WiFiConfig wifiConfig;

// API client
APIClient apiClient;

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
  Serial.begin(9600);
  delay(1000);
  
  Serial.println("=== CES SmartFarm Arduino R4 Starting ===");
  Serial.print("Module ID: ");
  Serial.println(MODULE_ID);

  // WiFi 연결 시도 (우선순위: EEPROM > 서버)
  Serial.println("WiFi 연결 시도 중...");
  
  // 1. EEPROM에 저장된 WiFi 정보로 먼저 시도
  if (wifiConfig.isConfigured()) {
    Serial.println("EEPROM에서 WiFi 설정 로드");
    if (wifiConfig.connect()) {
      Serial.println("EEPROM WiFi로 연결 성공!");
    } else {
      Serial.println("EEPROM WiFi 연결 실패. 서버에서 설정을 가져오는 중...");
      // 2. EEPROM 연결 실패 시, 서버에서 WiFi 정보 가져오기 시도
      // (이미 임시 WiFi에 연결되어 있어야 함)
      String serverSSID = "";
      String serverPassword = "";
      
      if (WiFi.status() == WL_CONNECTED && apiClient.getWiFiConfig(serverSSID, serverPassword)) {
        Serial.print("서버에서 WiFi 설정 받음: ");
        Serial.println(serverSSID);
        
        // 서버에서 받은 WiFi로 재연결
        WiFi.disconnect();
        delay(1000);
        WiFi.begin(serverSSID.c_str(), serverPassword.c_str());
        int attempts = 0;
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
          delay(500);
          Serial.print(".");
          attempts++;
        }
        
        if (WiFi.status() == WL_CONNECTED) {
          Serial.println();
          Serial.print("서버 WiFi로 연결 성공! IP: ");
          Serial.println(WiFi.localIP());
          wifiConfig.save(serverSSID, serverPassword);
        } else {
          Serial.println();
          Serial.println("서버 WiFi 연결 실패. 설정 포털 시작...");
          wifiConfig.startConfigPortal();
        }
      } else {
        Serial.println("서버에서 WiFi 설정을 가져올 수 없습니다. 설정 포털 시작...");
        wifiConfig.startConfigPortal();
      }
    }
  } else {
    // 3. EEPROM에 설정이 없으면 설정 포털 시작
    Serial.println("EEPROM에 WiFi 설정이 없습니다. 설정 포털 시작...");
    Serial.println("또는 임시 WiFi(핫스팟)에 연결 후 서버에서 설정을 받을 수 있습니다.");
    wifiConfig.startConfigPortal();
  }

  // Initialize sensors
  Serial.println("Initializing sensors...");
  // Sensors are initialized in their constructors

  // Initialize actuators (all OFF initially)
  Serial.println("Initializing actuators...");
  waterPump.turnOff();
  airPump.turnOff();
  valve.turnOff();
  heater.turnOff();
  cooler.turnOff();

  Serial.println("Initialization complete!");
  Serial.println("Starting main loop...");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Attempting to reconnect...");
    if (!wifiConfig.connect()) {
      delay(5000);
      return;
    }
  }

  unsigned long currentTime = millis();

  // Send sensor data every 30 seconds
  if (currentTime - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    lastSensorUpdate = currentTime;
    
    Serial.println("Reading sensors...");
    
    // Read all sensors
    float waterLevel = waterLevelSensor.read();
    float temperature = temperatureSensor.read();
    float doLevel = doSensor.read();
    float phLevel = phSensor.read();
    float lightLevel = lightSensor.read();

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
    if (apiClient.sendSensorData(waterLevel, temperature, doLevel, phLevel, lightLevel)) {
      Serial.println("Sensor data sent successfully!");
    } else {
      Serial.println("Failed to send sensor data!");
    }

    // Auto control based on sensor readings
    performAutoControl(waterLevel, temperature, doLevel, phLevel, lightLevel);
  }

  // Check actuator status from server every 10 seconds
  if (currentTime - lastActuatorCheck >= 10000) {
    lastActuatorCheck = currentTime;
    
    bool serverWaterPump, serverAirPump, serverValve, serverHeater, serverCooler;
    
    if (apiClient.getActuatorStatus(serverWaterPump, serverAirPump, serverValve, serverHeater, serverCooler)) {
      // Update actuators based on server status
      waterPump.setState(serverWaterPump);
      airPump.setState(serverAirPump);
      valve.setState(serverValve);
      heater.setState(serverHeater);
      cooler.setState(serverCooler);
      
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
    waterPump.turnOn();
    Serial.println("Auto: Water pump ON (low water level)");
  } else if (waterLevel > 80.0) {
    waterPump.turnOff();
    Serial.println("Auto: Water pump OFF (sufficient water level)");
  }

  // Temperature control
  if (temperature < temperatureMin) {
    heater.turnOn();
    cooler.turnOff();
    Serial.println("Auto: Heater ON (low temperature)");
  } else if (temperature > temperatureMax) {
    heater.turnOff();
    cooler.turnOn();
    Serial.println("Auto: Cooler ON (high temperature)");
  } else {
    heater.turnOff();
    cooler.turnOff();
    Serial.println("Auto: Temperature OK");
  }

  // DO control
  if (doLevel < doMin) {
    airPump.turnOn();
    Serial.println("Auto: Air pump ON (low DO)");
  } else if (doLevel > 8.0) {
    airPump.turnOff();
    Serial.println("Auto: Air pump OFF (sufficient DO)");
  }

  // pH control
  if (phLevel < phMin) {
    valve.turnOn();
    Serial.println("Auto: Valve ON (low pH)");
  } else if (phLevel > phMax) {
    valve.turnOn();
    Serial.println("Auto: Valve ON (high pH)");
  } else {
    valve.turnOff();
    Serial.println("Auto: pH OK");
  }

  // Note: Light level is typically for monitoring, not control
  // But you can add LED control here if needed
}

