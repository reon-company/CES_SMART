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

  // Send DHT11 sensor data (temperature and humidity)
  bool sendSensorData(float temperature, float humidity) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected!");
      return false;
    }

    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["module_id"] = String(MODULE_ID);
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;

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

    // Read response headers and body
    String response = "";
    bool headerEnded = false;
    int statusCode = 0;
    
    while (client.available()) {
      String line = client.readStringUntil('\r');
      
      // Check HTTP status line
      if (line.startsWith("HTTP/1.1 ")) {
        statusCode = line.substring(9, 12).toInt();
        if (LOG_LEVEL >= 1) {
          Serial.println(line);
        }
      } else if (line.length() == 0 && !headerEnded) {
        headerEnded = true;
        continue;
      } else if (headerEnded) {
        // Response body
        response += line;
      } else if (LOG_LEVEL >= 2) {
        Serial.println(line);
      }
    }

    // Check status code
    if (statusCode >= 200 && statusCode < 300) {
      if (LOG_LEVEL >= 1) {
        Serial.println("Sensor data sent successfully");
      }
      client.stop();
      return true;
    } else {
      // Parse error response
      if (response.length() > 0) {
        StaticJsonDocument<200> errorDoc;
        DeserializationError error = deserializeJson(errorDoc, response);
        if (!error && errorDoc.containsKey("message")) {
          Serial.print("Server error: ");
          Serial.println(errorDoc["message"].as<String>());
        } else {
          Serial.print("HTTP error: ");
          Serial.println(statusCode);
        }
      } else {
        Serial.print("HTTP error: ");
        Serial.println(statusCode);
      }
      client.stop();
      return false;
    }
  }

  // Get relay status from server
  bool getRelayStatus(bool& relayState) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected!");
      return false;
    }

    String endpoint = String(API_ACTUATORS_STATUS_ENDPOINT) + "/" + String(MODULE_ID);
    
    if (LOG_LEVEL >= 1) {
      Serial.print("Requesting relay status from: ");
      Serial.println(endpoint);
    }
    
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

    // Read response headers and body
    String response = "";
    bool headerEnded = false;
    int statusCode = 0;
    int contentLength = 0;
    
    // Read headers first
    while (client.available() && !headerEnded) {
      String line = client.readStringUntil('\n');
      line.trim(); // Remove \r and whitespace
      
      // Check HTTP status line
      if (line.startsWith("HTTP/1.1 ")) {
        statusCode = line.substring(9, 12).toInt();
        if (LOG_LEVEL >= 1) {
          Serial.println(line);
        }
      } 
      // Check Content-Length header
      else if (line.startsWith("Content-Length:")) {
        contentLength = line.substring(15).toInt();
      }
      // Empty line indicates end of headers
      else if (line.length() == 0) {
        headerEnded = true;
      }
    }
    
    // Read response body
    if (headerEnded && client.available()) {
      // Read all available data as response body
      unsigned long bodyTimeout = millis();
      while (client.available() || (contentLength > 0 && response.length() < contentLength)) {
        if (client.available()) {
          char c = client.read();
          response += c;
        } else {
          // Wait a bit for more data
          if (millis() - bodyTimeout > 1000) {
            break; // Timeout waiting for body
          }
          delay(10);
        }
      }
    }

    // Check if response is empty
    response.trim(); // Remove any trailing whitespace
    
    if (response.length() == 0) {
      Serial.print("Empty response (HTTP ");
      Serial.print(statusCode);
      Serial.println(")");
      if (statusCode == 200) {
        Serial.println("WARNING: 200 OK but empty body. Server may not be returning data.");
      } else if (statusCode == 404) {
        Serial.println("ERROR: Module not found! Please register module in web dashboard.");
        Serial.print("Current MODULE_ID: ");
        Serial.println(MODULE_ID);
      } else if (statusCode == 401) {
        Serial.println("ERROR: Unauthorized (401). Server may need restart.");
        Serial.println("This endpoint should be Public. Check server code.");
      }
      client.stop();
      return false;
    }

    if (LOG_LEVEL >= 1) {
      Serial.print("Response length: ");
      Serial.println(response.length());
      if (LOG_LEVEL >= 2) {
        Serial.print("Relay status response: ");
        Serial.println(response);
      }
    }

    // Parse JSON response
    StaticJsonDocument<300> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (error) {
      Serial.print("JSON parsing failed: ");
      Serial.println(error.c_str());
      Serial.print("Response was: ");
      Serial.println(response);
      client.stop();
      return false;
    }
    
    // Check for error in response
    if (doc.containsKey("success") && !doc["success"]) {
      if (doc.containsKey("message")) {
        Serial.print("Server error: ");
        Serial.println(doc["message"].as<String>());
      }
      if (statusCode == 401) {
        Serial.println("ERROR: 401 Unauthorized - Server may need restart");
        Serial.println("Contact server administrator to restart backend.");
      }
      client.stop();
      return false;
    }
    
    // Check HTTP status code
    if (statusCode == 401) {
      Serial.println("ERROR: 401 Unauthorized - This endpoint should be Public");
      Serial.println("Server may be using old code. Please restart server.");
      client.stop();
      return false;
    }
    
    // Server returns: { "success": true, "status": { "relay": true/false, ... } }
    if (doc.containsKey("status")) {
      JsonObject statusObj = doc["status"];
      if (statusObj.containsKey("relay")) {
        relayState = statusObj["relay"] | false;
      } else {
        relayState = false;
      }
    } else if (doc.containsKey("relay")) {
      // Direct relay field (fallback)
      relayState = doc["relay"] | false;
    } else {
      relayState = false;
    }

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
