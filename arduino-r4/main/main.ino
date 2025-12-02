// CES SmartFarm - Arduino R4 Main Control Loop
#include "config.h"
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

  // Initialize WiFi connection
  if (!apiClient.connectWiFi()) {
    Serial.println("Failed to connect to WiFi. System will retry in loop.");
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
    apiClient.connectWiFi();
    delay(5000);
    return;
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

