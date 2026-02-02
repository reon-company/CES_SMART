#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <WiFiS3.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

class APIClient {
private:
  HTTPClient http;
  String baseUrl;
  String host;
  int port;

public:
  APIClient() {
    baseUrl = String(API_BASE_URL);
    // Parse URL to extract host and port
    // For http://43.201.148.223:3000
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
    // 빈 문자열이면 하드코딩된 값 사용 (하위 호환성)
    String wifiSSID = (ssid.length() > 0) ? ssid : String(WIFI_SSID);
    String wifiPASS = (password.length() > 0) ? password : String(WIFI_PASSWORD);
    
    Serial.print("Connecting to WiFi: ");
    Serial.println(wifiSSID);
    
    WiFi.begin(wifiSSID.c_str(), wifiPASS.c_str());
    
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

    // Send HTTP POST request
    String url = "http://" + host + ":" + String(port) + String(API_SENSORS_ENDPOINT);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
      http.end();
      return true;
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      http.end();
      return false;
    }
  }

  bool getActuatorStatus(bool& waterPump, bool& airPump, bool& valve, bool& heater, bool& cooler) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi not connected!");
      return false;
    }

    String endpoint = String(API_ACTUATORS_STATUS_ENDPOINT) + "/" + String(MODULE_ID);
    String url = "http://" + host + ":" + String(port) + endpoint;
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Actuator status response: ");
      Serial.println(response);
      
      // Parse JSON response
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (error) {
        Serial.print("JSON parsing failed: ");
        Serial.println(error.c_str());
        http.end();
        return false;
      }
      
      waterPump = doc["water_pump"] | false;
      airPump = doc["air_pump"] | false;
      valve = doc["valve"] | false;
      heater = doc["heater"] | false;
      cooler = doc["cooler"] | false;
      
      http.end();
      return true;
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      http.end();
      return false;
    }
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
    String url = "http://" + host + ":" + String(port) + endpoint;
    
    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("WiFi config response: ");
      Serial.println(response);
      
      // Parse JSON response
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, response);
      
      if (error) {
        Serial.print("JSON parsing failed: ");
        Serial.println(error.c_str());
        http.end();
        return false;
      }
      
      if (doc["success"] && doc["wifi_ssid"] && doc["wifi_password"]) {
        ssid = doc["wifi_ssid"].as<String>();
        password = doc["wifi_password"].as<String>();
        http.end();
        return true;
      } else {
        Serial.println("WiFi config not found in server");
        http.end();
        return false;
      }
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      http.end();
      return false;
    }
  }
};

#endif

