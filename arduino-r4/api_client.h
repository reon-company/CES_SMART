#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <WiFiNINA.h>
#include "config.h"

class APIClient {
private:
  WiFiClient client;
  String baseUrl;

public:
  APIClient() {
    baseUrl = String(API_BASE_URL);
  }

  bool connectWiFi() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println();
      Serial.print("WiFi connected! IP address: ");
      Serial.println(WiFi.localIP());
      return true;
    } else {
      Serial.println();
      Serial.println("WiFi connection failed!");
      return false;
    }
  }

  bool sendSensorData(float waterLevel, float temperature, float doLevel, float phLevel, float lightLevel) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected!");
      return false;
    }

    if (!client.connect(baseUrl.c_str(), 80)) {
      Serial.println("Connection to server failed!");
      return false;
    }

    // Create JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"module_id\":\"" + String(MODULE_ID) + "\",";
    jsonPayload += "\"water_level\":" + String(waterLevel) + ",";
    jsonPayload += "\"temperature\":" + String(temperature) + ",";
    jsonPayload += "\"do_level\":" + String(doLevel) + ",";
    jsonPayload += "\"ph_level\":" + String(phLevel) + ",";
    jsonPayload += "\"light_level\":" + String(lightLevel);
    jsonPayload += "}";

    // Send HTTP POST request
    client.print("POST ");
    client.print(API_SENSORS_ENDPOINT);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(baseUrl);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonPayload.length());
    client.println();
    client.println(jsonPayload);

    // Wait for response
    unsigned long timeout = millis();
    while (client.available() == 0) {
      if (millis() - timeout > 5000) {
        Serial.println("Client timeout!");
        client.stop();
        return false;
      }
    }

    // Read response
    while (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    }

    client.stop();
    return true;
  }

  bool getActuatorStatus(bool& waterPump, bool& airPump, bool& valve, bool& heater, bool& cooler) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected!");
      return false;
    }

    String endpoint = String(API_ACTUATORS_STATUS_ENDPOINT) + "/" + String(MODULE_ID);
    
    if (!client.connect(baseUrl.c_str(), 80)) {
      Serial.println("Connection to server failed!");
      return false;
    }

    // Send HTTP GET request
    client.print("GET ");
    client.print(endpoint);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(baseUrl);
    client.println("Connection: close");
    client.println();

    // Wait for response
    unsigned long timeout = millis();
    while (client.available() == 0) {
      if (millis() - timeout > 5000) {
        Serial.println("Client timeout!");
        client.stop();
        return false;
      }
    }

    // Parse response (simplified - in production, use proper JSON parsing)
    String response = "";
    while (client.available()) {
      response += client.readStringUntil('\r');
    }

    // Simple JSON parsing (for production, use ArduinoJson library)
    // This is a simplified version - adjust based on actual response format
    if (response.indexOf("\"water_pump\":true") > 0) waterPump = true;
    else waterPump = false;
    
    if (response.indexOf("\"air_pump\":true") > 0) airPump = true;
    else airPump = false;
    
    if (response.indexOf("\"valve\":true") > 0) valve = true;
    else valve = false;
    
    if (response.indexOf("\"heater\":true") > 0) heater = true;
    else heater = false;
    
    if (response.indexOf("\"cooler\":true") > 0) cooler = true;
    else cooler = false;

    client.stop();
    return true;
  }
};

#endif

