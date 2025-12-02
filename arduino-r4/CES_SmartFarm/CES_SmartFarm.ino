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

  // WiFi 연결 시도 (우선순위: EEPROM > 서버)
  Serial.println("DEBUG: WiFi 연결 시도 시작");
  Serial.flush();
  delay(100);
  
  Serial.println("WiFi 연결 시도 중...");
  Serial.flush();
  delay(100);
  
  Serial.println("DEBUG: wifiConfig->isConfigured() 확인 중...");
  Serial.flush();
  delay(100);
  
  // 1. EEPROM에 저장된 WiFi 정보로 먼저 시도
  if (wifiConfig->isConfigured()) {
    Serial.println("DEBUG: EEPROM에 설정 있음");
    Serial.flush();
    delay(100);
    
    Serial.println("EEPROM에서 WiFi 설정 로드");
    Serial.flush();
    delay(100);
    Serial.println("DEBUG: EEPROM SSID/Password 가져오는 중...");
    Serial.flush();
    delay(100);
    
    String eepromSSID = wifiConfig->getSSID();
    String eepromPassword = wifiConfig->getPassword();
    
    Serial.print("DEBUG: SSID 길이: ");
    Serial.println(eepromSSID.length());
    Serial.flush();
    delay(100);
    
    Serial.println("DEBUG: WiFi.connect() 호출 전");
    Serial.flush();
    delay(100);
    
    if (wifiConfig->connect(eepromSSID, eepromPassword)) {
      Serial.println("DEBUG: WiFi.connect() 성공");
      Serial.flush();
      delay(100);
      
      Serial.println("EEPROM WiFi로 연결 성공!");
      Serial.flush();
    } else {
      Serial.println("DEBUG: WiFi.connect() 실패");
      Serial.flush();
      delay(100);
      
      Serial.println("EEPROM WiFi 연결 실패.");
      Serial.println("loop()에서 계속 재시도합니다.");
      Serial.flush();
    }
  } else {
    Serial.println("DEBUG: EEPROM에 설정 없음");
    Serial.flush();
    delay(100);
    
    // 2. EEPROM에 설정이 없으면 서버에서 받기 시도 (임시 WiFi 필요)
    Serial.println("EEPROM에 WiFi 설정이 없습니다.");
    Serial.println("서버에서 WiFi 설정을 받으려면 임시 WiFi(핫스팟)에 연결하세요.");
    Serial.println("또는 웹 대시보드에서 모듈을 추가한 후 아두이노를 재시작하세요.");
    Serial.flush();
    delay(100);
    
    // 임시 WiFi에 연결되어 있으면 서버에서 설정 받기 시도
    delay(3000);  // 임시 WiFi 연결을 위한 대기 시간
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("임시 WiFi에 연결됨. 서버에서 WiFi 설정 가져오는 중...");
      Serial.flush();
      String serverSSID = "";
      String serverPassword = "";
      
      if (apiClient->getWiFiConfig(serverSSID, serverPassword)) {
        Serial.print("서버에서 WiFi 설정 받음: ");
        Serial.println(serverSSID);
        Serial.flush();
        
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
          wifiConfig->save(serverSSID, serverPassword);
          Serial.flush();
        } else {
          Serial.println();
          Serial.println("서버 WiFi 연결 실패. loop()에서 계속 재시도합니다.");
          Serial.flush();
        }
      } else {
        Serial.println("서버에서 WiFi 설정을 받을 수 없습니다.");
        Serial.println("웹 대시보드에서 모듈을 추가한 후 재시작하세요.");
        Serial.flush();
      }
    } else {
      Serial.println("임시 WiFi에 연결되지 않았습니다.");
      Serial.println("웹 대시보드에서 모듈을 추가한 후 재시작하세요.");
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
  
  Serial.println("DEBUG: waterPump->turnOff() 호출");
  Serial.flush();
  delay(100);
  waterPump->turnOff();
  
  Serial.println("DEBUG: airPump->turnOff() 호출");
  Serial.flush();
  delay(100);
  airPump->turnOff();
  
  Serial.println("DEBUG: valve->turnOff() 호출");
  Serial.flush();
  delay(100);
  valve->turnOff();
  
  Serial.println("DEBUG: heater->turnOff() 호출");
  Serial.flush();
  delay(100);
  heater->turnOff();
  
  Serial.println("DEBUG: cooler->turnOff() 호출");
  Serial.flush();
  delay(100);
  cooler->turnOff();

  Serial.println("DEBUG: 모든 액추에이터 초기화 완료");
  Serial.flush();
  delay(100);

  Serial.println("Initialization complete!");
  Serial.println("Starting main loop...");
  Serial.println("========================================");
  Serial.flush();
  delay(100);
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
    static unsigned long lastReconnectAttempt = 0;
    unsigned long currentTime = millis();
    
    // 10초마다 재연결 시도
    if (currentTime - lastReconnectAttempt >= 10000) {
      lastReconnectAttempt = currentTime;
      Serial.println("WiFi disconnected. Attempting to reconnect...");
      Serial.flush();
      
      if (wifiConfig->isConfigured()) {
        String eepromSSID = wifiConfig->getSSID();
        String eepromPassword = wifiConfig->getPassword();
        if (wifiConfig->connect(eepromSSID, eepromPassword)) {
          Serial.println("WiFi 재연결 성공!");
          Serial.flush();
        } else {
          Serial.println("WiFi 재연결 실패. 10초 후 다시 시도합니다.");
          Serial.flush();
        }
      } else {
        // EEPROM에 설정이 없으면 서버에서 받기 시도
        Serial.println("EEPROM에 WiFi 설정이 없습니다. 서버에서 가져오는 중...");
        Serial.flush();
        
        // 임시 WiFi에 연결되어 있으면 서버에서 설정 받기
        if (WiFi.status() == WL_CONNECTED) {
          String serverSSID = "";
          String serverPassword = "";
          if (apiClient->getWiFiConfig(serverSSID, serverPassword)) {
            Serial.print("서버에서 WiFi 설정 받음: ");
            Serial.println(serverSSID);
            Serial.flush();
            
            WiFi.disconnect();
            delay(1000);
            if (wifiConfig->connect(serverSSID, serverPassword)) {
              Serial.println("서버 WiFi로 연결 성공!");
              wifiConfig->save(serverSSID, serverPassword);
              Serial.flush();
            }
          }
        } else {
          Serial.println("임시 WiFi에 연결되지 않았습니다.");
          Serial.println("웹 대시보드에서 모듈을 추가한 후 재시작하세요.");
          Serial.flush();
        }
      }
    }
    
    // WiFi가 연결되지 않으면 센서 읽기/전송 건너뛰기
    delay(1000);
    return;
  }

  unsigned long currentTime = millis();

  // Send sensor data every 30 seconds
  if (currentTime - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL || lastSensorUpdate == 0) {
    lastSensorUpdate = currentTime;
    
    Serial.println("Reading sensors...");
    
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
    if (apiClient->sendSensorData(waterLevel, temperature, doLevel, phLevel, lightLevel)) {
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

  // WiFi 연결 상태 주기적 출력 (1분마다)
  static unsigned long lastStatusPrint = 0;
  if (currentTime - lastStatusPrint >= 60000) {
    lastStatusPrint = currentTime;
    Serial.print("System running. WiFi: ");
    Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
    }
    Serial.flush();
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

