/*
 * CES SmartFarm - Arduino R4 Main Control Loop
 * 
 * Version: 1.0.4
 * Date: 2024
 * 
 * Features:
 * - WiFi AP 모드 설정 포털 (EEPROM 저장)
 * - 센서 데이터 수집 및 서버 전송 (30초 간격)
 * - 액추에이터 서버 제어 (10초 간격)
 * - 자동 제어 로직 (임계값 기반)
 * - WiFi 자동 재연결
 * - 상세한 시리얼 디버깅 메시지
 */

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

// Sensor objects - Use pointers to delay construction until setup()
// This prevents constructor issues before Serial is ready
WaterLevelSensor* waterLevelSensor = nullptr;
TemperatureSensor* temperatureSensor = nullptr;
DOSensor* doSensor = nullptr;
PHSensor* phSensor = nullptr;
LightSensor* lightSensor = nullptr;

// Actuator objects - Use pointers to delay construction until setup()
WaterPump* waterPump = nullptr;
AirPump* airPump = nullptr;
Valve* valve = nullptr;
Heater* heater = nullptr;
Cooler* cooler = nullptr;

// WiFi Config Manager (EEPROM에 저장된 WiFi 정보 사용)
// Constructor is safe - no EEPROM access
WiFiConfig wifiConfig;

// API client - Constructor is safe (just string parsing)
APIClient apiClient;

// ===== CRITICAL: Setup function - FIRST thing that runs after global constructors =====
// This MUST execute even if global constructors have issues

// Timing variables
unsigned long lastSensorUpdate = 0;
unsigned long lastActuatorCheck = 0;

// Default thresholds (can be updated from server)
float waterLevelMin = 20.0;      // Minimum water level (%)
float waterLevelMax = 80.0;     // Maximum water level (%)
float temperatureMin = 20.0;    // Minimum temperature (°C)
float temperatureMax = 28.0;    // Maximum temperature (°C)
float temperatureHysteresis = 1.0; // Hysteresis for temperature control (°C)
float doMin = 5.0;              // Minimum DO (mg/L)
float doMax = 8.0;              // Maximum DO (mg/L)
float phMin = 6.5;              // Minimum pH
float phMax = 8.5;              // Maximum pH
float lightLevelMin = 30.0;     // Minimum light level (%)

// Log level control (0=none, 1=essential, 2=detailed)
#define LOG_LEVEL 1

// WiFi reconnect state machine
enum WiFiReconnectState {
  WIFI_RECONNECT_IDLE,
  WIFI_RECONNECT_ATTEMPTING,
  WIFI_RECONNECT_WAITING
};
WiFiReconnectState wifiReconnectState = WIFI_RECONNECT_IDLE;
unsigned long wifiReconnectLastAttempt = 0;
int wifiReconnectAttempts = 0;

