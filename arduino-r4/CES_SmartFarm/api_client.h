#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <WiFiS3.h>
#include <ArduinoJson.h>
#include "config.h"

class APIClient {
private:
  WiFiClient client;
  String baseUrl;
  String host;
  int port;

public:
  APIClient() {
    baseUrl = String(API_BASE_URL);
    // Parse URL to extract host and port
    // For http://3.36.109.155:3000
    if (baseUrl.startsWith("http://")) {
      baseUrl = baseUrl.substring(7); // Remove "http://"
    }
    int colonIndex = baseUrl.indexOf(':');
    if (colonIndex > 0) {
      host = baseUrl.substring(0, colonIndex);
      port = baseUrl.substring(colonIndex + 1).toInt();
    } else {
      host = baseUrl;
      port = 80;
    }
  }

  bool connectWiFi(String ssid = "", String password = "") {
    // WiFiConfig에서 SSID와 Password를 받아서 사용
    // 빈 문자열이면 연결 실패 (WiFiConfig를 통해 연결해야 함)
    if (ssid.length() == 0 || password.length() == 0) {
      Serial.println("WiFi 연결 실패: SSID와 비밀번호가 필요합니다.");
      Serial.println("WiFiConfig.connect()를 사용하세요.");
      return false;
    }
    
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);
    
    WiFi.begin(ssid.c_str(), password.c_str());
    
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

    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["module_id"] = String(MODULE_ID);
    doc["water_level"] = waterLevel;
    doc["temperature"] = temperature;
    doc["do_level"] = doLevel;
    doc["ph_level"] = phLevel;
    doc["light_level"] = lightLevel;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    // Connect to server
    if (!client.connect(host.c_str(), port)) {
      Serial.println("Connection to server failed!");
      return false;
    }

    // Send HTTP POST request
    client.print("POST ");
    client.print(API_SENSORS_ENDPOINT);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(host);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonPayload.length());
    client.println("Connection: close");
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
      Serial.println(line);
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
    
    // Connect to server
    if (!client.connect(host.c_str(), port)) {
      Serial.println("Connection to server failed!");
      return false;
    }

    // Send HTTP GET request
    client.print("GET ");
    client.print(endpoint);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(host);
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

    // Read response
    String response = "";
    bool headerEnded = false;
    while (client.available()) {
      String line = client.readStringUntil('\r');
      if (line.length() == 0 && !headerEnded) {
        headerEnded = true;
        continue;
      }
      if (headerEnded) {
        response += line;
      }
    }

    Serial.print("Actuator status response: ");
    Serial.println(response);

    // Parse JSON response
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (error) {
      Serial.print("JSON parsing failed: ");
      Serial.println(error.c_str());
      client.stop();
      return false;
    }
    
    waterPump = doc["water_pump"] | false;
    airPump = doc["air_pump"] | false;
    valve = doc["valve"] | false;
    heater = doc["heater"] | false;
    cooler = doc["cooler"] | false;

    client.stop();
    return true;
  }

  // 서버에서 WiFi 설정 가져오기 (WiFi 연결 전에 사용 - 임시 WiFi 필요)
  bool getWiFiConfig(String& ssid, String& password) {
    // WiFi가 연결되어 있지 않으면 실패
    // 첫 부팅 시에는 임시 WiFi(핫스팟 등)로 연결되어 있어야 함
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected! Cannot fetch config from server.");
      Serial.println("Please connect to a temporary WiFi first (e.g., mobile hotspot).");
      return false;
    }

    String endpoint = "/api/modules/" + String(MODULE_ID) + "/wifi-config";
    
    // Connect to server
    if (!client.connect(host.c_str(), port)) {
      Serial.println("Connection to server failed!");
      return false;
    }

    // Send HTTP GET request
    client.print("GET ");
    client.print(endpoint);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(host);
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

    // Read response
    String response = "";
    bool headerEnded = false;
    while (client.available()) {
      String line = client.readStringUntil('\r');
      if (line.length() == 0 && !headerEnded) {
        headerEnded = true;
        continue;
      }
      if (headerEnded) {
        response += line;
      }
    }

    Serial.print("WiFi config response: ");
    Serial.println(response);

    // Parse JSON response
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (error) {
      Serial.print("JSON parsing failed: ");
      Serial.println(error.c_str());
      client.stop();
      return false;
    }
    
    if (doc["success"] && doc["wifi_ssid"] && doc["wifi_password"]) {
      ssid = doc["wifi_ssid"].as<String>();
      password = doc["wifi_password"].as<String>();
      client.stop();
      return true;
    } else {
      Serial.println("WiFi config not found in server");
      client.stop();
      return false;
    }
  }
};

#endif
