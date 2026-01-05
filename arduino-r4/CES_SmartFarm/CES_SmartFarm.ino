/*
 * CES SmartFarm - Arduino R4 Test Version
 * 
 * Version: 1.1.0 (Test - DHT11 + Relay)
 * Date: 2024
 * 
 * Features:
 * - DHT11 센서 (온도/습도)
 * - 1채널 릴레이 모듈 제어
 * - WiFi AP 모드 설정 포털 (EEPROM 저장)
 * - 센서 데이터 수집 및 서버 전송 (30초 간격)
 * - 릴레이 서버 제어 (10초 간격)
 * - WiFi 자동 재연결
 */

#include "config.h"
#include "wifi_config.h"
#include "api_client.h"

// DHT11 Sensor
#include "sensors/DHT11Sensor.h"

// Relay Control
#include "actuators/RelayControl.h"

// Sensor object - Use pointer to delay construction until setup()
DHT11Sensor* dht11Sensor = nullptr;

// Relay object - Use pointer to delay construction until setup()
RelayControl* relay = nullptr;

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

// Log level is defined in config.h

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
  Serial.println("Initializing DHT11 sensor and relay...");
  
  dht11Sensor = new DHT11Sensor();
  relay = new RelayControl(RELAY_PIN);
  
  Serial.println("DHT11 sensor and relay initialized");
  
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
    String storedSSID = wifiConfig.getSSID();
    if (LOG_LEVEL >= 1) {
      Serial.println("EEPROM WiFi config found");
      Serial.print("SSID: ");
      Serial.println(storedSSID);
      Serial.print("SSID length: ");
      Serial.println(storedSSID.length());
    }
    
    // SSID가 비어있거나 유효하지 않으면 설정 포털 시작
    if (storedSSID.length() == 0) {
      if (LOG_LEVEL >= 1) {
        Serial.println("⚠️ 저장된 SSID가 비어있습니다. 설정 포털을 시작합니다.");
      }
      wifiConfig.reset(); // 잘못된 설정 초기화
      delay(1000);
      wifiConfig.startConfigPortal();
    } else {
      if (wifiConfig.connect()) {
        if (LOG_LEVEL >= 1) {
          Serial.println("WiFi connected!");
        }
      } else {
        // EEPROM connection failed - start config portal directly
        if (LOG_LEVEL >= 1) {
          Serial.println("EEPROM WiFi connection failed");
          Serial.println("Starting config portal...");
        }
        delay(1000);
        wifiConfig.startConfigPortal();
      }
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

  // Initialize relay (OFF initially)
  if (relay) {
    relay->turnOff();
    if (LOG_LEVEL >= 1) {
      Serial.println("Relay initialized to OFF");
    }
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
    
    if (!dht11Sensor) {
      Serial.println("ERROR: DHT11 sensor not initialized!");
      return;
    }
    
    // Read DHT11 sensor
    float temperature = dht11Sensor->readTemperature();
    float humidity = dht11Sensor->readHumidity();

    // Print sensor values
    if (LOG_LEVEL >= 1) {
      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.print("C | Humidity: ");
      Serial.print(humidity);
      Serial.println("%");
    }

    // Send data to server
    if (apiClient.sendSensorData(temperature, humidity)) {
      if (LOG_LEVEL >= 1) {
        Serial.println("Sensor data sent");
      }
    } else {
      if (LOG_LEVEL >= 1) {
        Serial.println("Sensor data send failed");
      }
    }
  }

  // Check relay status from server every 10 seconds (server control priority)
  if (WiFi.status() == WL_CONNECTED && currentTime - lastActuatorCheck >= 10000) {
    lastActuatorCheck = currentTime;
    
    bool serverRelayState;
    
    if (apiClient.getRelayStatus(serverRelayState)) {
      // Server control takes priority - update relay
      if (relay) {
        relay->setState(serverRelayState);
        if (LOG_LEVEL >= 1) {
          Serial.print("Relay updated from server: ");
          Serial.println(serverRelayState ? "ON" : "OFF");
        }
      }
    } else {
      if (LOG_LEVEL >= 2) {
        Serial.println("Failed to get relay status");
      }
    }
  }

  // Small non-blocking delay
  delay(10);
}

// Auto control removed for test version
// Server control is the primary method