void setup() {
  // ===== ABSOLUTE FIRST: Hardware initialization =====
  // LED 초기화 (Arduino R4 WiFi) - NO dependencies
  #ifdef LED_BUILTIN
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH);
  #else
    pinMode(13, OUTPUT);
    digitalWrite(13, HIGH);
  #endif
  
  // Serial communication (9600 baud - MUST match Serial Monitor)
  // This MUST be initialized before any Serial.print()
  Serial.begin(9600);
  
  // CRITICAL: Wait for serial port - but with timeout
  // Arduino R4 may not have Serial ready immediately
  unsigned long serialWaitStart = millis();
  while (!Serial && (millis() - serialWaitStart < 2000)) {
    // Wait max 2 seconds for serial
  }
  
  // Immediate test output - if this doesn't appear, setup() didn't run
  Serial.println("SETUP_START");  // Simple ASCII, no formatting
  Serial.flush();
  
  delay(100);  // Small delay for serial buffer
  
  if (LOG_LEVEL >= 1) {
    Serial.println();
    Serial.println("========================================");
    Serial.println("CES SmartFarm Arduino R4 Starting");
    Serial.println("========================================");
    Serial.print("Module ID: ");
    Serial.println(MODULE_ID);
    Serial.print("Start time: ");
    Serial.print(millis());
    Serial.println(" ms");
    Serial.println("========================================");
  }

  // CRITICAL: Initialize sensor/actuator objects NOW (after Serial is ready)
  // This prevents constructor issues during global object initialization
  Serial.println("Initializing sensors and actuators...");
  
  waterLevelSensor = new WaterLevelSensor();
  temperatureSensor = new TemperatureSensor();
  doSensor = new DOSensor();
  phSensor = new PHSensor();
  lightSensor = new LightSensor();
  
  waterPump = new WaterPump();
  airPump = new AirPump();
  valve = new Valve();
  heater = new Heater();
  cooler = new Cooler();
  
  Serial.println("Sensors and actuators initialized");
  
  // CRITICAL: Load EEPROM config NOW (after Serial is ready)
  Serial.println("Loading EEPROM config...");
  wifiConfig.loadFromEEPROM();
  
  // WiFi connection process
  if (LOG_LEVEL >= 1) {
    Serial.println();
    Serial.println("========================================");
    Serial.println("WiFi Connection Process");
    Serial.println("========================================");
  }
  
  // Try EEPROM stored WiFi first
  if (wifiConfig.isConfigured()) {
    if (LOG_LEVEL >= 1) {
      Serial.println("EEPROM WiFi config found");
      Serial.print("SSID: ");
      Serial.println(wifiConfig.getSSID());
    }
    
    if (wifiConfig.connect()) {
      if (LOG_LEVEL >= 1) {
        Serial.println("WiFi connected!");
      }
    } else {
      // EEPROM connection failed - start config portal directly
      // (Removed server WiFi config path for simplicity and reliability)
      if (LOG_LEVEL >= 1) {
        Serial.println("EEPROM WiFi connection failed");
        Serial.println("Starting config portal...");
      }
      delay(1000);
      wifiConfig.startConfigPortal();
    }
  } else {
    // No EEPROM config - start config portal
    if (LOG_LEVEL >= 1) {
      Serial.println("No EEPROM WiFi config");
      Serial.println("Starting config portal...");
      Serial.println("Connect to WiFi: CES_SmartFarm_Setup");
      Serial.println("Then open: http://192.168.4.1");
    }
    delay(1000);
    wifiConfig.startConfigPortal();
  }
  
  Serial.println();

  // Initialize actuators (all OFF initially)
  if (waterPump) waterPump->turnOff();
  if (airPump) airPump->turnOff();
  if (valve) valve->turnOff();
  if (heater) heater->turnOff();
  if (cooler) cooler->turnOff();
  
  if (LOG_LEVEL >= 2) {
    Serial.println("Actuators set to OFF");
  }
  
  if (LOG_LEVEL >= 1) {
    Serial.println("========================================");
    Serial.println("Initialization complete!");
    Serial.print("WiFi status: ");
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Connected | IP: ");
      Serial.println(WiFi.localIP());
    } else if (WiFi.status() == WL_AP_LISTENING || WiFi.status() == WL_AP_CONNECTED) {
      Serial.println("AP mode (config portal)");
    } else {
      Serial.println("Not connected");
    }
    Serial.println("========================================");
    Serial.println("Main loop starting...");
    Serial.println();
  }
}

void loop() {
  // LED blink (heartbeat - 1 second interval)
  static unsigned long lastBlink = 0;
  static bool ledState = false;
  if (millis() - lastBlink > 1000) {
    lastBlink = millis();
    ledState = !ledState;
    #ifdef LED_BUILTIN
      digitalWrite(LED_BUILTIN, ledState);
    #else
      digitalWrite(13, ledState);
    #endif
  }
  
  // WiFi connection state machine (non-blocking)
  int wifiStatus = WiFi.status();
  if (wifiStatus != WL_CONNECTED && wifiStatus != WL_AP_LISTENING && wifiStatus != WL_AP_CONNECTED) {
    // WiFi disconnected - attempt reconnect using state machine
    unsigned long now = millis();
    
    switch (wifiReconnectState) {
      case WIFI_RECONNECT_IDLE:
        wifiReconnectState = WIFI_RECONNECT_ATTEMPTING;
        wifiReconnectLastAttempt = now;
        wifiReconnectAttempts = 0;
        if (LOG_LEVEL >= 1) {
          Serial.println("WiFi disconnected - attempting reconnect");
        }
        break;
        
      case WIFI_RECONNECT_ATTEMPTING:
        if (wifiReconnectAttempts < 3) {
          if (now - wifiReconnectLastAttempt > 5000) {  // 5 second interval
            wifiReconnectLastAttempt = now;
            wifiReconnectAttempts++;
            if (wifiConfig.reconnect()) {
              wifiReconnectState = WIFI_RECONNECT_IDLE;
              if (LOG_LEVEL >= 1) {
                Serial.println("WiFi reconnected!");
              }
            } else {
              if (LOG_LEVEL >= 1) {
                Serial.print("Reconnect attempt ");
                Serial.print(wifiReconnectAttempts);
                Serial.println("/3 failed");
              }
            }
          }
        } else {
          // All attempts failed - wait before retrying
          wifiReconnectState = WIFI_RECONNECT_WAITING;
          wifiReconnectLastAttempt = now;
        }
        break;
        
      case WIFI_RECONNECT_WAITING:
        if (now - wifiReconnectLastAttempt > 30000) {  // Wait 30 seconds
          wifiReconnectState = WIFI_RECONNECT_IDLE;  // Reset and try again
        }
        break;
    }
  } else {
    // WiFi connected or in AP mode - reset reconnect state
    if (wifiReconnectState != WIFI_RECONNECT_IDLE) {
      wifiReconnectState = WIFI_RECONNECT_IDLE;
    }
  }
  
  // Periodic WiFi status (every 30 seconds, non-blocking)
  static unsigned long lastStatusPrint = 0;
  if (LOG_LEVEL >= 2 && millis() - lastStatusPrint > 30000) {
    lastStatusPrint = millis();
    Serial.print("[");
    Serial.print(millis() / 1000);
    Serial.print("s] WiFi: ");
    if (wifiStatus == WL_CONNECTED) {
      Serial.print("Connected | IP: ");
      Serial.print(WiFi.localIP());
      Serial.print(" | RSSI: ");
      Serial.print(WiFi.RSSI());
      Serial.println(" dBm");
    } else if (wifiStatus == WL_AP_LISTENING || wifiStatus == WL_AP_CONNECTED) {
      Serial.println("AP mode");
    } else {
      Serial.print("Disconnected (");
      Serial.print(wifiStatus);
      Serial.println(")");
    }
  }

  unsigned long currentTime = millis();

  // Send sensor data every 30 seconds (only if WiFi connected)
  if (WiFi.status() == WL_CONNECTED && currentTime - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    lastSensorUpdate = currentTime;
    
    if (LOG_LEVEL >= 2) {
      Serial.println("Reading sensors...");
    }
    
    // Read all sensors
    if (!waterLevelSensor || !temperatureSensor || !doSensor || !phSensor || !lightSensor) {
      Serial.println("ERROR: Sensors not initialized!");
      return;
    }
    
    float waterLevel = waterLevelSensor->read();
    float temperature = temperatureSensor->read();
    float doLevel = doSensor->read();
    float phLevel = phSensor->read();
    float lightLevel = lightSensor->read();

    // Print sensor values (only if detailed logging)
    if (LOG_LEVEL >= 2) {
      Serial.print("Water: ");
      Serial.print(waterLevel);
      Serial.print("% | Temp: ");
      Serial.print(temperature);
      Serial.print("C | DO: ");
      Serial.print(doLevel);
      Serial.print("mg/L | pH: ");
      Serial.print(phLevel);
      Serial.print(" | Light: ");
      Serial.print(lightLevel);
      Serial.println("%");
    }

    // Send data to server
    if (apiClient.sendSensorData(waterLevel, temperature, doLevel, phLevel, lightLevel)) {
      if (LOG_LEVEL >= 1) {
        Serial.println("Sensor data sent");
      }
    } else {
      if (LOG_LEVEL >= 1) {
        Serial.println("Sensor data send failed");
      }
    }

    // Auto control (safety fallback - server control takes priority)
    performAutoControl(waterLevel, temperature, doLevel, phLevel, lightLevel);
  }

  // Check actuator status from server every 10 seconds (server control priority)
  if (WiFi.status() == WL_CONNECTED && currentTime - lastActuatorCheck >= 10000) {
    lastActuatorCheck = currentTime;
    
    bool serverWaterPump, serverAirPump, serverValve, serverHeater, serverCooler;
    
    if (apiClient.getActuatorStatus(serverWaterPump, serverAirPump, serverValve, serverHeater, serverCooler)) {
      // Server control takes priority - update actuators
      if (waterPump) waterPump->setState(serverWaterPump);
      if (airPump) airPump->setState(serverAirPump);
      if (valve) valve->setState(serverValve);
      if (heater) heater->setState(serverHeater);
      if (cooler) cooler->setState(serverCooler);
      
      if (LOG_LEVEL >= 2) {
        Serial.println("Actuators updated from server");
      }
    } else {
      if (LOG_LEVEL >= 2) {
        Serial.println("Failed to get actuator status");
      }
    }
  }

  // Small non-blocking delay
  delay(10);
}

void performAutoControl(float waterLevel, float temperature, float doLevel, float phLevel, float lightLevel) {
  // Auto control logic (safety fallback - server control has priority)
  // Only runs if server control is not available
  
  // Water level control with hysteresis
  static bool waterPumpAutoState = false;
  if (waterLevel < waterLevelMin) {
    if (!waterPumpAutoState && waterPump) {
      waterPump->turnOn();
      waterPumpAutoState = true;
      if (LOG_LEVEL >= 1) {
        Serial.println("Auto: Water pump ON (low level)");
      }
    }
  } else if (waterLevel > waterLevelMax) {
    if (waterPumpAutoState && waterPump) {
      waterPump->turnOff();
      waterPumpAutoState = false;
      if (LOG_LEVEL >= 1) {
        Serial.println("Auto: Water pump OFF (sufficient level)");
      }
    }
  }

  // Temperature control with hysteresis
  static bool heaterAutoState = false;
  static bool coolerAutoState = false;
  if (temperature < (temperatureMin - temperatureHysteresis)) {
    if (!heaterAutoState && heater && cooler) {
      heater->turnOn();
      cooler->turnOff();
      heaterAutoState = true;
      coolerAutoState = false;
      if (LOG_LEVEL >= 1) {
        Serial.println("Auto: Heater ON (low temp)");
      }
    }
  } else if (temperature > (temperatureMax + temperatureHysteresis)) {
    if (!coolerAutoState && heater && cooler) {
      heater->turnOff();
      cooler->turnOn();
      heaterAutoState = false;
      coolerAutoState = true;
      if (LOG_LEVEL >= 1) {
        Serial.println("Auto: Cooler ON (high temp)");
      }
    }
  } else {
    // Within acceptable range - turn off both
    if ((heaterAutoState || coolerAutoState) && heater && cooler) {
      heater->turnOff();
      cooler->turnOff();
      heaterAutoState = false;
      coolerAutoState = false;
      if (LOG_LEVEL >= 2) {
        Serial.println("Auto: Temperature OK");
      }
    }
  }

  // DO control with hysteresis
  static bool airPumpAutoState = false;
  if (doLevel < doMin) {
    if (!airPumpAutoState && airPump) {
      airPump->turnOn();
      airPumpAutoState = true;
      if (LOG_LEVEL >= 1) {
        Serial.println("Auto: Air pump ON (low DO)");
      }
    }
  } else if (doLevel > doMax) {
    if (airPumpAutoState && airPump) {
      airPump->turnOff();
      airPumpAutoState = false;
      if (LOG_LEVEL >= 1) {
        Serial.println("Auto: Air pump OFF (sufficient DO)");
      }
    }
  }

  // pH control - NOTE: This assumes valve is for pH adjustment
  // If you have separate valves for acid/base, modify this logic
  static bool valveAutoState = false;
  if (phLevel < phMin || phLevel > phMax) {
    if (!valveAutoState && valve) {
      valve->turnOn();
      valveAutoState = true;
      if (LOG_LEVEL >= 1) {
        Serial.print("Auto: Valve ON (pH out of range: ");
        Serial.print(phLevel);
        Serial.println(")");
      }
    }
  } else {
    if (valveAutoState && valve) {
      valve->turnOff();
      valveAutoState = false;
      if (LOG_LEVEL >= 2) {
        Serial.println("Auto: pH OK");
      }
    }
  }
}

